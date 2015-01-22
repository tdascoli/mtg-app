;(function () {
    'use strict';

    var module = angular.module('common.constants', []);

    module.constant('applicationVersion', '0.1.0');
    module.constant('applicationReleaseNote', 'poc');
    module.constant('supportedLanguages', ['de', 'en']);
    module.constant('defaultLanguage', 'de');

}());