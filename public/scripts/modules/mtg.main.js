;(function () {
    'use strict';

    var module = angular.module('mtg.main', []);

    module.controller('MtgMainCtrl', function ($scope) {

        $scope.hasMessage=true;
        $scope.countMessage=2;
    });

}());