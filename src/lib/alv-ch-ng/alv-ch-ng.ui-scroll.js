;(function(){

    'use strict';
    var module = angular.module('alv-ch-ng.ui-scroll', ['alv-ch-ng.ui-core','alv-ch-ng.translate']);

    module.service('ScrollService', ['$window', function ScrollService($window) {
        var ctrl=this;

        ctrl.scrollY=function(){
            // AngularJS
            if ($window.scrollY){
                return $window.scrollY;
            }
            // Firefox, Chrome, Opera, Safari
            if ($window.pageYOffset){
                return $window.pageYOffset;
            }
            // Internet Explorer 6 - standards mode
            if ($window.document.documentElement && document.documentElement.scrollTop){
                return document.documentElement.scrollTop;
            }
            // Internet Explorer 6, 7 and 8
            if ($window.document.body.scrollTop){
                return document.body.scrollTop;
            }
            return 0;
        };

        ctrl.positionTop=function(element){
            if (element.offset()){
                return element.offset().top;
            }
            return 0;
        };
    }]);

    module.factory('ScrollSpyService', function ScrollSpyService() {
        var spies={};

        function addSpy(spyObj) {
            spies[spyObj.id]=spyObj;
        }

        function getSpies(){
            return spies;
        }

        function clearSpies(){
            spies={};
        }

        return {
            addSpy: addSpy,
            getSpies: getSpies,
            clearSpies: clearSpies
        };
    });

    module.controller('ScrollSpyCtrl', ['$scope','ScrollService','ScrollSpyService', function ScrollSpyCtrl($scope,ScrollService,ScrollSpyService){
        var ctrl=this;

        ctrl.checkSpy=function(bodyOffset){
            var highlightSpy, pos, spyOffset;
            highlightSpy = null;
            // cycle through `spy` elements to find which to highlight
            angular.forEach(ScrollSpyService.getSpies(), function (spy){
                spy.out();
                spyOffset=parseInt($('#'+spy.id).css("margin-top"))+parseInt($('#'+spy.id).css("padding-top"));
                pos = ScrollService.positionTop($('#'+spy.id))-bodyOffset-spyOffset;

                if (pos-ScrollService.scrollY()<=0) {
                    // the window has been scrolled past the top of a spy element
                    spy.pos = pos;

                    if (highlightSpy == null) {
                        highlightSpy = spy;
                    }
                    if (highlightSpy.pos < spy.pos) {
                        highlightSpy = spy;
                    }
                }
            });
            if (highlightSpy!==null){
                $scope.currentSpy=highlightSpy.id;
                highlightSpy.in();
            }
        };
    }]);

    module.controller('ScrollFixCtrl', ['$scope','$window','$document','ScrollService', function ScrollFixCtrl($scope,$window,$document,ScrollService) {
        var ctrl = this;
        var init = true;
        var fixed = false;
        var fixedTopBottom = false;
        var parentFixed=false; // wenn scrollfix attr nicht false, prüfung ob scrollfix element fixed oder nicht
        var param = {};

        ctrl.parentSet=function(el,id,attrScrollFix){
            if (id===attrScrollFix) {
                ctrl.doParentSet(el,attrScrollFix);
            }
        };

        ctrl.doParentSet=function(el,attrScrollFix){
            ctrl.checkParent(attrScrollFix);
            param.overlayTop=ctrl.overlayTop(attrScrollFix);
            ctrl.checkElementTop(el);
            ctrl.refreshDummyElement(el);
        };

        ctrl.checkParent=function(attrScrollFix){
            parentFixed=false;
            if ($('#'+attrScrollFix).hasClass('scroll-fixed')){
                parentFixed=true;
            }
        };

        ctrl.getDummyElement=function(el){
            var element = angular.element('<div id="scroll-fix-'+param.elementId+'" style="height: '+el.outerHeight(true)+'px;"></div>');
            if (param.elementWidth!=='100%'){
                element.css({
                    'width':param.elementWidth,
                    'float':param.elementFloat
                });
            }
            return element;
        };

        ctrl.refreshDummyElement=function(el){
            $('#scroll-fix-' + param.elementId).css('height',el.outerHeight(true));
        };

        ctrl.elementTop=function(el){
            return ScrollService.positionTop(el) - parseInt(el.css("margin-top")) - parseInt(el.css("padding-top"));
        };

        ctrl.overlayTop=function(attrScrollFix){
            if (!attrScrollFix || $('#'+attrScrollFix).offset()==='undefined'){
                return 0;
            }
            return ($('#'+attrScrollFix).outerHeight(true)+ScrollService.positionTop($('#'+attrScrollFix)))-ScrollService.scrollY();
        };

        ctrl.overlayBottom=function(el,attrScrollFixBottom){
            if (!attrScrollFixBottom){
                return 0;
            }
            return $document.height() - $('#' + attrScrollFixBottom).outerHeight(true);
        };

        ctrl.elementTopPosition=function(attrScrollFix){
            if (!attrScrollFix){
                return 0;
            }
            return $('#'+attrScrollFix).outerHeight(true);
        };

        ctrl.fixElement=function(el){
            el.addClass('scroll-fixed');
            el.css('width', param.elementWidth);
            if (angular.isString(param.attrScrollFixBottom) && !param.attrScrollFix){
                el.css('bottom', 0);
                el.before(ctrl.getDummyElement(el));
            }
            else {
                el.css('top', ctrl.overlayTop(param.attrScrollFix));
                el.after(ctrl.getDummyElement(el));
            }
            fixed = true;

            $scope.$broadcast('alv-ch-ng:dom-manipulate', {'id': param.elementId, 'event':'scrollFix:fixed'});
        };

        ctrl.releaseElement=function(el){
            el.removeClass('scroll-fixed');
            $('#scroll-fix-' + param.elementId).remove();
            if (angular.isString(param.attrScrollFixBottom) && !param.attrScrollFix){
                el.css('bottom', 'auto');
            }
            else {
                el.css('top', 'auto');
            }
            fixed = false;

            $scope.$broadcast('alv-ch-ng:dom-manipulate', {'id': param.elementId, 'event':'scrollFix:release'});
        };

        ctrl.fixTopBottomElement=function(el){
            el.removeAttr('style');
            el.removeClass('scroll-fixed');
            el.addClass('scroll-fixed-bottom');
            el.css('bottom', parseInt(el.css("margin-bottom"))+parseInt(el.css("padding-bottom")));
            fixedTopBottom=true;

            $scope.$broadcast('alv-ch-ng:dom-manipulate', {'id': param.elementId, 'event':'scrollFix:topBottom:fixed'});
        };

        ctrl.releaseTopBottomElement=function(el){
            el.removeAttr('style');
            el.removeClass('scroll-fixed-bottom');
            el.addClass('scroll-fixed');
            el.css('top', ctrl.overlayTop(param.attrScrollFix));
            fixedTopBottom=false;

            $scope.$broadcast('alv-ch-ng:dom-manipulate', {'id': param.elementId, 'event':'scrollFix:topBottom:released'});
        };

        ctrl.resizeElement=function(el,resizedWidth){
            param.elementWidth=resizedWidth;
            el.css('width',resizedWidth);

            $scope.$broadcast('alv-ch-ng:dom-manipulate', {'id': param.elementId, 'event':'scrollFix:resize'});
        };

        ctrl.checkElement=function(el){
            ctrl.checkElementTop(el);

            // FIX ELEMENT
            if (ctrl.checkFix(el)){
                ctrl.fixElement(el);
            }

            // RELEASE ELEMENT
            if (ctrl.checkRelease(el)){
                ctrl.releaseElement(el);
            }

            // TOP & BOTTOM
            ctrl.checkTopBottom(el);
        };

        ctrl.checkElementTop=function(el){
            // if there was a change in the DOM, evaluate the new overlay
            if (param.elementTop!==ctrl.elementTop(el) && !fixed) {
                param.elementTop = ctrl.elementTop(el);
            }
        };

        ctrl.checkElementWidth=function(el){
            var resizedWidth = $('#scroll-fix-' + param.elementId).outerWidth(true) || '100%';

            if (param.elementWidth!=="100%" && resizedWidth!==param.elementWidth){
                ctrl.resizeElement(el, resizedWidth);
            }
            ctrl.doParentSet(el,param.attrScrollFix);
        };

        ctrl.checkFix=function(el){
            if (!fixed) {
                // has the window past the overlaytop mark and is it not fixed yet
                if ((ScrollService.scrollY() + ctrl.overlayTop(param.attrScrollFix)) > ctrl.elementTop(el)) {
                    // is there a parent element defined, when true is it NOT fixed yet (the defintive overlaytop is not yet reached
                    ctrl.checkParent(param.attrScrollFix);
                    if ((angular.isString(param.attrScrollFix) && parentFixed) || !param.attrScrollFix) {
                        return true;
                    }
                }
                // when its a scrollfixbottom set, means it is fixed to the bottom, until a element is showing
                if (angular.isString(param.attrScrollFixBottom) && !param.attrScrollFix) {
                    // when the scroll-level + the window height (browser!=document) is lower or equal to the overlay
                    if ((ScrollService.scrollY() + $(window).height()) <= ctrl.overlayBottom(el, param.attrScrollFixBottom)) {
                        return true;
                    }
                }
            }
            return false;
        };

        ctrl.checkRelease=function(el){
            if (fixed) {
                // check if there is a scrollfix element
                if (angular.isString(param.attrScrollFix)) {
                    // when the scroll-level and the overlay is lower than the elements top (means the "highest" position of the element
                    if (param.elementTop>(ScrollService.scrollY() + param.overlayTop)) {
                        return true;
                    }
                }
                // when its a scrollfixbottom set, means it is fixed to the bottom, until a element is showing
                if (angular.isString(param.attrScrollFixBottom) && !param.attrScrollFix) {
                    // when the scroll-level + the window height (browser!=document) is higher than the overlay
                    if ((ScrollService.scrollY() + $(window).height()) > ctrl.overlayBottom(el, param.attrScrollFixBottom)) {
                        return true;
                    }
                }
            }
            return false;
        };

        ctrl.checkTopBottom=function(el){
            // when there is a scroll-fix and scroll-fix-bottom set
            if (angular.isString(param.attrScrollFix) && angular.isString(param.attrScrollFixBottom)) {
                var overlayTop=$document.height()-($('#'+param.attrScrollFixBottom).outerHeight(true)+el.outerHeight(true)+parseInt(el.css("margin-bottom"))+parseInt(el.css("padding-bottom")));
                var overlayBottom=$document.height()-($('#'+param.attrScrollFixBottom).outerHeight(true)+el.outerHeight(true)+parseInt(el.css("margin-bottom"))+parseInt(el.css("padding-bottom"))+ctrl.overlayTop(param.attrScrollFix));

                if (overlayBottom<=ScrollService.scrollY() && !fixedTopBottom){
                    ctrl.fixTopBottomElement(el);
                }

                if (overlayTop>(ScrollService.scrollY()+ctrl.overlayTop(param.attrScrollFix)) && fixedTopBottom){
                    ctrl.releaseTopBottomElement(el);
                }
            }
        };

        ctrl.init=function(el,_param){
            param = _param;
            param.overlayTop=ctrl.overlayTop(param.attrScrollFix);
            if (!param.attrScrollFixBottom) {
                ctrl.fixElement(el);
            }
            ctrl.checkElement(el);
            init=false;
        };
    }]);

    module.directive('scrollFix', ['$window','$document', function($window,$document){
        return {
            priority: 10,
            restrict: 'A',
            controller: 'ScrollFixCtrl',
            link: function(scope, element, attrs, ctrl){
                var attrScrollFix = attrs.scrollFix || false;
                var attrScrollFixBottom=attrs.scrollFixBottom || false;

                var elementId = attrs.id || 'random_'+Math.floor((Math.random()*6)+1);
                if (attrs.id===undefined){
                    element.attr('id',elementId);
                }
                var elementTop = ctrl.elementTop(element);
                var elementHeight = element.outerHeight(true);
                var elementWidth="100%";
                if (element.outerWidth(true)<$document.width()){
                    elementWidth=element.outerWidth(true);
                }
                var elementFloat = element.css('float');

                var param = {
                    'attrScrollFix': attrScrollFix,
                    'attrScrollFixBottom': attrScrollFixBottom,
                    'elementId':elementId,
                    'elementTop': elementTop,
                    'elementHeight':elementHeight,
                    'elementWidth': elementWidth,
                    'elementFloat': elementFloat,
                    'overlayTop': 'auto'
                };

                $($window).scroll(function () {
                    ctrl.checkElement(element);
                });

                $($window).resize(function(){
                    ctrl.checkElementWidth(element);
                });

                $document.ready(function () {
                    ctrl.init(element, param);
                });

                scope.$on('$viewContentLoaded' ,function(){
                    ctrl.checkElement(element);
                });

                scope.$on('alv-ch-ng:dom-manipulate', function(event,trigger){
                    ctrl.parentSet(element,trigger.id,attrs.scrollFix);
                });
            }

        };
    }]);

    module.directive('scrollSpy', ['$rootScope', '$window', 'ScrollSpyService', function ($rootScope, $window, ScrollSpyService) {
        return {
            restrict: 'A',
            priority: 20,
            controller: 'ScrollSpyCtrl',
            link: function (scope, elem, attrs, ctrl) {
                var bodyOffset=0;
                angular.forEach($('body').find('*[scroll-fix]'), function(value) {
                    var el = angular.element(value);
                    if (el.attr('scroll-fix-bottom')===undefined) {
                        bodyOffset=bodyOffset+el.outerHeight(true);
                    }
                });

                $($window).scroll(function () {
                    ctrl.checkSpy(bodyOffset);
                });

                $rootScope.$on('$translateChangeSuccess', function () {
                    // todo on lang change, .active is missing and no translation!!!
                    //ScrollSpyService.clearSpies();
                });

                scope.$on('$routeChangeSuccess',function(){
                    ScrollSpyService.clearSpies();
                });
            }
        };
    }]);

    module.directive('spy', ['ScrollSpyService',function (ScrollSpyService) {
        return {
            restrict: "A",
            priority: 30,
            link: function(scope, elem, attrs) {
                ScrollSpyService.addSpy({
                    id: attrs.spy,
                    in: function() {
                        elem.addClass('active');
                    },
                    out: function() {
                        elem.removeClass('active');
                    }
                });
            }
        };
    }]);

    module.directive('scrollUp', ['$compile','$window','$document','$location','$anchorScroll','ScrollService','UiRenderService', function($compile,$window,$document,$location,$anchorScroll,ScrollService,UiRenderService){
        return {
            restrict: 'A',
            priority: 10,
            link: function(scope, element, attrs){
                var body = element;
                if (element.prop('tagName')!=='BODY'){
                    body=$('body');
                }
                var documentTopId=element.attr('id') || 'document-top';
                if (body.attr('id')===undefined){
                    body.attr('id',documentTopId);
                }
                var fixed=false;
                var scrollFix = attrs.scrollUp || false;
                var scrollFixBottom = $('*[scroll-fix-bottom]').attr('id') || false;

                var scrollUp = angular.element('<a id="scroll-up" ng-click="scrollTop()" translate="'+UiRenderService.getScrollUpI18n()+'" style="display: none; bottom: '+UiRenderService.getScrollUpBottom()+'px;"></a>');
                $compile(scrollUp)(scope);
                body.append(scrollUp);

                var fixedBottom=$('#'+scrollFix).outerHeight(true)+$('#scroll-up').outerHeight(true)+UiRenderService.getScrollUpBottom();
                if (angular.isString(scrollFixBottom)){
                    // if there is a scroll-fix-bottom (displayed always at bottom)
                    fixedBottom=fixedBottom-$('#'+scrollFixBottom).outerHeight(true);
                }

                $($window).scroll(function () {
                    var overlay=$document.height()-$('#'+scrollFix).outerHeight(true);
                    if (angular.isString(scrollFixBottom)){
                        // if there is a scroll-fix-bottom (displayed always at bottom)
                        overlay=overlay+$('#'+scrollFixBottom).outerHeight(true);
                    }

                    if (ScrollService.scrollY()>UiRenderService.getScrollUp() && !fixed){
                        $('#scroll-up').css('display','block');
                        fixed=true;
                    }
                    else if (ScrollService.scrollY()<UiRenderService.getScrollUp() && fixed){
                        $('#scroll-up').css('display','none');
                        fixed=false;
                    }

                    if ((ScrollService.scrollY()+$(window).height())>overlay){
                        $('#scroll-up').css('bottom',fixedBottom);
                        $('#scroll-up').css('position','relative');
                    }
                    else {
                        $('#scroll-up').css('bottom',UiRenderService.getScrollUpBottom());
                        $('#scroll-up').css('position','fixed');
                    }
                });

                scope.scrollTop=function(){
                    $anchorScroll();
                    $location.hash(documentTopId);
                    scope.$broadcast('alv-ch-ng:dom-manipulate', {'id':documentTopId,'event':'scrollUp:scrollTop'});
                };
            }
        };
    }]);

}());