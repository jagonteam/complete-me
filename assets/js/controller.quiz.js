angular.module('completeMe')
    .controller('QuizController', ['$scope', '$location',
        function($scope, $location) {

            // default values
            $scope.question = {
                text: "En attente de la prochaine question...",
                needResponse: false,
                time: 60000,
                startTime: new Date().getTime()
            };
            $scope.answer = {
                placeholder: "Entez votre réponse ici !"
            };
            $scope.currentProgression = 0;
            setInterval(function() {
                updateCurrentProgression();
            }, 500);

            // open socket connection
            var currentLocationRoot = $location.protocol() + '://' + $location.host() + ':' + $location.port();
            console.info('Websocket connection url : ' + currentLocationRoot);
            var socket = io.connect(currentLocationRoot);

            /*
             * Triggered when the server tell someone join
             */
            socket.on('user:join', function(user) {
                console.info("some user has join the game");
            });

            /*
             * Triggered when the server send a question
             */
            socket.on('quiz:question', function(question) {
                $scope.$apply(function() {
                    $scope.question = question;
                });
            });

            /**
             * Triggered when the user submit form (so, an answer)
             */
            $scope.submitAnswer = function() {
                console.debug("user is trying answer : " + $scope.answer.text);

                // send answer to server
                socket.emit("quiz:answer", $scope.answer);

                // reset current text input
                $scope.answer.text = "";

                // set dummy placeholdert
                $scope.answer.placeholder = "Presque, essayez encore !";
            }

            /**
             * The server handled my answer, and tell me if its valid or not
             */
            socket.on('quiz:answer-feedback', function(feedback) {
                $scope.$apply(function() {
                    if (feedback.validated) {
                        console.debug("answer is validated by server :)");
                    } else {
                        console.debug("answer is not validated by server :(");
                    }
                });
            });

            /**
             * Get current progress according to current phase
             */
            updateCurrentProgression = function() {
                var currentProgressTime = new Date().getTime() - $scope.question.startTime;
                $scope.$apply(function() {
                    $scope.currentProgression = (100 * currentProgressTime) / $scope.question.time;
                });
            }
        }
    ]);
