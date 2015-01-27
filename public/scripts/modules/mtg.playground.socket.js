;(function () {
    'use strict';

    var module = angular.module('mtg.playground.socket', ['mtg.socket','mtg.variables']);

    module.controller('GameAreaSocketCtrl', function (socket, $scope, $rootScope) {
        var $game = $('#game-area');
        var $library = $('#op-library');
        var $hand = $('#op-hand');
        var side = 'op';

        // Socket listeners
        // ================

        socket.on('playground:drag', function (data) {
            console.log('playground:drag',data);
        });

        socket.on('playground:action', function (message) {
            console.log('playground:action',message);

            $scope.drawCard(data.multiverseid,side);
        });

        // Methods published to the scope
        // ==============================
        $scope.sendDragCard=function($card){
            var pos = {
                left: $card.offset().left,
                top: $card.offset().top,
                //fluidLeft: playground.helpers.getFluidLeft(ui.position.left),
                //fluidTop: playground.helpers.getFluidTop(ui.position.top),
                zIndex: $card.css('z-index'),
                id: $card.attr('number')
            };

            socket.emit('playground:drag', { offset: pos });
        };
        $scope.sendDrawCard=function($card){
            var appendix = {
                multiverseid: $card.attr('multiverseid'),
                id: $card.attr('number')
            };
            socket.emit('playground:action', { action: 'draw', appendix: appendix });
        };
    });

}());