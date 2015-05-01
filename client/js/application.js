angular.module('completeMe', ['ngRoute','ngMaterial']).
config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/', {
        templateUrl: '/html/login.html',
        controller: 'LoginController',
        controllerAs: 'login'
    }).
    when('/quiz', {
        templateUrl: '/html/quiz.html',
        controller: 'QuizController'
    }).
    otherwise({
        redirectTo: '/'
    });
}]);
