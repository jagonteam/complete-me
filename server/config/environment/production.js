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
    }
};
