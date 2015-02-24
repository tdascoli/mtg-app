;(function () {
    'use strict';

    var module = angular.module('mtg.lobby', ['mtg.socket','mtg.variables','ngLodash']);

    module.controller('LobbyCtrl', function ($scope,$rootScope,$location,lodash,socket,AuthenticationService,Game) {

        $rootScope.countMessage=0;
        $rootScope.player1=false;
        $rootScope.player2=false;
        $scope.gameName='';
        $scope.games=[];
        $scope.newGame='';

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

        $scope.loadGame=function(id,name){
            $scope.gameName=name;
            socket.emit('host:save-game', name);
            $location.path('/playground/load/'+id);
        };

        $rootScope.debugGame=function(){
            socket.emit('host:debug', 'debug-'+$rootScope.globals.currentUser.username);
            $location.path('/playground/debug/debug-'+$rootScope.globals.currentUser.username);
        };

        socket.on('host:update', function (games, newgame) {
            $scope.newGame=newgame;
            console.log(games);
            $scope.games = games;
        });

        socket.on('host:list', function (games) {
            console.log(games);
            $scope.games = games;
        });
    });

}());