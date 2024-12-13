jQuery(document).ready(function($) {	
	$('.menu-toggle').click(function(){
		$(this).toggleClass('active');
		$('#SideBar').addClass('active');
		$('.bg-black').toggleClass('active');
	});

	$('.close-menus').click(function(){
		$('.menu-toggle').removeClass('active');
		$('#SideBar').removeClass('active');
		$('.bg-black').toggleClass('active');
	});

	$('.bg-black').click(function(){
		$('.menu-toggle').removeClass('active');
		$('#SideBar').removeClass('active');
		$('.bg-black').removeClass('active');    
	});
	
	$('.header-nav .navbar-nav > li a').click(function(){
		$('.menu-toggle').removeClass('active');
		$('#SideBar').removeClass('active'); 
		$('.bg-black').removeClass('active'); 		
	});
	
});	

jQuery(document).ready(function($) {
	$('#signButton').click(function(){
		$(this).toggleClass('active');
		$('.RightSidbar').addClass('active');
		$('.bg-overlay').toggleClass('active');
	});	
	
	$('.cross-menus').click(function(){
		$('.RightSidbar').removeClass('active');
		$('.bg-overlay').toggleClass('active');
	});
	
	$('.bg-overlay').click(function(){
		$('.RightSidbar').removeClass('active');
		$('.bg-overlay').removeClass('active');    
	});
	
});	

jQuery(document).ready(function($) {
	
	var owl = $('#Testimonials');
	owl.owlCarousel({
		items: 1,
		dots: true,
		loop: false,
		margin: 30,
		autoplay: false,
		nav: false,
		smartSpeed: 1000,
		slideSpeed : 5000,
		autoplayTimeout: 5000,
		autoplayHoverPause: false
	});	
	
	var owl = $('.live-slider');
	owl.owlCarousel({
		items: 1,
		dots: true,
		loop: false,
		margin: 30,
		autoplay: false,
		nav: false,
		navText: [
			'<i class="fa fa-angle-left" aria-hidden="true"></i>',
			'<i class="fa fa-angle-right" aria-hidden="true"></i>'
		],
		smartSpeed: 1000,
		slideSpeed : 5000,
		autoplayTimeout: 5000,
		autoplayHoverPause: false,
		responsive:{
			0:{ items: 1 },
			480:{ items: 1 },
			767:{ items: 2 },
			991:{ items: 3 },
			1024:{ items: 3 }
		} 
	});	
	
	var owl = $('#Offer');
	owl.owlCarousel({
		items: 1,
		dots: true,
		loop: false,
		margin: 20,
		autoplay: false,
		nav: false,
		navText: [
			'<i class="fa fa-angle-left" aria-hidden="true"></i>',
			'<i class="fa fa-angle-right" aria-hidden="true"></i>'
		],
		smartSpeed: 1000,
		slideSpeed : 5000,
		autoplayTimeout: 5000,
		autoplayHoverPause: false,
		responsive:{
			0:{ items: 1 },
			480:{ items: 1 },
			767:{ items: 2 },
			991:{ items: 3 },
			1024:{ items: 3 }
		} 
	});	
	
});	

// Preloader
/*$(window).on('load', function () {
	$('.preloader').fadeOut();
});*/

$(window).on('load', function() {
	$('body').addClass('loaded');
});

// FAQ Accordion
jQuery(document).ready(function($) {
	$('.accordion').find('.accordion-title').on('click', function(){
		// Adds Active Class
		$(this).toggleClass('active');
		// Expand or Collapse This Panel
		$(this).next().slideToggle('fast');
		// Hide The Other Panels
		$('.accordion-content').not($(this).next()).slideUp('fast');
		// Removes Active Class From Other Titles
		$('.accordion-title').not($(this)).removeClass('active');
	});
});
