// App entry point
// ===============

'use strict';

var express = require('express'),
    http = require('http'),
    path = require('path'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    methodOverride = require('method-override');

var logger = require("./utils/logger");

// transpiled dependencies
var game = require("./build/game");


// Configuration
// -------------
var publicPath = path.join(__dirname) + '/assets/';


// Launch server
// -------------
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.use(methodOverride());
app.use(express.static(publicPath));

server.listen(app.get('port'), process.env.OPENSHIFT_NODEJS_IP || server.INADDR_ANY, function() {
    logger.info('Express server listening on port ' + app.get('port'));
});


// Start the game !
// ----------------
new game.Game(io.sockets);
