# $.geocomplete()
## jQuery Geocoder and Places Autocomplete Plugin

An advanced jQuery plugin that wraps the Google Maps API's [Geocoding](https://code.google.com/apis/maps/documentation/javascript/geocoding.html) and [Places Autocomplete](https://code.google.com/apis/maps/documentation/javascript/places.html#places_autocomplete) services. You simply provide an input that let's you search for locations with a nice autocomplete dropdown. Optionally add a container to show an interactive map and a form that will be populated with the address details.


### Usage 

To convert an input into a autocomplete field, simply call `geocomplete` plugin:

```javascript
$("input").geocomplete();  // Option 1: Call on element.
$.fn.geocomplete("input"); // Option 2: Pass element as argument.
```

### Options

* `map` - `false`
* `details` - `false`
* `detailsAttribute` - `"name"`
* `mapOptions.zoom` - `14`
* `mapOptions.scrollwheel` - `false`
* `mapOptions.mapTypeId` - `"roadmap"`
* `markerOptions.draggable` - `false`
* `maxZoom` - `16`
* `types` - `['geocode']`


### Events

* `"geocode:result"` - geocode was successful
* `"geocode:error"` - geocode throws an error
* `"geocode:multiple"` - multiple results found
* `"geocode:dragged"` - Marker position was changed manually
