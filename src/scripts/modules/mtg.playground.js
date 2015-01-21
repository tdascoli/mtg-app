;
(function () {
    'use strict';

    var module = angular.module('mtg.playground', ['mtg.variables','ngLodash']);

    module.controller('GameAreaCtrl', function ($compile, $scope, lodash, GameAreaService) {
        var $game = $('#game-area');
        var $library = $('#my-library');
        var $hand = $('#my-hand');
        var side = 'my';

        var currentCard = 0;
        $scope.currentPhase={begin:false,main1:false,combat:false,main2:false,end:false};
        $scope.phase={begin:false,main1:false,combat:false,main2:false,end:false};

        var card = {baseOffset: 40};
        /*if ($.browser.mobile) {
         card.baseOffset = 38; // mobile card width
         }*/
        var offset = card.baseOffset;
        var top = (side === 'op') ? 0 : $library.offset().top;
        var dummyCard = angular.element('<div class="card-min" data-drag="true" jqyoui-draggable data-jqyoui-options="{{dragCardOptions}}">' +
                                            '<img src="/images/card-back.jpeg" class="back-side"/>' +
                                        '</div>');

        $scope.my = {
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
        $scope.op = {};
        $scope.dragCardOptions = {containment: '#game-area', snap: '.exile,.graveyard,.library,.hand,.battlefield'}; // ,grid: [10, 10]

        $scope.toBattlefield = function (event, ui) {
            console.log('toBattlefield');
            //$scope.my.battlefield=ui.draggable;
            GameAreaService.cardIn(ui.draggable, 'battlefield');
            //ui.draggable.addClass('flipped');
            $scope.reorganize();
        };

        $scope.toHand = function (event, ui) {
            console.log('toHand');
            GameAreaService.cardIn(ui.draggable, 'hand');
            $scope.reorganize();
        };

        $scope.toGraveyard = function (event, ui) {
            console.log('toGraveyard');
            GameAreaService.cardIn(ui.draggable, 'graveyard');
            GameAreaService.placeIn(ui.draggable, $('#my-graveyard').offset());
            $scope.reorganize();
        };

        $scope.toExile = function (event, ui) {
            console.log('toExile');
            GameAreaService.cardIn(ui.draggable, 'exile');
            GameAreaService.placeIn(ui.draggable, $('#my-exile').offset());
            $scope.reorganize();
        };

        $scope.toLibrary = function (event, ui) {
            console.log('toLibrary');
            GameAreaService.cardIn(ui.draggable, 'library');
            GameAreaService.placeIn(ui.draggable, $('#my-library').offset());
            $scope.reorganize();
        };

        $scope.shuffleLibrary = function () {
            if ($scope.my.library === undefined) {
                $scope.my = {library: $scope.my.cards};
            }
            GameAreaService.shuffleArray($scope.my.library);
        };

        $scope.cardAction = function (id, side) {
            if ($.browser.mobile) {
                console.log('mobile');
                GameAreaService.cardContextMobile(id, side);
            }
            else {
                if (side === 'my') {
                    GameAreaService.tap(id, side);
                }
            }
        };

        $scope.isTapped = function (id, side) {
            if ($('#' + side + '_' + id).hasClass('in-battlefield')) {
                if ($('#' + side + '_' + id).hasClass('tapped')) {
                    return true;
                }
                return false;
            }
            return false;
        };

        $scope.untapAll = function () {
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

        $scope.drawCard = function () {
            if (currentCard === 0) {
                $scope.shuffleLibrary();
            }

            // Appending to DOM
            var $card = dummyCard.clone();

            $card.attr('id', side + '_' + currentCard).attr('ng-click', 'cardAction(' + currentCard + ',\'' + side + '\')');

            var multiverseid = $scope.my.library[0];
            $scope.my.library.splice(0, 1);
            currentCard++;

            $card.append(angular.element('<img src="http://mtgimage.com/multiverseid/' + multiverseid + '.jpg" class="front-side" />'));
            $card.addClass('my').addClass('in-hand');

            $compile($card)($scope);

            $game.append($card);

            // Position
            $card.css({
                left: $library.offset().left,
                top: top
            });

            // Reorganizing
            $scope.reorganize();
        };

        $scope.reorganize = function () {
            console.log('reorganize');
            var $cards = $('.card-min.in-hand');
            // Position
            var width = $hand.width() - offset,
                left = $hand.offset().left;

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
                    top: top
                }, 'fast');
            });
        };
    });

    module.factory('GameAreaService', ['zIndex', function (zIndex) {

        function cardContextMobile(id,side) {
            $('#card-widget-mobile').attr('card', id);
            $('#card-widget-mobile').attr('side', side);
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

        return {
            'cardContextMobile': cardContextMobile,
            'cardIn': cardIn,
            'placeIn': placeIn,
            'tap': tap,
            'shuffleArray': shuffleArray,
            'updateZ':updateZ
        };
    }]);

}());