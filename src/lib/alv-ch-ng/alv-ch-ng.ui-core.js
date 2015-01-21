/* alv-ch-ng - 0.2.0 - 2015-01-13 - Copyright (c) 2015 Informatik der Arbeitslosenversicherung; */
;(function(){

    'use strict';

    var module = angular.module('alv-ch-ng.ui-core', []);

    module.directive('message', function(){
            return {
                priority: 10,
                restrict: 'E',
                template: '<div class="alert" ng-transclude></div>',
                transclude: true,
                replace: true,
                link: function(scope, element, attrs){
                    var severity = "info";
                    if (attrs.messageSeverity!==undefined){
                        severity = attrs.messageSeverity;
                    }
                    // add severity
                    element.addClass("alert-"+severity);
                    // add dismissbale

                    if (attrs.messageDismissable==='true'){
                        element.addClass("alert-dismissable");
                        if (!attrs.messageDismissableText){
                            element.prepend(angular.element('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'));
                        } else {
                            element.prepend(angular.element('<button type="button" class="close text-close" data-dismiss="alert" aria-hidden="true">'+attrs.messageDismissableText+'</button>'));
                        }
                    }
                }
            };
        });

    module.directive('alert', function(){
        return {
            priority: 10,
            restrict: 'E',
            template: '<div class="alert" ng-transclude></div>',
            transclude: true,
            replace: true,
            link: function(scope, element, attrs){
                var severity = "info";
                if (attrs.alertSeverity!==undefined){
                    severity = attrs.alertSeverity;
                }
                // add severity
                element.addClass("alert-"+severity);
                // add dismissbale

                if (attrs.alertDismissable==='true'){
                    element.addClass("alert-dismissable");
                    if (!attrs.alertDismissableText){
                        element.prepend(angular.element('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'));
                    } else {
                        element.prepend(angular.element('<button type="button" class="close text-close" data-dismiss="alert" aria-hidden="true">'+attrs.alertDismissableText+'</button>'));
                    }
                }
            }
        };
    });

    module.directive('button', function(){
        return {
            priority: 10,
            restrict: 'E',
            link: function(scope, element, attrs){
                element.addClass('btn');
                element.addClass('btn-default');
                if (attrs.primary==="true"){
                    element.addClass('btn-primary');
                }
            }
        };
    });

    module.directive('badge', function(){
            return {
                priority: 10,
                restrict: 'E',
                template: '<span class="badge" ng-transclude></span>',
                transclude: true,
                replace: true,
                link: function(scope, element, attrs){
                    if (attrs.badgeAlign==='right'){
                        element.addClass('pull-right');
                    }
                    if (attrs.badgeSquared){
                        element.addClass('squared');
                    }
                }
            };
        });

    module.directive('badge', function(){
            return {
                priority: 10,
                restrict: 'A',
                replace: true,
                link: function(scope, element, attrs){
                    var badge = angular.element('<span class="badge">'+attrs.badge+'</span>');
                    if (attrs.badgeAlign==='right'){
                        badge.addClass('pull-right');
                    }
                    if (attrs.badgeSquared){
                        element.addClass('squared');
                    }
                    element.append(badge);
                }
            };
        });

    module.directive('marker', function(){
            return {
                priority: 10,
                restrict: 'E',
                template: '<span class="label" ng-transclude></span>',
                transclude: true,
                replace: true,
                link: function(scope, element, attrs){
                    if (!attrs.markerSeverity){
                        element.addClass('label-default');
                    }
                    else {
                        element.addClass('label-'+attrs.markerSeverity);
                    }
                    if (attrs.markerSquared){
                        element.addClass('squared');
                    }
                }
            };
        });

    module.directive('marker', function(){
            return {
                priority: 10,
                restrict: 'A',
                replace: true,
                link: function(scope, element, attrs){
                    var marker = angular.element('<span class="label">'+attrs.marker+'</span>');
                    if (attrs.markerSeverity===undefined){
                        marker.addClass('label-default');
                    }
                    else {
                        marker.addClass('label-'+attrs.markerSeverity);
                    }
                    if (attrs.markerSquared){
                        marker.addClass('squared');
                    }
                    element.append(marker);
                }
            };
        });

    module.directive('glyph', function(){
            return {
                priority: 10,
                restrict: 'E',
                template: '<span class="glyphicon" ng-transclude></span>',
                transclude: true,
                replace: true,
                link: function(scope, element, attrs){
                    if (attrs.icon===undefined){
                        element.addClass('glyphicon-warning-sign');
                    }
                    else {
                        element.addClass('glyphicon-'+attrs.icon);
                    }
                }
            };
        });

    module.directive('glyphIcon', function(){
            return {
                priority: 10,
                restrict: 'A',
                replace: true,
                link: function(scope, element, attrs){
                    var icon = angular.element('<span class="glyphicon"></span>');
                    if (!attrs.glyphIcon){
                        icon.addClass('glyphicon-warning-sign');
                    }
                    else {
                        icon.addClass('glyphicon-'+attrs.glyphIcon);
                    }
                    if (attrs.glyphAlign==='right'){
                        element.append(icon);
                    }
                    else {
                        element.prepend(icon);
                    }
                }
            };
        });

    module.directive('adminSymbol', function(){
        return {
            priority: 10,
            restrict: 'A',
            replace: true,
            link: function(scope, element, attrs){
                var icon = angular.element('<span class="icon" aria-hidden="true"></span>');
                if (!attrs.adminSymbol){
                    icon.addClass('icon--exclam');
                }
                else {
                    icon.addClass('icon--'+attrs.adminSymbol);
                }
                if (attrs.glyphAlign==='right'){
                    element.append(icon);
                }
                else {
                    element.prepend(icon);
                }
            }
        };
    });

    module.directive('collapsible', function(){
            return {
                priority: 10,
                restrict: 'A',
                replace: true,
                link: function(scope, element, attrs){
                    element.addClass("pointer");
                    element.attr("data-toggle","collapse");
                    element.attr("data-target",attrs.collapsible);
                }
            };
        });

    module.directive('grid', ['UiRenderService', function (UiRenderService) {
        return {
            restrict: 'EA',
            priority: 110,
            controller: function ($scope) {
                $scope.columns = [];
                this.addColumn = function (columnObj) {
                    $scope.columns.push(columnObj);
                };
            },
            link:  function(scope, element, attrs){
                if (attrs.grid==="show-grid"){
                    element.addClass(attrs.grid);
                }

                scope.$watch('columns', function (columns) {
                    var col, _i, _len, _total, row;
                    _total=0;
                    row=angular.element('<div class="row"></div>');
                    _len = columns.length;

                    for (_i = 0; _i <= _len; _i++) {
                        if (_i===_len){
                            element.append(row);
                        }
                        else {
                            col = columns[_i];
                            _total=_total + parseInt(col.column);
                            row.append(col.element);

                            if (_total>=UiRenderService.getGridDefaultColumns() || col.last===true) {
                                element.append(row);
                                _total=0;
                                row=angular.element('<div class="row"></div>');
                            }
                        }
                    }
                });
            }
        };
    }]);

    module.directive('column', ['UiRenderService', function(UiRenderService){
        return {
            priority: 100,
            restrict: 'A',
            require: '^grid',
            replace: true,
            link: function(scope, element, attrs, affix){
                if (attrs.column){
                    var column= +attrs.column;
                    var last=false;
                    var gridClass="col-"+UiRenderService.getGridDefaultDevice()+"-";
                    element.addClass(gridClass+column);

                    if (attrs.columnOffset!==undefined){
                        element.addClass(gridClass+"offset-"+attrs.columnOffset);
                        column=column+parseInt(attrs.columnOffset);
                    }

                    if (attrs.columnPush!==undefined){
                        element.addClass(gridClass+"push-"+attrs.columnPush);
                    }

                    if (attrs.columnPull!==undefined){
                        element.addClass(gridClass+"pull-"+attrs.columnPull);
                    }

                    if (attrs.columnLast==='true'){
                        last=true;
                    }

                    affix.addColumn({
                        column:column,
                        last:last,
                        element:element
                    });
                }
            }
        };
    }]);

    module.directive('releaseNote', function () {
        return {
            restrict: 'A',
            replace: true,
            link: function(scope, element) {
                element.addClass("pointer");
                element.click(function(){
                    element.parent().toggleClass('show');
                    scope.$broadcast('alv-ch-ng:dom-manipulate', {'id': element.attr('id'), 'event':'releaseNote:click', 'show':element.parent().hasClass('show')});
                });
            }
        };
    });

    module.directive('sidebar', function(){
        return {
            restrict: 'C',
            link: function (scope, element) {
                scope.$on('$viewContentLoaded',function(){
                    var height=element.next('.content').outerHeight(true) || element.prev('.content').outerHeight(true);
                    element.css('height',height);
                    element.attr('style','height: '+height+'px !important;');
                });
            }
        };
    });

    module.directive('sidebarToggle', ['$document',function($document){
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'template/core/sidebar-toggle.html',
            link: function(scope, element){
                element.addClass('ng-hide');
                element.removeClass('ng-show');
                if ($document.find('.sidebar').length) {
                    element.addClass('ng-show');
                    element.removeClass('ng-hide');
                }

                scope.$on('$routeChangeSuccess',function(){
                    element.addClass('ng-hide');
                    element.removeClass('ng-show');
                    if ($document.find('.sidebar').length) {
                        element.addClass('ng-show');
                        element.removeClass('ng-hide');
                    }
                });
            }
        };
    }]);

    module.directive('toc', ['$rootScope', '$location','$anchorScroll', function ($rootScope,$location,$anchorScroll) {
        var collect = function (element, selector) {
            // Get the elements based on the selector
            var els = angular.element(selector);
            var tocs=[];

            // collect all data (title, id) for toc
            angular.forEach(els, function (el){
                var local = angular.element(el);
                var toc={};
                toc.title = local.text();
                toc.translate = local.attr('translate') || false;
                toc.id = local.attr('id') || local.text().toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
                local.attr('id',toc.id);
                local.addClass('toc-scrollable');
                tocs.push(toc);
            });

            return tocs;
        };
        return {
            priority: 20,
            restrict: 'E',
            replace: true,
            templateUrl: 'template/core/toc.html',
            link: function (scope, element, attrs) {
                // Set the selector that will be used, default to .toc-item
                var selector = attrs.selector || '.toc-item';

                scope.tocs=collect(element,selector);

                $rootScope.$on('$translateChangeSuccess', function () {
                    scope.tocs=collect(element,selector);
                });

                scope.scrollToc=function(anchor){
                    $anchorScroll.yOffset = 0;
                    var yOffset=parseInt($('#'+anchor).css("margin-top")) + parseInt($('#'+anchor).css("padding-top"));
                    var scrollFixTop = $('body').find('*[scroll-fix]') || false;

                    angular.forEach(scrollFixTop, function(value) {
                        var el = angular.element(value);
                        if (el.attr('scroll-fix-bottom')===undefined && el.attr('id')!==element.attr('id') && el.attr('id')!==element.parent().attr('id')) {
                            yOffset=yOffset+el.outerHeight(true);
                        }
                    });
                    $anchorScroll.yOffset = yOffset;
                    $anchorScroll();
                    $location.hash(anchor);

                    scope.$broadcast('alv-ch-ng:dom-manipulate', {'id': element.attr('id'), 'event':'toc:scrollToc'});
                };
            }
        };
    }]);

    module.provider('UiConfigService', function() {

        var _config = {labelWidth:2,classPrefix:'alv',gridDefaultDevice:'md',gridDefaultColumns:12,pageNavigationDefaultColumns:2,scrollUp:300,scrollUpBottom:20,scrollUpI18n:'common_i18n_scrollToTop'};

        function setConfig(config) {
            if (!config) {
                throw new Error('Param \'config\' must not be empty!');
            }
            jQuery.extend(true,_config,config);
        }

        function getLabelWidth() {
            return _config.labelWidth;
        }

        function getCommonSubmit() {
            return _config.commonSubmit;
        }

        function getCommonCancel() {
            return _config.commonCancel;
        }

        function getClassPrefix() {
            return _config.classPrefix;
        }

        function getTitleSelect() {
            return _config.titleSelect;
        }

        function getGridDefaultDevice(){
            return _config.gridDefaultDevice;
        }

        function getGridDefaultColumns(){
            return _config.gridDefaultColumns;
        }

        function getPageNavigationDefaultColumns(){
            return _config.pageNavigationDefaultColumns;
        }

        function getScrollUp(){
            return _config.scrollUp;
        }

        function getScrollUpBottom(){
            return _config.scrollUpBottom;
        }

        function getScrollUpI18n(){
            return _config.scrollUpI18n;
        }

        return {
            setConfig: setConfig,
            $get: function () {
                return {
                    getLabelWidth: getLabelWidth,
                    getCommonSubmit: getCommonSubmit,
                    getCommonCancel: getCommonCancel,
                    getClassPrefix: getClassPrefix,
                    getTitleSelect: getTitleSelect,
                    getGridDefaultDevice: getGridDefaultDevice,
                    getGridDefaultColumns: getGridDefaultColumns,
                    getPageNavigationDefaultColumns: getPageNavigationDefaultColumns,
                    getScrollUp: getScrollUp,
                    getScrollUpBottom: getScrollUpBottom,
                    getScrollUpI18n: getScrollUpI18n
                };
            }
        };
    });

    module.factory('UiRenderService', ['UiConfigService', function(UiConfigService){
        function getFormGridLabelClass(offset){
            var spanLabel='col-'+UiConfigService.getGridDefaultDevice()+'-';
            if (typeof(offset)==='undefined')  {
                offset = false;
            }

            if (offset){
                return spanLabel+'offset-'+UiConfigService.getLabelWidth();
            }
            return spanLabel+UiConfigService.getLabelWidth();
        }

        function getFormGridContent(){
            var spanWidth = 12-UiConfigService.getLabelWidth();
            return angular.element('<div class="col-'+UiConfigService.getGridDefaultDevice()+'-'+spanWidth+'"></div>');
        }

        function getFormGrid(){
            var spanWidth = 12-UiConfigService.getLabelWidth();
            return '<div class="col-'+UiConfigService.getGridDefaultDevice()+'-'+spanWidth+'"></div>';
        }

        function getCommonSubmit() {
            return UiConfigService.getCommonSubmit();
        }

        function getCommonCancel() {
            return UiConfigService.getCommonCancel();
        }

        function getClassPrefix(cssClass){
            return UiConfigService.getClassPrefix()+"-"+cssClass;
        }

        function getTitleSelect(){
            return UiConfigService.getTitleSelect();
        }

        function getGridDefaultDevice(){
            return UiConfigService.getGridDefaultDevice();
        }

        function getGridDefaultColumns(){
            return UiConfigService.getGridDefaultColumns();
        }

        function getPageNavigationDefaultColumns(){
            return UiConfigService.getPageNavigationDefaultColumns();
        }

        function getHelptext(helptext){
            return angular.element('<span class="help-block" translate="'+helptext+'"></span>');
        }

        function getScrollUp(){
            return UiConfigService.getScrollUp();
        }

        function getScrollUpBottom(){
            return UiConfigService.getScrollUpBottom();
        }

        function getScrollUpI18n(){
            return UiConfigService.getScrollUpI18n();
        }

        return {
            getFormGridLabelClass: getFormGridLabelClass,
            getFormGridContent: getFormGridContent,
            getFormGrid: getFormGrid,
            getCommonSubmit: getCommonSubmit,
            getCommonCancel: getCommonCancel,
            getClassPrefix: getClassPrefix,
            getTitleSelect: getTitleSelect,
            getGridDefaultDevice: getGridDefaultDevice,
            getGridDefaultColumns: getGridDefaultColumns,
            getHelptext: getHelptext,
            getPageNavigationDefaultColumns: getPageNavigationDefaultColumns,
            getScrollUp: getScrollUp,
            getScrollUpBottom: getScrollUpBottom,
            getScrollUpI18n: getScrollUpI18n
        };
    }]);

}());;angular.module('alv-ch-ng.ui-core').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('template/core/sidebar-toggle.html',
    "<button type=\"button\" class=\"sidebar-toggle\" data-toggle=\"collapse\" data-target=\".sidebar\">\n" +
    "    <span class=\"sr-only\">Toggle sidebar</span>\n" +
    "    <span class=\"icon-bar\"></span>\n" +
    "    <span class=\"icon-bar\"></span>\n" +
    "    <span class=\"icon-bar\"></span>\n" +
    "</button>"
  );


  $templateCache.put('template/core/toc.html',
    "<div id=\"toc\">\n" +
    "    <span translate=\"common_i18n_contents\"></span>\n" +
    "    <ul class=\"toc-list\">\n" +
    "        <li ng-repeat=\"toc in tocs\" spy=\"{{toc.id}}\">\n" +
    "            <a ng-click=\"scrollToc(toc.id)\" ng-class=\"{'current': toc.id===currentSpy }\">\n" +
    "                <span ng-hide=\"toc.translate\">{{toc.title}}</span>\n" +
    "                <span ng-show=\"toc.translate\" translate=\"{{toc.translate}}\"></span>\n" +
    "            </a>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>"
  );

}]);
