;(function () {
    'use strict';

    var module = angular.module('mtg.deckbuilder', ['mtg.variables','mtg.modals','restangular','ngLodash']);

    module.controller('DeckBuilderCtrl', function ($scope,$rootScope,$http,MTGJson,lodash) {
        $scope.cards=null;
        $scope.searchCards=[];
        $scope.deck={name:'Deck', cards: []};
        $scope.parseDeck=false;
        $scope.selectedSet=false;

        $scope.setList=MTGJson.setList().getList().$object;

        $scope.setSet=function(){
            $scope.searchCards=[];
            $scope.cards=MTGJson.sets().one($scope.selectedSet).get().$object;
        };

        $scope.toDeck=function(multiverseid){
            $scope.deck.cards.push(multiverseid);
        };
        $scope.removeFromDeck=function(index){
            $scope.deck.cards.splice(index, 1);
        };

        $scope.searchParseCard=function(){
            $http.get('/data/AllCards.json').then(function(cards) {
                $scope.test=lodash.filter(cards.data,{'name':'Swamp'});
            });
        };

        $scope.searchCard=function(){
            $http.get('/data/sets.json').then(function(sets) {
                $scope.cards=null;
                angular.forEach(sets.data, function(setObject){
                    var cards = lodash.pluck(lodash.filter(setObject.cards,{'name':$scope.search}),'multiverseid');
                    if (cards.length>0){
                        $scope.searchCards = lodash.compact($scope.searchCards.concat(cards));
                    }
                });
            });
        };
    });

    module.factory('MTGJson', function (Restangular) {
        return {
            cards: function () {
                return Restangular.service('AllCards');
            },
            sets: function () {
                return Restangular.service('sets');
            },
            setList: function () {
                return Restangular.service('SetList');
            }
        };
    });

}());