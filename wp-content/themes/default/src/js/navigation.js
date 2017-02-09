// Constants
const burgerMenu = document.querySelector('.burger-menu');

// Functions
function openMenu() {
	burgerMenu.classList.remove('burger-menu--closed');
}

// Events
burgerMenu.addEventListener('click', openMenu);
