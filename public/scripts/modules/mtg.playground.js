;(function () {
    'use strict';

    var module = angular.module('mtg.playground', ['mtg.variables','mtg.socket','ngLodash']);

    module.controller('GameAreaCtrl', function ($compile, $scope, $rootScope, $routeParams, socket, lodash, currentCard, GameAreaService, Game) {
        var $game = $('#game-area');
        var $library = {my:$('#my-library'),op:$('#op-library')};
        var $hand = {my:$('#my-hand'),op:$('#op-hand')};
        var $graveyard = {my:$('#my-graveyard'),op:$('#op-graveyard')};
        var $exile = {my:$('#my-exile'),op:$('#op-exile')};
        var side = 'my';

        // game
        var game = $routeParams.game;
        var savedGame=false;

        $rootScope.currentPhase={begin:false,main1:false,combat:false,main2:false,end:false};
        $rootScope.phase={begin:false,main1:false,combat:false,main2:false,end:false};

        $rootScope.debug=false;

        var card = {baseOffset: 40};
        /*if ($.browser.mobile) {
         card.baseOffset = 38; // mobile card width
         }*/
        var offset = card.baseOffset;

        $rootScope.my = {
            hitpoints: 20,
            infection: 0,
            cards: []
        };
        /*
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
         */
        $rootScope.op = { hitpoints: 20, infection: 0, cards: [] };

        $scope.isHandConcealed=true;
        $scope.dragCardOptions = {containment: '#game-area' ,grid: [10, 10], snap: '.exile,.graveyard,.library,.hand,.battlefield',snapTolerance: 10};

        $scope.toBattlefield = function (event, ui) {
            console.log('toBattlefield');
            $scope.cardIn('my',ui.draggable, 'battlefield');
            //ui.draggable.find('.flipped').removeClass('flipped');
            $scope.sendDragCard(ui.draggable,ui.offset,ui.position,'battlefield');
            $scope.reorganize(side);
        };

        $scope.toHand = function (event, ui) {
            console.log('toHand');
            $scope.cardIn('my',ui.draggable, 'hand');
            $scope.sendDragCard(ui.draggable,ui.offset,ui.position,'hand');
            $scope.reorganize(side);
        };

        $scope.toGraveyard = function (event, ui) {
            console.log('toGraveyard');
            $scope.cardIn('my',ui.draggable, 'graveyard');
            GameAreaService.placeIn(ui.draggable, $('#my-graveyard').offset());
            $scope.sendDragCard(ui.draggable,ui.offset,ui.position,'graveyard');
            $scope.reorganize(side);
        };

        $scope.toExile = function (event, ui) {
            console.log('toExile');
            $scope.cardIn('my',ui.draggable, 'exile');
            GameAreaService.placeIn(ui.draggable, $('#my-exile').offset());
            $scope.sendDragCard(ui.draggable,ui.offset,ui.position,'exile');
            $scope.reorganize(side);
        };

        $scope.toLibrary = function (event, ui) {
            console.log('toLibrary');
            GameAreaService.putInLibrary(ui.draggable.attr('number'),'my',ui.draggable.attr('multiverseid'));
            $scope.sendCardToLibrary(ui.draggable.attr('number'));
            $scope.reorganize(side);
        };

        $scope.cardIn=function(side,$card,where){
            if (side==='my'){
                GameAreaService.cardIn($card, where);
            }

            var card={in:where,offset:{ top: GameAreaService.getFluidTop($card.offset().top), left: GameAreaService.getFluidLeft($card.offset().left) },number:$card.attr('number'),multiverseid:$card.attr('multiverseid'),counter:($card.hasClass('has-token') ? $card.attr('data-token') : 0),zIndex:$card.css('zIndex'),tapped:$card.hasClass('tapped')};
            console.log('cardIn',card);
            if (side==='my'){
                $rootScope.my.cards[$card.attr('number')]=card;
            }
            else {
                $rootScope.op.cards[$card.attr('number')]=card;
            }
        };

        $scope.shuffleLibrary = function (sidebar) {
            if (sidebar){
                GameAreaService.closeSidebar();
            }
            GameAreaService.shuffleArray($rootScope.my.library);
        };

        $scope.cardAction = function (id, side, multiverseid) {
            if ($.browser.mobile) {
                if (side==='my' || (side==='op' && ($game.hasClass('reveal-hand') || !$('#op_'+id).hasClass('in-hand')))){
                    GameAreaService.cardContextMobile(id, side, multiverseid);
                }
            }
            else {
                if (side === 'my') {
                    GameAreaService.tap(id, side);
                    $scope.sendTapCard(id);
                }
            }
        };

        $scope.searchCards=function(side,which){
            GameAreaService.closeSidebar();
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

        $scope.saveGame=function(){
            var game = saveGame($rootScope.globals.currentUser.username);
            game.save(function(err,result){
                console.log('SAVE GAME',game._id,err,result);
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

            var $card=GameAreaService.drawCard(multiverseid,side,currentCard);
            currentCard++;

            $compile($card)($scope);
            $game.append($card);
            $scope.cardIn('my',$card, 'hand');


            $scope.sendDrawCard($card);

            // Reorganizing
            $scope.reorganize(side);
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
            $scope.sendPoints(what,points);
            if (what==='hitpoints'){
                if (points==='lose'){
                    $rootScope.my.hitpoints--;
                }
                else if (points==='gain'){
                    $rootScope.my.hitpoints++;
                }
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

        function changeOpPoints(what,points){
            if (what==='hitpoints'){
                if (points==='lose'){
                    $rootScope.op.hitpoints--;
                }
                else if (points==='gain'){
                    $rootScope.op.hitpoints++;
                }
            }
            else {
                if (points==='lose'){
                    $rootScope.op.infection--;
                }
                else if (points==='gain'){
                    $rootScope.op.infection++;
                }
            }
        }

        // Socket listeners
        // ================

        socket.on('playground:drag', function (data) {
            console.log('playground:drag',data,data.offset);
            if (data.user!==$rootScope.globals.currentUser.username || $scope.debug) {

                var offset = convertOffset(true,{top:data.offset.fluidTop,left:data.offset.fluidLeft});

                if (data.offset.where !== 'battlefield') {
                    GameAreaService.cardIn($('#op_' + data.offset.id), data.offset.where);
                    offset = $graveyard.op;
                    if (data.offset.where === 'hand') {
                        offset = $hand.op;
                    }
                    if (data.offset.where === 'exile') {
                        offset = $exile.op;
                    }
                    GameAreaService.placeIn($('#op_' + data.offset.id), offset.offset());
                }
                else {
                    GameAreaService.cardIn($('#op_' + data.offset.id), data.offset.where);
                    $('#op_' + data.offset.id).css({
                        zIndex: data.offset.zIndex,
                        left: offset.left,
                        top: offset.top
                    });
                    //$('#op_'+data.offset.id+' img.front-side').removeClass('flipped');
                }
                $scope.cardIn('op',$('#op_' + data.offset.id), data.offset.where);
                $scope.reorganize('op');
            }
        });

        socket.on('playground:action', function (data) {
            console.log('playground:action',data,data.appendix);
            if (data.user!==$rootScope.globals.currentUser.username || $scope.debug) {
                if (data.action === 'draw') {
                    $rootScope.op.library = data.appendix.library;
                    var $card = GameAreaService.drawCard(data.appendix.multiverseid, 'op', data.appendix.id);
                    $compile($card)($scope);
                    $game.append($card);
                    $scope.cardIn('op',$card, 'hand');
                    $scope.reorganize('op');
                }
                if (data.action === 'tap') {
                    GameAreaService.tap(data.appendix.id, 'op');
                }
                if (data.action === 'token') {
                    GameAreaService.setToken(data.appendix.id, 'op', data.appendix.token);
                }
                if (data.action === 'revealHand') {
                    $game.toggleClass('reveal-hand');
                }
                if (data.action === 'points') {
                    changeOpPoints(data.appendix.what, data.appendix.points);
                }
                if (data.action === 'toLibrary') {
                    $rootScope.op.library = data.appendix.library;
                    GameAreaService.removeCard(data.appendix.id, 'op')
                }
            }
        });

        socket.on('host:save', function (user) {
            console.log('host:save',user,'has disconnected');
            var game = saveGame(user);
            // todo collect data and store, show message etc...
            // todo --> refresh?!
            game.save(function(err,result){
                console.log('SAVE GAME',game._id,err,result);
            });
        });

        socket.on('host:joined', function(user){
            if (user!==$rootScope.globals.currentUser.username) {
                $rootScope.player2 = user;
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
                fluidLeft: GameAreaService.getFluidLeft(offset.left),
                fluidTop: GameAreaService.getFluidTop(offset.top),
                zIndex: $card.css('z-index'),
                id: $card.attr('number'),
                where: where
            };

            socket.emit('playground:drag', { user: $rootScope.globals.currentUser.username, offset: pos });
        };
        $scope.sendDrawCard=function($card){
            var appendix = {
                library: $rootScope.my.library,
                multiverseid: $card.attr('multiverseid'),
                id: $card.attr('number')
            };
            socket.emit('playground:action', { action: 'draw', user: $rootScope.globals.currentUser.username, appendix: appendix });
        };
        $scope.sendTapCard=function(id){
            var appendix = {
                id: id
            };
            socket.emit('playground:action', { action: 'tap', user: $rootScope.globals.currentUser.username, appendix: appendix });
        };
        $scope.sendTokenCard=function(id,token){
            var appendix = {
                token: token,
                id: id
            };
            socket.emit('playground:action', { action: 'token', user: $rootScope.globals.currentUser.username, appendix: appendix });
        };
        $scope.sendRevealHand=function(){
            GameAreaService.closeSidebar();
            $scope.isHandConcealed=!$scope.isHandConcealed;
            socket.emit('playground:action', { action: 'revealHand', user: $rootScope.globals.currentUser.username, appendix: null });
        };
        $scope.sendPoints=function(what,points){
            var appendix = {
                what: what,
                points: points
            };
            socket.emit('playground:action', { action: 'points', user: $rootScope.globals.currentUser.username, appendix: appendix });
        };
        $scope.sendCardToLibrary=function(id){
            var appendix = {
                library: $rootScope.my.library,
                id: id
            };
            socket.emit('playground:action', { action: 'toLibrary', user: $rootScope.globals.currentUser.username, appendix: appendix });
        };

        // load or host game
        $scope.initShow=false;
        // join game
        if ($routeParams.game || $routeParams.debug) {
            // debug
            if ($routeParams.debug) {
                $rootScope.debug=true;
                game = $routeParams.debug;
            }
            $scope.initShow=true;

            socket.emit('host:join', game);
            if (!$rootScope.player1){
                $rootScope.player1=$scope.globals.currentUser.username;
            }
            else {
                $rootScope.player2=$scope.globals.currentUser.username;
            }
        }

        // load game
        if ($routeParams.id) {
            Game.findOne({_id:$routeParams.id}, function(err,result){
                savedGame = result;
                game = savedGame.name;

                $rootScope.player1=savedGame.player1;
                $rootScope.player2=savedGame.player2;

                if (savedGame.player1===$scope.globals.currentUser.username){
                    $rootScope.my=savedGame.player1Stats;
                    $rootScope.op=savedGame.player2Stats;
                }
                else {
                    $rootScope.my=savedGame.player2Stats;
                    $rootScope.op=savedGame.player1Stats;
                }
                // place cards in game-area
                loadGameCards($rootScope.my.cards,'my');
                loadGameCards($rootScope.op.cards,'op');

                $scope.reorganize('my');
                $scope.reorganize('op');

                // join room
                socket.emit('host:join', game);
            });
        }

        function loadGameCards(cards,side){
            angular.forEach(cards, function(card){
                var $card;
                if (card.in==='battlefield'){
                    $card=GameAreaService.getNewCardElement(card.multiverseid,side,card.number);
                    GameAreaService.placeIn($card,convertOffset((side==='op'),card.offset));
                }
                else {
                    $card=GameAreaService.drawCard(card.multiverseid,side,card.number);
                    if (card.in!=='hand'){
                        GameAreaService.placeIn($card,$('#'+side+'-'+card.in).offset());
                    }
                }
                if (card.tapped){
                    $card.addClass('tapped');
                }
                $compile($card)($scope);
                $game.append($card);

                if (card.counter>0){
                    GameAreaService.setToken(card.number,side,card.counter);
                }
                GameAreaService.cardIn($card,card.in);
                GameAreaService.updateZ($card);
            });
        }

        function saveGame(user){
            // when player1 unknown
            if (!$rootScope.player1){
                $rootScope.player1=user;
            }
            // when game name is unknown
            if (!game){
                game = $routeParams.game;
            }

            if (!savedGame){
                savedGame = new Game({
                    player1: $rootScope.player1,
                    player2: $rootScope.player2,
                    saved: user,
                    name: game,
                    player1Stats: ($rootScope.player1===$rootScope.globals.currentUser.username ? $rootScope.my : $rootScope.op),
                    player2Stats: ($rootScope.player2===$rootScope.globals.currentUser.username ? $rootScope.my : $rootScope.op)
                });
            }
            return savedGame;
        }

        function convertOffset(op,offset){
            return {
                top:GameAreaService.convertFluidTop(offset.top,55,op),
                left:GameAreaService.convertFluidLeft(offset.left,48)
              };
        }
    });

    module.factory('GameAreaService', ['zIndex', function (zIndex) {

        var myDummyCard = angular.element('<div class="my card-min" data-drag="true" jqyoui-draggable data-jqyoui-options="{{dragCardOptions}}">' +
                                            '<img src="/images/card-back.jpeg" class="back-side"/>' +
                                          '</div>');
        var opDummyCard = angular.element('<div class="op card-min">' +
                                            '<img src="/images/card-back.jpeg" class="back-side"/>' +
                                          '</div>');

        var library = {my:$('#my-library'),op:$('#op-library')};
        var hand = {my:$('#my-hand'),op:$('#op-hand')};
        var game = $('#game-area');

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
                $card.removeClass('has-token');
                $card.attr('data-token',0);
            }
            $card.addClass('in-'+where);
        }

        function placeIn($card, offset) {
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

        function putInLibrary(id,side,multiverseid) {
            $('#library-widget').attr('multiverseid', multiverseid);
            $('#library-widget').attr('number', id);
            $('#library-widget').modal();
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
            return (side === 'op') ? 51 : library.my.offset().top;
        }

        function setToken(id,side,token){
            if (token>0) {
                getCardElement(id,side).addClass('has-token').attr('data-token', token);
            }
            else {
                getCardElement(id,side).removeClass('has-token').removeAttr('data-token');
            }
        }

        function removeCard(id,side){
            $('#'+side+'_'+id).remove();
        }

        // getFluidHeight
        function getFluidTop(top){
            var height=game.height();
            return Math.round(100 * (top / height));
        }

        // getFluidWidth
        function getFluidLeft(left){
            var width=game.width();
            return Math.round(100 * (left / width));
        }

        function convertFluidTop(fluidTop,cardHeight,op){
            var top=(100-fluidTop)/100;
            if (!op){
                top=fluidTop/100;
            }
            top = Math.round((top * game.height())+(cardHeight-$('#phase').height()));
            if (top>(game.height()-cardHeight)){
                return (game.height()-cardHeight);
            }
            return top;
        }

        function convertFluidLeft(fluidLeft,cardWidth){
            var left=fluidLeft/100;
            left = Math.round(left * game.width());
            if (left>(game.width()-cardWidth)){
                return (game.width()-cardWidth);
            }
            return left;
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
            'handTop':handTop,
            'setToken':setToken,
            'removeCard':removeCard,
            'putInLibrary':putInLibrary,
            'getFluidTop':getFluidTop,
            'getFluidLeft':getFluidLeft,
            'convertFluidTop':convertFluidTop,
            'convertFluidLeft':convertFluidLeft
        };
    }]);

}());