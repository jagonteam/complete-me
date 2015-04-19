// Game class
// ==========

'use strict';

var logger = require("../utils/logger");


export class Task {

    constructor(sockets_io) {
        this.sockets = sockets_io;
        this.currentQuestion = "";

        // listen for new users
        this.sockets.on('connection', (socket) => {
            this.addSocket(socket);
        });
    }

    /**
     * called when some websocket connect
     */
    addSocket(socket) {
        logger.info("user joined the game");

        // tell everyone that someone joined !
        this.sockets.emit('user:join', {});

        // send question to the new user
        this.broadcastCurrentQuestion();
    }

    /**
     * Send current question to all connected users
     */
    broadcastCurrentQuestion() {
        this.sockets.emit('quiz:question', {
            text: "What is the day today ?"
        });
    }
}
