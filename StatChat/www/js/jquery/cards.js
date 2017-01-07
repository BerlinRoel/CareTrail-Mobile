// Set a flag to determine the current flip state of our popup
var popupFlipped = false;

// Card flipping code
$(window).load(function () {
	// Set a global for the card we just clicked so we can track it
	var $lastelement = "";

	// Set up an object for last clicked element so we know where to return to on collapse
	var lastelement = {
		'top': 0,
		'left': 0,
		'width': 0,
		'height': 0
	};

	// Need to reset variables when we leave the current page/tab
	$(document).bind("DOMNodeRemoved", function (e) {
		if (e.target.nodeName == "ION-VIEW" || e.target.nodeName == "CT-CARD-POPUP") {
			// ION-VIEW: When the view is removed (eg: transitioned to a new page)
			// CT-CARD-POPUP: When a tab is clicked

			// Reset positions of popup and original card
			$($lastelement).css('opacity', 1);
			$('.ctcard-popup').hide();

			// Reset variables to default values			
			$lastelement = "";
			lastelement = {
				'top': 0,
				'left': 0,
				'width': 0,
				'height': 0
			};
			popupFlipped = false;

			$('.ctcard-popup').find('.ctcard-popup-front').removeClass("ctcard-front-isunread");
		}
	});

	function togglePopupState() {
		// Toggle the popup state
		popupFlipped = !popupFlipped;

		// Detect if our popup has returned to the original position and then hide it
		if (!popupFlipped) {
			$($lastelement).css('opacity', 1);
			$('.ctcard-popup').hide();
			$('.ctcard-popup').find('.ctcard-popup-front').removeClass("ctcard-front-isunread");
		}
		else {
			$('.ctcard-popup-background').addClass('ctcard-popup-active-background');
		}
	}

	// Bind a handler to the popup so we can detect when the transition is done
	$("body").on("transitionend webkitTransitionEnd oTransitionEnd", '.ctcard-popup', function (e) {
		if (e.target === e.currentTarget) {
			if (e.originalEvent.propertyName == 'top') {
				togglePopupState();
			}
		}
	});

	// Click on a card
	$("body").on('click', '.ctcard-front', function (e) {
		if ($(this).parent(".ctcard").hasClass("ctcard-static")) {
			return;
		}
		if (!popupFlipped) {
			// Cache clicked card
			$lastelement = $(this);

			// Store position of this element for the return trip
			var offset = $lastelement.offset();
			lastelement.top = offset.top - $(document).scrollTop();
			lastelement.left = offset.left;
			lastelement.width = $lastelement.width();
			lastelement.height = $lastelement.height();

			// Copy static contents of the clicked card into the popup's front card
			var htmlFront = $lastelement.html();
			$('.ctcard-popup').find('.ctcard-popup-front').html(htmlFront);
			if ($(this).hasClass("ctcard-front-isunread")) {
				$('.ctcard-popup').find('.ctcard-popup-front').addClass("ctcard-front-isunread");
			}

			// Show the popup on top of the clicked card and hide the clicked card
			$('.ctcard-popup').css({
				'display': 'block',
				'top': lastelement.top,
				'left': lastelement.left,
				'width': lastelement.width,
				'height': lastelement.height,
				'-ms-transform': 'translate3d(0, 0, 150px)',
				'-webkit-transform': 'translate3d(0, 0, 150px)',
				'-moz-transform': 'translate3d(0, 0, 150px)',
				'-o-transform': 'translate3d(0, 0, 150px)',
				'transform': 'translate3d(0, 0, 150px)'
			});
			$lastelement.css('opacity', 0);

			$(".ctcard-popup-background").addClass("ctcard-popup-disabled-background");

			// Flip the card while centering it in the screen
			// [hack: we have to wait for the popup to finish drawing before calling 
			// the transform so we put it in a 100 millisecond settimeout callback]
			setTimeout(function () {
				var popup = $('.ctcard-popup');
				popup.css({
					'top': '10%',
					'left': '5%',
					'height': '500px',
					'width': '90%'
				});
				popup.find('.ctcard-popup-front').css({
					'-webkit-transform': "rotateY(-180deg)",
					'transform': "rotateY(-180deg)"
				});
				popup.find('.ctcard-popup-back').css({
					'-webkit-transform': "rotateY(-360deg)",
					'transform': "rotateY(-360deg)"
				});
			}, 100);
		}
		else {
			$('body').click();
		}
	});

	// If user clicks outside of the flipped card, or the X at the top right, close the card
	$("body").on('click', '.ctcard-popup-background, .ctcard-back-close', function (e) {
		if (popupFlipped) {
			$(".ctcard-popup-background").removeClass("ctcard-popup-active-background");
			$(".ctcard-popup-background").removeClass("ctcard-popup-disabled-background");

			var popup = $('.ctcard-popup');

			// Reverse the animation
			popup.css({
				'top': lastelement.top + 'px',
				'left': lastelement.left + 'px',
				'height': lastelement.height + 'px',
				'width': lastelement.width + 'px',
				'-ms-transform': 'translate3d(0, 0, 150px)',
				'-webkit-transform': 'translate3d(0, 0, 150px)',
				'-moz-transform': 'translate3d(0, 0, 150px)',
				'-o-transform': 'translate3d(0, 0, 150px)',
				'transform': 'translate3d(0, 0, 150px)'
			});
			popup.find('.ctcard-popup-front').css({
				'-webkit-transform': 'rotateY(0deg)',
				'transform': 'rotateY(0deg)'
			});
			popup.find('.ctcard-popup-back').css({
				'-webkit-transform': 'rotateY(-180deg)',
				'transform': 'rotateY(-180deg)'
			});
		}
	});
});