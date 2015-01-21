;(function () {
    'use strict';

    var module = angular.module('mtg.modals', ['mtg.playground']);

    module.controller('GameModalCtrl', function ($scope,GameAreaService) {

        $scope.tapModal=function(){
            GameAreaService.tap($('#card-widget-mobile').attr('card'), $('#card-widget-mobile').attr('side'));
            $('#card-context').modal('hide');
        };

        $scope.showTappedModal=function(isTapped){
            if ($('#card-widget-mobile').attr('side')==='my'){
                if(
                    ($scope.isTapped($('#card-widget-mobile').attr('card'),$('#card-widget-mobile').attr('side')) && isTapped) ||
                    (!$scope.isTapped($('#card-widget-mobile').attr('card'),$('#card-widget-mobile').attr('side')) && !isTapped) &&
                    ($('#'+$('#card-widget-mobile').attr('side')+'_'+$('#card-widget-mobile').attr('card')).hasClass('in-battlefield'))
                ){
                    return true;
                }
            }
            return false;
        };
    });

}());