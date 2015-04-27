// Game class
// ==========

'use strict';

var logger = require("../utils/logger");

/*
 * Time that you wait until the next question
 */
const TIME_BETWEEN_QUESTIONS = 10000;

/*
 * Time you have to answer to some question
 */
const TIME_TO_ANSWER_FOR_QUESTION = 15000;

/**
 * Game phases
 */
const GAME_PHASE_INIT = 0;
const GAME_PHASE_WAITING = 1;
const GAME_PHASE_QUESTION = 2;


export class Game {

    constructor(sockets_io) {
        this.sockets = sockets_io;
        this.currentQuestion = "";
        this.phase = GAME_PHASE_INIT;

        // listen for new users
        this.sockets.on('connection', (socket) => {
            this.addSocket(socket);
        });

        // launch questions loop
        this.runGame();
    }

    /**
     * Handle game phases
     */
    runGame() {

        // next phase is waiting until next question
        if (this.phase == GAME_PHASE_INIT || this.phase == GAME_PHASE_QUESTION) {
            this.phase = GAME_PHASE_WAITING;

            this.startTime = new Date().getTime();
            this.timeout = TIME_BETWEEN_QUESTIONS;

            this.sendWaitBeetwenQuestion();
        }

        // next phase is sending question
        else if (this.phase == GAME_PHASE_WAITING) {

            this.phase = GAME_PHASE_QUESTION;

            this.startTime = new Date().getTime();
            this.timeout = TIME_TO_ANSWER_FOR_QUESTION;

            // @todo #1 : random question before broadcast
            this.sendCurrentQuestion();
        }

        // Timeout for next phase
        setTimeout(() => {
            this.runGame();
        }, this.timeout);
    }

    /**
     * Time to go to next questions ! Get it and send it to client
     */
    sendCurrentQuestion(destination = this.sockets) {
        destination.emit('quiz:question', {
            text: "What is the day today ?",
            needResponse: true,
            time: TIME_TO_ANSWER_FOR_QUESTION,
            startTime: new Date().getTime()
        });
    }

    /**
     * Wait beetwen questions, wait and said it to client
     */
    sendWaitBeetwenQuestion(destination = this.sockets) {
        destination.emit('quiz:question', {
            text: "La prochaine question arrive bientôt !",
            needResponse: false,
            time: this.timeout,
            startTime: this.startTime
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
        this.handleNewUser(socket);

        // handle new client responses
        socket.on('quiz:answer', answer => {
            this.handleClientAnswer(socket, answer);
        });
    }

    /**
     * Handle new user, send him the rugth data
     */
    handleNewUser(socket) {
        if (this.phase == GAME_PHASE_WAITING || this.phase == GAME_PHASE_INIT) {
            this.sendWaitBeetwenQuestion(socket);
        } else if (this.phase == GAME_PHASE_QUESTION) {
            this.sendCurrentQuestion(socket);
        } else {
            logger.warn("Undefined log phase in handleNewUser : " + this.phase);
        }
    }

    /**
     * The given socket client tried to give an answer
     */
    handleClientAnswer(socket, answer) {
        logger.verbose("client send answer");

        var validated = (answer.text === "xavier");

        socket.emit('quiz:answer-feedback', {
            validated
        });
    }
}
