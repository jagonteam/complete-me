// Google crawler class
// ====================

'use strict';

import request from 'request';
import diacritics from 'diacritics';

import {
    Crawler
}
from './crawler';

import logger from '../../utils/logger';


export class GoogleCrawler extends Crawler {

    /**
     * Crawl google, get answers and insert responses into elastic
     * Query example : http://suggestqueries.google.com/complete/search?client=firefoxhl=fr&q=Je voudrais arrêter
     */
    getAutocompleteForQuery(query, callback) {
        logger.verbose("Crawing for question : " + query.text);

        request('http://suggestqueries.google.com/complete/search?client=firefox&hl=fr&q=' + query.text.toLowerCase(), (err, res, data) => {
            if (err) {
                logger.error("Failed to crawl : " + err);
                callback([]);
                return;
            }

            var queryResult = JSON.parse(data);
            var question = diacritics.remove(queryResult[0]);
            var answers = queryResult[1].map((answer) => {
                return answer.replace(new RegExp(question, 'g'), '').trim();
            });

            callback(answers);
        });
    }
}
