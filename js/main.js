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
  center: [44, -122.5],
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
  if (lepHH > 6.03) {
    id = 4;
  } else if (lepHH > 3.25 && lepHH <= 6.03) {
    id = 3;
  } else if (lepHH > 1.44 && lepHH <= 3.25) {
    id = 2;
  } else if (lepHH > 0.38 && lepHH <= 1.44) {
    id = 1;
  } else {
    id = 0;
  }
  return colors[id];
}

// 7. Set style function that sets fill color.md
function style(feature) {
  return {
    fillColor: setColor(feature.properties.shareLep),
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
    '<b>' + layer.feature.properties.Geography + ' County' + '</b><br>' +
    (layer.feature.properties.shareLep).toFixed(2) + '% of the Population 5 Year and over speaking English less than well<br>');

}
// 3.2.3 reset the hightlighted feature when the mouse is out of its region.
function resetHighlight(e) {
  county.resetStyle(e.target);
  $(".update").html("<b>Oregon</b><br>2.9% of the Population 5 Year and over speaking English less than well");
}

// 3.3 add these event the layer obejct.
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight
  });
}

// 3.4 assign the geojson data path, style option and onEachFeature option. And then Add the geojson layer to the map.

$.when($.getJSON("assets/Lang.geojson")).done(function(lang) {
county = L.geoJson(lang, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(mymap);

//add in dashboard
function dashboard(id, fData){
    var barColor = 'steelblue';
    function segColor(c){ return {well:"#e08214",lessWell:"#41ab5d"}[c]; }

    // compute total for each state.
    fData.forEach(function(d){d.total=d.freq.well+d.freq.lessWell;});

    // function to handle histogram.
    function histoGram(fD){
        var hG={},    hGDim = {t: 60, r: 0, b: 30, l: 0};
        hGDim.w = 750 - hGDim.l - hGDim.r,
        hGDim.h = 250 - hGDim.t - hGDim.b;

        //create svg for histogram.
        var hGsvg = d3.select(id).append("svg")
            .attr("width", hGDim.w + hGDim.l + hGDim.r)
            .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
            .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");

        // create function for x-axis mapping.
        var x = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
                .domain(fD.map(function(d) { return d[0]; }));

        // Add x-axis to the histogram svg.
        hGsvg.append("g").attr("class", "x axis")
            .attr("transform", "translate(0," + hGDim.h + ")")
            .call(d3.svg.axis().scale(x).orient("bottom"));

        // Create function for y-axis map.
        var y = d3.scale.linear().range([hGDim.h, 0])
                .domain([0, d3.max(fD, function(d) { return d[1]; })]);

        // Create bars for histogram to contain rectangles and freq labels.
        var bars = hGsvg.selectAll(".bar").data(fD).enter()
                .append("g").attr("class", "bar");

        //create the rectangles.
        bars.append("rect")
            .attr("x", function(d) { return x(d[0]); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("width", x.rangeBand())
            .attr("height", function(d) { return hGDim.h - y(d[1]); })
            .attr('fill',barColor)
            .on("mouseover",mouseover)// mouseover is defined below.
            .on("mouseout",mouseout);// mouseout is defined below.

        //Create the frequency labels above the rectangles.
        bars.append("text").text(function(d){ return d3.format(",")(d[1])})
            .attr("x", function(d) { return x(d[0])+x.rangeBand()/2; })
            .attr("y", function(d) { return y(d[1])-5; })
            .attr("text-anchor", "middle");

        function mouseover(d){  // utility function to be called on mouseover.
            // filter for selected state.
            var st = fData.filter(function(s){ return s.State == d[0];})[0],
                nD = d3.keys(st.freq).map(function(s){ return {type:s, freq:st.freq[s]};});

            // call update functions of pie-chart and legend.
            pC.update(nD);
            leg.update(nD);
        }

        function mouseout(d){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.
            pC.update(tF);
            leg.update(tF);
        }

        // create function to update the bars. This will be used by pie-chart.
        hG.update = function(nD, color){
            // update the domain of the y-axis map to reflect change in frequencies.
            y.domain([0, d3.max(nD, function(d) { return d[1]; })]);

            // Attach the new data to the bars.
            var bars = hGsvg.selectAll(".bar").data(nD);

            // transition the height and color of rectangles.
            bars.select("rect").transition().duration(500)
                .attr("y", function(d) {return y(d[1]); })
                .attr("height", function(d) { return hGDim.h - y(d[1]); })
                .attr("fill", color);

            // transition the frequency labels location and change value.
            bars.select("text").transition().duration(500)
                .text(function(d){ return d3.format(",")(d[1])})
                .attr("y", function(d) {return y(d[1])-5; });
        }
        return hG;
    }

    // function to handle pieChart.
    function pieChart(pD){
        var pC ={},    pieDim ={w:200, h: 200};
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;

        // create svg for pie chart.
        var piesvg = d3.select(id).append("svg")
            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
            .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");

        // create function to draw the arcs of the pie slices.
        var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);

        // create a function to compute the pie slice angles.
        var pie = d3.layout.pie().sort(null).value(function(d) { return d.freq; });

        // Draw the pie slices.
        piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })
            .on("mouseover",mouseover).on("mouseout",mouseout);

        // create function to update pie-chart. This will be used by histogram.
        pC.update = function(nD){
            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                .attrTween("d", arcTween);
        }
        // Utility function to be called on mouseover a pie slice.
        function mouseover(d){
            // call the update function of histogram with new data.
            hG.update(fData.map(function(v){
                return [v.State,v.freq[d.data.type]];}),segColor(d.data.type));
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d){
            // call the update function of histogram with all data.
            hG.update(fData.map(function(v){
                return [v.State,v.total];}), barColor);
        }
        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t));    };
        }
        return pC;
    }

    // function to handle legend.
    function legend(lD){
        var leg = {};

        // create table for legend.
        var legend = d3.select(id).append("table").attr('class','legend');

        // create one row per segment.
        var tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");

        // create the first column for each segment.
        tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
            .attr("width", '16').attr("height", '16')
			.attr("fill",function(d){ return segColor(d.type); });

        // create the second column for each segment.
        tr.append("td").text(function(d){ return d.type;});

        // create the third column for each segment.
        tr.append("td").attr("class",'legendFreq')
            .text(function(d){ return d3.format(",")(d.freq);});

        // create the fourth column for each segment.
        tr.append("td").attr("class",'legendPerc')
            .text(function(d){ return getLegend(d,lD);});

        // Utility function to be used to update the legend.
        leg.update = function(nD){
            // update the data attached to the row elements.
            var l = legend.select("tbody").selectAll("tr").data(nD);

            // update the frequencies.
            l.select(".legendFreq").text(function(d){ return d3.format(",")(d.freq);});

            // update the percentage column.
            l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});
        }

        function getLegend(d,aD){ // Utility function to compute percentage.
            return d3.format("%")(d.freq/d3.sum(aD.map(function(v){ return v.freq; })));
        }

        return leg;
    }

    // calculate total frequency by segment for all state.
    var tF = ['well','lessWell'].map(function(d){
        return {type:d, freq: d3.sum(fData.map(function(t){ return t.freq[d];}))};
    });

    // calculate total frequency by state for all segment.
    var sF = fData.map(function(d){return [d.State,d.total];});

    var pC = pieChart(tF), // create the pie-chart.
        leg = legend(tF),  // create the legend.
        hG = histoGram(sF); // create the histogram.

}
        var oregon =[
        {State:'Spanish',freq:{well:207448, lessWell:135584}}
        ,{State:'French',freq:{well:9545, lessWell:1656}}
        ,{State:'German',freq:{well:16040, lessWell:1457}}
        ,{State:'Russian',freq:{well:33107, lessWell:19824}}
        ,{State:'Other Indo-European',freq:{well:25643, lessWell:9447}}
        ,{State:'Korean',freq:{well:5200, lessWell:4697}}
        ,{State:'Chinese',freq:{well:14298, lessWell:15383}}
        ,{State:'Vietnamese',freq:{well:9658, lessWell:15308}}
        ,{State:'Tagolog',freq:{well:7399, lessWell:3153}}
        ,{State:'Other Asian and PI',freq:{well:24893, lessWell:14424}}
        ,{State:'Arabic',freq:{well:5307, lessWell:2749}}
        ,{State:'Other',freq:{well:10645, lessWell:5287}}
        ];

        var Baker =[
        {State:'Spanish',freq:{well:199, lessWell:161}}
        ,{State:'French',freq:{well:31, lessWell:0}}
        ,{State:'German',freq:{well:79, lessWell:2}}
        ,{State:'Russian',freq:{well:25, lessWell:0}}
        ,{State:'Other Indo-European',freq:{well:13, lessWell:10}}
        ,{State:'Korean',freq:{well:11, lessWell:4}}
        ,{State:'Chinese',freq:{well:5, lessWell:0}}
        ,{State:'Vietnamese',freq:{well:25, lessWell:9}}
        ,{State:'Tagolog',freq:{well:0, lessWell:4}}
        ,{State:'Other Asian and PI',freq:{well:4, lessWell:0}}
        ,{State:'Arabic',freq:{well:0, lessWell:0}}
        ,{State:'Other',freq:{well:24, lessWell:0}}
        ];

dashboard('#dashboard', oregon);
$('#dashboard table tbody tr:nth-child(1) td:nth-child(2)').html('Speaks English well')
$('#dashboard table tbody tr:nth-child(2) td:nth-child(2)').html('Speaks English less than well')
});

// 9. Create Leaflet Control Object for Legend
var leg = L.control({
  position: 'bottomright'
});

// 10. Function that runs when legend is added to map
leg.onAdd = function() {

  // Create Div Element and Populate it with HTML
  var div = L.DomUtil.create('div', 'leg');
  div.innerHTML += '<b>% in LEP Households</b><br />';
  div.innerHTML += '<i style="background: ' + colors[4] + '; opacity: 0.5"></i><p>>6.03%</p>';
  div.innerHTML += '<i style="background: ' + colors[3] + '; opacity: 0.5"></i><p>3.25%-6.03%</p>';
  div.innerHTML += '<i style="background: ' + colors[2] + '; opacity: 0.5"></i><p>1.44%-3.24%</p>';
  div.innerHTML += '<i style="background: ' + colors[1] + '; opacity: 0.5"></i><p>0.38%-1.43%</p>';
  div.innerHTML += '<i style="background: ' + colors[0] + '; opacity: 0.5"></i><p><0.38%</p>';
  // Return the Legend div containing the HTML content
  return div;
};
// 11. Add a legend to map
leg.addTo(mymap);

//attribution
$(".leaflet-control-attribution")
  .css("background-color", "transparent")
  .html("Supported by <a href='https://oregonexplorer.info/topics/rural-communities?ptopic=140' target='_blank'>The RCE @ Oregon State University </a> | Web Map by: <a href='#' target='_blank'>Benji Antolin");
