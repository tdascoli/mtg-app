;(function () {
    'use strict';

    var module = angular.module('mtg.lobby', ['mtg.socket','mtg.variables']);

    module.controller('LobbyCtrl', function ($scope,$rootScope,$location,socket,AuthenticationService,Game) {

        $rootScope.countMessage=0;
        $rootScope.player1=false;
        $rootScope.player2=false;
        $scope.gameName='';
        $scope.games=[];

        if ($rootScope.globals.currentUser) {
            Game.find({$or: [{player1: $scope.globals.currentUser.username}, {player2: $scope.globals.currentUser.username}]}, function (err, result) {
                /*
                 todo qbaka or track.js!
                 if (err) return console.error(err);
                 else console.log(result);
                 */
                if (!err) {
                    $scope.savedGames = result;
                }
            });
        }

        $rootScope.debug=false;

        $scope.hostGame=function(){
            $rootScope.player1=$scope.globals.currentUser.username;
            socket.emit('host', $scope.gameName);
            $location.path('/playground/'+$scope.gameName);
        };

        $scope.debugGame=function(){
            socket.emit('host:debug', 'debug-'+$rootScope.globals.currentUser.username);
            $rootScope.debug=true;
            $location.path('/playground/debug-'+$rootScope.globals.currentUser.username);
        };

        socket.on('host:update', function (newgame, player1) {
            console.log(player1, newgame);
            $scope.games.push({name:newgame,player1:player1});
        });
    });

}());