// Mobile Menu

const mobileMenuIcon = $('.burger-menu');

const mobileMenu = $('.nav')

function openMenu(){
    mobileMenuIcon.toggleClass('open');
	mobileMenu.toggleClass('open');
};

mobileMenuIcon.click(openMenu);
