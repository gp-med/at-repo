$(document).ready(function(){
  $(".datemask").mask("?99/99/9999");
  //$('.datemask').attr('placeholder','GG/AA/YYYY');
  $(".phonemask").mask("?999 999 9999");
  //$('.phonemask').attr('placeholder','___ ___ ____');

  $('#modal').on('hidden.bs.modal', function (e) {
    console.log($(this))
    //$(this).html("<div class='modal-dialog'> <div class='modal-content'></div> </div>");
    $(this).removeData('bs.modal');
  })
  $.extend(jQuery.validator.messages, {
      required: "Zorunlu alan.",
      email: "Lütfen geçerli bir e-posta adresi gir.",
      minlength: $.validator.format("Bu alan en az {0} karakter içermeli."),
  });

  $.validator.addMethod('trmobile', function(value, element, arg) {
    value = value.replace(/^0{1}/,'')
    if (value == "" || value == "___ ___ ____") return true;
    if (value.match(/^5[02-5]{1}[\d]{1} [\d]{3} [\d]{4}$/)) { return true; } else return false
  }, $.validator.format("Lütfen geçerli bir cep telefonu numarası gir."))

  $.validator.addMethod('ascii', function(value, element, arg) {
    match = value.toLowerCase().match(/[^\u0061-\u007A]/g).join('');
    match = match.replace(/[!#\$%&'\*\+\-\/=\?\^_`{\|}~@.0-9]/g,'')
    console.log(match)
    if (match === '') return true;
    return false;
  }, $.validator.format("Lütfen geçerli bir e-posta adresi gir."))

  $.validator.addMethod("trdate", function(value, element) { 
    if (value == '') return true;
    var parts = value.split('/');
    if (parts.length < 3) return false
    if (parts[0] > 31) return false
    if (parts[1] > 12) return false
    if (parts[2] < 1894) return false
    if (parts[2] > 2002) return false
    return new Date(parts[2],parts[1]-1,parts[0]);
  }, $.validator.format("Lütfen geçerli bir doğum tarihi gir."));

  $("form#petition").validate({
   errorPlacement: function(error, element) {
     var erhtml = error[0].outerHTML;
     $(erhtml).insertAfter( element );
     $(element).next('label.error').addClass( 'control-label hata' );
   },
   rules: {
     "signer[email]": {
       "email": true,
       "ascii": true,
       "required": true},

     "signer[first_name]": {
       "required": true,
       "minlength": 2},

     "signer[last_name]": {
       "required": true,
       "minlength": 2},

     "signer[phone_number]": {
       "trmobile": true},

     "signer[date_of_birth]": {
       "trdate": true}
   }
  });

  $('form#petition .has-feedback input').on('change blur',function(e){
    checkInput($(this));
  })
  
  $('#rotate img').hide();
  $('#rotate img:first').show();
  setTimeout(shrink,3000);
});
var rotated = 1;
var rsize = 160;
var rstep = 1;
function shrink () {
  if (rsize > 0) {
    resize("#olsa"+rotated,rsize);
    rsize -= rstep;
    rstep ++;
    setTimeout(shrink,12);
  } else {
    $("#olsa"+rotated).hide();
    rotated = rotated%3+1;
    $("#olsa"+rotated).show();
    rsize = 8;
    rstep = 20;
    grow();
  }
}
function grow () {
  if (rsize < 160) {
    resize("#olsa"+rotated,rsize);
    rsize += rstep;
    rstep --
    setTimeout(grow,12);
  } else {
    rsize = 160;
    rstep = 1;
    resize("#olsa"+rotated,rsize);
    setTimeout(shrink,3000);
  }
}
function resize(imgID,x) {
  var img = $(imgID);
  img.css('margin-top',((160-x)/2).toString()+'px');
  img.css('margin-left',((160-x)/2).toString()+'px');
  img.css('width', x);
  img.css('height', x);
}
function checkInput( item ) {
  par = item.closest('.form-group');
  spa = par.find('span.form-control-feedback');
  if (item.valid()) {
    par.addClass('has-success');
    par.removeClass('has-error');
    spa.addClass('glyphicon-ok');
    spa.removeClass('glyphicon-remove');
  } else {
    par.removeClass('has-success');
    par.addClass('has-error');
    spa.removeClass('glyphicon-ok');
    spa.addClass('glyphicon-remove');
  }
}
// Jquery ve Sayfanın tümü yüklenmeden Form detay alanı kapatılmalı. Bu sayede eğer JS desteği olmayan bir browser gelirse form açık kalabilir.
if ($('#form-detail').length) {
  document.getElementById('form-detail').style.display = 'none';
	// Form'daki E-mail kutusuna odaklanınca Form detayları açılır.
	$("form #email").focus(function () {
		$("#form-detail").show("fast");
    $("#totop").hide();
	})
}

if ($('.progress-bar.katilimci').length) {
     $(document).ready(function(){
	  $(".progress-bar.katilimci").css("width", "45%");
	});
}

$('#submit').on('click',function(e){
  e.preventDefault();
  $('.has-feedback input').each(function(i,v){
      checkInput($(v));
  })
  if ($('form#petition').valid()) {
    formdata = $('form#petition').serialize();
    $.post('/',formdata,function(data){
        console.log(data)
      if (data === 'ok') {
        window.location = '/tesekkurler';
      } else if (data.match(/^r/)	) {
        window.location = '/tesekkurler?sid='+data.replace('r','');
      } else {
        $('#error').html(data);
      }
    })
  } else {
    elem = $('.has-error:first input')
    elem.focus();
    window.scrollTo(0,elem.offset()['top']-90)
  }
})
