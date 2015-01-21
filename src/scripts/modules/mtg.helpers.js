;(function () {
    'use strict';

    var module = angular.module('mtg.helpers', ['mtg.variables']);

    module.factory('Helpers', function Helpers(zIndex) {
        return {
            // Update the z-index of a single card
            updateZ: function ($card) {
                if ($card.hasClass('enchantment') &&
                    $card.hasClass('ui-draggable-dragging'))
                    $card.css('z-index', zIndex);
                else
                    $card.css('z-index', ++zIndex);
            }
        }
    });

}());