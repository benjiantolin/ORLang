$(window).ready(function() {
  $('.loader').fadeOut("slow");
});
// 1. Create a map object.
var mymap = L.map('map', {
    center: [44, -123.5],
    zoom: 7,
    maxZoom: 10,
    minZoom: 3,
    zoomcontrol: false,
    detectRetina: true });

$(".leaflet-control-zoom").hide();

L.control.scale({
  // bottom: 50  ;
  position: 'topright'
}).addTo(mymap);

// 2. Add a base map.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mymap);

// 3. Add airports GeoJSON Data
var airports = null;

// 4. build up a set of colors from colorbrewer's dark2 category
var colors = chroma.scale('RdYlBu').mode('lch').colors(2);

// 5. dynamically append style classes to this page. This style classes will be used for colorize the markers.
for (i = 0; i < 2; i++) {
    $('head').append($("<style> .marker-color-" + (i + 1).toString() + " { color: " + colors[i] + "; font-size: 15px; text-shadow: 0 0 3px #ffffff;} </style>"));
}

//get airport.geojson data
// airports= L.geoJson.ajax("assets/airports.geojson",{

//add popup window
// onEachFeature: function (feature, layer) {
// layer.bindPopup('Airport Name: '+feature.properties.AIRPT_NAME +'<br> City: '+feature.properties.CITY +'<br> County: '+feature.properties.COUNTY +'<br> State: '+feature.properties.STATE)
// },
//
// pointToLayer: function (feature, latlng) {
// var id = 0;
// if (feature.properties.CNTL_TWR == "N") { id = 0; }
// else { id = 1;}
// return L.marker(latlng, {icon: L.divIcon({className: 'fa fa-plane marker-color-' + (id + 1).toString() })});
// },
//
// attribution: 'Airport Data &copy; data.gov | US States &copy; Mike Bostock of D3 | Base Map &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> | Made By Benjamin Antolin'
// })
// .addTo(mymap);

// 6. Set function for color ramp
colors = chroma.scale('YlOrRd').colors(7); //colors = chroma.scale('OrRd').colors(5);

function setColor(density) {
    var id = 0;
    if (density > .94) { id = 6; }
    else if (density > .92 && density <= .94) { id = 5; }
    else if (density > .88 &&  density <= .92) { id = 4; }
    else if (density > .83 && density <= .88) { id = 3; }
    else if (density > .77 && density <= .83) { id = 2; }
    else if (density > .72 &&  density <= .77) { id = 1; }
    else  { id = 0; }
    return colors[id];
}

// 7. Set style function that sets fill color.md property equal to cell tower density
function style(feature) {
    return {
        fillColor: setColor(feature.properties.id1),
        fillOpacity: 0.4,
        weight: 2,
        opacity: 1,
        color: '#b4b4b4',
        dashArray: '4'
    };
}

// 3. add the state layer to the map. Also, this layer has some interactive features.

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
      '<b>' + layer.feature.properties.county + ' County'+'</b><br>'
            + layer.feature.properties.id1 *100 + '% Speaks only English<br>');
}

// 3.2.2 zoom to the highlighted feature when the mouse is clicking onto it.
function zoomToFeature(e) {
    mymap.fitBounds(e.target.getBounds());
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
        click: zoomToFeature,
        mouseout: resetHighlight
    });
}

// 3.4 assign the geojson data path, style option and onEachFeature option. And then Add the geojson layer to the map.
county = L.geoJson.ajax("assets/ORLang.geojson", {
    style: style,
    onEachFeature: onEachFeature
}).addTo(mymap);


// 9. Create Leaflet Control Object for Legend
var legend = L.control({position: 'bottomright'});

// 10. Function that runs when legend is added to map
legend.onAdd = function () {

    // Create Div Element and Populate it with HTML
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<b>% Speaks only English</b><br />';
    div.innerHTML += '<i style="background: ' + colors[6] + '; opacity: 0.5"></i><p>>94%</p>';
    div.innerHTML += '<i style="background: ' + colors[5] + '; opacity: 0.5"></i><p>93%-94%</p>';
    div.innerHTML += '<i style="background: ' + colors[4] + '; opacity: 0.5"></i><p>89%-92%</p>';
    div.innerHTML += '<i style="background: ' + colors[3] + '; opacity: 0.5"></i><p>83%-88%</p>';
    div.innerHTML += '<i style="background: ' + colors[2] + '; opacity: 0.5"></i><p>77%-83%</p>';
    div.innerHTML += '<i style="background: ' + colors[1] + '; opacity: 0.5"></i><p>72%-77%</p>';
    div.innerHTML += '<i style="background: ' + colors[0] + '; opacity: 0.5"></i><p><72%</p>';
    // Return the Legend div containing the HTML content
    return div;
};

// 11. Add a legend to map
legend.addTo(mymap);
// 12. Add a scale bar to map
L.control.scale({position: 'bottomleft'}).addTo(mymap);
//Add mouse position to map
L.control.mousePosition().addTo(mymap);
