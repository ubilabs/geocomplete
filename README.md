# $.geocomplete()
## jQuery Geocoding and Places Autocomplete Plugin

An advanced jQuery plugin that wraps the Google Maps API's [Geocoding](https://code.google.com/apis/maps/documentation/javascript/geocoding.html) and [Places Autocomplete](https://code.google.com/apis/maps/documentation/javascript/places.html#places_autocomplete) services. You simply provide an input that let's you search for locations with a nice autocomplete dropdown. Optionally add a container to show an interactive map and a form that will be populated with the address details.


### Usage 

To convert an input into a autocomplete field, simply call `geocomplete` plugin:

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

### Options

The following options might be passed to the plugin call. If you omit them, they fall back to the default.

Example:

```javascript
$("#my_input").geocomplete({
  map: "#my_map",
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

* `"geocode:result"` - geocode was successful
* `"geocode:error"` - geocode throws an error
* `"geocode:multiple"` - multiple results found
* `"geocode:dragged"` - marker position was modified manually

### Address and Places Specific Component Types

The following types are supported by the geocoder and will be passed to the provided form or container:

`street_address`, `route`, `intersection`, `political`, `country`, `administrative_area_level_1`, `administrative_area_level_2`, `administrative_area_level_3`, `colloquial_area`, `locality`, `sublocality`, `neighborhood`, `premise`, `subpremise`, `postal_code`, `natural_feature`, `airport`, `park`, `point_of_interest`, `post_box`, `street_number`, `floor`, `room`, `lat`, `lng`, `viewport`, `location`, `formatted_address`, `location_type`, `bounds`

For more information about address components visit http://code.google.com/apis/maps/documentation/geocoding/#Types


Additionally the following details are passed when the Places API was requested:

`id`, `url`, `website`, `vicinity`, `reference`, `rating`, `international_phone_number`, `icon`, `formatted_phone_number`

More information can be found here: http://code.google.com/apis/maps/documentation/javascript/places.html#place_details_responses