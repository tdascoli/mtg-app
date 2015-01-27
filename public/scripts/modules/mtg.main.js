;(function () {
    'use strict';

    var module = angular.module('mtg.main', ['mtg.chat','mtg.directives','mtg.modals','mtg.playground','mtg.socket','mtg.variables']);

    module.controller('MtgMainCtrl', function ($scope,$rootScope,socket) {

        $rootScope.countMessage=0;

        socket.on('init', function (data) {
            $scope.name = data.name;
            $scope.users = data.users;
            $scope.games = data.games;
        });
    });

}());