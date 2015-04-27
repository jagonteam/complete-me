// Administration class
// ====================

'use strict';

import request from 'request';
import async from 'async';

import {
    GoogleCrawler
}
from '../build/crawler/google-crawler';

import logger from '../utils/logger';

// prefix for all admin logs
const LOG_TAG = "[admin] ";


export class Administration {

    constructor() {
        // set current crawler
        this.crawler = new GoogleCrawler();
    }

    /**
     * Start the answer crawler
     */
    crawlAnswers(req, res) {
        logger.warn(LOG_TAG + req.user + " started crawler");
        res.send("Crawler has been started !");

        async.series([

            // 1. clear previous answer in unused alias
            (callbackSerieStep) => {
                logger.info(LOG_TAG + "clearing content of unused alias");
                // TODO
                callbackSerieStep();
            },

            // 2. retrieve queries list and crawl answers
            (callbackSerieStep) => {
                logger.info(LOG_TAG + "retrieve queries list from elastic");

                // TODO (actually MOCKED)
                var queries = [{
                    text: "Je voudrais arrêter"
                }, {
                    text: "Comment se procurer"
                }];

                async.eachSeries(queries, (query, callback) => {
                    this.crawler.getAutocompleteForQuery(query, (answers) => {
                        logger.verbose(LOG_TAG + query.text + " : [" + answers.join(",") + "]");

                        logger.verbose(LOG_TAG + "storing answer in elastic...");
                        // TODO
                        callback();
                    });
                });
            },

            // 3. switch answer alias
            (callbackSerieStep) => {
                logger.info(LOG_TAG + "crawling is over, switching elastic to new answer alias");
                // TODO
                callbackSerieStep();
            }

        ], function(err) {});
    }
}
