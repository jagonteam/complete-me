angular
  .module('completeMe')
  .controller('LeftBarController', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      $mdSidenav('left').close();
    };
  });
