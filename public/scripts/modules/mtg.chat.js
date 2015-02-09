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

        // Methods published to the scope
        // ==============================

        $scope.messages = [];

        $scope.sendMessage = function () {
            socket.emit('send:message', {
                message: $scope.message
            });

            // add the message to our model locally
            $scope.messages.push({
                user: $rootScope.globals.currentUser.username,
                text: $scope.message
            });

            // clear message box
            $scope.message = '';
        };

        $scope.dismissMessage=function(){
            $rootScope.countMessage=0;
            $('#messages').attr('data-messages',$rootScope.countMessage);
        };

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