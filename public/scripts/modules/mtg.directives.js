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

    module.directive('myHitpoints', function(){
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
    });
    module.directive('hasMessage', ['countMessage', function(countMessage){
        return {
            priority: 10,
            restrict: 'A',
            link: function(scope, element) {
                element.attr('id','messages');
                element.attr('data-messages',countMessage);
                element.hide();

                if (element.attr['data-messages']>0){
                    element.show();
                }

                scope.$watch(element.attr['data-messages'], function(){
                    element.attr('data-messages',countMessage);
                });
            }
        }
    }]);
    module.directive('mtgChatButton', ['$compile',function($compile){
        return {
            priority: 10,
            restrict: 'E',
            replace: true,
            link: function(scope, element) {
                var button = angular.element('<button type="button" class="navbar-toggle navbar-btn navbar-playground" data-toggle="modal" data-target="#chat-widget" glyph-icon="comment"></button>');
                var notify = angular.element('<span has-message class="badge badge-notify"><span></span></span>');
                button.append(notify);

                $compile(button)(scope);
                element.append(button);
                /*

                scope.$watch(element.attr['data-messages'], function(){
                    element.attr('data-messages',countMessage);
                });
                */
            }
        }
    }]);
}());