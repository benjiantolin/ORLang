$(window).ready(function() {
  $('.loader').fadeOut("slow");

  $("#nextTimeSwitcher input").on("click", function() {
    if ($("#nextTimeSwitcher input:checked").val() === "on") {
      localStorage.setItem('popState', 'shown');
    } else {

      localStorage.setItem('popState', 'notShown');
    }
  })

  if (localStorage.getItem('popState') != 'shown') {
    console.log("show disclaimer");
    $('#disclaimer').modal('show');

  } else {
    console.log("hide disclaimer");
    $('#disclaimer').modal('hide');
  }
  $('#disclaimer-close').click(function(e) // You are clicking the close button
    {
      $('#disclaimer').fadeOut(); // Now the pop up is hiden.
      $('#disclaimer').modal('hide');
    });
});

$(".showFrontPage").on("click", function() {
  $('#disclaimer').modal('show');
  localStorage.setItem('popState', 'notShown');
})
// 1. Create a map object.
var mymap = L.map('map', {
  center: [44, -123.5],
  zoom: 7,
  maxZoom: 10,
  minZoom: 3,
  zoomcontrol: false,
  detectRetina: true
});

$(".leaflet-control-zoom").hide();

L.control.scale({
  // bottom: 50  ;
  position: 'topright'
}).addTo(mymap);

// 2. Add a base map.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mymap);

// 6. Set function for color ramp
colors = chroma.scale('PuBuGn').colors(5);

function setColor(lepHH) {
  var id = 0;
  if (lepHH > .25) {
    id = 4;
  } else if (lepHH > .17 && lepHH <= .25) {
    id = 3;
  } else if (lepHH > .1 && lepHH <= .17) {
    id = 2;
  } else if (lepHH > .06 && lepHH <= .1) {
    id = 1;
  } else {
    id = 0;
  }
  return colors[id];
}

// 7. Set style function that sets fill color.md
function style(feature) {
  return {
    fillColor: setColor(feature.properties.id78),
    fillOpacity: 0.4,
    weight: 2,
    opacity: 1,
    color: '#b4b4b4',
    dashArray: '4'
  };
}

// 3. add the county layer to the map. Also, this layer has some interactive features.

// 3.1 declare an empty/null geojson object
var county = null;

// 3.2 interactive features.
// 3.2.1 highlight a feature when the mouse hovers on it.

function highlightFeature(e) {
  // e indicates the current event
  var layer = e.target; //the target capture the object which the event associates with
  layer.setStyle({
    weight: 8,
    opacity: 0.8,
    color: '#e3e3e3',
    fillColor: '#e3e00f',
    fillOpacity: 0.5
  });
  // bring the layer to the front.
  layer.bringToFront();
  // select the update class, and update the contet with the input value.
  $(".update").html(
    '<b>' + layer.feature.properties.county + ' County' + '</b><br>' +
    (layer.feature.properties.id78 * 100).toFixed(0) + '% in LEP Household<br>');

}
// 3.2.3 reset the hightlighted feature when the mouse is out of its region.
function resetHighlight(e) {
  county.resetStyle(e.target);
  $(".update").html("Hover over a county");
}

// 3.3 add these event the layer obejct.
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight
  });
}

// 3.4 assign the geojson data path, style option and onEachFeature option. And then Add the geojson layer to the map.
county = L.geoJson.ajax("assets/deiLang.geojson", {
  style: style,
  onEachFeature: onEachFeature
}).addTo(mymap);


Promise.all([
  d3.csv('assets/shareLang.csv'),
]).then(function(datasets) {

  var geo = ["County"]
  var tot = ["Total"];
  var eng = ["English"];
  var spa = ["Spanish"];
  var fre = ["French"];
  var ger = ["German"];
  var rus = ["Russian"];
  var oie = ["Other Indo-Euro"];
  var kor = ["Korean"];
  var chi = ["Chinese"];
  var vet = ["Vietnamese"];
  var tag = ["Tagolog"];
  var oap = ["Other Asian and PI"];
  var arb = ["Arabic"];
  var oth = ["Other"];

  datasets[0].forEach(function(d) {
    geo.push(d["Geography"])
    tot.push(+d["total"])
    eng.push(+d["shareEng"])
    spa.push(+d["shareSpan"])
    fre.push(+d["shareFren"])
    ger.push(+d["shareGerm"])
    rus.push(+d["shareRuss"])
    oie.push(+d["shareIndo"])
    kor.push(+d["shareKore"])
    chi.push(+d["shareChin"])
    vet.push(+d["shareViet"])
    tag.push(+d["shareTago"])
    oap.push(+d["shareOtherAz"])
    arb.push(+d["shareArab"])
    oth.push(+d["shareOther"])
  });

  var chart = c3.generate({
    title: {
      text: 'Language Spoken at Home for the Population 5 Years and Over'
    },
    data: {
      x: 'County',
      columns: [geo, spa, fre, ger, rus, oie, kor, chi, vet, tag, oap, arb, oth],
      groups: [
        ["Spanish", "French", "German", "Russian", "Other Indo-Euro", "Korean", "Chinese", "Vietnamese", "Tagolog", "Other Asian and PI", "Arabic", "Other"]
      ],
      type: 'bar'
    },
    axis: {
      rotated: true,
      x: {
        type: 'category'
      }
    },
    bindto: "#chart"
  });
});
// 9. Create Leaflet Control Object for Legend
var legend = L.control({
  position: 'bottomright'
});

// 10. Function that runs when legend is added to map
legend.onAdd = function() {

  // Create Div Element and Populate it with HTML
  var div = L.DomUtil.create('div', 'legend');
  div.innerHTML += '<b>% in LEP Households</b><br />';
  div.innerHTML += '<i style="background: ' + colors[4] + '; opacity: 0.5"></i><p>25%-31%</p>';
  div.innerHTML += '<i style="background: ' + colors[3] + '; opacity: 0.5"></i><p>17%-24%</p>';
  div.innerHTML += '<i style="background: ' + colors[2] + '; opacity: 0.5"></i><p>10%-16%</p>';
  div.innerHTML += '<i style="background: ' + colors[1] + '; opacity: 0.5"></i><p>6%-9%</p>';
  div.innerHTML += '<i style="background: ' + colors[0] + '; opacity: 0.5"></i><p><6%</p>';
  // Return the Legend div containing the HTML content
  return div;
};
// 11. Add a legend to map
legend.addTo(mymap);

//attribution
$(".leaflet-control-attribution")
  .css("background-color", "transparent")
  .html("Supported by <a href='https://oregonexplorer.info/topics/rural-communities?ptopic=140' target='_blank'>The RCE @ Oregon State University </a> | Web Map by: <a href='#' target='_blank'>Benji Antolin");
