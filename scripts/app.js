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

      var elapsedDays = Math.abs(
        (elapsedMili / (1000 * 60 * 60 * 24))
      ).toFixed(0);


      // console.log(elapsedDays);
    //   var quakeInstance = `
    //   <article class="quake-item">
    //     <p class="badge">#${i + 1}</p>
    //     <p class="title">${placeName}\u00A0 </p><span class="badge magBadge"></span>
    //     <p class="date">${date}</p>
    //     <p><span class="badge">${elapsedDays}\u00A0 day(s) ${elapsedHours} hour(s) and ${elapsedMinutes} minute(s) ago</span></p>
    //   </article>
    // `;

    var magBadgeElement;
    //  = `
    // <span class="badge"> ${mag}</span>
    // `;
    function addBadgeClass(mag){
      let $info = $("#info").append(magBadgeElement);
        if (mag > 5.5 ) {
            magBadgeElement = `
            <article class="quake-item">
              <p class="badge">#${i + 1}</p>
              <p class="title">${placeName}\u00A0 </p><span class="badge magBadgeRed">${mag}</span>
              <p><span class="badge">${elapsedDays}\u00A0 day(s) ${elapsedHours} hour(s) and ${elapsedMinutes} minute(s) ago</span></p>
            </article>
            `;
            $info.append(magBadgeElement);
        } else if (mag >= 4.6) {
          magBadgeElement = `
          <article class="quake-item">
            <p class="badge">#${i + 1}</p>
            <p class="title">${placeName}\u00A0<span class="badge magBadgeOrange">${mag}</span></p>
            <p><span class="badge">${elapsedDays}\u00A0 day(s) ${elapsedHours} hour(s) and ${elapsedMinutes} minute(s) ago</span></p>
          </article>
          `;
            $info.append(magBadgeElement);
        } else {
          magBadgeElement = `
          <article class="quake-item">
            <p class="badge">#${i + 1}</p>
            <p class="title">${placeName}\u00A0 </p><span class="badge magBadgeYellow">${mag}</span>
            <p><span class="badge">${elapsedDays}\u00A0 day(s) ${elapsedHours} hour(s) and ${elapsedMinutes} minute(s) ago</span></p>
          </article>
          `;
            $info.append(magBadgeElement);
        }
        // console.log(magBadgeElement);
        // $("#info").append(magBadgeElement);
      }
      addBadgeClass(mag);

      // $("#info").append(quakeInstance);


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


    function initMap(allQuakes) {
      map = new google.maps.Map(d3.select("#map").node(), {
        center: { lat: 0.78, lng: 130.44 },
        zoom: 3,
        styles: styles,
        mapTypeId: google.maps.MapTypeId.SATELITE
      });

      // Construct the circle for each value in quakeSpots.
      //   Note: We scale the area of the circle based on the population.
        // allQuakes.forEach(function(quake, i) {
        //   // Add the circle for this city to the map.
        //   var cityCircle = new google.maps.Circle({
        //     strokeColor: '#FFF',
        //     strokeOpacity: 0.8,
        //     strokeWeight: .75,
        //     // fillColor: '#FF0000',
        //     fillOpacity: 0,
        //     map: map,
        //     center: allQuakes[i].center,
        //     // radius: getCircleMag(allQuakes[i].place.mag)
        //     // radius: Math.pow(2, allQuakes[i].place.mag) / 2
        //     radius: Math.sqrt(allQuakes[i].mag) * 100000
        //     // position: allQuakes[i].place.center
        //   });
        //   // console.log(allQuakes[i].place.center);
        // }); //end allQuakes.forEach


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
        // var tooltip = d3
        //   .select("map")
        //   .append("div")
        //   .attr("class", "tooltip")
        //   .style("opacity", 0);


        // Add a circle.
        let circle = marker.append("circle")
          .attr("r", function(d) {
            return Math.pow(1.345, d.value.mag);
          })
          .attr("cx", padding)
          .attr("cy", padding)
          .attr("stroke-width", 20)
          .attr("fill", function(d) {
            if (d.value.mag > 5.5) {
              return "rgba(158, 42, 43, 1)";
            } else if (d.value.mag >= 4.6) {
              return "rgba(224, 159, 62, 1)";
            }
            return "rgba(255, 243, 176, 1)";
          })
          .on("click", function(d){
            console.log(d.value.placeName);
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

        //Inspired by http://bl.ocks.org/chiester/11267307
    		// function pulse() {
    		// 	var circle = marker.select("circle");
    		// 	(function repeat() {
    		// 		circle = circle.transition()
    		// 			.duration(2000)
    		// 			.attr("stroke-width", 20)
    		// 			// .attr("r", 10)
    		// 			.transition()
    		// 			.duration(2000)
    		// 			.attr('stroke-width', 0.5)
    		// 			// .attr("r", 20)
    		// 			// .ease('sine')
    		// 			.each("end", repeat);
    		// 	})();
        // }
        // circle.transition()
        //   .duration(5500)
        //   .delay(function(d) {
    		// 		 return d.value.elapsedMili/5000;
    		// 	 })
        //    .attr("r", function(d) {
        //      return Math.pow(1.345, d.value.mag);
        //    });


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

  var styles = [{
	"elementType": "labels.text.fill",
	"stylers": [{
		"visibility": "on"
	}, {
		"saturation": -76
	}, {
		"color": "540B0E"
	}, {
		"weight": 0.1
	}]
}, {
	"featureType": "landscape.natural",
	"stylers": [{
			"visibility": "on"
		}, {
			"saturation": -28
		},
		// { "color": "#32302f" },
		{
			"color": "#e5e3df"
		}
	]
}, {
	"featureType": "poi",
	"stylers": [{
			"visibility": "on"
		},
		// { "color": "#808080" },
		{
			"color": "#e5e3df"
		}
	]
}, {
	"elementType": "labels.text.stroke",
	"stylers": [{
		"weight": 0.5
	}, {
		"saturation": -71
	}, {
		"color": "540B0E"
	}]
}, {
	"featureType": "road",
	"elementType": "geometry",
	"stylers": [{
    "visibility": "off",
		"color": "#ffffff"
	}]
}, {
	"featureType": "landscape",
	"stylers": [{
		"visibility": "on"
	}, {
		"color": "#e5e3df"
	}]
}, {
	"featureType": "landscape",
	"elementType": "geometry",
	"stylers": [{
		"hue": "#e3e3e3"
	}, {
		"saturation": -100
	}, {
		"lightness": 0
	}, {
		"visibility": "on"
	}]
}, {
	"featureType": "water",
	"elementType": "all",
	"stylers": [{
		"color": "#29425d"
    }]
	}, {
		"visibility": "on"
	}, {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{  "visibility": "off"}]
  }
]; //end map styles

var simpleMapStyle = [{
        'featureType': 'all',
        'elementType': 'all',
        'stylers': [{'visibility': 'off'}]
      }, {
        'featureType': 'landscape',
        'elementType': 'geometry',
        'stylers': [{'visibility': 'on'}, {'color': '#fcfcfc'}]
      }, {
        'featureType': 'water',
        'elementType': 'labels',
        'stylers': [{'visibility': 'off'}]
      },
      // {
      //   'featureType': 'water',
      //   'elementType': 'geometry',
      //   'stylers': [{'visibility': 'on'}, {'hue': '#29425d'}]
      // },
      {
      	"featureType": "water",
      	'elementType': 'geometry',
      	"stylers": [{'visibility': 'on'}, {"color": "#335C67"}]
    }
    ];


}); //end docuemnt ready
