// App entry point
// ===============

'use strict';

// Set default env to DEV
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express'),
    config = require('./config/environment'),
    logger = require('./utils/logger');

// Launch server
// -------------
var app = express();
var server = require('http').createServer(app);
var socketio = require('socket.io')(server);

require('./config/express')(app, socketio);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function() {
    logger.info('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

module.exports = app;
