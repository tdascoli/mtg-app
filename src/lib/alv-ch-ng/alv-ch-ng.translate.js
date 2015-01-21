/* alv-ch-ng - 0.2.0 - 2015-01-13 - Copyright (c) 2015 Informatik der Arbeitslosenversicherung; */
;(function () {

    'use strict';

    var module = angular.module('alv-ch-ng.translate', ['pascalprecht.translate']);

    module.directive('languageSwitcher', ['$translate', 'supportedLanguages', function ($translate,supportedLanguages) {
        return {
            restrict: 'E',
            templateUrl: 'template/i18n/language-switcher.html',
            replace: true,
            link: function (scope, element, attrs) {
                scope.styleClass = element.attr('class');
                scope.style = element.attr('style');

                // put supported languages into allLanguages array
                scope.allLanguages = [];

                if (attrs.languages) {
                    var tokens = attrs.languages.split(',');
                    for (var i = 0; i < tokens.length; i++) {
                        scope.allLanguages[i] = tokens[i].trim();
                    }
                } else {
                    scope.allLanguages = supportedLanguages;
                }


                scope.getTranslationLanguage = function () {
                    return $translate.use();
                };

                scope.setTranslationLanguage = function (language) {
                    $translate.use(language);
                };
            }
        };
    }]);

    // todo major release changes...??!!
    module.directive('i18nMsg', function () {
        return {
            restrict: 'A',
            priority: 100,
            replace: false,
            link: function (scope, element) {
                element.addClass('deprecated');
                element.attr('title','i18n-msg - this directive is no longer supported, please see alv-ch-ng doc.');
                //console.log('i18n-msg','this directive is no longer supported, please see alv-ch-ng doc.');
            }
        };
    });

}());
;angular.module('alv-ch-ng.translate').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('template/i18n/i18n-switcher.html',
    "<div id=\"i18n-switcher\">\n" +
    "    <ul id=\"i18n-switch\">\n" +
    "        <li id=\"i18n-switch-option_{{language}}\" ng-repeat=\"language in allLanguages\">\n" +
    "            <a ng-click=\"setLanguage(language)\" ng-class=\"{'active':getLanguage()===language}\" i18n-attribute=\"title\" i18n-value=\"med-i18n.language.short.{{language}}\">{{language}}</a>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>"
  );


  $templateCache.put('template/i18n/language-switcher.html',
    "<ul class=\"nav navbar-nav\" id=\"language-switch\">\n" +
    "    <li id=\"language_{{language}}\" ng-class=\"{'active':getTranslationLanguage()===language}\" ng-repeat=\"language in allLanguages\">\n" +
    "        <a ng-click=\"setTranslationLanguage(language)\" translate=\"{{language}}\" translate-attr-title=\"med_i18n_language_short_{{language}}\"></a>\n" +
    "    </li>\n" +
    "</ul>"
  );

}]);
