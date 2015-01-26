;(function () {
    'use strict';

    var module = angular.module('mtg.main', ['mtg.chat','mtg.directives','mtg.modals','mtg.playground','mtg.socket','mtg.variables']);

    module.controller('MtgMainCtrl', function ($rootScope) {

        $rootScope.countMessage=0;

    });

}());