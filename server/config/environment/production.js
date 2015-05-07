'use strict';

// Production specific configuration
// =================================
module.exports = {
    // Server IP
    ip: process.env.HOST ||
        undefined,

    // Server port
    port: process.env.PORT ||
        9000,

    // MongoDB connection options
    mongo: {
        uri: process.env.MONGOLAB_URI ||
            process.env.MONGOHQ_URL ||
            process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME ||
            'mongodb://localhost/complete-me'
    },

    // elastic connection options
    elastic: {
        host: process.env.BONSAI_URL || 'localhost',
        port: 443
    },

    // users who can launch crawler
    crawling_users: (process.env.crawling_users ? JSON.parse(process.env.crawling_users) : [])
};
