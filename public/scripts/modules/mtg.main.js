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

    module.controller('LoginCtrl', function ($scope, Auth, $location) {
        $scope.error = {};
        $scope.user = {};

        $scope.login = function(form) {
            Auth.login('password', {
                    'email': $scope.user.email,
                    'password': $scope.user.password
                },
                function(err) {
                    $scope.errors = {};

                    if (!err) {
                        $location.path('/');
                    } else {
                        angular.forEach(err.errors, function(error, field) {
                            form[field].$setValidity('mongoose', false);
                            $scope.errors[field] = error.type;
                        });
                        $scope.error.other = err.message;
                    }
                });
        };
    });

    module.controller('SignupCtrl', function ($scope, Auth, $location) {
        $scope.register = function(form) {
            Auth.createUser({
                    email: $scope.user.email,
                    username: $scope.user.username,
                    password: $scope.user.password
                },
                function(err) {
                    $scope.errors = {};

                    if (!err) {
                        $location.path('/');
                    } else {
                        angular.forEach(err.errors, function(error, field) {
                            form[field].$setValidity('mongoose', false);
                            $scope.errors[field] = error.type;
                        });
                    }
                }
            );
        };
    });

    module.factory('Auth', function Auth($location, $rootScope, Session, User, $cookieStore) {
        $rootScope.currentUser = $cookieStore.get('user') || null;
        $cookieStore.remove('user');

        return {

            login: function(provider, user, callback) {
                var cb = callback || angular.noop;
                Session.save({
                    provider: provider,
                    email: user.email,
                    password: user.password,
                    rememberMe: user.rememberMe
                }, function(user) {
                    $rootScope.currentUser = user;
                    return cb();
                }, function(err) {
                    return cb(err.data);
                });
            },

            logout: function(callback) {
                var cb = callback || angular.noop;
                Session.delete(function(res) {
                        $rootScope.currentUser = null;
                        return cb();
                    },
                    function(err) {
                        return cb(err.data);
                    });
            },

            createUser: function(userinfo, callback) {
                var cb = callback || angular.noop;
                User.save(userinfo,
                    function(user) {
                        $rootScope.currentUser = user;
                        return cb();
                    },
                    function(err) {
                        return cb(err.data);
                    });
            },

            currentUser: function() {
                Session.get(function(user) {
                    $rootScope.currentUser = user;
                });
            },

            changePassword: function(email, oldPassword, newPassword, callback) {
                var cb = callback || angular.noop;
                User.update({
                    email: email,
                    oldPassword: oldPassword,
                    newPassword: newPassword
                }, function(user) {
                    console.log('password changed');
                    return cb();
                }, function(err) {
                    return cb(err.data);
                });
            },

            removeUser: function(email, password, callback) {
                var cb = callback || angular.noop;
                User.delete({
                    email: email,
                    password: password
                }, function(user) {
                    console.log(user + 'removed');
                    return cb();
                }, function(err) {
                    return cb(err.data);
                });
            }
        };
    });

    module.factory('Session', function ($resource) {
        return $resource('/auth/session/');
    });

    module.factory('User', function ($resource) {
        return $resource('/auth/users/:id/', {},
            {
                'update': {
                    method:'PUT'
                }
            });
    });

}());