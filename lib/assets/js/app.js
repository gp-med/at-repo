function resize() {
  $('#body, #list, #description').css('height',window.innerHeight-$("#top").height());
  $('#canvas, #legend').css('height',window.innerHeight-$("#top").height()-$("h3#title").closest(".row").height());
  $('#map').css('height',window.innerHeight-$("#top").height()-$("#mlegend").height());
  if ($code[0]=="I") {
    fitInfo();
  } else {
    if ($ismap) {
    } else if ($code.length > 1) {
      updateGraph();
    }
  }
}

function has_key(obj,key) {
  return Object.keys(obj).indexOf(key) >= 0;
}

$(function() {
  function imageLoaded() {
    counter--; 
    if( counter === 0 ) {
      if ($('#carousel_ul li img').length == $('#carousel_ul li img.error').length) {
        console.log('err');
      } else {
        $('#carousel_ul li img').show();
        $('#carousel_container').slideDown('400');
      }
      crsgap = 6;
      crswidth = 0
      $('#carousel_ul li').each(function(i,v){
        crswidth += $(this).width();
        crswidth += crsgap;
      })
      wdiff = $('#carousel_container').width() - crswidth;
      if (wdiff >= 0){
        $('#carousel_ul').css('left','0px')
        $('#left_scroll').hide();
        $('#right_scroll').hide();
      } else {
        $('#carousel_ul li:first').before($('#carousel_ul li:last'));
        var item_width = $('#carousel_ul li:first').width() + crsgap; 
        $('#carousel_ul').css({'left' : String(item_width * -1) + 'px'});
      }
      $('#right_scroll').click(function(){
        var item_width = $('#carousel_ul li:eq(1)').width() + crsgap;
        var left_indent = parseInt($('#carousel_ul').css('left')) - item_width;
        $('#carousel_ul').animate({'left' : left_indent},{queue:false, duration:500, complete: function(){
          $('#carousel_ul li:last').after($('#carousel_ul li:first'));
          var item_width = $('#carousel_ul li:first').width() + crsgap;
          $('#carousel_ul').css({'left' : String(item_width * -1) + 'px'});
        }});
      });
      $('#left_scroll').click(function(){
        $('#carousel_ul li:first').before($('#carousel_ul li:last'));
        var item_width = $('#carousel_ul li:eq(1)').width() + $('#carousel_ul li:first').width() + crsgap * 2;
        $('#carousel_ul').css({'left' : String(item_width * -1) + 'px'});
        var item_width = $('#carousel_ul li:eq(1)').width()  + crsgap;
        var left_indent = parseInt($('#carousel_ul').css('left')) + item_width;
        $('#carousel_ul').animate({'left' : left_indent},{queue:false, duration:500});
      });
      $('#carousel_ul li').mouseenter(function(){
        $(this).find('.title').show();
        $(this).find('.url').show();
      });
      $('#carousel_ul li').mouseleave(function(){
        $(this).find('.title').hide();
        $(this).find('.url').hide();
      });
    }
  }
  var images = $('#carousel_inner img');
  var counter = images.length;  // initialize the counter

  images.each(function() {
    if( this.complete ) {
      imageLoaded.call( this );
    } else {
      $(this).one('load', imageLoaded);
    }
  });
  images.error(function(){
    imageLoaded();
    $(this).addClass('error');
  });
});
