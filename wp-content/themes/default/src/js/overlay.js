const overlayOpen = $('.overlay__open');
const overlayClose = ('.overlay__close');
const overlayBackground = $('.overlay');

function toggleOverlay(){
    if($('.overlay').hasClass('open')){
        $('.overlay').removeClass('open');
        $('.overlay').hide();
    } else {
        $('.overlay').show();
        $('.overlay').addClass('open');
    }
}

overlayOpen.click(toggleOverlay);
overlayClose.click(toggleOverlay);
