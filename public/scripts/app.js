;(function () {

    'use strict';

    /**
     * Initially required dependencies.
     * @type {string[]}
     */
    var dependencies = [
        'ngRoute',
        'restangular',
        'ngCookies',
        'ngResource',
        'ngTouch',
        'ngAria',
        'alv-ch-ng.ui-core',
        'alv-ch-ng.ui-forms',
        'alv-ch-ng.ui-scroll',
        'common.constants',
        'mtg.main',
        'mtg.playground',
        'mtg.directives',
        'mtg.modals',
        'mtg.variables',
        'mtg.chat',
        'mtg.auth',
        'mtg.lobby',
        'mtg.deckbuilder',
        'btford.socket-io',
        'ngDragDrop',
        'angoose.client',
        'swipe',
        'ngFastLevenshtein'
    ];

    /**
     * The sysInfos admin application.
     */
    var app = angular.module('mtg-app', dependencies);

    /**
     * xSite request & routing definitions
     */
    app.config(function ($routeProvider, $httpProvider, RestangularProvider) {
            /** Enable cross domain communication **/
            /*$httpProvider.defaults.headers.useXDomain = true;
            $httpProvider.defaults.withCredentials = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
            */
            /** -- Routings -- **/
            var routes = [
                {path: '/', redirectTo: '/lobby'},
                // mtg
                {path: '/lobby', templateUrl: '/pages/lobby/lobby.html', controller: 'LobbyCtrl'},
                {path: '/deck-builder', templateUrl: '/pages/deck-builder/deck-builder.html', controller: 'DeckBuilderCtrl'},
                {path: '/deck-builder/scan', templateUrl: '/pages/deck-builder/scan-card.html', controller: 'DeckBuilderCtrl'},
                {path: '/playground', templateUrl: '/pages/playground/playground.html', controller: 'GameAreaCtrl'},
                {path: '/playground/:game', templateUrl: '/pages/playground/playground.html', controller: 'GameAreaCtrl'},
                {path: '/playground/load/:id', templateUrl: '/pages/playground/playground.html', controller: 'GameAreaCtrl'},
                {path: '/playground/debug/:debug', templateUrl: '/pages/playground/playground.html', controller: 'GameAreaCtrl'},
                // security
                {path: '/login', templateUrl: '/pages/common/login.html', controller: 'LoginCtrl'},
                {path: '/signup', templateUrl: '/pages/common/signup.html', controller: 'SignupCtrl'}
            ];

            for (var i = 0; i < routes.length; i++) {
                var route = routes[i];

                if (route.redirectTo) {
                    $routeProvider.when(route.path, {redirectTo: route.redirectTo});
                } else if (route.controller) {
                    $routeProvider.when(route.path, {
                        templateUrl: route.templateUrl,
                        controller: route.controller
                    });
                } else {
                    $routeProvider.when(route.path, {
                        templateUrl: route.templateUrl
                    });
                }
            }

            /** 404 **/
            $routeProvider.otherwise({templateUrl: '/pages/common/404.html'});

            // restangular
            RestangularProvider.setBaseUrl('/data/');
            RestangularProvider.setRequestSuffix('.json');
        }
    );

    /**
     * angular translate
     */
    app.config(function ($translateProvider, supportedLanguages) {
        $translateProvider.registerAvailableLanguageKeys(supportedLanguages, {
            'en_US': 'en',
            'en_UK': 'en',
            'de_DE': 'de',
            'de_CH': 'de'
        });

        $translateProvider.useStaticFilesLoader({
            prefix: 'lang/messages_',
            suffix: '.json'
        });

        $translateProvider.determinePreferredLanguage();

        $translateProvider.useLocalStorage();
    });

    app.run(['$rootScope', '$location', '$cookieStore', '$http','socket',
        function ($rootScope, $location, $cookieStore, $http, socket) {
            // keep user logged in after page refresh
            $rootScope.globals = $cookieStore.get('globals') || {};
            if ($rootScope.globals.currentUser) {
                $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line

                socket.emit('user:login', $rootScope.globals.currentUser.username);
            }

            $rootScope.$on('$locationChangeStart', function (event, next, current) {
                // redirect to login page if not logged in
                if ( (
                        $location.path() !== '/login' &&
                        $location.path() !== '/signup'
                    ) && !$rootScope.globals.currentUser) {
                    $location.path('/login');
                }
            });
        }]);
}());