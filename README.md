# $.geocomplete()
## jQuery Geocoding and Places Autocomplete Plugin

An advanced jQuery plugin that wraps the Google Maps API's [Geocoding](https://code.google.com/apis/maps/documentation/javascript/geocoding.html) and [Places Autocomplete](https://code.google.com/apis/maps/documentation/javascript/places.html#places_autocomplete) services. You simply provide an input that let's you search for locations with a nice autocomplete dropdown. Optionally add a container to show an interactive map and a form that will be populated with the address details.


### Basic Usage 

To convert an input into an autocomplete field, simply call `geocomplete` plugin:

```javascript
$("input").geocomplete();  // Option 1: Call on element.
$.fn.geocomplete("input"); // Option 2: Pass element as argument.
```

### Requirements

Make sure you include the Google Maps API with the Places Library before loading this plugin the as described [here](http://code.google.com/intl/de-DE/apis/maps/documentation/javascript/places.html#loading_the_library).

````html
<script src="http://maps.googleapis.com/maps/api/js?sensor=false&amp;libraries=places"></script>
<script src="jquery.geocomplete.js"></script>
``` 

### Adding a Map Preview

To link the geocode results with an interactive map, you can pass `map` as an option to the plugin.

```javascript
$("#my_input").geocomplete({
  map: "#my_map"
});
```

The `map` option might be a selector, an jQuery object or a DOM element.

### Populate Form Data

You can pass `details` as an option to specify a cointainer that will be populated when a geocoding request was successfull. 

By default the plugin analyses the `name` attribute of the containers child nodes and replaces the content. You can override the `detailsAttribute` to use another attribute such as `data-geo`.

If the element is an input, the value will be replaced otherwise the plugin overrides the current text.

Simple Example:

```html
<form>
  Latitude:   <input name="lat" type="text" value="">
  Longitude:  <input name="lng" type="text" value="">
  Address:    <input name="formatted_address" type="text" value="">
</form>
```

```javascript
$("input").geocomplete({ details: "form" });
```

Advanced Example:

```html
<div class="details">
  Latitude:   <span data-geo="lat" />
  Longitude:  <span data-geo="lng" />
  Address:    <span data-geo="formatted_address" />
</form>
```

```javascript
$("input").geocomplete({
  details: ".details",
  detailsAttribute: "data-geo"
});
```

### List of Options

The following options might be passed to the plugin call. If you omit them, they fall back to the default.

Example:

```javascript
$("#my_input").geocomplete({
  map: "#my_map",
  mapOptions: {
    zoom: 10
  },
  markerOptions: {
    draggable: true
  },
  details: "#my_form"
});
```

* `map` - Might be a selector, an jQuery object or a DOM element. Default is `false` which shows no map.
* `details` - The container that should be populated with data. Defaults to `false` which ignores the setting.
* `bindToMap` - Whether to snap geocode search to map bounds. Default: `true`
* `detailsAttribute` - The attribute's name to use as an indicator. Default: `"name"`
* `mapOptions` - Options to pass to the `google.maps.Map` constructor. See the full list [here](http://code.google.com/apis/maps/documentation/javascript/reference.html#MapOptions).
* `mapOptions.zoom` - The inital zoom level. Default: `14`
* `mapOptions.scrollwheel` - Whether to enable the scrollwheel to zoom the map. Default: `false`
* `mapOptions.mapTypeId` - The map type. Default: `"roadmap"`
* `markerOptions` - The options to pass to the `google.maps.Marker` constructor. See the full list [here](http://code.google.com/apis/maps/documentation/javascript/reference.html#MarkerOptions).
* `markerOptions.draggable` - If the marker is draggable. Default: `false`. Set to true to enable dragging.
* `maxZoom` - The maximum zoom level too zoom in after a geocoding response. Default: `16`
* `types` - An array containing one or more of the supported types for the places request. Default: `['geocode']` See the full list [here].(http://code.google.com/apis/maps/documentation/javascript/places.html#place_search_requests)

### Events

You can subscribe to events of the geocode plugin by using the default jQuery syntax:

````javascript
$("input")
  .geocomplete()
  .bind("geocode:result", function(event, result){
    console.log(result);
  });
```

The following events are supported:

* `"geocode:result"` - Geocode was successful. Passes the original result as described [here](http://code.google.com/apis/maps/documentation/javascript/geocoding.html#GeocodingResults).
* `"geocode:error"` - Fired when the geocode returns an error. Passes the current status as listed [here](http://code.google.com/apis/maps/documentation/javascript/geocoding.html#GeocodingStatusCodes).
* `"geocode:multiple"` - Firedimmediately after the "result" event if multiple results were found. Passes an array of all results.
* `"geocode:dragged"` - Fired when the marker's position was modified manually. Passes the updated location.

### Methods and Properties

You can access all properties and methods of the plugin from outside. Simply add a string as the first argument to the `.geocomplete` method after you initialized the plugin.

Example:

````javascript
// Initialize the plugin.
$("input").geocomplete({ map: ".map_canvas" });

// Call the find method with the paramenter "NYC".
$("input").geocomplete("find", "NYC");

// Get the map and set a new zoom level. 
var map = $("input").geocomplete("map");
map.setZoom(3);
```

### Address and Places Specific Component Types

The following types are supported by the geocoder and will be passed to the provided form or container:

`street_address`, `route`, `intersection`, `political`, `country`, `administrative_area_level_1`, `administrative_area_level_2`, `administrative_area_level_3`, `colloquial_area`, `locality`, `sublocality`, `neighborhood`, `premise`, `subpremise`, `postal_code`, `natural_feature`, `airport`, `park`, `point_of_interest`, `post_box`, `street_number`, `floor`, `room`, `lat`, `lng`, `viewport`, `location`, `formatted_address`, `location_type`, `bounds`

For more information about address components visit http://code.google.com/apis/maps/documentation/geocoding/#Types


Additionally the following details are passed when the Places API was requested:

`id`, `url`, `website`, `vicinity`, `reference`, `rating`, `international_phone_number`, `icon`, `formatted_phone_number`

More information can be found here: http://code.google.com/apis/maps/documentation/javascript/places.html#place_details_responses