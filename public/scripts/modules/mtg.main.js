;(function () {
    'use strict';

    var module = angular.module('mtg.main', ['mtg.auth']);

    module.controller('MtgMainCtrl', function ($scope,$location,AuthenticationService) {

        $scope.getCredentials=function(){
            return AuthenticationService.GetCredentials();
        };

        $scope.logout=function(){
            AuthenticationService.ClearCredentials();
            $location.path('/login');
        };
    });

}());