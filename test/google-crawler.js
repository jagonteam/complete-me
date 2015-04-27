var assert = require("assert");

import {
    GoogleCrawler
}
from "../build/tools/crawler/google-crawler";

describe('GoogleCrawler', function() {
    describe('#getAutocompleteForQuery()', function() {

        it('should return an array of ten answer for a query', function(done) {
            this.timeout(10000);

            let crawler = new GoogleCrawler();
            crawler.getAutocompleteForQuery({
                text: "Je voudrais arrêter"
            }, function(answer) {
                assert.equal(answer.length, 10);
                done();
            });
        });

        it('should return real answers', function(done) {
            this.timeout(10000);

            let crawler = new GoogleCrawler();
            crawler.getAutocompleteForQuery({
                text: "Je voudrais arrêter"
            }, function(answer) {
                assert.equal(answer[0], "de fumer");
                done();
            });
        });

    });
});
