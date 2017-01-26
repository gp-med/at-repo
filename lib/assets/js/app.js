var $code, $subcode, $hash, $yaxis, $xaxis, $segs, $segdesc, $data, $legend, $colors, $svg, $svgh, $svgw, $min, $noleg, $ismap, $lastCode;
var $infostate = "tt";
var $alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var $gtype = "stack";
var $fresh = true;
var $social = "<div class='social' style='right:120px'><i class='fa fa-facebook'>&nbsp;</i> PAYLAŞ</div><div class='social'><i class='fa fa-twitter'>&nbsp;</i> TWEETLE</div>"

$(".menu > .main").on("click tap",function(e){
  if ($(this).hasClass('active')) { return }
  //if ($(this).find('a').attr('id')=="I") { return }
  code = $(this).find("a").data("code")
  hash = $(this).find("a").attr("href")
  $lastCode = $code;
  window.location.hash = hash;
  $(".side-item").hide();
  $("#item-"+code).show();
  $(".menu > .main").removeClass("active");
  $(this).addClass("active");
})

$(".side-item li.side").on("click tap",function(e){
    if ($(this).hasClass('active') || $(this).attr("id")[0] == "X") { return }
  $("#description .info").html("");
  hash = $(this).find("a").attr("href")
  window.location.hash = hash;
  $(".side-item").removeClass("active");
  $(this).addClass("active");
})

$("#legend").on("click tap", ".controls .segment .control" ,function(e){
  if ($(this).hasClass('active')) { return }
  $("#description .info").html("");
  $(this).closest(".segment").find(".control").removeClass("active");
  $(this).addClass("active");
  s = 0;
  segdesc = [];
  seg = [1,1];
  if($("#legend .segment").length > 1) {seg = [$("#legend .segment:first .control").length,1];}
  if($code=="CA") {seg = [1,$("#legend .segment:first .control").length];}
  console.log(seg)
  $.each($('#legend .segment .control.active').get().reverse(), function(i,e){
    a = $(e).attr("id").split("-");
    console.log(a)
    s += seg[parseInt(a[1])] * parseInt(a[2]);
    segdesc.push($(e).text())
  });
  console.log(s)
  $segdesc = segdesc.join(", ")
  $subcode = $code+$alphabet[s]
  $("#description .content").html($content["D"][$subcode]);
  prepareData($content[$code].data,$(this).text());
  data = []
  $.each($data,function(ind,d) {
    var y0 = 0;
    classes = [];
    $.each(d,function(i,e) { 
      if (i>0) {
        classes.push({i:i-1, ind:ind, name: name, y0: y0, y1: $gtype=="group" ? e : y0 += e, v:e});
      }
    });
    total = classes[classes.length - 1].y1;
    data.push({classes:classes,total:total});
  });

  function make_y_axis() {        
    return d3.svg.axis()
    .scale(y)
    .orient("left")
  }

  var y = d3.scale.linear().rangeRound([$svgh, 0]);
  ymax = d3.max(data, function(d) { return d.total; });
  y.domain([0, ymax]);
  $("#canvas svg .grid text").remove();
  grid = $svg.append("g")         
    .attr("class", "grid")
    .call(make_y_axis()
    .tickSize(0, 0, 0)
    .tickValues(d3.range(0,ymax+1,ymax/10))
    .tickFormat(function(d){
      if ($code[0] == "C" || $code.match(/T(A|K)/)) {
        return " %"+parseInt(d);
      } else {
        return " %"+d.toFixed(1);
      }  
    })
  );

  var bars = $svg.selectAll(".bar").data(data);
  if ($gtype == "group") {
    bars.selectAll("rect")
      .data(function(d) { return d.classes; })
      .transition().duration(400)
      .attr("width", function(d) {
        return $svgw / cols / 4;
      })
      .attr("x", function(d) { 
        return $svgw / cols * d.ind + ($svgw / cols * 0.3) + ($svgw / cols * 0.25 * (1-d.i)); 
      })
      .attr("height", function(d,i) { return y(d.y0) - y(d.y1); })
      .attr("y", function(d) { return y(d.y1); });
  } else {
    bars.selectAll("rect")
      .data(function(d) { return d.classes; })
      .transition().duration(400)
      .attr("height", function(d,i) { return y(d.y0) - y(d.y1); })
      .attr("y", function(d) { return y(d.y1); });
  }
})

$( window ).resize(function() { resize(); });

$(window).on( 'load ', function(e) {
  $hash = window.location.hash.replace("#","");
  if ($hash.length == 0 && window.location.pathname == "/" ) {
    $(".inner").css("opacity",1);
    $("#cover").show();
  } else {
    $(".inner").animate({
      opacity: 1  
    })
  }
});

$(window).on( 'load hashchange', function(e) {
  //console.log(window.location.pathname);
  if(typeof $code == "undefined" && window.location.pathname == "/" ) {
    $code = "T";
    $("#title").text($("#"+$code).data("title"));
    $(".side-item").hide();
    $("#item-"+$code[0]).show();
    $(".menu > .main").removeClass("active");
    $(".menu > .main > #"+$code[0]).parent().addClass("active");
    $(".side-item .side[data-code="+$code+"]").addClass("active");
    $legend == null;
    $('#description .content').html("");
    $('#map-graph').hide();
    $('#legend').html("");
    $('#canvas').html("<div class='yello selectable'>"+$content["D"][$code]+"</div>");
    $('#titlerow').addClass("yello")
    $('#middle').addClass("yello")
    $("#description").addClass("yello");
    $('#graph').addClass("yello").show().focus();
  }
  $hash = window.location.hash.replace("#","");
  $("li.side").removeClass("active");
  $("a[href=#"+$hash+"]").closest("li.side").addClass("active");
  $lastCode = $code;
  $code = $content["S"][$hash]
  if (!$code) $code = "T"
  $subcode = $code+"A";
  if ($code[0]=="I") {
    $("#infograph").fadeIn(400);
    $fresh = true;
    fitInfo();
  } else {
    $('#infograph').fadeOut(400);
    $("#title").text($("#"+$code).data("title"));
    $(".side-item").hide();
    $("#item-"+$code[0]).show();
    $(".menu > .main").removeClass("active");
    $(".menu > .main > #"+$code[0]).parent().addClass("active");
    $(".side-item .side[data-code="+$code+"]").addClass("active");
    if ($(".side-item .side[data-code="+$code+"]").hasClass("sub")) {
      $("#"+$code).parent().show();
    }
    if ($code.length > 1) {
      choose(false);
      $('#titlerow').removeClass("yello")
      $('#middle').removeClass("yello")
      $('#graph').removeClass("yello")
      $("#description").removeClass("yello")
    } else {
      $legend == null;
      $('#description .content').html("");
      $('#map-graph').hide();
      $('#legend').html("");
      $('#canvas').html("<div class='yello selectable'>"+$content["D"][$code]+"</div>");
      $('#titlerow').addClass("yello")
      $('#middle').addClass("yello")
      $("#description").addClass("yello");
      $('#graph').addClass("yello").show().focus();
    }
  }
  resize();
});

function choose(ismap) {
  legend = jQuery.extend(true, {}, $content[$code]);
  data = legend.data;
  delete legend.data;
  $legend = legend;
  if (ismap) {
    if ($code=="TE" && $ismap) { $legend["T23"] = $content["T"]["T23"] }
    if ($code=="TI" && $ismap) { delete $legend["T02"]  }
  } else {
    if ($code=="TE") { $legend["T23"] = $content["T"]["T23"] }
    if ($code=="TI") { delete $legend["T02"]  }
  }
  color = [];
  $.each($legend,function(k,v){
    color.push("#"+v['color'])
  })
  $color = color.reverse();
  $segs = [[]]
  if (typeof data != "undefined") {
    if ($code == "CA") {
      $.each(Object.keys(data).sort(),function(i,e){
        $segs[0].push(e)
      })
    } else {
      $.each(data,function(e,v){
        $segs[0].push(e)
      })
    }
    if (!has_key($content[$code].data[Object.keys($content[$code].data)[0]],"data")) {
      if ($segs[0][0].match(/^\d+$/)) {
        $segs[0].reverse();
      }
      $segs.push([]);
      $.each(data[Object.keys(data)[0]],function(k,v){ $segs[1].push(k) })
    }
    $segs.reverse();
    $min = 0;
    dada = jQuery.extend(true, {}, $content[$code]).data
    if (ismap) {
      if ($ismap) { 
        $data = dada[Object.keys(dada)[0]].data;
        if( $code == "TE" && $data["G1"].length == 1){
          $.each($data,function(k,v){
            $data[k].push(dada[Object.keys(dada)[1]].data[k])
          })
        } else if( $code == "TI" ){
          $.each($data,function(k,v){
            $data[k] = [v[1]];
          })
        }
      } else {
        if (has_key($legend,"T01")) { 
          delete $legend["T01"];
          $min = 1; 
        }
        updateLegend();
        prepareData(data);
      }
    } else {
      if ($code.match(/^T[CEFGIM]$/)) { 
        $ismap = true;
        $data = dada[Object.keys(dada)[0]].data;
        if( $code == "TE" ){
          $.each($data,function(k,v){
            $data[k].push(dada[Object.keys(dada)[1]].data[k])
          })
        } else if( $code == "TI" ){
          $.each($data,function(k,v){
            $data[k] = [v[1]];
          })
        }
      } else {
        $ismap = false;
        if (has_key($legend,"T01")) { 
          delete $legend["T01"];
          $min = 1; 
        }
        $("#map-graph").hide();
        updateLegend();
        prepareData(data);
      }
    }
  } else {
    data = false;
  }
  segdesc = [];
  $.each($('#legend .segment .control.active').get().reverse(),function(i,e){
    segdesc.push($(e).text())
  });
  $segdesc = segdesc.join(", ")
  updateGraph();
}

$("#map-graph").on("click tap", ".segment .control" ,function(e){
  if ($(this).hasClass('active')) { return }
  $(this).closest(".controls").find(".control").removeClass("active");
  $(this).addClass("active");
  if ($(this).attr("id") == "control-map") {
    $ismap = true;
    choose(true);
  } else {
    $ismap = false;
    choose(true);
  }
  $subcode = $code+"A"
  $("#description .content").html($content["D"][$subcode]);
})

$("body").on("keyup", function(e){
  //console.log(e.keyCode);
  if (e.keyCode == 27) {
    if ($("#infograph").css("display") == "block") {
      window.location = '#'+$content['Q'][$lastCode];
    } else if ($("#cover").css("display") == "block") {
      $('#cover').fadeOut();
    }
  }
})

function growGraph() {
  $('#canvas').html('');
  if (!$data) return
  data = $.extend(true, [], $data);
  cols = Object.keys(data).length

  var sum = 0;
  for(var k in data) {
    sum += data[k];
  }

  var titles = [];
  if ($code[0] == "C") {
    c = $content[$code[0]];
    $.each(Object.keys(c),function(i,e){
      titles.push(c[e].title);
    })
  } else {
    c = $content[$code].data[Object.keys($content[$code].data)[0]].data; 
    $.each(Object.keys(c),function(i,e){
      titles.push($content[e.match(/\D+/)[0]][e].title);
    })
  }

  $bottom = 50;
  if (titles.length > 10 && titles.length < 50){
    t = []
    $.each(titles,function(i,e){
      t.push(e.length);
    });
    t = Math.max.apply(null,t)
    if (t > 4) {
      $bottom += t * 5;
    } else {
      $bottom += 20;
    }
  }

  var margin = {top: 10, right: 0, bottom: $bottom, left: $code == "TB" ? 90 : 70},
    width = $("#canvas").width() - margin.left - margin.right,
    height = $("#canvas").height() - margin.top - margin.bottom;

  $svgh = height;
  $svgw = width;
  tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d; });

  if ($gtype.match(/(stack|group)/)) {

    var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
      .rangeRound([height, 0]);

    var color = d3.scale.ordinal()
    .range($color);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    function make_y_axis() {        
      return d3.svg.axis()
      .scale(y)
      .orient("left")
    }


    data.forEach(function(d,ind) {
      var y0 = 0;
      name = d.shift();
      d.classes = d.map(function(e,i) { return {i:i, ind:ind, name: name, y0: y0, y1: $gtype=="group" ? e : y0 += e,v:e}; });
      d.total = d.classes[d.classes.length - 1].y1;
    });

    ymax = d3.max(data, function(d) { return d.total; });
    y.domain([0, ymax]);
    $svg = d3.select("#canvas").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom) 
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    color.domain(d3.keys(data[0]).filter(function(key) { return (typeof key == "string"); }));

    grid = $svg.append("g")         
      .attr("class", "grid")
      .call(make_y_axis()
        .tickSize(-width, 0, 0)
        .tickValues(d3.range(0,ymax+0.1,ymax/10))
        .tickFormat(function(d){
          if ($code[0] == "C" || $code.match(/T(A|K)/)) {
            return "%"+parseInt(d);
          } else {
            return "%"+d.toFixed(1);
          }  
        })
      );

    var bar = $svg.selectAll(".bar")
      .data(data)
      .enter().append("g")
      .attr("class", "bar")

    $svg.call(tip);

    bar.selectAll("rect")
      .data(function(d) { return d.classes; })
      .enter().append("rect")
      .attr("data-value", function(d) { return d.y1 - d.y0; })
      .attr("width", function(d) {
        if (titles.length > 50){
          return width / cols;
        } else if ($gtype == "group") {
          return width / cols / 4;
        } else {
          return width / cols / 2;
        }
      })
      .attr("x", function(d) { 
        if ($gtype == "group") {
          return width / cols * d.ind + (width / cols * 0.25) + (width / cols * 0.25 * (1-d.i)); 
        } else {
          return width / cols * d.ind + (width / cols * 0.2); 
        }
      })
      .attr("height", 0)
      .attr("y", height)
      .on("mouseover",function(d){
        if ($noleg) {
          tip.show("<span class='center'>"+$segdesc+"</span><br/><span class='large'>"+titles[d.ind]+"</span></br/><div class='result'><span class='large brand'>%"+d.v.toFixed(1)+"</span></div>");
        } else {
          lk = Object.keys($legend);
          tip.show("<span class='center'>"+$segdesc+"</span><br/><span class='large'>"+titles[d.ind]+"</span><br/>"+$legend[lk[lk.length-d.i-1]].title+"</br/><div class='result'><span class='large brand'>%"+d.v.toFixed(1)+"</span></div>");
        }
        d3.select(this).transition(400).style("opacity",0.75)
      })
      .on("mouseout",function(d){
        tip.hide();
        d3.select(this).transition(400).style("opacity",1)
      })
      .style("fill", function(d) { return color(d.i); })
      .transition()
      .duration(400)
      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
      .attr("y", function(d) { return y(d.y1); })

    var xax = $svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    if (titles.length < 50) {
      xax.selectAll(".legend")
        .data(data)
        .enter().append("text")
        .attr('class','legend')
        .attr("font-size", "16px")
        .attr("transform", function(d,i) {
          if (titles.length > 10) {
            return "translate("+width / cols * (i+0.6)+",15) rotate(-45)"
          } else {
            return "translate("+width / cols * (i+0.5)+",20)"
          }
        })
        .attr("text-anchor", function(d,i) {
          if (titles.length > 10) {
            return "end"
          } else {
            return "middle"
          }
        })
        .text(function(d,i){ 
          if ($code.match(/T[DE]/)) { 
            return "";//$cities[titles[i]];
          } else { 
            return titles[i]; 
          }
        });
    }

  } else if ($gtype == "stoup") {

    var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
      .rangeRound([height, 0]);

    var color = d3.scale.ordinal()
    .range($color);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    function make_y_axis() {        
      return d3.svg.axis()
      .scale(y)
      .orient("left")
    }


    data.forEach(function(d,ind) {
      var y0 = 0;
      name = d.shift();
      d.classes = d.map(function(e,i) { if (i==2){y0=0}; return {i:i, ind:ind, name: name, y0: y0, y1: y0 += e,v:e}; });
      d.total = d.classes[d.classes.length - 1].y1;
    });

    ymax = d3.max(data, function(d) { return d.total; });
    y.domain([0, ymax]);
    $svg = d3.select("#canvas").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom) 
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    color.domain(d3.keys(data[0]).filter(function(key) { return (typeof key == "string"); }));

    grid = $svg.append("g")         
      .attr("class", "grid")
      .call(make_y_axis()
        .tickSize(-width, 0, 0)
        .tickValues(d3.range(0,ymax+1,ymax/10))
        .tickFormat(function(d){
            return d3.format(".3s")(d);
        })
      );

    var bar = $svg.selectAll(".bar")
      .data(data)
      .enter().append("g")
      .attr("class", "bar")

    $svg.call(tip);

    bar.selectAll("rect")
      .data(function(d) { return d.classes; })
      .enter().append("rect")
      .attr("data-value", function(d) { return d.y1 - d.y0; })
      .attr("width", width / cols / 4)
      .attr("x", function(d) { 
          return width / cols * d.ind + (width / cols * 0.25) + (width / cols * 0.25) * (1-Math.floor(d.i/2)); 
      })
      .attr("height", 0)
      .attr("y", height)
      .on("mouseover",function(d){
        lk = Object.keys($legend);
        tip.show("<span class='large'>"+titles[d.ind]+"</span><br/>"+$legend[lk[lk.length-d.i-1]].title+"</br/><div class='result'><span class='large brand'>"+addCommas(d.v)+"</span></div>");
        d3.select(this).transition(400).style("opacity",0.75)
      })
      .on("mouseout",function(d){
        tip.hide();
        d3.select(this).transition(400).style("opacity",1)
      })
      .style("fill", function(d) { return color(d.i); })
      .transition()
      .duration(400)
      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
      .attr("y", function(d) { return y(d.y1); })

    var xax = $svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    xax.selectAll(".legend")
      .data(data)
      .enter().append("text")
      .attr('class','legend')
      .attr("font-size", "16px")
      .attr("transform", function(d,i) {
        return "translate("+width / cols * (i+0.5)+",20)"
      })
      .attr("text-anchor", function(d,i) {
        return "middle"
      })
      .text(function(d,i){ 
        return titles[i]; 
      });
  }
}

function prepareMap() {
  $("#description .content").html($content["D"][$subcode]);
  $gtype = "map";
  $("#mlegend").html("");
  $("#mcontrols").html("");
  if (typeof $legend == "object") {
    leg = $("<div class='legend'></div>");
    con = $("<div class='controls'></div>");
    row = $("<div class='segment'></div>");
    $.each($legend,function(i,e){
      if(has_key(e,"color")) {
        row.append("<div id='control-"+i+"' class='control'>"+e.title+"</div>");
      }
    })
    con.append(row);
    con.find(".control").first().addClass("active");
    if ($code != "TI") $("#mcontrols").append(con);
    $("#mlegend").height(160);
  }

  resize();
  id = Object.keys($legend)[0]
  $("#map-graph .control").removeClass("active");
  $("#control-map").addClass("active");
  $("#infograph").hide();
  $("#graph").hide();
  $("#maprow").show();
  $("#title").show();
  $("#map-graph").show();
  if ($code=="TE") { map = "#iller" } else { map = "#bolge"}
  $("#map svg").hide();
  $("#ulke").show();
  $(map).show();
  data = layOnMap(id,map)
  ratio = Math.max($("#map svg g")[0].getBBox().height / $("#map").height(), $("#map svg g")[0].getBBox().width / $("#map").width()) * 1.1
  diff = [Math.abs($("#map").width() - $("#map svg g")[0].getBBox().width/ratio), Math.abs($("#map").height() - $("#map svg g")[0].getBBox().height/ratio)]
  d3.selectAll("#map svg g")
    .attr("transform","scale("+1/ratio+","+1/ratio+") translate("+diff[0]/2+","+diff[1]/2+")")
    .style("opacity",0)
    .transition()
    .duration(400)
    .style("opacity",1);
}

function infoLoad() {
  $.get("/img/info.svg",function(data){
    svg = $(data).find("svg");
    $('#info').html(svg)
  })
}
infoLoad()

function fitInfo() {
  $("#description .content").html($content["D"][$subcode]);
  //orig = [ 0.9, 1.2, 1.8, 0.5, 1.3, 31.8, 18, 44.5]
  //edit = [ 16.5, 20.6, 32.1, 8.7, 22.2, 33.7, 19.1, 47.2]
  iheight = window.innerHeight;//-$("#top").height();
  ratio = Math.max($("#info svg > g")[0].getBBox().height / iheight, $("#info svg > g")[0].getBBox().width / window.innerWidth) * 1;
  srat = $("#info svg > g")[0].getBBox().width / $("#info svg > g")[0].getBBox().height;
  wrat = window.innerWidth / window.innerHeight;
  box = $("#info svg")[0].getBBox();
  x = srat >= wrat ? 0 : window.innerWidth/2;
  y = 0;
  d3.selectAll("#info svg g")
    .style("opacity",1);
  d3.select("#info svg")
    .style("transform","scale("+1/ratio+","+1/ratio+")")
    .style("transform-origin", "0px 0px")
    .attr("x",x+"px")
    .attr("y",y)
}

$("#mcontrols").on("click tap", ".segment .control" ,function(e){
  if ($(this).hasClass('active')) { return }
  $(this).closest(".controls").find(".control").removeClass("active");
  $(this).addClass("active");
  id = $(this).attr("id").replace(/^control-/,"");
  if ($code=="TE") { 
    map = "#iller";
    if (id=="T22") {
      $("#description .content").html($content["D"]["TEA"]);
    } else {
      $("#description .content").html($content["D"]["TEB"]);
    }
  } else { 
    map = "#bolge";
  }
  layOnMap(id,map)
})

function layOnMap(id,map) {
  index = Object.keys($legend).indexOf(id)
  console.log(id)
  tot = []
  count = 0;
  $.each($data,function(k,v){
    tot.push(v[index]);
    count += v[index];
  })
  max = Math.max.apply(null,tot)
  min = Math.min.apply(null,tot)
  maxx = (max-min)*0.9;
  console.log($data)
  $.each($data,function(k,v){
    $("#map svg path#"+k)
      .css("fill","#"+$legend[id].color)
      .css("opacity",0.1+(v[index]-min)/maxx);
  })
  $("#mlegend .legend").remove();
  leg = $("<div class='legend clearfix' style='position:relative'></div>");
  for (var i=0;i<6;i++) {
    e = min + (max-min)*(i/6)
    f = (min + (max-min)*((i+1)/6)-(i==5 ? 0 : 0.1 )).toFixed(1);
    leg.append("<div class='pull-left' style='position:absolute;top:"+(i%3*24)+"px;right:"+((1-Math.floor(i/3))*128+108)+"px'><div class='leg'><div style='background:#FFF,position:absolute;' class='sqbg'></div><div style='background:#"+$legend[id].color+";opacity:"+(0.1+(e-min)/maxx)+";position:absolute' class='sq'></div><span style='position:absolute;left:72px;top:-8px;width:128px;'>%"+e.toFixed(1)+" - "+f+"</span></div></div>")
  }
  $("#mlegend").prepend(leg)
  tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d; });
  d3.select("#map svg"+map+" g path").call(tip)
  d3.selectAll("#map svg.display g path")
    .on("mouseover", function(d,i) {
      //console.log($(this).attr("id"))
      tip.show("<span class='large'>"+$content["G"][$(this).attr("id")].title+"</span></br/><span class='center'>"+$legend[id].title+"</span><br/><div class='result'><span class='large brand'>%"+parseFloat($data[$(this).attr("id")][index]).toFixed(1)+"</span></div>");
      d3.select(this).transition(200).style("opacity",(0.1+($data[$(this).attr("id")][index]-min)/maxx)/2)
    })
    .on("mouseout",function(d,i){
      tip.hide();
      d3.select(this).transition(400).style("opacity",0.1+($data[$(this).attr("id")][index]-min)/maxx)
    })
}

function prepareData(data) {
  $("#graph").show();
  $("#infograph").hide();
  $("#maprow").hide();
  $("#title").show();
  if ($segs.length == 2) {
    data = data[$("#legend .control.active").last().text()][$("#legend .control.active").first().text()].data;
  } else if ($code != "TB"){
    data = data[$("#legend .control.active").first().text()].data
  } else {
    data = data["Erkek"].data
  }
  arr = [["ID"]]
  $.each($legend,function(k,v){
      arr[0].push(v.title);
  })
  arr = [];
  $.each(data,function(k,v){
    x = arr.length;
    arr.push([]);
    arr[x].push(k);
    for(var i=v.length-1;i>=$min;i--) { 
      arr[x].push( parseFloat(v[i]) ); 
    }
  })
  $data = arr;
  //console.log($data)
  if ($code == "TB"){
    $gtype = "stoup";
  } else if ($code == "TN"){
    $gtype = "group";
  } else {
    $gtype = "stack";
  }
}


function updateLegend() {
  $("#description .content").html($content["D"][$subcode]);
  $("#legend").html("");
  if (typeof $legend == "object") {
    leg = $("<div class='legend'></div>");
    con = $("<div class='controls'></div>");
    cnt = [];
    $.each($legend,function(i,e){
      if(has_key(e,"color")) {
        leg.append("<div class='clearfix'><div class='leg'><div style='background:#"+e.color+"' class='sq'></div><span>"+e.title+"</span></div></div><br/>")
      }
    })
    $.each($segs,function(i,segs){
      row = $("<div class='segment'></div>");
      $.each(segs,function(ii,but){
        row.append("<div id='control-"+i+"-"+ii+"' class='control"+(ii == 0 ? " active" : "")+"'>"+but+"</div>");
      })
      cnt.push(row[0].outerHTML);
    })
    con.html(cnt.join("<hr/>"))
    if ($code != "TB") {
      $("#legend").append(con);
    }
    if(leg.find(".leg").length > 1) {
      $("#legend").append(leg);
      $noleg = false;
    } else {
      $noleg = true;
    }
  }
}

function updateGraph() {
  if ($fresh) {
    $fresh = false;
    if ($ismap) {
      prepareMap();
    } else {
      growGraph();
    }
  } else {
    d3.selectAll(".bar rect")
      .transition()
      .duration(200)
      .attr("height", 0)
      .attr("y", function(d) { return $('#canvas').height() - $bottom - 10; });
    d3.selectAll("#graph g, #maprow g")
      .transition()
      .duration(200)
      .style("opacity", 0);
    if ($ismap) {
      setTimeout(prepareMap, 200);
    } else {
      setTimeout(growGraph, 200);
    }
  }
}

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

function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + '.' + '$2');
    }
    return x1 + x2;
}

$('.dropdown').on('shown.bs.dropdown', function (e) {
  $(".dropdown").not(".open").find(".dropdown-menu").slideUp()
  window.location.hash = $(this).find(".sub:first a").attr("href");
});

$('.dropdown').on('show.bs.dropdown', function (e) {
  $(this).find('.dropdown-menu').first().stop(true, true).slideDown();
});

$('.dropdown').on('hide.bs.dropdown', function (e) {
  $(this).find('.dropdown-menu').first().stop(true, true).slideUp();
});
$("#infograph").on('click',function(e){
  if(e.target.nodeName.match(/(svg|img|div)/i)){
    window.location = '#'+$content['Q'][$lastCode];
  }
})

function fbShare() {
  window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(window.location.href.replace("#","")),'_blank');
}

function twShare() {
  window.open("https://twitter.com/intent/tweet?url="+encodeURIComponent(window.location.href.replace("#",""))+"&text="+encodeURIComponent($tweettext),'_blank');
}

