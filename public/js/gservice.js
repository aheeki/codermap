// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('gservice', [])
  .factory('gservice', function($rootScope, $http){

    // Initialize Variables
    // -------------------------------------------------------------
    // Service our factory will return
    var googleMapService = {};

    // Handling Clicks and location selection
    googleMapService.clickLat  = 0;
    googleMapService.clickLong = 0;

    // Array of locations obtained from API calls
    var locations = [];

    // Variables we'll use to help us pan to the right spot
    var lastMarker;
    var currentSelectedMarker;

    // Selected Location (initialize to center of DC)
    var selectedLat = 38.900363;
    var selectedLong = -77.036439;

    // Functions
    // --------------------------------------------------------------


    // Refresh the Map with new data. Takes three parameters (lat, long, and filtering results)
    googleMapService.refresh = function(latitude, longitude, filteredResults){

      // Clears the holding array of locations
      locations = [];

      // Set the selected lat and long equal to the ones provided on the refresh() call
      selectedLat = latitude;
      selectedLong = longitude;

      // If filtered results are provided in the refresh() call...
      if (filteredResults){

        // Then convert the filtered results into map points.
        locations = convertToMapPoints(filteredResults);

        // Then, initialize the map -- noting that a filter was used (to mark icons yellow)
        initialize(latitude, longitude, true);
      }

      // If no filter is provided in the refresh() call...
      else {

        // Perform an AJAX call to get all of the records in the db.
        $http.get('/users').success(function(response){
          // Then convert the results into map points
          locations = convertToMapPoints(response);

          // Then initialize the map -- noting that no filter was used.
          initialize(latitude, longitude, false);
        }).error(function(){});
      }
    };


    // Private Inner Functions
    // --------------------------------------------------------------
    // Convert a JSON of users into map points
    var convertToMapPoints = function(response){

      // Clear the locations holder
      var locations = [];

      // Loop through all of the JSON entries provided in the response
      for(var i= 0; i < response.length; i++) {
        var user = response[i];

        // Create popup windows for each record
        var  contentString =
        '<p><b>Username</b>: ' + user.username +
        '<br><b>Time</b>: ' + user.when +
        '<br><b>Project</b>: ' + user.project +
        '<br><b>Language</b>: ' + user.languages +
        '</p>';

        // Converts each of the JSON records into Google Maps Location format (Note [Lat, Lng] format).
        locations.push(new Location(
          new google.maps.LatLng(user.location[1], user.location[0]),
          new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 320
          }),
          user.username,
          user.when,
          user.project,
          user.languages
        ))
      }
      // location is now an array populated with records in Google Maps format
      return locations;
    };

    // Constructor for generic location
    var Location = function(latlon, message, username, when, project, languages){
      this.latlon = latlon;
      this.message = message;
      this.username = username;
      this.when = when;
      this.project = project;
      this.languages = languages;
    };    


    // Initializes the map
    var initialize = function(latitude, longitude, filter) {

      // Uses the selected lat, long as starting point
      var myLatLng = new google.maps.LatLng(selectedLong, selectedLat);

      // If map has not been created...
      if (!map){

        // Create a new map and place in the index.html page
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 11,
          center: myLatLng,
          scrollwheel: false,
          //snazzy map light dream theme
          styles: [{"featureType":"landscape","stylers":[{"hue":"#FFBB00"},
            {"saturation":43.400000000000006},{"lightness":37.599999999999994},
            {"gamma":1}]},{"featureType":"road.highway","stylers":[{"hue":"#FFC200"},
            {"saturation":-61.8},{"lightness":45.599999999999994},{"gamma":1}]},
            {"featureType":"road.arterial","stylers":[{"hue":"#FF0300"},{"saturation":-100},
            {"lightness":51.19999999999999},{"gamma":1}]},{"featureType":"road.local",
            "stylers":[{"hue":"#FF0300"},{"saturation":-100},{"lightness":52},{"gamma":1}]},
            {"featureType":"water","stylers":[{"hue":"#0078FF"},{"saturation":-13.200000000000003},
            {"lightness":2.4000000000000057},{"gamma":1}]},{"featureType":"poi","stylers":
            [{"hue":"#00FF6A"},{"saturation":-1.0989010989011234},{"lightness":11.200000000000017},
            {"gamma":1}]}]
        });
      }

      // If a filter was used set the icons yellow, otherwise blue
      if(filter){
        icon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
      }
      else{
        icon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
      }

      // Loop through each location in the array and place a marker
      locations.forEach(function(n, i){
        var marker = new google.maps.Marker({
          position: n.latlon,
          map: map,
          title: "Big Map",
          icon: icon,
        });

        // For each marker created, add a listener that checks for clicks
        google.maps.event.addListener(marker, 'click', function(e){

          // When clicked, open the selected marker's message
          currentSelectedMarker = n;
          n.message.open(map, marker);
        });
      });

      // Set initial location as a bouncing red marker
      var initialLocation = new google.maps.LatLng(latitude, longitude);
      var marker = new google.maps.Marker({
        position: initialLocation,
        animation: google.maps.Animation.BOUNCE,
        map: map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
      });
      lastMarker = marker;

      // Function for moving to a selected location
      map.panTo(new google.maps.LatLng(latitude, longitude));
    };

    // Refresh the page upon window load. Use the initial latitude and longitude
    google.maps.event.addDomListener(window, 'load', googleMapService.refresh(selectedLat, selectedLong));

    return googleMapService;
});
