/* alv-ch-ng - 0.2.0 - 2015-01-13 - Copyright (c) 2015 Informatik der Arbeitslosenversicherung; */
;(function(){

    'use strict';

    var module = angular.module('alv-ch-ng.ui-navigation', ['alv-ch-ng.ui-core']);

    module.controller('NavigationCtrl', ['NavigationService', '$scope', '$location', function(NavigationService, $scope, $location){
        $scope.navigateTo=function(item){
            NavigationService.setCurrentItem(item);
            $location.path(item.location);
        };
    }]);

    module.provider('NavigationService', function () {
        var _model = [];
        var _currentItem = null;
        var _breadCrumbs = [];
        var _pageNavigation={
                              columns: 0,
                              row: false
                            };

        function setModel(model) {
            checkModelAndSetParentRelation(model);

            _model = model;
            _currentItem = _model[0];
            _breadCrumbs = createBreadCrumbsRecursively(_currentItem, []);
        }

        function checkModelAndSetParentRelation(model) {
            var throwError = function() {
                throw 'Illegal model to set.';
            };

            if (!model) {
                throwError();
            }

            if (angular.isArray(model)) {
                if (model.length === 0) {
                    throwError();
                }
                for (var i = 0; i < model.length; i++) {
                    var item = model[i];
                    addParentRecursively(item);
                }
                _model = model;
            }  else {
                throwError();
            }
        }

        function addParentRecursively(item){
            var throwError = function() {
                throw 'Illegal model to set.';
            };

            if (!item || !item.id) {
                throwError();
            }
            if (item.children && item.children.length > 0) {
                for (var j = 0; j < item.children.length; j++) {
                    item.children[j].parent = item;
                    addParentRecursively(item.children[j]);
                }
            }
        }

        function getModel() {
            return _model;
        }

        function getTopLevelItems(){
            if (_model.length>0){
            return _model[0].children;
            }
            return [];
        }

        function getRootItem(){
            if (_model.length>0){
                return _model[0];
            }
            return false;
        }

        function getCurrentItem() {
            return _currentItem;
        }

        function setCurrentItem(item) {
            if (!item) {
                throw 'item must not be null.';
            } else if (!item.id) {
                throw 'param item must provide an id attribute.';
            }
            _currentItem = item;
            _breadCrumbs = createBreadCrumbsRecursively(item, []);
            if (hasChildrenItems()){
                _pageNavigation.row=true;
            }
        }

        function getChildrenItems(){
            return getCurrentItem().children;
        }

        function getBreadCrumbs() {
            return _breadCrumbs;
        }

        function createBreadCrumbsRecursively(item, path) {
            path.unshift(item);
            if (item.parent) {
                return createBreadCrumbsRecursively(item.parent, path);
            }
            return path;
        }

        function isCurrentItem(item) {
            return areItemsEqual(item, _currentItem);
        }

        function areItemsEqual(item1, item2) {
            if (item1.id === item2.id) {
                return true;
            }
            return false;
        }

        function isOnCurrentPath(item) {
            if (!item) {
                return false;
            }
            for (var i = 0; i < _breadCrumbs.length; i++ ) {
                if (areItemsEqual(item, _breadCrumbs[i])) {
                    return true;
                }
            }
            return false;
        }

        function isChildOfCurrent(item) {
            if (!item) {
                return false;
            }
            for (var i = 0; i < _currentItem.children.length; i++) {
                if (areItemsEqual(item, _currentItem.children[i])) {
                    return true;
                }
            }
            return false;
        }

        function hasChildrenItems(){
            var _show = false;
            if (getChildrenItems()!==undefined && getChildrenItems().length>0 && !areItemsEqual(getCurrentItem(),getRootItem())){
                _show=true;
            }
            return _show;
        }


        this.setModel=setModel;
        this.getModel=getModel;
        this.$get=function() {
            return {
                getModel: getModel,
                getRootItem: getRootItem,
                getTopLevelItems: getTopLevelItems,
                getBreadCrumbs: getBreadCrumbs,
                getCurrentItem: getCurrentItem,
                setCurrentItem: setCurrentItem,
                isCurrentItem: isCurrentItem,
                isOnCurrentPath: isOnCurrentPath,
                isChildOfCurrent: isChildOfCurrent,
                hasChildrenItems: hasChildrenItems,
                getChildrenItems: getChildrenItems,
                pageNavigation: _pageNavigation
            };
        };
    });

    module.directive('globalNavigation', ['NavigationService', function(NavigationService){
        return {
            restrict: 'EA',
            priority: 20,
            templateUrl: 'template/navigation/global-navigation.html',
            replace: true,
            link: function(scope){
                scope.isCurrentItem = NavigationService.isCurrentItem;
                scope.getTopLevelItems = NavigationService.getTopLevelItems;
            }
        };
    }]);

    module.directive('pageNavigation', ['NavigationService', function(NavigationService){
        return {
            restrict: 'EA',
            priority: 20,
            templateUrl: 'template/navigation/page-navigation.html',
            replace: true,
            link: function(scope){
                 scope.isCurrentItem = NavigationService.isCurrentItem;
                 scope.getChildrenItems = NavigationService.getChildrenItems;
                 scope.hasChildrenItems = NavigationService.hasChildrenItems;
            }
        };
    }]);

    module.directive('breadcrumbs', ['NavigationService', function(NavigationService){
        return {
            restrict: 'EA',
            priority: 10,
            templateUrl: 'template/navigation/breadcrumb.html',
            replace: true,
            link: function(scope){
                scope.isCurrentItem = NavigationService.isCurrentItem;
                scope.getBreadCrumbs = NavigationService.getBreadCrumbs;
            }
        };
    }]);

}());;angular.module('alv-ch-ng.ui-navigation').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('template/navigation/breadcrumb.html',
    "<ol class=\"breadcrumb\" ng-controller=\"NavigationCtrl\">\n" +
    "    <li ng-repeat=\"breadcrumb in getBreadCrumbs() \" ng-class=\"{active: isCurrentItem(breadcrumb) }\">\n" +
    "        <a ng-click=\"navigateTo(breadcrumb)\" ng-hide=\"isCurrentItem(breadcrumb)\" class=\"pointer\">{{breadcrumb.text}}</a>\n" +
    "        <span ng-show=\"isCurrentItem(breadcrumb)\">{{breadcrumb.text}}</span>\n" +
    "    </li>\n" +
    "</ol>"
  );


  $templateCache.put('template/navigation/global-navigation.html',
    "<ul class=\"nav navbar-nav\" ng-controller=\"NavigationCtrl\">\n" +
    "    <li ng-repeat=\"nav in getTopLevelItems() \" ng-class=\"{active: isCurrentItem(nav) }\">\n" +
    "        <a ng-click=\"navigateTo(nav)\" class=\"pointer\">{{nav.text}}</a>\n" +
    "    </li>\n" +
    "</ul>"
  );


  $templateCache.put('template/navigation/page-navigation.html',
    "<ul class=\"nav sidebar\" id=\"page-navigation\" ng-controller=\"NavigationCtrl\">\n" +
    "    <li ng-repeat=\"nav in getChildrenItems() \" ng-class=\"{active: isCurrentItem(nav) }\">\n" +
    "        <a ng-click=\"navigateTo(nav)\" class=\"pointer\">{{nav.text}}</a>\n" +
    "    </li>\n" +
    "</ul>"
  );


  $templateCache.put('template/navigation/page-scroll-navigation.html',
    "<!DOCTYPE html>\n" +
    "<html>\n" +
    "<head>\n" +
    "    <title></title>\n" +
    "</head>\n" +
    "<body>\n" +
    "\n" +
    "</body>\n" +
    "</html>"
  );

}]);
