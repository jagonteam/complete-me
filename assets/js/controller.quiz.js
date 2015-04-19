angular.module('completeMe')
    .controller('QuizController', ['$scope', '$location',
        function($scope, $location) {

            $scope.question = {
                text: "En attente de la prochaine question..."
            };

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

        }
    ]);
