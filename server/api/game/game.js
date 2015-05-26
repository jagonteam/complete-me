// Game class
// ==========

'use strict';


import Elastic from 'machines-elastic';

import logger from '../../utils/logger';

import config from '../../config/environment';

/*
 * Time that you wait until the party starts !
 */
const TIME_BETWEEN_PARTIES = 10000;

/*
 * Time that you wait until the next question
 */
const TIME_BETWEEN_QUESTIONS = 10000;

/*
 * Time you have to answer to some question
 */
const TIME_TO_ANSWER_FOR_QUESTION = 15000;

/**
 * Number of question by party
 */
const NUMBER_OF_QUESTION_IN_PARTY = 10;

/**
 * Game phases
 */
const GAME_PHASE_INIT = 0;
const GAME_PHASE_WAITING = 1;
const GAME_PHASE_QUESTION = 2;

/**
 * Elastic configuration
 */
const ES_HOST = config.elastic.host;
const ES_PORT = config.elastic.port;


export class Game {

    constructor(sockets_io) {

        // sockets for current game
        this.sockets = sockets_io;

        // current game question list
        this.questions = [];
        // current game question index (refer to this.questions position, -1 means not defined yet (the game has not started))
        this.currentQuestionIndex = -1;
        // current question possible answers (contains informations about if they are discovered)
        this.currentAnswers = [];

        // next game phase
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
        // This is the action to do after launching current phase.
        // Typically, we will lauch next phase after current phase timeout
        let currentGamePhaseIsLaunched = () => {
            // Timeout for next phase
            setTimeout(() => {
                this.runGame();
            }, this.timeout);
        }

        // During initialization, we need to prepare game data (question list, ...)
        if (this.phase === GAME_PHASE_INIT) {
            this._handleGamePhaseInit(currentGamePhaseIsLaunched);
        }

        // During question phase, we broadcast the current question
        else if (this.phase === GAME_PHASE_QUESTION) {
            this._handleGamePhaseQuestion(currentGamePhaseIsLaunched);
        }

        // During waiting phase, we just wait...
        else if (this.phase === GAME_PHASE_WAITING) {
            this._handleGamePhaseWaiting(currentGamePhaseIsLaunched);
        }
    }

    /**
     * Game works on init phase
     */
    _handleGamePhaseInit(callback) {
        logger.verbose("init phase started");

        // configure the next game
        this.currentQuestionIndex = -1;
        this.getRandomQuestionList((questions) => {
            this.questions = questions;
            logger.verbose("questions : " + JSON.stringify(this.questions));

            this.startTime = new Date().getTime();
            this.timeout = TIME_BETWEEN_PARTIES;

            this.sendNewPartyMessage();

            // next phase
            this.phase = GAME_PHASE_QUESTION;
            callback();
        });
    }

    /**
     * Game works on question phase
     */
    _handleGamePhaseQuestion(callback) {
        logger.verbose("question phase started");

        // go to next question
        this.currentQuestionIndex++;

        // end of game
        if (this.currentQuestionIndex >= NUMBER_OF_QUESTION_IN_PARTY || this.currentQuestionIndex >= this.questions.length) {
            this._handleGamePhaseInit(callback);
            return;
        }

        logger.verbose("current question : [" + (this.currentQuestionIndex + 1) + "/" + this.questions.length + "]");

        this.getAnswersForQuestion(this.questions[this.currentQuestionIndex], (answers) => {
            this.currentAnswers = answers;

            this.startTime = new Date().getTime();
            this.timeout = TIME_TO_ANSWER_FOR_QUESTION;

            this.sendCurrentQuestion();

            // next phase
            this.phase = GAME_PHASE_WAITING;
            callback();
        });
    }

    /**
     * Game works on waiting phase
     */
    _handleGamePhaseWaiting(callback) {
        logger.verbose("waiting phase started");

        this.startTime = new Date().getTime();
        this.timeout = TIME_BETWEEN_QUESTIONS;

        this.sendWaitBeetwenQuestion();

        // next phase
        this.phase = GAME_PHASE_QUESTION;
        callback();
    }

    /**
     * Initialiation phase
     */
    sendNewPartyMessage(destination = this.sockets) {
        this._broadcastAnswersState(true);
        destination.emit('quiz:question', {
            text: "La partie (re-?)commence bientôt !",
            needResponse: false,
            time: this.timeout,
            startTime: this.startTime
        });
    }

    /**
     * Wait beetwen questions, wait and said it to client
     */
    sendWaitBeetwenQuestion(destination = this.sockets) {
        this._broadcastAnswersState(true);
        destination.emit('quiz:question', {
            text: "La prochaine question arrive bientôt !",
            needResponse: false,
            time: this.timeout,
            startTime: this.startTime
        });
    }

    /**
     * Time to go to next questions ! Get it and send it to client
     */
    sendCurrentQuestion(destination = this.sockets) {
        this._broadcastAnswersState();
        destination.emit('quiz:question', {
            text: this.questions[this.currentQuestionIndex].text,
            needResponse: true,
            time: this.timeout,
            startTime: this.startTime
        });
    }

    /**
     * Brodcast current question answers
     */
    sendLastQuestionAnswers(destination = this.sockets) {
        this._broadcastAnswersState(true);
        destination.emit('quiz:answers', {
            text: "La partie re-commence bientôt !",
            needResponse: false,
            time: this.timeout,
            startTime: this.startTime,
            answers: this.currentAnswers
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
        socket.emit('quiz:question', {
            text: "Bienvenue ! Nous vous introduisons dans la partie...",
            needResponse: false,
            time: this.timeout,
            startTime: this.startTime
        });
    }

    /**
     * The given socket client tried to give an answer
     */
    handleClientAnswer(socket, answer) {
        logger.verbose("client send answer");

        this.validateAnswer(this.questions[this.currentQuestionIndex], answer, (answers) => {
            logger.verbose("answers for text '" + answer.text + "' : " + JSON.stringify(answers));
            for (let answerIndex in answers) {
                let currentAnswer = this.currentAnswers[answers[answerIndex].rank];
                currentAnswer.display = true;
                currentAnswer.validated = {
                    isValidated: true,
                    by: {
                        name: "Xavier"
                    }
                }
            }
            this._broadcastAnswersState();
        });
    }

    /**
      * Broadcast current answer state after "proxifying" brodcasted data
      *
      * @param allAnswer : force broadcast of all data to client, they will get all the answers !
      */
    _broadcastAnswersState(allAnswer = false) {
        let completedAnswers = this.currentAnswers.map((answer) => {

            // force broadcast of all results
            if (allAnswer) {
                // force display
                answer.display = true;
                // add informations "that answer is not validated" if necessary
                if (answer.validated === undefined || answer.validated.isValidated === undefined || ! answer.validated.isValidated) {
                    answer.validated = {
                        isValidated: false,
                        by: {}
                    }
                }
                return answer;
            }

            // display current answer, according to discover state
            // this doesn't sound important but it's important proxy
            if (answer.validated === undefined || answer.validated.isValidated === undefined || ! answer.validated.isValidated) {
                return {
                    text: "???",
                    display: false,
                    validated: {
                        isValidated: false,
                        by: {}
                    }
                }
            }

            return answer;
        });

        this.sockets.emit('quiz:answer-feedback', completedAnswers);
    }

    /**
     * Retrieve a random list of question from ES
     */
    getRandomQuestionList(callback) {
        Elastic.searchCustom({
            port: ES_PORT,
            hostname: ES_HOST,
            index: 'query',
            type: 'query',
            query: '{"from" : 0, "size" : ' + NUMBER_OF_QUESTION_IN_PARTY + ', "query": {"function_score" : {"query" : { "match_all": {} }, "random_score" : {}}}}'
        }).exec({
            error: (err) => {
                logger.error("Could not getRandomQuestionList : " + err);
                return;
            },
            couldNotConnect: () => {
                logger.error("Could not connect to elastic");
                return;
            },
            noSuchIndex: () => {
                logger.error("'query' index not found");
                return;
            },
            success: (result) => {
                callback(result.map(function(queryResult) {
                    return queryResult._source;
                }));
            },
        });
    }

    /**
     * Retrieve a random list of question from ES
     */
    validateAnswer(question, answer, callback) {
        Elastic.searchCustom({
            port: ES_PORT,
            hostname: ES_HOST,
            index: 'response',
            type: 'response',
            query: '{"filter": {"term": {"query.text": "' + question.text + '"}},"query": {"match": {"text": {"query": "' + answer.text + '","fuzziness": "AUTO"}}}, "sort":["rank"]}'
        }).exec({
            error: (err) => {
                logger.error("Could not getRandomQuestionList : " + err);
                return;
            },
            couldNotConnect: () => {
                logger.error("Could not connect to elastic");
                return;
            },
            noSuchIndex: () => {
                logger.error("'query' index not found");
                return;
            },
            success: (result) => {
                callback(result.map(function(queryResult) {
                    return queryResult._source;
                }));
            },
        });
    }

    /**
     * Retrieve a random list of question from ES
     */
    getAnswersForQuestion(question, callback) {
        Elastic.searchCustom({
            port: ES_PORT,
            hostname: ES_HOST,
            index: 'response',
            type: 'response',
            query: '{"filter": {"term": {"query.text": "' + question.text + '"}}, "sort":["rank"]}'
        }).exec({
            error: (err) => {
                logger.error("Could not getRandomQuestionList : " + err);
                return;
            },
            couldNotConnect: () => {
                logger.error("Could not connect to elastic");
                return;
            },
            noSuchIndex: () => {
                logger.error("'response' index not found");
                return;
            },
            success: (result) => {
                callback(result.map(function(queryResult) {
                    return queryResult._source;
                }));
            },
        });
    }
}
