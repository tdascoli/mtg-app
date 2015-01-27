;(function () {
    'use strict';

    var module = angular.module('mtg.chat', ['mtg.socket','mtg.variables']);

    module.controller('ChatCtrl', ['$scope','$rootScope','socket','countMessage', function ($scope, $rootScope, socket) {

        // Socket listeners
        // ================

        socket.on('send:message', function (message) {
            $scope.messages.push(message);
            $rootScope.countMessage++;
            $('#messages').attr('data-messages',$rootScope.countMessage);
        });

        socket.on('change:name', function (data) {
            changeName(data.oldName, data.newName);
        });

        socket.on('user:join', function (data) {
            $scope.messages.push({
                user: 'chatroom',
                text: 'User ' + data.name + ' has joined.'
            });
            $scope.users.push(data.name);
        });

        // add a message to the conversation when a user disconnects or leaves the room
        socket.on('user:left', function (data) {
            $scope.messages.push({
                user: 'chatroom',
                text: 'User ' + data.name + ' has left.'
            });
            var i, user;
            for (i = 0; i < $scope.users.length; i++) {
                user = $scope.users[i];
                if (user === data.name) {
                    $scope.users.splice(i, 1);
                    break;
                }
            }
        });

        // Private helpers
        // ===============

        var changeName = function (oldName, newName) {
            // rename user in list of users
            var i;
            for (i = 0; i < $scope.users.length; i++) {
                if ($scope.users[i] === oldName) {
                    $scope.users[i] = newName;
                }
            }

            $scope.messages.push({
                user: 'chatroom',
                text: 'User ' + oldName + ' is now known as ' + newName + '.'
            });
        };

        // Methods published to the scope
        // ==============================

        $scope.changeName = function () {
            socket.emit('change:name', {
                name: $scope.newName
            }, function (result) {
                if (!result) {
                    alert('There was an error changing your name');
                } else {

                    changeName($scope.name, $scope.newName);

                    $scope.name = $scope.newName;
                    $scope.newName = '';
                }
            });
        };

        $scope.messages = [];

        $scope.sendMessage = function () {
            socket.emit('send:message', {
                message: $scope.message
            });

            // add the message to our model locally
            $scope.messages.push({
                user: $scope.name,
                text: $scope.message
            });

            // clear message box
            $scope.message = '';
        };

        $scope.dismissMessage=function(){
            $rootScope.countMessage=0;
            $('#messages').attr('data-messages',$rootScope.countMessage);
        };

        socket.on('send:name', function (data) {
            $scope.name = data.name;
        });

        $scope.hasMessage=function(){
            $scope.$watch($rootScope.countMessage, function(){
                if ($rootScope.countMessage>0){
                    return true;
                }
                return false;
            });
        };
        $scope.getCountMessage=function(){
            return $rootScope.countMessage;
        };

    }]);

}());