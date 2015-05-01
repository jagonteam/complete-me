angular
    .module('completeMe')
    .controller('HeaderController', function($scope, $timeout, $mdSidenav, $mdUtil, $log) {
        $scope.toggleLeftBar = buildToggler('left');

        function buildToggler(navID) {
            var debounceFn = $mdUtil.debounce(function() {
                $mdSidenav(navID).toggle();
            }, 300);
            return debounceFn;
        }
    });
