
        $(document).ready(function(){
            var submitIcon = $('.searchbar-icon');
            var inputBox = $('.searchbar-input');
            var searchbar = $('.searchbar');
            var isOpen = false;
            submitIcon.click(function(){
            if(isOpen == false){
            searchbar.addClass('searchbar-open');
            inputBox.focus();
            isOpen = true;
            } 
            else {
            searchbar.removeClass('searchbar-open');
            inputBox.focusout();
            isOpen = false;
            }
            });
            submitIcon.mouseup(function(){
            return false;
            });
            searchbar.mouseup(function(){
            return false;
            });
            $(document).mouseup(function(){
            if(isOpen == true){
            $('.searchbar-icon').css('display','block');
            submitIcon.click();
            }
            });


var $videoSrc;  
$('.play-btn').click(function() {
    $videoSrc = $(this).data( "src" );
});

$('#youtubeModal').on('shown.bs.modal', function (e) {
    
$("#video").attr('src',$videoSrc ); 
})
  

$('#youtubeModal').on('hide.bs.modal', function (e) {
    $("#video").attr('src',$videoSrc); 
}) 

    
});
  function buttonUp(){
            var inputVal = $('.searchbar-input').val();
            inputVal = $.trim(inputVal).length;
            if( inputVal !== 0){
            $('.searchbar-icon').css('display','none');
            } else {
            $('.searchbar-input').val('');
            $('.searchbar-icon').css('display','block');
            }
            }
$(function () {
    $(document).scroll(function () {
        var $nav = $(".fixed-top");
        $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
    });
    });


    $('.courses-slide').slick({
      dots: true,
      infinite: false,
      speed: 300,
      slidesToShow: 4,
      dots:false,
      slidesToScroll: 4,
      responsive: [
        {
          breakpoint: 1160,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
            infinite: true,
            dots: true
          }
        },
        {
          breakpoint: 991,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            dots: true
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true
          }
        }
      ]
    });
    $('.blog-slide').slick({
        dots: true,
        infinite: false,
        speed: 300,
        slidesToShow: 3,
        dots:false,
        slidesToScroll: 3,
        responsive: [
          {
            breakpoint: 991,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2,
              dots: true
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              dots: true
            }
          }
        ]
      });
    $('.session-slide').slick({
        dots: true,
        infinite: false,
        speed: 300,
        slidesToShow: 3,
        dots:true,
        slidesToScroll: 3,
        responsive: [
          {
            breakpoint: 991,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2,
            }
          },
          {
            breakpoint: 640,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
            }
          }
        ]
      });
      $('.video-slide').slick({
        dots: true,
        infinite: false,
        speed: 300,
        slidesToShow: 2,
        dots:false,
        slidesToScroll: 2,
        responsive: [
          {
            breakpoint: 1160,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2,
              infinite: true
            }
          },
          {
            breakpoint: 767,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              dots: true
            }
          }
        ]
      });

      (function ($){
        $.fn.responsiveTabs = function() {
        this.addClass('responsive-tabs'),
        this.append($('<span class="dropdown-arrow"><i class="fa fa-angle-down" aria-hidden="true"></i></span>')),
      
        this.on("click", "li > a.active, span.dropdown-arrow", function (){
            this.toggleClass('open');
          }.bind(this)), this.on("click", "li > a:not(.active)", function() {
                this.removeClass("open")
            }.bind(this)); 
        }
      })(jQuery);
      (function ($) {
        $('.article-tab').responsiveTabs();
      })(jQuery);
      setTimeout(() => { //you slick-carousel init code 
      }, 1000);
      // $('[data-fancybox="gallery"]').fancybox({
      //   baseClass: 'myFancyBox',
      //   thumbs: {
      //     autoStart: true,
      //     toolbar: false,
      //     axis: 'x'
      //   }
      // })

      