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
const GAME_PHASE_WAITING = 1;
const GAME_PHASE_QUESTION = 2;


export class Game {

    constructor(sockets_io) {
        this.sockets = sockets_io;
        this.currentQuestion = "";
        this.phase = GAME_PHASE_WAITING;

        // listen for new users
        this.sockets.on('connection', (socket) => {
            this.addSocket(socket);
        });

        // launch questions loop
        this.sendWaitBeetwenQuestion();
    }

    /**
     * Move to the given phase if it's not the current phase.
     * @return : true if the phase has been change, false otherwise.
     */
    _nextPhase(phase) {
        if (this.currentPhase == phase) {
            return false;
        }
        this.currentPhase = phase;
        return true;
    }

    /**
     * Time to go to next questions ! Get it and send it to client
     */
    sendCurrentQuestion(destination = this.sockets) {
        logger.verbose("next question");

        if (this._nextPhase(GAME_PHASE_QUESTION)) { // phase has changed !
            // @todo #1 : random question before broadcast
            this.broadcastCurrentQuestion();

            // launch next question timer
            setTimeout(() => {
                this.sendWaitBeetwenQuestion();
            }, TIME_TO_ANSWER_FOR_QUESTION);

        } else { // phase hasn't change, but new client is connected (send him infos)
            this.broadcastCurrentQuestion(destination);
        }
    }

    /**
     * Wait beetwen questions, wait and said it to client
     */
    sendWaitBeetwenQuestion(destination = this.sockets) {
        logger.verbose("wait until next question");
        if (this._nextPhase(GAME_PHASE_WAITING)) { // phase has changed !

            // broacast wait message
            destination.emit('quiz:question', {
                text: "La prochaine question arrive bientôt !",
                needResponse: false,
                time: TIME_BETWEEN_QUESTIONS
            });

            // launch wait timer
            setTimeout(() => {
                this.sendCurrentQuestion();
            }, TIME_BETWEEN_QUESTIONS);
        } else { // phase hasn't change, but new client is connected (send him infos)
            destination.emit('quiz:question', {
                text: "Bienvenue ! Le jeu commence bientôt !",
                needResponse: false,
                time: TIME_BETWEEN_QUESTIONS
            });
        }
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
        if (this.phase == GAME_PHASE_WAITING) {
            this.sendWaitBeetwenQuestion(socket);
        } else if (this.phase == GAME_PHASE_QUESTION) {
            this.sendCurrentQuestion(socket);
        } else {
            logger.warn("Undefined log phase in handleNewUser : " + this.phase);
        }
    }

    /**
     * Send current question to all connected users
     */
    broadcastCurrentQuestion(destination = this.sockets) {
        destination.emit('quiz:question', {
            text: "What is the day today ?",
            needResponse: true
        });
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
