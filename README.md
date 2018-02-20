# GeoQuakes

Welcome. Here is a map of recent earthquakes. The data comes from the USGS Earthquake Hazards Program.


## Objectives

Develop a map of earthquakes around the globe:
- Use AJAX to grab data from the USGS earthquakes API
- Use a template literal to display data from an AJAX call on your HTML page
- Use the Google Maps API to embed the map
- Use D3.js, (D3.js is a JavaScript library for manipulating documents based on data) to display quake data.


## GeoQuakes

#### Code Snippets

AJAX

```
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
  });
  ```
Google Maps API
```
function initMap(allQuakes) {
  map = new google.maps.Map(d3.select("#map").node(), {
    center: { lat: 0.78, lng: 130.44 },
    zoom: 3,
    styles: styles,
    mapTypeId: google.maps.MapTypeId.SATELITE
  });

}
```

D3.js: proportionally sized circle radii

```
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
```

D3: Transform Latitude and Longitude to pixels

```
function transform(d) {
  d = new google.maps.LatLng(d.value.lat, d.value.lng);
  d = projection.fromLatLngToDivPixel(d);
  return d3
    .select(this)
    .style("left", d.x - padding + "px")
    .style("top", d.y - padding + "px");
}
```

#### Deliverable

Goals:
- List information about each quake: location, magnitude, time of occurrence.
- Display a Google Map with a circle marker at the epicenter of each quake.
- Circle markers should display correlation to quake magnitude


#### Recources:

Technololgy  
- jQuery, JavaScript, HTML, CSS, Google Maps API, D3.js.

Ideas and people that influenced project
- Mike Bostock (D3.js)

Resources
-MDN, https://www.w3schools.com/
