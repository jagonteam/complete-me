var winston = require('winston');
var fs = require('fs');

// Configure logger
// ----------------
if (!fs.existsSync('../logs')) {
    fs.mkdirSync('../logs');
}

winston.emitErrs = true;

var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'verbose',
            filename: './logs/stdout.log',
            handleExceptions: true,
            json: false,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'verbose',
            handleExceptions: true,
            json: false,
            colorize: true,
            timestamp: true
        })
    ],
    exitOnError: false
});

module.exports = logger;
