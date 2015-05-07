'use strict';

// Development specific configuration
// ==================================

module.exports = {
    // MongoDB connection options
    mongo: {
        uri: 'mongodb://localhost/complete-me'
    },

    // elastic connection options
    elastic: {
        host: 'localhost',
        port: 9200
    },

    // users who can launch crawler
    crawling_users: [{
        "user": "dev_crawler",
        "pass": "dev_crawler_pass"
    }, {
        "user": "somebody",
        "pass": "s0m3b0dY"
    }]
};
