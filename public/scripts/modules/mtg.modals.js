;(function () {
    'use strict';

    var module = angular.module('mtg.modals', ['ngLodash']);

    module.controller('GameModalCtrl', function ($scope,$rootScope,$compile,lodash,GameAreaService) {

        $scope.amountCards=0;
        $scope.showCards=false;
        $scope.selectedCards=[];
        $scope.removeCards=[];

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

        $scope.showTokenModal=function(){
            if (
                $('#card-widget-mobile').attr('side')==='my' &&
                GameAreaService.getCardElement($('#card-widget-mobile').attr('card'),$('#card-widget-mobile').attr('side')).hasClass('in-battlefield'))
            {
                return true;
            }
            return false;
        };

        $scope.changeToken=function(points){
            var token = $scope.showTokens();
            if (points==='lose'){
                token--;
            }
            else if (points==='gain'){
                token++;
            }
            if (token>0) {
                GameAreaService.getCardElement($('#card-widget-mobile').attr('card'),$('#card-widget-mobile').attr('side')).addClass('has-token').attr('data-token', token);
            }
            else {
                GameAreaService.getCardElement($('#card-widget-mobile').attr('card'), $('#card-widget-mobile').attr('side')).removeClass('has-token').removeAttr('data-token');
            }
        };

        $scope.showTokens=function(){
            var token = GameAreaService.getCardElement($('#card-widget-mobile').attr('card'),$('#card-widget-mobile').attr('side')).attr('data-token') || 0;
            return token;
        };

        $scope.selectCardModal=function(){
            if ($scope.selectedCards){
                var arr = $.grep($scope.my.library, function(n, i) {
                    return $.inArray(i, $scope.removeCards) ==-1;
                });
                $scope.my.library=arr;

                angular.forEach($scope.selectedCards, function(value){
                    $scope.drawCard(value,'my');
                });
            }
            $scope.closeSearchCardModal();
        };

        $scope.searchCards=function(){
            if ($('#search-cards').attr('cards')==='library'){
                if ($scope.showCards){
                    return $scope.my.library;
                }
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

        $scope.showCardsModal=function(){
            $scope.showCards=true;
            if ($scope.amountCards<1){
                $scope.amountCards=$scope.my.library.length;
            }
        };

        $scope.isLibrary=function(){
            if ($('#search-cards').attr('cards')==='library'){
                return true;
            }
            return false;
        };

        $scope.closeSearchCardModal=function(){
            $scope.showCards=false;
            $scope.amountCards=0;
            $scope.selectedCards=[];
            $scope.removeCards=[];
            $('#search-cards').modal('hide');
        };

        $scope.selectCard=function(index,card){
            $scope.selectedCards.push(card);
            $scope.removeCards.push(index);
            $('#card_'+index).addClass('selected');
        };
    });

}());