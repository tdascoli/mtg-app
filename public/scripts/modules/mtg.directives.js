;(function () {
    'use strict';

    var module = angular.module('mtg.directives', ['mtg.playground']);

    module.directive('mtgPlayground', function(){
        return {
            priority: 10,
            restrict: 'A',
            link: function(scope, element) {
                if ($.browser.mobile) {
                    var screen = $(window).height();
                    var navbar = $('#topnav .navbar').outerHeight(true) || 0;
                    var height = Math.round((screen - navbar - 15)/2)*2; // #mainframe - margin-top plus spacing!
                    //element.css('height',height);
                }
            }
        }
    });

    module.directive('mtgOpBattlefield', function(){
        return {
            priority: 20,
            restrict: 'A',
            link: function(scope, element) {
                if ($.browser.mobile) {
                    var screen = $(window).height();
                    var navbar = $('#topnav .navbar').outerHeight(true) || 0;
                    var height = Math.round((screen - navbar - 15)/2)*2; // #mainframe - margin-top plus spacing!
                    height = ($('#game-area').css('height')-$('#phase').css('height'));
                    height=height*0.4;
                    //element.css('height',height);
                }
            }
        }
    });

    module.directive('mtgMyBattlefield', function(){
        return {
            priority: 20,
            restrict: 'A',
            link: function(scope, element) {
                if ($.browser.mobile) {
                    var screen = $(window).height();
                    var navbar = $('#topnav .navbar').outerHeight(true) || 0;
                    var height = Math.round((screen - navbar - 15)/2)*2; // #mainframe - margin-top plus spacing!
                    height = ($('#game-area').css('height')-$('#phase').css('height'));
                    height=(height*0.6)-$('my-handlogic').css('height')-10;
                    //element.css('height',height);
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
}());