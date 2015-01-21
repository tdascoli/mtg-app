;(function () {
    'use strict';

    var module = angular.module('common.constants', []);

    module.constant('applicationVersion', '1.0.0');
    module.constant('applicationReleaseNote', 'poc');
    module.constant('supportedLanguages', ['de', 'en']);
    module.constant('defaultLanguage', 'de');

}());