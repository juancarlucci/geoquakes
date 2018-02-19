// define globals
var weekly_quakes_endpoint =
  "http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";
var pastHour_quakes_endpoint =
  "http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

$(document).ready(function() {
  console.log("Let's get coding!");

  $.ajax({
    method: "GET",
    url: weekly_quakes_endpoint,

    success: function(json) {
      displayQuakes(json);
    },
    error: function() {
      alert("There was an error getting weather data.");
    },
    beforeSend: function() {
      $("#page").append("Loading");
    },
    complete: function() {
      $("#loading").remove();
    }
  }); //end AJAX

  let allQuakes = [];

  let displayQuakes = function(json) {
    let quakeInstance;

    // json.features.forEach(function(quake, i){
    //   let date = new Date(quake.properties.time);
    //   // using Date objects
    //   var start = Date.now();
    //   let fullDate = `
    //   ${date.getMonth() + 1} + "/" +
    //   ${date.getDate()} + "/" +
    //   ${date.getFullYear()} + " " +
    //   ${date.getHours()} + ":" +
    //   date.getMinutes()
    //   `;
    //
    //   console.log(fullDate);
    //
    //   var elapsedMili = date - start;
    //   var elapsed = elapsedMili / 1000;
    //   // console.log(quake.properties);
    //   var quakeInstance = `
    //     <p class="badge">${i}</p>
    //     <p class="title">${quake.properties.place}</p>
    //     <p class="date">${date} elapsed:${elapsed}</p>
    //   `;
    //   $('#info').append(quakeInstance);
    //
    //   allQuakes.push(quake);
    //   setUpMap(json);
    //
    // })
    json.features.forEach(function(quake, i) {
      let date = new Date(quake.properties.time);
      // using Date objects
      var start = Date.now();
      let fullDate = `
    ${date.getMonth() + 1}
    ${date.getDate()}
    ${date.getFullYear()}
    ${date.getHours()}
    ${date.getMinutes()}
    `;

      let placeName = quake.properties.place;
      var lat = quake.geometry.coordinates[1];
      var lng = quake.geometry.coordinates[0];
      var mag = quake.properties.mag;

      var elapsedMili = date - start;
      var elapsedMinutes = Math.abs((elapsedMili / (1000 * 60)) % 60).toFixed(
        0
      );
      var elapsedHours = Math.abs(
        (elapsedMili / (1000 * 60 * 60)) % 24
      ).toFixed(0);
      // console.log(quake.properties);
      var quakeInstance = `
      <p class="badge">${i + 1}</p>
      <p class="title">${placeName}</p>
      <p class="date">${date}<span class="badge">${elapsedHours} hour and ${elapsedMinutes} minutes ago</span></p>
    `;
      $("#info").append(quakeInstance);
      let quakeObj = {
        id: placeName + i,
        placeName,
        center: {
          lat: quake.geometry.coordinates[1],
          lng: quake.geometry.coordinates[0]
        },
        lat,
        lng,
        mag,
        elapsedMili,
        elapsedMinutes,
        elapsedHours
      };
      allQuakes.push(quakeObj);
      setUpMap(json);
    });
  }; //end displayQuakes

  function setUpMap(json) {
    //Map
    var map;
    var lat, lng, mag;

    var defaultIcon = {
      url: "images/earthquake.png",
      scaledSize: new google.maps.Size(50, 83)
    };
    var highlightedIcon = {
      url: "images/earthquake.png",
      scaledSize: new google.maps.Size(50, 83)
    };

    function initMap(allQuakes) {
      map = new google.maps.Map(d3.select("#map").node(), {
        // map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 0.78, lng: 130.44 },
        // zoom: 2
        zoom: 3,
        // center: new google.maps.LatLng(37.76487, -122.41948),
        mapTypeId: google.maps.MapTypeId.SATELITE
      });

      // var legend = document.getElementById('legend');
      //    // for (var key in allQuakes) {
      //      // var type = icons[key];
      //      var name = "Eathquakes";
      //      // var icon = type.icon;
      //      var div = document.createElement('div');
      //      div.innerHTML =   "Magnitudes 2-9.0";
      //      legend.appendChild(div);
      //    // }
      //
      //    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
      //
      map.controls[google.maps.ControlPosition.RIGHT_TOP].push(
        document.getElementById("legend")
      );
    } //end map
    initMap(allQuakes);

    var data = allQuakes;
    var overlay = new google.maps.OverlayView();

    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() {
      var layer = d3
        .select(this.getPanes().overlayLayer)
        .append("div")
        .attr("class", "earthquakes");

      // Draw each marker as a separate SVG element.
      overlay.draw = function() {
        var projection = this.getProjection(),
          padding = 10;

        var marker = layer
          .selectAll("svg")
          .data(d3.entries(data))
          .each(transform) // update existing markers
          .enter()
          .append("svg")
          .each(transform)
          .attr("class", "marker");

        //add tooltip
        // Define the div for the tooltip
        var tooltip = d3
          .select("map")
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

        // var matrix = this.getScreenCTM()
        //   .translate(+this.getAttribute("cx"),+this.getAttribute("cy"));
        // tooltip.style("left", (window.pageXOffset + matrix.e) + "px")
        // .style("top", (window.pageYOffset + matrix.f + 30) + "px");

        // Add a circle.
        marker
          .append("circle")
          .attr("r", function(d) {
            return Math.pow(1.5, d.value.mag);
          })
          .attr("cx", padding)
          .attr("cy", padding)
          .attr("fill", function(d) {
            if (d.value.mag > 5.5) {
              return "red";
            } else if (d.value.mag >= 4.6) {
              return "orange";
            }
            return "yellow";
          });
        // .on("mouseover", function(){return tooltip.style("visibility", "visible");})
        // .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
        // .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

        // .on("mouseover", function(d) {
        //         div.transition()
        //             .duration(200)
        //             .style("opacity", .9);
        //         div.html("<div><span>Quake:</span> <span style='color:white'>" + d.value.mag + "</span></div>")
        //             // .style("left", (d3.event.pageX - 50) + "px")
        //             // .style("top", (d3.event.pageY - 50) + "px");
        //             // .style("left", (d3.x - padding) + "px")
        //             // .style("top", (d3.y - padding) + "px");
        //             .style("left", d3.select(this).attr("cx") + "px")
        //             .style("top", d3.select(this).attr("cy") + "px");
        //         })
        //         .on("mouseout", function(d) {
        //             div.transition()
        //                 .duration(500)
        //                 .style("opacity", 0);
        //         });
        // .on("mouseover", function(d) {
        //   tooltip.transition().duration(200).style("opacity", .9);
        //   tooltip.html(d)
        //     // .style("left", (parseInt(d3.select(this).attr("cx")) + document.getElementById("map").offsetLeft) + "px")
        //     // .style("top", (parseInt(d3.select(this).attr("cy")) + document.getElementById("map").offsetTop) + "px");
        //     // .style("left", (window.pageXOffset + matrix.e) + "px")
        //     // .style("top", (window.pageYOffset + matrix.f + 30) + "px");
        //
        // })
        // .on("mouseout", function(d) {
        //   tooltip.transition().duration(500).style("opacity", 0);
        // });

        // Add a label.
        marker
          .append("text")
          .attr("x", padding + 7)
          .attr("y", padding)
          .attr("dy", ".31em")
          .style("fill", "white")
          .style("opacity", 1)
          // .text(function(d) { return d.value.mag; })
          // .on("mouseover", function(d) {
          //                       div.transition()
          //                           .duration(200)
          //                           .style("opacity", .9);
          //                       div.html("<div><span>Quake:</span> <span style='color:white'>" + d.value.mag + "</span></div>")
          //                           // .style("left", (d3.event.pageX - 50) + "px")
          //                           // .style("top", (d3.event.pageY - 50) + "px");
          //                           // .style("left", (d3.x - padding) + "px")
          //                           // .style("top", (d3.y - padding) + "px");
          //                           .style("left", d + "px")
          //                           .style("top", d + "px");
          //                       })
          //                       .on("mouseout", function(d) {
          //                           div.transition()
          //                               .duration(500)
          //                               .style("opacity", 0);
          //                       });
          .on("mouseover", function(d) {
            return d.value.mag;
          });

        function transform(d) {
          // d = new google.maps.LatLng(d.value.value[1], d.value.value[0]);
          // console.log("d", d.value.mag,"d.value.lat", d);
          d = new google.maps.LatLng(d.value.lat, d.value.lng);
          d = projection.fromLatLngToDivPixel(d);
          return d3
            .select(this)
            .style("left", d.x - padding + "px")
            .style("top", d.y - padding + "px");
        }
      };
    };

    // Bind our overlay to the map…
    overlay.setMap(map);
  } //end setUpMap
}); //end docuemnt ready
