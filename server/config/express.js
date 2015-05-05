/**
 * Express configuration
 */

'use strict';

var express = require('express'),
    favicon = require('serve-favicon'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    errorHandler = require('errorhandler'),
    path = require('path'),
    config = require('./environment'),
    auth = require('http-auth'),
    fs = require('fs'),
    logger = require('../utils/logger');

// transpiled dependencies
var game = require('../api/game/game'),
    admin = require('../api/administration/administration');

var httpAuthentificationFilePath = config.root + '/private/users.htpasswd';

module.exports = function(app, socketio) {
    var env = app.get('env');

    app.set('view engine', 'html');
    app.use(compression());
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser());

    app.set('appPath', path.join(config.root, 'client'));
    app.use(express.static(app.get('appPath')));

    if ('production' === env) {
        //app.use(favicon(path.join(app.use('appPath'), 'favicon.ico')));
        app.use(errorHandler());
    }

    if ('development' === env) {
        app.use(require('connect-livereload')());
        app.use(errorHandler({ dumpExceptions: true, showStack: true }))
    }

    // Start the game !
    // ----------------
    new game.Game(socketio.sockets);
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
};
