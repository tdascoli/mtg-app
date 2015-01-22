;(function () {
    'use strict';

    var module = angular.module('mtg.socket', []);

    module.factory('socket', function ($rootScope) {
        var socket = io.connect();
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