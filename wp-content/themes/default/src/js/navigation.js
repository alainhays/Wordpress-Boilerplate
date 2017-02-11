// Constants
const burgerMenu = document.querySelector('.burger-menu');
const navigatonMenu = document.querySelector('nav');
const navigationContent = document.querySelector('nav .menu');

// Functions
function openMenu() {
	burgerMenu.classList.toggle('open');
    navigatonMenu.classList.toggle('open');
    setTimeout(function() {
      navigationContent.classList.toggle('open');
  }, 500);
}

// Events
burgerMenu.addEventListener('click', openMenu);
