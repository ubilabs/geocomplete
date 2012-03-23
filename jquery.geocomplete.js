/**
 * jQuery Geocoding and Places Autocomplete Plugin - V 1.2
 *
 * @author Martin Kleppe <kleppe@ubilabs.net>, 2012
 * @author Ubilabs http://ubilabs.net, 2012
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

;(function($, window, document, undefined){

  // # $.geocomplete()
  // ## jQuery Geocoding and Places Autocomplete Plugin
  //
  // * Version: 1.1
  // * https://github.com/ubilabs/geocomplete/
  // * by Martin Kleppe <kleppe@ubilabs.net>

  // The default options for this plugin.
  //
  // * `map` - Might be a selector, an jQuery object or a DOM element. Default is `false` which shows no map.
  // * `details` - The container that should be populated with data. Defaults to `false` which ignores the setting.
  // * `location` - Full address or latitude, longitude array to initialize on.
  // * `bounds` - Whether to snap geocode search to map bounds. Default: `true` if false search globally. Alternatively pass a custom LatLngBounds object
  // * `detailsAttribute` - The attribute's name to use as an indicator. Default: `"name"`
  // * `mapOptions` - Options to pass to the `google.maps.Map` constructor. See the full list [here](http://code.google.com/apis/maps/documentation/javascript/reference.html#MapOptions).
  // * `mapOptions.zoom` - The inital zoom level. Default: `14`
  // * `mapOptions.scrollwheel` - Whether to enable the scrollwheel to zoom the map. Default: `false`
  // * `mapOptions.mapTypeId` - The map type. Default: `"roadmap"`
  // * `markerOptions` - The options to pass to the `google.maps.Marker` constructor. See the full list [here](http://code.google.com/apis/maps/documentation/javascript/reference.html#MarkerOptions).
  // * `markerOptions.draggable` - If the marker is draggable. Default: `false`. Set to true to enable dragging.
  // * `maxZoom` - The maximum zoom level too zoom in after a geocoding response. Default: `16`
  // * `types` - An array containing one or more of the supported types for the places request. Default: `['geocode']` See the full list [here].(http://code.google.com/apis/maps/documentation/javascript/places.html#place_search_requests)
  var defaults = {
    bounds: true,
    map: false,
    details: false,
    detailsAttribute: "name",
    location: false,
    
    mapOptions: {
      zoom: 14,
      scrollwheel: false,
      mapTypeId: "roadmap"  
    },
    
    markerOptions: {
      draggable: false
    },
    
    maxZoom: 16,
    types: ['geocode']
  };
  
  // 
  // See: http://code.google.com/apis/maps/documentation/geocoding/#Types
  var componentTypes = ("street_address route intersection political " +
    "country administrative_area_level_1 administrative_area_level_2 " +
    "administrative_area_level_3 colloquial_area locality sublocality " +
    "neighborhood premise subpremise postal_code natural_feature airport " +
    "park point_of_interest post_box street_number floor room " +
    "lat lng viewport location " +
    "formatted_address location_type bounds").split(" ");

  var placesDetails = ("id url website vicinity reference rating " +
    "international_phone_number icon formatted_phone_number").split(" ");

  // The actual plugin constructor. 
  function GeoComplete(input, options) {

    this.options = $.extend(true, {}, defaults, options);

    this.input = input;
    this.$input = $(input);
    
    this._defaults = defaults;
    this._name = 'geocomplete';

    this.init();
  }
  
  $.extend(GeoComplete.prototype, {
    init: function(){
      this.initMap();
      this.initMarker();
      this.initGeocoder();
      this.initDetails();
      this.initAddress();
    },
    
    initMap: function(){
      var container;
      
      if (!this.options.map){ return; }

      if (typeof this.options.map.setCenter == "function"){
        this.map = this.options.map;
        return;
      } 
      
      container = $(this.options.map)[0];
      this.map = new google.maps.Map(container, this.options.mapOptions);
    },
    
    initMarker: function(){
      if (!this.map){ return; }
      var options = $.extend(this.options.markerOptions, { map: this.map });
      this.marker = new google.maps.Marker(options);
      
      google.maps.event.addListener(
        this.marker, 
        'dragend', 
        $.proxy(this.markerDragged, this)
      );
    },
    
    initGeocoder: function(){
      
      // Create a geocoder to fallback when the autocomplete 
      // does not return any value.
      this.geocoder = new google.maps.Geocoder();

      var options = {
        types: this.options.types,
        bounds: this.options.bounds === true ? null : this.options.bounds
      };

      this.autocomplete = new google.maps.places.Autocomplete(
        this.input, options
      );
      
      // Bind autocomplete to map bounds but only if there is a map
      // and `options.bindToMap` is set to true.
      if (this.map && this.options.bounds === true){
        this.autocomplete.bindTo('bounds', this.map);
      }
  
      // Watch `place_changed` events on the autocomplete input field.
      google.maps.event.addListener(
        this.autocomplete, 
        'place_changed', 
        $.proxy(this.placeChanged, this)
      );
      
      // Prevent parent form from being submitted if user hit enter.
      this.$input.keypress(function(event){
        if (event.keyCode === 13){ return false; }
      });
      
      // Listen for "geocode" events and trigger find action.
      this.$input.bind("geocode", $.proxy(function(){
        this.find();
      }, this));
    },
    
    initDetails: function(){
      if (!this.options.details){ return; }
      
      var $details = $(this.options.details),
        attribute = this.options.detailsAttribute,
        details = {};
        
      function setDetail(value){
        details[value] = $details.find("[" +  attribute + "=" + value + "]");
      }
      
      $.each(componentTypes, function(index, key){
        setDetail(key);
        setDetail(key + "_short");
      });
      
      $.each(placesDetails, function(index, key){
        setDetail(key);
      });
      
      this.$details = $details;
      this.details = details;
    },

    initAddress: function() {

      var location = this.options.location;

      if (location) {
        if (typeof location == 'string') {
          this.find(location);
        } else if (location instanceof Array) {
          this.geoocode({ 
            latLng: new google.maps.LatLng(location[0], location[1]) 
          });
        }
      }
    },
    
    find: function(address){
      var options = { 
        address: address || this.$input.val()
      };
        
      // Bind geocode requests to map bounds but only if there is a map
      // and `options.bounds` is set to true.
      if (this.options.bounds){
        if (this.options.bounds === true){
          options.bounds = this.map && this.map.getBounds();
        } else {
          options.bounds = this.options.bounds;
        }
      }

      this.geocode(options);
    },

    geocode: function(options){
      this.geocoder.geocode(options, $.proxy(this.handleGeocode, this));
    },
    
    handleGeocode: function(results, status){      
      if (status === google.maps.GeocoderStatus.OK) {
        var result = results[0];
        this.$input.val(result.formatted_address);
        this.update(result);
        
        if (results.length > 1){
          this.trigger("geocode:multiple", results);
        }
        
      } else {
        this.trigger("geocode:error", status);
      }
    },
    
    trigger: function(event, argument){
      this.$input.trigger(event, [argument]);
    },
    
    center: function(geometry){
      
      if (geometry.viewport){
        this.map.fitBounds(geometry.viewport);
        if (this.map.getZoom() > this.options.maxZoom){
          this.map.setZoom(this.options.maxZoom);
        }
      } else {
        this.map.setZoom(this.options.maxZoom);
        this.map.setCenter(geometry.location);
      }
      
      if (this.marker){
        this.marker.setPosition(geometry.location);
        this.marker.setAnimation(this.options.markerOptions.animation);
      }
    },
    
    update: function(result){

      if (this.map){
        this.center(result.geometry);
      }
      
      if (this.$details){
        this.fillDetails(result);
      }
      
      this.trigger("geocode:result", result);
    },
    
    fillDetails: function(result){
      
      var data = {},
        geometry = result.geometry,
        viewport = geometry.viewport,
        bounds = geometry.bounds;
      
      $.each(result.address_components, function(index, object){
        var name = object.types[0];
        data[name] = object.long_name;
        data[name + "_short"] = object.short_name;
      });
      
      $.each(placesDetails, function(index, key){
        data[key] = result[key];
      });
      
      $.extend(data, {
        formatted_address: result.formatted_address,
        location_type: geometry.location_type || "PLACES",
        viewport: viewport,
        bounds: bounds,
        location: geometry.location,
        lat: geometry.location.lat(),
        lng: geometry.location.lng()
      });

      $.each(this.details, $.proxy(function(key, $detail){
        var value = data[key];
        this.setDetail($detail, value);
      }, this));
      
      this.data = data;
    },
    
    setDetail: function($detail, value){
      
      if (value === undefined){
        value = "";
      } else if (typeof value.toUrlValue == "function"){
        value = value.toUrlValue();
      }
      
      if ($detail.is(":input")){
        $detail.val(value);
      } else {
        $detail.text(value);
      }
    },
    
    markerDragged: function(event){
      this.trigger("geocode:dragged", event.latLng);
    },
    
    resetMarker: function(){
      this.marker.setPosition(this.data.location);
      this.setDetail(this.details.lat, this.data.location.lat());
      this.setDetail(this.details.lng, this.data.location.lng());
    },
    
    placeChanged: function(){
      var place = this.autocomplete.getPlace();
      
      if (!place.geometry){
        this.find(place.name);
      } else {
        this.update(place);
      }
    }
  });

  $.fn.geocomplete = function(options) {
    
    var attribute = 'plugin_geocomplete';
    
    if (typeof options == "string"){
      
      var instance = $(this).data(attribute),
        prop = instance[options];
      
      if (typeof prop == "function"){
        return prop.apply(instance, Array.prototype.slice.call(arguments, 1));
      } else {
        if (arguments.length == 2){
          prop = arguments[1];
        }
        return prop;
      }
    } else {
      return this.each(function () {
        if (!$.data(this, attribute)) {
          $.data(this, attribute, new GeoComplete( this, options ));
        }
      });
    }
  };

})( jQuery, window, document );