;(function () {
    'use strict';

    var module = angular.module('mtg.deckbuilder', ['mtg.variables','mtg.modals','restangular']);

    module.controller('DeckBuilderCtrl', function ($scope,$rootScope,MTGJson,Restangular) {
        $scope.cards=null;
        $scope.deck={name:'Deck', cards: []};
        $scope.parseDeck=false;
        $scope.selectedSet=false;

        $scope.setList=MTGJson.setList().getList().$object;

        $scope.setSet=function(){
            $scope.cards=MTGJson.sets().one($scope.selectedSet).get().$object;
        };

        $scope.toDeck=function(multiverseid){
            $scope.deck.cards.push(multiverseid);
        };

        $scope.searchCard=function(){
            console.log($scope.search);
            //Restangular.all("items").customGET('', { q: {"tags": "node"}})
            $scope.test = Restangular.all('AllCards').customGET('', {'filter[where][names]': 'Morphling'}).$object;
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