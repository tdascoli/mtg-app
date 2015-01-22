$(document).ready(function() {
    window.addEventListener("load",function() {
        setTimeout(function(){
            window.scrollTo(0, 1);
        }, 0);
    });

    // Mobile
    //-------
    /*
    if ($.browser.mobile) {
        var screen = $(window).height();
        var navbar = $('#topnav .navbar').outerHeight(true) || 0;
        var height = Math.round((screen - navbar - 15)/2)*2; // #mainframe - margin-top plus spacing!
        console.log(height);
        $('#op-game-area').attr('height',height);
        $('#game-area').css('min-height',height);

        $('#top_game_block').css('height',(height/2));
        $('#bottom_game_block').css('height',(height/2)-1);
        $('.game-emplacement').css('height',(height/2)-55); // mobile card height

        $('#top_helper_block').addClass('modal').addClass('fade');
        $('#top_helper_block .card_viewer').addClass('modal-content');
        $('#card_viewer_block').addClass('modal-body');
        $('#bottom_helper_block').hide();
    }
    */
});