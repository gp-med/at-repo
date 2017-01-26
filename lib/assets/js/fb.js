
function statusChangeCallback(response, signup) {
  if (response.status === 'connected') {
    if (signup) {
      FBLogin();
    } else {
      loginOnly();
    }
  } else if (response.status === 'not_authorized') {
    document.getElementById('status').innerHTML = please_allow;
  } else {
    document.getElementById('status').innerHTML = please_login;
  }
}

function loginButtonCallback(keep) {
  FB.login(function(response){
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response,true);
    });
  }, {scope: 'public_profile,email'});
}

function loginThroughFB() {
  FB.login(function(response){
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response,false);
    });
  }, {scope: 'public_profile,email'});
}

window.fbAsyncInit = function() {
  FB.init({
    appId      : appId,
    cookie     : true,
    xfbml      : true,
    version    : 'v2.2'
  });
};

(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function FBLogin() {
  //if (localStorage.getItem('token')) {return}
  $('#fadeblack').css('opacity',0);
  $('#fadeblack').css('display','block');
  $('#fadeblack').animate({opacity: 0.5},100);
  var cities = $cities;
  FB.api('/me', function(response) {
    fbData = response;
    fbData['source'] = btoa(JSON.stringify(urlParams));
    FB.api('/me/picture',{"width":"48","height":"48"}, function (response) {
      fbData['avatar'] = response.data.url;
      FB.api('/me/picture',{"width":"96","height":"96"}, function (response) {
        fbData['avatar_large'] = response.data.url;
        /*$.getJSON('https://freegeoip.net/json/',function(data,error){
          region = data.region_code;
          if (region.length > 0) { fbData['city'] = cities[String(region)]; }
          console.log(fbData);*/
          query = [];
          //delete fbData['email']
          $.each(fbData, function(key, value) {
            query.push(key + "=" + encodeURIComponent(value));
          })
          query.push("petition_id=" + $('#pet_id').val());
          /*if (fbData.email == undefined) {
            crossBreed(fbData);
            return
          }*/
          querystring = query.join('&');
          $.post(apiURL+'/facebook/',querystring,function(data){
            if (data != 'error') {
              $.each(JSON.parse(data),function(k,v){
                element = $("#"+k);
                if(element.length===0) {return 0}
                if(v===null) {return 0}
                //console.log(k+": "+element.prop('tagName')+", "+v);
                if (element.prop('tagName')==="INPUT"){
                  if (k==="date_of_birth" && v!= null) {
                    element.val(v.split('-').reverse().join('/'));
                  } else if (k==="phone_number" && v != null && v.length == 10) {
                    $('#phone_ok, #sms_ok').show();
                    element.val(v.substr(0,3)+' '+v.substr(3,3)+' '+v.substr(6,4))
                  } else {
                    element.val(v);
                  }
                } else if (element.prop('tagName')==="DIV" && v === "Y") {
                  element.find("input").prop('checked',true);
                } else if (element.prop('tagName')==="SELECT" && v.length) {
                  element.find("option[value="+v+"]").prop('selected',true);
                }
              })
              unfurl(false);
            } else {
              $('#error').html(try_again);
            }
          })
        //})
      })
    });
  });
}

