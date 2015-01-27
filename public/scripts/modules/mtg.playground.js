;(function () {
    'use strict';

    var module = angular.module('mtg.playground', ['mtg.variables','mtg.socket','ngLodash']);

    module.controller('GameAreaCtrl', function ($compile, $scope, $rootScope, socket, lodash, currentCard, GameAreaService) {
        var $game = $('#game-area');
        var $library = {my:$('#my-library'),op:$('#op-library')};
        var $hand = {my:$('#my-hand'),op:$('#op-hand')};
        var $graveyard = {my:$('#my-graveyard'),op:$('#op-graveyard')};
        var $exile = {my:$('#my-exile'),op:$('#op-exile')};
        var side = 'my';

        $rootScope.currentPhase={begin:false,main1:false,combat:false,main2:false,end:false};
        $rootScope.phase={begin:false,main1:false,combat:false,main2:false,end:false};

        var card = {baseOffset: 40};
        /*if ($.browser.mobile) {
         card.baseOffset = 38; // mobile card width
         }*/
        var offset = card.baseOffset;

        $rootScope.my = {
            hitpoints: 20,
            infection: 0,
            cards: [
                370490,
                370490,
                370490,
                370490,
                380194,
                380194,
                380194,
                380194,
                202429,
                376453,
                376453,
                376453,
                202433,
                202433,
                202433,
                202424,
                202424,
                202424,
                202424,
                202442,
                202442,
                600,
                83058,
                83058,
                275705,
                159307,
                629,
                630,
                631,
                632,
                633,
                376508,
                159308,
                159308,
                692,
                202437,
                202437,
                201156,
                201156,
                201156,
                201156,
                202447,
                202447,
                201162,
                201162,
                201162,
                201162,
                373334,
                373334,
                373334,
                373334,
                202628,
                159828,
                202409,
                729,
                728,
                201161,
                373408,
                5863,
                5863
            ]
        };
        $rootScope.op = { hitpoints: 20, infection: 0,
            library: [
            370490,
            370490,
            370490,
            370490,
            380194,
            380194,
            380194,
            380194,
            202429,
            376453,
            376453,
            376453,
            202433,
            202433,
            202433,
            202424,
            202424,
            202424,
            202424,
            202442,
            202442,
            600,
            83058,
            83058,
            275705,
            159307,
            629,
            630,
            631,
            632,
            633,
            376508,
            159308,
            159308,
            692,
            202437,
            202437,
            201156,
            201156,
            201156,
            201156,
            202447,
            202447,
            201162,
            201162,
            201162,
            201162,
            373334,
            373334,
            373334,
            373334,
            202628,
            159828,
            202409,
            729,
            728,
            201161,
            373408,
            5863,
            5863
        ] };

        $scope.dragCardOptions = {containment: '#game-area' ,grid: [10, 10], snap: '.exile,.graveyard,.library,.hand,.battlefield',snapTolerance: 10};

        $scope.toBattlefield = function (event, ui) {
            console.log('toBattlefield');
            GameAreaService.cardIn(ui.draggable, 'battlefield');
            //ui.draggable.addClass('flipped');
            $scope.sendDragCard(ui.draggable,ui.offset,ui.position,'battlefield');

            $scope.reorganize(side);
        };

        $scope.toHand = function (event, ui) {
            console.log('toHand');
            GameAreaService.cardIn(ui.draggable, 'hand');
            $scope.sendDragCard(ui.draggable,ui.offset,ui.position,'hand');
            $scope.reorganize(side);
        };

        $scope.toGraveyard = function (event, ui) {
            console.log('toGraveyard');
            GameAreaService.cardIn(ui.draggable, 'graveyard');
            GameAreaService.placeIn(ui.draggable, $('#my-graveyard').offset());
            $scope.sendDragCard(ui.draggable,ui.offset,ui.position,'graveyard');
            $scope.reorganize(side);
        };

        $scope.toExile = function (event, ui) {
            console.log('toExile');
            GameAreaService.cardIn(ui.draggable, 'exile');
            GameAreaService.placeIn(ui.draggable, $('#my-exile').offset());
            $scope.sendDragCard(ui.draggable,ui.offset,ui.position,'exile');
            $scope.reorganize(side);
        };

        $scope.toLibrary = function (event, ui) {
            console.log('toLibrary');
            GameAreaService.cardIn(ui.draggable, 'library');
            GameAreaService.placeIn(ui.draggable, $('#my-library').offset());
            $scope.sendDragCard(ui.draggable,ui.offset,ui.position,'library');
            $scope.reorganize(side);
        };

        $scope.shuffleLibrary = function (sidebar) {
            if (sidebar){
                GameAreaService.closeSidebar();
            }
            if ($rootScope.my.library === undefined) {
                $rootScope.my.library=$rootScope.my.cards;
            }
            GameAreaService.shuffleArray($rootScope.my.library);
        };

        $scope.cardAction = function (id, side, multiverseid) {
            if ($.browser.mobile) {
                console.log('mobile',id, side, multiverseid);
                GameAreaService.cardContextMobile(id, side, multiverseid);
            }
            else {
                if (side === 'my') {
                    GameAreaService.tap(id, side);
                }
            }
        };

        $scope.searchCards=function(side,which){
            if (side==='my'){
                GameAreaService.closeSidebar();
            }
            GameAreaService.searchCards(side,which);
        };

        $scope.isTapped = function (id, side) {
            if (GameAreaService.getCardElement(id,side).hasClass('in-battlefield')) {
                if (GameAreaService.getCardElement(id,side).hasClass('tapped')) {
                    return true;
                }
                return false;
            }
            return false;
        };

        $scope.untapAll = function () {
            GameAreaService.closeSidebar();
            $('.my.tapped').toggleClass('tapped');
        };

        $scope.setPhase = function(phase) {
            var active=true;
            angular.forEach($scope.phase, function(value,key){
                $scope.phase[key]=active;
                if (key===phase){
                    active=false;
                }
            });
        };

        $scope.nextPhase = function() {
            var active=true;
            angular.forEach($scope.phase, function(value,key){
                if (!value && active){
                    $scope.phase[key]=true;
                    active=false;
                }
            });
        };

        $scope.drawFullHand=function(){
            for(var i=0;i<7;i++){
                $scope.drawCard(false,'my');
            }
        };

        $scope.drawCard = function (multiverseid,side) {
            if (currentCard === 0) {
                $scope.shuffleLibrary(false);
            }

            if (!multiverseid) {
                multiverseid = $rootScope.my.library[0];
                $rootScope.my.library.splice(0, 1);
            }
            currentCard++;

            var $card=GameAreaService.drawCard(multiverseid,side,currentCard);

            $compile($card)($scope);
            $game.append($card);

            $scope.sendDrawCard($card);

            // Reorganizing
            $scope.reorganize(side);
        };

        $scope.dragCard=function(){

        };

        $scope.reorganize = function (side) {
            var hand = $hand.my;
            if (side==='op'){
                hand = $hand.op;
            }
            var $cards = $('.'+side+'.card-min.in-hand');
            // Position
            var width = hand.width() - offset,
                left = hand.offset().left;

            // Is there place in the hand?
            var diff = Math.floor(width / $cards.length);
            if (($cards.length * card.baseOffset) > width) {
                offset = diff;
            }
            else {
                offset = card.baseOffset;
            }

            $($cards.get().reverse()).each(function (i) {
                // Getting to position
                var to_position = left + offset * i;
                // z-index
                GameAreaService.updateZ($(this));
                // Animating
                $(this).animate({
                    left: to_position,
                    top: GameAreaService.handTop(side)
                }, 'fast');
            });
        };

        $scope.changePoints=function(what,points){
            if (what==='hitpoints'){
                if (points==='lose'){
                    $rootScope.my.hitpoints--;
                }
                else if (points==='gain'){
                    $rootScope.my.hitpoints++;
                }
                $('#my-battlefield').attr('data-hitpoints',$rootScope.my.hitpoints);
            }
            else {
                if (points==='lose'){
                    $rootScope.my.infection--;
                }
                else if (points==='gain'){
                    $rootScope.my.infection++;
                }
            }
        };

        $scope.countCards=function(side,which){
            return $('.'+side+'.card-min.in-'+which).length;
        };

        // Socket listeners
        // ================

        socket.on('playground:drag', function (data) {
            console.log('playground:drag',data,data.offset);

            if (data.offset.where!=='battlefield'){
                GameAreaService.cardIn($('#op_'+data.offset.id), data.offset.where);
                var offset=$graveyard.op;
                if (data.offset.where==='hand'){
                    offset=$hand.op;
                }
                if (data.offset.where==='exile'){
                    offset=$exile.op;
                }
                GameAreaService.placeIn($('#op_'+data.offset.id),offset.offset());
            }
            else {
                GameAreaService.cardIn($('#op_'+data.offset.id), data.offset.where);
                $('#op_'+data.offset.id).css({
                    zIndex: data.offset.zIndex,
                    left: data.offset.left,
                    top: (data.offset.top/2)
                }).addClass('flipped');
            }
            $scope.reorganize('op');
        });

        socket.on('playground:action', function (data) {
            console.log('playground:action',data,data.appendix);

            if (data.action==='draw') {
                var $card = GameAreaService.drawCard(data.appendix.multiverseid, 'op', data.appendix.id);
                $compile($card)($scope);
                $game.append($card);
                $scope.reorganize('op');
            }
        });

        // Methods published to the scope
        // ==============================
        $scope.sendDragCard=function($card,offset,position,where){
            var pos = {
                left: offset.left,
                top: offset.top,
                posLeft: position.left,
                posTop: position.top,
                //fluidLeft: playground.helpers.getFluidLeft(ui.position.left),
                //fluidTop: playground.helpers.getFluidTop(ui.position.top),
                zIndex: $card.css('z-index'),
                id: $card.attr('number'),
                where: where
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

    module.factory('GameAreaService', ['zIndex', function (zIndex) {

        var myDummyCard = angular.element('<div class="card-min" data-drag="true" jqyoui-draggable data-jqyoui-options="{{dragCardOptions}}">' +
                                            '<img src="/images/card-back.jpeg" class="back-side"/>' +
                                          '</div>');
        var opDummyCard = angular.element('<div class="card-min">' +
                                            '<img src="/images/card-back.jpeg" class="back-side"/>' +
                                          '</div>');

        var library = {my:$('#my-library'),op:$('#op-library')};
        var hand = {my:$('#my-hand'),op:$('#op-hand')};

        function cardContextMobile(id,side,multiverseid) {
            $('#card-widget-mobile').attr('card', id);
            $('#card-widget-mobile').attr('side', side);
            $('#card-widget-mobile').attr('multiverseid', multiverseid);
            $('#card-context').modal();
        }

        function cardIn($card, where) {
            $card.removeClass('in-exile').removeClass('in-graveyard').removeClass('in-library').removeClass('in-hand').removeClass('in-battlefield');
            if (where !== 'battlefield') {
                $card.removeClass('tapped');
            }
            $card.addClass('in-' + where);
        }

        function placeIn($card, offset) {
            console.log($card,offset);
            $card.animate({
                left: offset.left,
                top: offset.top
            }, 'fast');
        }

        function tap(id, side) {
            if ($('#' + side + '_' + id).hasClass('in-battlefield')) {
                $('#' + side + '_' + id).toggleClass('tapped');
            }
        }
        /**
         * Randomize array element order in-place.
         * Using Fisher-Yates shuffle algorithm.
         */
        function shuffleArray(array) {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        }

        function updateZ($card) {
            if ($card.hasClass('enchantment') &&
                $card.hasClass('ui-draggable-dragging'))
                $card.css('z-index', zIndex);
            else
                $card.css('z-index', ++zIndex);
        }

        function searchCards(side,which) {
            $('#search-cards').attr('side', side);
            $('#search-cards').attr('cards', which);
            $('#search-cards').modal();
        }

        function closeSidebar(){
            $('#playgroundnav').collapse('hide');
        }

        function getCardElement(id,side){
            return $('#'+side+'_'+id);
        }

        function getNewCardElement(multiverseid,side,currentCard){
            // Appending to DOM
            var $card = myDummyCard.clone();
            if (side==='op'){
                $card = opDummyCard.clone();
            }
            $card.attr('id', side + '_' + currentCard).attr('ng-click', 'cardAction(' + currentCard + ',\'' + side + '\','+multiverseid+')');
            $card.attr('number',currentCard);
            $card.attr('multiverseid',multiverseid);
            $card.append(angular.element('<img src="http://mtgimage.com/multiverseid/' + multiverseid + '.jpg" class="front-side" />'));
            return $card;
        }

        function drawCard(multiverseid,side,currentCard) {
            var offset = library.my.offset();
            if (side==='op'){
                offset = library.op.offset();
            }
            var $card=getNewCardElement(multiverseid,side,currentCard);
            $card.addClass(side).addClass('in-hand');
            // Position

            $card.css({
                left: offset.left,
                top: offset.top
            });
            return $card;
        }

        function handTop(side){
            var top = (side === 'op') ? 0 : library.my.offset().top;
        }

        return {
            'cardContextMobile': cardContextMobile,
            'cardIn': cardIn,
            'placeIn': placeIn,
            'tap': tap,
            'shuffleArray': shuffleArray,
            'updateZ':updateZ,
            'closeSidebar':closeSidebar,
            'searchCards':searchCards,
            'getCardElement':getCardElement,
            'getNewCardElement':getNewCardElement,
            'drawCard':drawCard,
            'handTop':handTop
        };
    }]);

}());