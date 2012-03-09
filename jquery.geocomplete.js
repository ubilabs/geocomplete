;(function($, window, document, undefined){

  var pluginName = 'geocomplete',
    defaults = {
      // Whether to snap geocode search to map bounds.
      bindToMap: true,
      
      // Might be a selector (eg "#map_canvas"), 
      // an jQuery object (eg $("#map_canvas"))
      // or a DOM element (eg document.getElementById("map_canvas");)
      map: false,
      
      details: false,
      
      detailsAttribute: "name",
      
      mapOptions: {
        zoom: 14,
        scrollwheel: false,
        mapTypeId: "roadmap"
      },
      
      markerOptions: {
        draggable: false,
        animation: null
      },
      
      maxZoom: 16,
      
      // Places types to search for.
      types: ['geocode']
    };
  
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

  // The actual plugin constructor
  function GeoComplete(input, options) {

    this.options = $.extend(true, {}, defaults, options);

    this.input = input;
    this.$input = $(input);
    
    this._defaults = defaults;
    this._name = pluginName;

    this.init();
  }
  
  $.extend(GeoComplete.prototype, {
    init: function(){
      this.initMap();
      this.initMarker();
      this.initGeocoder();
      this.initDetails();
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
      
      this.autocomplete = new google.maps.places.Autocomplete(
        this.input, 
        { types: this.options.types }
      );
      
      // Bind autocomplete to map bounds but only if there is a map
      // and `options.bindToMap` is set to true.
      if (this.map && this.options.bindToMap){
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
    
    find: function(address){
      var options = { 
        address: address || this.$input.val()
      };
        
      // Bind geocode requests to map bounds but only if there is a map
      // and `options.bindToMap` is set to true.
      if (this.map && this.options.bindToMap){
        options.bounds = this.map.getBounds();
      }
      
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

  $.fn[pluginName] = function(options) {
    
    var attribute = 'plugin_' + pluginName;
    
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