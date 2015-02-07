;(function () {
    'use strict';

    var module = angular.module('mtg.socket', []);

    module.factory('socket', function ($rootScope) {
        var socket = io.connect();

        // on connection to server, ask for user's name with an anonymous callback
        /*
        socket.on('connect', function(){
            // call the server-side function 'adduser' and send one parameter (value of prompt)
            socket.emit('adduser', prompt("What's your name?"));
        });
        */
        // listener, whenever the server emits 'updatechat', this updates the chat body
        socket.on('mtg:update', function (username, data) {
           console.log(username, data);
        });

        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    });

    module.filter('interpolate', function (version) {
        return function (text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        }
    });

}());