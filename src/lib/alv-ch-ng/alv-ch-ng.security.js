/* alv-ch-ng - 0.2.0 - 2015-01-13 - Copyright (c) 2015 Informatik der Arbeitslosenversicherung; */
;(function () {
    'use strict';

    var module = angular.module('alv-ch-ng.security', ['alv-ch-ng.ui-forms']);

    /**
     * @ngdoc interface
     * @name alv-ch-ng.security.AuthenticationService
     *
     * @description With the AuthenticationService one can provide the required mechanisms to authenticate a user.
     * The default authenticator returns null, so this module should be configured in the config phase of your app.
     */
    module.provider('AuthenticationService', function ($httpProvider) {

        var DEFAULT_AUTHENTICATOR_NAME = 'defaultAuthenticator';
        // sandbox
        //var _apiKey='7ea6e01f516b0a3ba8e9df75d1f9a6f6';
        //var _authy = require('authy')(_apiKey, 'http://sandbox-api.authy.com');
        // production
        //var _apiKey='c4fb9462d735a11c7c0af82ad95014ee';
        //var _authy = require('authy')(_apiKey);

        var _constants = {
            EVENT_NAME_LOGIN: 'sec:login',
            EVENT_NAME_LOGIN_REQUIRED: 'sec:loginRequired',
            EVENT_NAME_LOGIN_FAILED: 'sec:loginFailed',
            EVENT_NAME_LOGIN_REQUEST: 'sec:loginRequest',
            EVENT_NAME_LOGIN_CONFIRMED: 'sec:loginConfirmed',
            EVENT_NAME_2FA_REQUIRED: 'sec:2faRequired',
            EVENT_NAME_2FA_FAILED: 'sec:2faFailed',
            EVENT_NAME_LOGOUT: 'sec:logout'
        };

        var _httpHeaders = $httpProvider.defaults.headers;

        var _authenticators = {};
        _authenticators[DEFAULT_AUTHENTICATOR_NAME] = {
            authenticate:   function (userName, password, options, rootScope) {
                // mock
                _httpHeaders.common['Authorization'] = 'Basic ' + _base64Service.encode(userName + ':' + password);
                _http.get(_userServiceEndPoint)
                    .success(function (data) {
                        rootScope.user = data;
                        if (rootScope.user.authToken){
                            rootScope.$broadcast(_constants.EVENT_NAME_2FA_REQUIRED);
                        }
                        else {
                            rootScope.$broadcast(_constants.EVENT_NAME_LOGIN_CONFIRMED);
                        }
                    })
                    .error(function () {
                        rootScope.user = null;
                        rootScope.$broadcast(_constants.EVENT_NAME_LOGIN_FAILED);
                    });
            }
        };

        var _authenticatorOptions = {};
        _authenticatorOptions[DEFAULT_AUTHENTICATOR_NAME] = {
            endpoint: '/api/currentUser'
        };

        var _authenticatorName = DEFAULT_AUTHENTICATOR_NAME;
        var _http = {};

        var _base64Service;
        var _rootScope;
        var _userServiceEndPoint = '/api/currentUser';

        function getConstants() {
            return _constants;
        }

        function setConstants(constants) {
            if (!constants) {
                throw new Error('constants must not be empty.');
            }
            jQuery.extend(true, _constants, constants);
        }

        function setAuthenticatorName(authenticatorName) {
            if (!authenticatorName) {
                throw new Error('authenticatorName must not be empty.');
            }
            if (!_authenticators[authenticatorName]) {
                throw new Error('No authenticator with name \'' + authenticatorName + '\' registered.');
            }
            _authenticatorName = authenticatorName;
        }

        function addAuthenticator(name, authenticator) {
            if (!name) {
                throw new Error('name must not be empty.');
            }
            if (name === DEFAULT_AUTHENTICATOR_NAME) {
                throw new Error('name must not be equal to \'' + DEFAULT_AUTHENTICATOR_NAME + '\'.');
            }
            if (!authenticator) {
                throw new Error('authenticator must not be empty.');
            }
            if (!angular.isFunction(authenticator.authenticate)) {
                throw new Error('authenticator.authenticate must be a function.');
            }
            _authenticators[name] = authenticator;
        }

        function getAuthenticator() {
            return _authenticators[_authenticatorName];
        }

        function getAuthenticatorOptions() {
            return _authenticatorOptions[_authenticatorName];
        }

        function setAuthenticatorOptionsFor(name, options) {
            if (!name) {
                throw new Error('name must not be empty.');
            }
            if (!_authenticators[name]) {
                throw new Error('Could not configure unknown authenticator \'' + name + '\'.');
            }
            if (!options) {
                throw new Error('config must not be empty.');
            }
            _authenticatorOptions[name] = options;
        }

        function login(userName, password) {
            return getAuthenticator().authenticate(userName, password, getAuthenticatorOptions(), _rootScope);
        }

        function getCurrentUser() {
            return _rootScope.user;
        }

        function isAuthenticated() {
            return getCurrentUser() ? true : false;
        }

        function logout() {
            _rootScope.user = null;
            _rootScope.$broadcast(_constants.EVENT_NAME_LOGOUT);
            return true;
        }

        return {
            $get: function ($rootScope, $http, Base64Service) {
                _rootScope = $rootScope;
                _base64Service = Base64Service;
                _http = $http;
                return {
                    getConstants: getConstants,
                    login: login,
                    getCurrentUser: getCurrentUser,
                    isAuthenticated: isAuthenticated,
                    logout: logout
                };
            },
            setConstants: setConstants,
            setAuthenticatorName: setAuthenticatorName,
            addAuthenticator: addAuthenticator,
            setAuthenticatorOptionsFor: setAuthenticatorOptionsFor
        };
    });

    /**
     * @ngdoc interface
     * @name alv-ch-ng.security.SecurityService
     *
     * @description the core of the med-ng-security module. the stateHolder for user / security data.
     */
    module.factory('SecurityService', function ($rootScope, $http, AuthenticationService) {

        /**
         * @ngdoc function
         * @name alv-ch-ng.security.SecurityService.login
         *
         * @property {String} userName the userName to log in
         * @property {String} password the password to log in
         *
         * @description try to log in ...
         */
        function login(userName, password) {
            if (!AuthenticationService.isAuthenticated()) {
                return AuthenticationService.login(userName, password);
            }
        }

        /**
         * @ngdoc function
         * @name med-ng-security.SecurityService.logout
         *
         * @description Removes the current user from all scopes and broadcasts an adequate event.
         */
        function logout() {
            if (AuthenticationService.isAuthenticated()) {
                return AuthenticationService.logout();
            }
            return false;
        }

        /**
         * @ngdoc function
         * @name alv-ch-ng.security.SecurityService.hasRole
         * @property {String} role the role to check for
         *
         * @description returns true if the current user owns the given role.
         */
        function hasRole(role) {
            var user = $rootScope.user;
            if (!role) {
                return true;
            }
            var value = true;
            if (role.trim().indexOf('!') === 0) {
                value = !value;
                role = role.replace('!', '');
            }
            if (user && user.roles) {
                for (var i = 0; i < user.roles.length; i++) {
                    if (user.roles[i].key.trim().toLowerCase() === role.trim().toLowerCase()) {
                        return value;
                    }
                }
            }
            return !value;
        }

        /**
         * @ngdoc function
         * @name alv-ch-ng.security.SecurityService.hasAnyRole
         * @property {Array} roles the roles to check for
         *
         * @description returns true if the current user owns ANY of the given roles.
         */
        function hasAnyRole(roles) {
            if (!roles || roles.length === 0) {
                return true;
            }
            for (var i = 0; i < roles.length; i++) {
                if (hasRole(roles[i])) {
                    return true;
                }
            }
            return false;
        }

        /**
         * @ngdoc function
         * @name alv-ch-ng.security.SecurityService.hasAllRoles
         * @property {Array} roles the roles to check for
         *
         * @description returns true if the current user owns ALL the given roles.
         */
        function hasAllRoles(roles) {
            if (!roles) {
                return true;
            }
            for (var i = 0; i < roles.length; i++) {
                if (!hasRole(roles[i])) {
                    return false;
                }
            }
            return true;
        }

        /**
         * @ngdoc function
         * @name alv-ch-ng.security.SecurityService.hasGroup
         * @property {String} group the group to check for
         *
         * @description returns true if the current user is member of the given group.
         */
        function hasGroup(group) {
            if (!group) {
                return true;
            }
            var user = $rootScope.user;
            var value = true;

            if (group.trim().indexOf('!') === 0) {
                value = !value;
                group = group.replace('!', '');
            }
            if (user && user.groups) {
                for (var i = 0; i < user.groups.length; i++) {
                    if (user.groups[i].trim().toLowerCase() === group.trim().toLowerCase()) {
                        return value;
                    }
                }
            }
            return !value;
        }

        /**
         * @ngdoc function
         * @name alv-ch-ng.security.SecurityService.hasAnyGroup
         * @property {Array} groups the groups to check for
         *
         * @description returns true if the current user is member of any of the given groups.
         */
        function hasAnyGroup(groups) {
            if (!groups) {
                return true;
            }
            for (var i = 0; i < groups.length; i++) {
                if (hasGroup(groups[i])) {
                    return true;
                }
            }
            return false;
        }

        /**
         * @ngdoc function
         * @name alv-ch-ng.security.SecurityService.hasAllGroups
         * @property {Array} groups the groups to check for
         *
         * @description returns true if the current user is member of ALL the usergroups.
         */
        function hasAllGroups(groups) {
            if (!groups) {
                return true;
            }
            for (var i = 0; i < groups.length; i++) {
                if (!hasGroup(groups[i])) {
                    return false;
                }
            }
            return true;
        }

        return {
            login: login,
            logout: logout,
            isAuthenticated: AuthenticationService.isAuthenticated,
            hasRole: hasRole,
            hasAnyRole: hasAnyRole,
            hasAllRoles: hasAllRoles,
            hasGroup: hasGroup,
            hasAnyGroup: hasAnyGroup,
            hasAllGroups: hasAllGroups,
            getConstants: AuthenticationService.getConstants,
            getCurrentUser: AuthenticationService.getCurrentUser
        };
    });

    var matcher = new RegExp('"|\\[|]', 'g');

    function checkAndHandlePermission(SecurityService, element, checkFn, itemString, scope) {
        if (!itemString) {
            return;
        }
        var tokens = itemString.replace(matcher, '').split(',');

        if (!checkFn(tokens)) {
            element.addClass('ng-hide');
        }
        scope.$on(SecurityService.getConstants().EVENT_NAME_LOGOUT, function () {
            if (!checkFn(tokens)) {
                element.addClass('ng-hide');
            } else {
                element.removeClass('ng-hide');
            }
        });
        scope.$on(SecurityService.getConstants().EVENT_NAME_LOGIN_CONFIRMED, function () {
            if (checkFn(tokens)) {
                element.removeClass('ng-hide');
            }
        });
    }

    function checkAndHandleAuth(SecurityService, scope, element, inverseOrder) {

        if (!SecurityService.isAuthenticated()) {
            if (inverseOrder) {
                element.removeClass('ng-hide');
            } else {
                element.addClass('ng-hide');
            }
        } else {
            if (inverseOrder) {
                element.addClass('ng-hide');
            } else {
                element.removeClass('ng-hide');
            }
        }
        scope.$on(SecurityService.getConstants().EVENT_NAME_LOGIN_CONFIRMED, function () {
            if (inverseOrder) {
                element.addClass('ng-hide');
            } else {
                element.removeClass('ng-hide');
            }
        });
        scope.$on(SecurityService.getConstants().EVENT_NAME_LOGOUT, function () {
            if (inverseOrder) {
                element.removeClass('ng-hide');
            } else {
                element.addClass('ng-hide');
            }
        });
    }

    /**
     * @ngdoc directive
     * @name alv-ch-ng.security.secHasRole
     * @property {String} sec-has-role a comma separated string of role(s) the user must own. if none matches, the element will be hidden.
     * @restrict A
     *
     * @description Check the existence of a role with this directive. The marked element will be shown if the user owns
     * one of the given roles.
     */
    module.directive('hasRole', ['$rootScope', 'SecurityService', function ($rootScope, SecurityService) {
        return {
            restrict: 'A',
            replace: false,
            priority: 50,
            link: function (scope, element, attrs) {
                checkAndHandlePermission(SecurityService, element, SecurityService.hasAnyRole, attrs.hasRole, $rootScope);
            }
        };
    }]);

    /**
     * @ngdoc directive
     * @name alv-ch-ng.security.secAuth
     * @restrict A
     *
     * @description Check if the user is authenticated.
     */
    module.directive('auth', ['$rootScope', 'SecurityService', function ($rootScope, SecurityService) {
        return {
            restrict: 'A',
            replace: false,
            priority: 50,
            link: function (scope, element) {
                checkAndHandleAuth(SecurityService, $rootScope, element);
            }
        };
    }]);

    /**
     * @ngdoc directive
     * @name alv-ch-ng.security.secNotAuth
     * @restrict A
     *
     * @description Check if the user is not authenticated.
     */
    module.directive('notAuth', ['$rootScope', 'SecurityService', function ($rootScope, SecurityService) {
        return {
            restrict: 'A',
            replace: false,
            priority: 50,
            link: function (scope, element) {
                checkAndHandleAuth(SecurityService, $rootScope, element, true);
            }
        };
    }]);

    /**
     * @ngdoc directive
     * @name security.LoginForm
     * @description display login form
     *
     */
    module.directive('formLogin', ['SecurityService', 'AuthenticationService', function(SecurityService, AuthenticationService){
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'template/security/form-login.html',
            priority: 50,
            link: function(scope){
                scope.login=function(){
                    SecurityService.login(scope.loginUsr,scope.loginPwd);
                };

                scope.$on(AuthenticationService.getConstants().EVENT_NAME_2FA_REQUIRED, function(){
                    scope.authTokenShow=true;
                });
            }
        };
    }]);

    /**
     * @ngdoc directive
     * @name security.LoginFormMessage
     * @description display login form messages
     *
     */
    module.directive('formLoginMessage', ['$compile','AuthenticationService', function($compile,AuthenticationService){
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'template/security/form-login-message.html',
            priority: 50,
            link: function(scope){
                scope.formLoginMessage={};
                scope.formLoginMessage.display=false;
                scope.formLoginMessage.severity='info';
                scope.formLoginMessage.messageTitle='';
                scope.formLoginMessage.messageContent='';

                scope.$on(AuthenticationService.getConstants().EVENT_NAME_LOGIN_CONFIRMED, function(){
                    scope.formLoginMessage.display=true;
                    scope.formLoginMessage.severity='success';
                    scope.formLoginMessage.messageTitle='Login';
                    scope.formLoginMessage.messageContent='Login successful.';
                });
                scope.$on(AuthenticationService.getConstants().EVENT_NAME_LOGIN_FAILED, function(){
                    scope.formLoginMessage.display=true;
                    scope.formLoginMessage.severity='danger';
                    scope.formLoginMessage.messageTitle='Login';
                    scope.formLoginMessage.messageContent='Username and/or password are wrong.';
                });
                scope.$on(AuthenticationService.getConstants().EVENT_NAME_2FA_REQUIRED, function(){
                    scope.formLoginMessage.display=true;
                    scope.formLoginMessage.messageTitle='2FA Authentication';
                    scope.formLoginMessage.messageContent='2FA Verification required.';
                });
                scope.$on(AuthenticationService.getConstants().EVENT_NAME_2FA_FAILED, function(){
                    scope.formLoginMessage.display=true;
                    scope.formLoginMessage.severity='danger';
                    scope.formLoginMessage.messageTitle='2FA Authentication';
                    scope.formLoginMessage.messageContent='2FA Verification failed.';
                });
            }
        };
    }]);

    /**
     * @ngdoc service
     * @name security.Base64Service
     * @description encode and decode strings with the base64 algorithm.
     *
     */
    module.service('Base64Service', function () {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "abcdefghijklmnopqrstuvwxyz" +
            "0123456789+/=";
        this.encode = function (input) {
            var output = "",
                chr1, chr2, chr3 = "",
                enc1, enc2, enc3, enc4 = "",
                i = 0;

            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            }
            return output;
        };

        this.decode = function (input) {
            var output = "",
                chr1, chr2, chr3 = "",
                enc1, enc2, enc3, enc4 = "",
                i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 !== 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 !== 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            }
            return output;
        };
    });


}());;angular.module('alv-ch-ng.security').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('template/security/form-login-message.html',
    "<div class=\"alert alert-{{formLoginMessage.severity}} alert-dismissable\">\n" +
    "    <span><strong>{{formLoginMessage.messageTitle}}</strong>&nbsp;{{formLoginMessage.messageContent}}</span>\n" +
    "    <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\">&times;</button>\n" +
    "</div>"
  );


  $templateCache.put('template/security/form-login.html',
    "<form not-auth>\n" +
    "    <input form-input form-label=\"loginUser\" type=\"email\" id=\"loginUser\" ng-model=\"loginUser\" />\n" +
    "    <input form-input form-label=\"loginPwd\" type=\"password\" id=\"loginPwd\" ng-model=\"loginPwd\" />\n" +
    "    <input form-input form-label=\"loginAuthToken\" form-prepend=\"Authy\" type=\"number\" id=\"authToken\" ng-model=\"authToken\" ng-show=\"authTokenShow\" />\n" +
    "    <button class=\"btn-primary\" ng-click=\"login()\" ng-show=\"!authTokenShow\">Login</button>\n" +
    "    <button class=\"btn-primary\" ng-click=\"authenticate()\" glyph-icon=\"eye-open\" ng-show=\"authTokenShow\">Authenticate</button>\n" +
    "</form>"
  );

}]);
