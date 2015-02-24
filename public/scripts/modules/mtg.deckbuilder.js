;(function () {
    'use strict';

    var module = angular.module('mtg.deckbuilder', ['mtg.variables','mtg.modals','restangular','ngLodash','ngFastLevenshtein']);

    module.controller('DeckBuilderCtrl', function ($scope,$rootScope,$http,MTGJson,lodash,Deck,fastLevenshteinService) {
        $scope.cards=null;
        $scope.searchCards=[];
        var emptyDeck=new Deck({ name: 'New Deck', username: $rootScope.globals.currentUser.username, cards: [] });
        $scope.deck=emptyDeck;
        $scope.parseDeck=false;
        $scope.selectedSet=false;
        $scope.idle=false;

        Deck.find({username: $scope.globals.currentUser.username}, function (err, result) {
            /*
             todo qbaka or track.js!
             if (err) return console.error(err);
             else console.log(result);
             */
            if (!err) {
                $scope.deckList = result;
            }
        });

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
            $scope.idle=true;
            $scope.searchCards=[];
            $http.get('/data/sets.json').then(function(sets) {
                $scope.cards=null;
                angular.forEach(sets.data, function(setObject){
                    var cards = lodash.pluck(lodash.filter(setObject.cards,function(card){
                        if (fastLevenshteinService.distance(card.name.toLowerCase(),$scope.search.toLowerCase())<4){
                            return card;
                        }
                    }),'multiverseid');

                    if (cards.length>0){
                        $scope.searchCards = lodash.compact($scope.searchCards.concat(cards));
                    }
                });
                $scope.idle=false;
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

        $scope.chooseDeck=function(deck){
            $scope.deck = deck;
        };

        $scope.showCard=function(multiverseid){
            if (multiverseid){
                return 'http://mtgimage.com/multiverseid/' + multiverseid + '.jpg';
            }
            return '/images/card-back.jpeg';
        };

        $rootScope.saveDeck=function(){
            $scope.deck.save(function(err, result){
                console.log('SAVE',$scope.deck._id,err,result);
            });
        };

        $rootScope.removeDeck=function(){
            $scope.deck.remove(function(err, result){
                console.log('REMOVE',$scope.deck._id,err,result);
                if (!err){
                    $scope.deck=emptyDeck;
                }
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