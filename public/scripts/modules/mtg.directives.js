;(function () {
    'use strict';

    var module = angular.module('mtg.directives', []);

    module.directive('mtgPlayground', function(){
        return {
            priority: 10,
            restrict: 'A',
            link: function(scope, element) {
                if ($.browser.mobile) {
                    var screen = $(window).height()-5;
                    var navbar = $('#navbar').outerHeight(true) || 0;
                    var phase = $('#phase').outerHeight(true) || 0;
                    var height = Math.round((screen - navbar)/2)*2; // #mainframe - margin-top plus spacing!
                    element.css('height',height);
                }
            }
        }
    });

    module.directive('mtgBattlefield', function(){
        return {
            priority: 20,
            restrict: 'A',
            link: function(scope, element) {
                if ($.browser.mobile) {
                    var screen = $(window).height()-5;
                    var navbar = $('#navbar').outerHeight(true) || 0;
                    var phase = $('#phase').outerHeight(true) || 0;
                    var hand = $('.handlogic').outerHeight(true) || 0;
                    var height = Math.round((screen - navbar - phase)/2)*2; // #mainframe - margin-top plus spacing!
                    element.css('height',(height/2)-hand);
                }
            }
        }
    });

    module.directive('myHitpoints', ['$rootScope',function($rootScope){
        return {
            priority: 10,
            restrict: 'A',
            link: function(scope, element) {
                element.attr('data-hitpoints',scope.my.hitpoints);

                scope.$watch(element.attr['data-hitpoints'], function(){
                    element.attr('data-hitpoints',scope.my.hitpoints);
                    if (element.attr['data-messages']>0){
                        element.show();
                    }
                });
            }
        }
    }]);

    module.directive('activeStartswith', ['$location', function ($location) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$on('$routeChangeSuccess', function () {
                    element.removeClass('active');
                    var patterns = attrs.activeStartswith.split('|');
                    for (var i = 0; i < patterns.length; i++) {
                        var pattern = patterns[i];
                        if ($location.path().indexOf(pattern) > -1) {
                            element.addClass('active');
                        }
                    }
                });
            }
        };
    }]);

    module.directive('showStartswith', ['$location', function ($location) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$on('$routeChangeSuccess', function () {
                    element.removeClass('active');
                    var patterns = attrs.showStartswith.split('|');
                    for (var i = 0; i < patterns.length; i++) {
                        var pattern = patterns[i];
                        if ($location.path().indexOf(pattern) > -1) {
                            element.removeClass('ng-hide');
                        }
                        else {
                            element.addClass('ng-hide');
                        }
                    }
                });
            }
        };
    }]);

    module.directive('hideStartswith', ['$location', function ($location) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$on('$routeChangeSuccess', function () {
                    element.removeClass('active');
                    var patterns = attrs.hideStartswith.split('|');
                    for (var i = 0; i < patterns.length; i++) {
                        var pattern = patterns[i];
                        if ($location.path().indexOf(pattern) > -1) {
                            element.addClass('ng-hide');
                        }
                        else {
                            element.removeClass('ng-hide');
                        }
                    }
                });
            }
        };
    }]);
}());