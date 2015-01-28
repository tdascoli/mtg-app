;(function () {

    'use strict';

    /**
     * Initially required dependencies.
     * @type {string[]}
     */
    var dependencies = [
        'ngRoute',
        'ngCookies',
        'ngResource',
        'ngTouch',
        'ngAria',
        'alv-ch-ng.ui-core',
        'alv-ch-ng.ui-forms',
        'alv-ch-ng.ui-scroll',
        'http-auth-interceptor',
        'common.constants',
        'mtg.main',
        'mtg.playground',
        'mtg.directives',
        'mtg.modals',
        'mtg.variables',
        'mtg.chat',
        'btford.socket-io',
        'ngDragDrop'
    ];

    /**
     * The sysInfos admin application.
     */
    var app = angular.module('mtg-app', dependencies);

    /**
     * xSite request & routing definitions
     */
    app.config(function ($routeProvider, $httpProvider) {
            /** Enable cross domain communication **/
            $httpProvider.defaults.headers.useXDomain = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];

            /** -- Routings -- **/
            var routes = [
                {path: '/', redirectTo: '/lobby'},
                // archive
                {path: '/chat', templateUrl: '/pages/playground/chat.html', controller: 'ChatCtrl'},
                // mtg
                {path: '/lobby', templateUrl: '/pages/lobby/lobby.html'},
                {path: '/deck-builder', templateUrl: '/pages/deck-builder/deck-builder.html'},
                {path: '/playground', templateUrl: '/pages/playground/playground.html', controller: 'GameAreaCtrl'},
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
}());