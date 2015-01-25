;(function () {
    'use strict';

    var module = angular.module('mtg.modals', []);

    module.controller('GameModalCtrl', function ($scope,$rootScope,GameAreaService) {

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

        $scope.cardWidget=function(){
            if ($('#card-widget-mobile').attr('multiverseid')){
                return 'http://mtgimage.com/multiverseid/' + $('#card-widget-mobile').attr('multiverseid') + '.jpg';
            }
            return '/images/card-back.jpeg';
        };

        $scope.selectCardModal=function(){
            alert('selected cards');
        };

        $scope.searchCards=function(){
            if ($('#search-cards').attr('cards')==='library'){
                return $scope.my.library;
            }
            else {
                var cards=[];
                $('.my.card-min.in-'+$('#search-cards').attr('cards')+' img.front-side').each(function(){
                    cards.push($(this).attr('multiverseid'));
                });
                return cards;
            }
        };

        $scope.showSearchCardModal=function(multiverseid){
            return 'http://mtgimage.com/multiverseid/' + multiverseid + '.jpg';
        };
    });

}());