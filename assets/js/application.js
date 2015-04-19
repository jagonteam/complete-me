angular.module('completeMe', ['ngRoute']).
config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/quiz', {
        templateUrl: '/html/quiz.html',
        controller: 'QuizController'
    }).
    otherwise({
        redirectTo: '/quiz'
    });
}]);
