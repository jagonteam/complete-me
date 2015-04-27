// App entry point
// ===============

'use strict';

var express = require('express'),
    http = require('http'),
    path = require('path'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    methodOverride = require('method-override'),
    auth = require('http-auth');

var logger = require("./utils/logger");

// transpiled dependencies
var game = require("./build/game"),
	admin = require("./build/administration");


// Configuration
// -------------
var publicPath = path.join(__dirname) + '/assets/';
var httpAuthentificationFilePath = path.join(__dirname) + '/private/users.htpasswd';


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
var administrationArea = new admin.Administration();


// Adminisation route
//-------------------
if (fs.existsSync(httpAuthentificationFilePath)) {
    logger.info('Using http authentification file (' + httpAuthentificationFilePath + ')');
    var basic = auth.basic({
        realm: "Restricted Area.",
        file: httpAuthentificationFilePath
    });
    app.get('/admin/api/crawl', auth.connect(basic), function(req, res) {
        administrationArea.crawlAnswers(req, res);
    });
} else {
    logger.warn('No http authentification file found (' + httpAuthentificationFilePath + '), administration routes are disabled !');
}

