// Administration class
// ====================

'use strict';

import request from 'request';
import async from 'async';
import Elastic from 'machines-elastic';

import config from '../../config/environment';

import {
    GoogleCrawler
}
from '../../tools/crawler/google-crawler.js';

var logger = require('../../utils/logger');


// prefix for all admin logs
const LOG_TAG = "[admin] ";

const ES_HOST = config.elastic.host;
const ES_PORT = config.elastic.port;


export class Administration {

    constructor() {
        // set current crawler
        this.crawler = new GoogleCrawler();
        this.isCrawling = false;
    }

    /**
     * Start the answer crawler
     */
    crawlAnswers(req, res) {
        logger.warn(LOG_TAG + req.user + " started crawler");

        if (this.isCrawling) {
            logger.warn(LOG_TAG + "crawler is already running, won't start again");
            res.send("Crawler is already running !");
            return;
        }

        res.send("Crawler has been started !");
        this.isCrawling = true;

        var usedIndex = "";
        var unusedIndex = "";
        var queries = [];

        async.series([

            // 1. Look to identify indexes
            (callbackSerieStep) => {
                Elastic.getAlias({
                    port: ES_PORT,
                    hostname: ES_HOST,
                    name: "response"
                }).exec({
                    error: (err) => {
                        logger.error(LOG_TAG + "Cannot getAlias : " + err);
                        this.isCrawling = false;
                        return;
                    },
                    couldNotConnect: () => {
                        logger.error(LOG_TAG + "Could not connect to elastic");
                        this.isCrawling = false;
                        return;
                    },
                    success: (result) => {
                        logger.verbose(LOG_TAG + "used index : " + result);
                        if (result === "response_1") {
                            usedIndex = "response_1";
                            unusedIndex = "response_2";
                        } else if (result === "response_2") {
                            usedIndex = "response_2";
                            unusedIndex = "response_1";
                        } else {
                            logger.error("Unknown index for getAlias [" + result + "], aborting...");
                            return;
                        }
                        callbackSerieStep();
                    },
                });
            },

            // 2. clear previous answer in unused alias
            (callbackSerieStep) => {
                logger.info(LOG_TAG + "clearing content of unused alias");
                Elastic.deleteByQuery({
                    port: ES_PORT,
                    hostname: ES_HOST,
                    index: unusedIndex,
                    type: 'response',
                    query: '{"query":{"match_all":{}}}'
                }).exec({
                    error: (err) => {
                        logger.error(LOG_TAG + "Cannot deleteByQuery : " + err);
                        this.isCrawling = false;
                        return;
                    },
                    couldNotConnect: () => {
                        logger.error(LOG_TAG + "Could not connect to elastic");
                        this.isCrawling = false;
                        return;
                    },
                    noSuchIndex: () => {
                        logger.error(LOG_TAG + "Index for deleteByQuery not found");
                        this.isCrawling = false;
                        return;
                    },
                    success: (result) => {
                        callbackSerieStep();
                    },
                });
            },

            // 3. retrieve queries list
            (callbackSerieStep) => {
                logger.info(LOG_TAG + "retrieve queries list from elastic");

                Elastic.searchCustom({
                    port: ES_PORT,
                    hostname: ES_HOST,
                    index: 'query',
                    type: 'query',
                    query: '{"query":{"match_all":{}}}'
                }).exec({
                    error: (err) => {
                        logger.error(LOG_TAG + "Cannot search : " + err);
                        this.isCrawling = false;
                        return;
                    },
                    couldNotConnect: () => {
                        logger.error(LOG_TAG + "Could not connect to elastic");
                        this.isCrawling = false;
                        return;
                    },
                    noSuchIndex: () => {
                        logger.error(LOG_TAG + "'query' index not found");
                        this.isCrawling = false;
                        return;
                    },
                    success: (result) => {
                        queries = result.map(function(queryResult) {
                            return queryResult._source;
                        });
                        callbackSerieStep();
                    },
                });
            },

            // 4. crawl answers
            (callbackSerieStep) => {
                logger.info(LOG_TAG + "crawl answers");

                async.eachSeries(queries, (query, callback) => {
                        this.crawler.getAutocompleteForQuery(query, (answers) => {
                            logger.verbose(LOG_TAG + query.text + " : [" + answers.join(",") + "]");
                            logger.verbose(LOG_TAG + "storing answer in elastic...");

                            // [{ index:  { _index: "myindex", _type: "mytype", _id: 2 } }, { title: "foo" } ]
                            let answerBulk = [];
                            for (let answerIndex in answers) {
                                let answer = answers[answerIndex];
                                answerBulk.push({
                                    index: {}
                                });
                                answerBulk.push({
                                    "text": answer,
                                    "rank": answerIndex,
                                    "query": [{
                                        "text": query.text
                                    }]
                                });
                            }

                            //logger.verbose("result bulk to store : " + JSON.stringify(answerBulk));
                            Elastic.bulk({
                                port: ES_PORT,
                                hostname: ES_HOST,
                                index: unusedIndex,
                                type: 'response',
                                actions: answerBulk
                            }).exec({
                                error: (err) => {
                                    logger.error(LOG_TAG + "Cannot search : " + err);
                                    this.isCrawling = false;
                                    return;
                                },
                                couldNotConnect: () => {
                                    logger.error(LOG_TAG + "Could not connect to elastic");
                                    this.isCrawling = false;
                                    return;
                                },
                                success: (result) => {
                                    callback();
                                },
                            });
                        });
                    },
                    function(err) {
                        if (!err) {
                            callbackSerieStep();
                        }
                    });
            },

            // 5. switch answer alias
            (callbackSerieStep) => {
                logger.info(LOG_TAG + "crawling is over, switching elastic to new answer alias");
                Elastic.updateAliases({
                    port: ES_PORT,
                    hostname: ES_HOST,
                    actions: '{actions: [{ remove: { index: "' + usedIndex + '", alias: "response" } }, { add: { index: "' + unusedIndex + '", alias: "response" } }] }'
                }).exec({
                    error: (err) => {
                        logger.error(LOG_TAG + "Cannot updateAlias : " + err);
                        this.isCrawling = false;
                        return;
                    },
                    couldNotConnect: () => {
                        logger.error(LOG_TAG + "Could not connect to elastic");
                        this.isCrawling = false;
                        return;
                    },
                    noSuchIndex: () => {
                        logger.error(LOG_TAG + "Index for new alias not found");
                        this.isCrawling = false;
                        return;
                    },
                    success: (result) => {
                        logger.info(LOG_TAG + "Re-indexing is over !");
                        this.isCrawling = false;
                        callbackSerieStep();
                    },
                });
            }

        ], function(err) {});
    }
}
