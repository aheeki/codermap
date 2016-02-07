// Creates the addCtrl Module and Controller. Note that it depends on the 'geolocation' module and service.
var addCtrl = angular.module('addCtrl', ['geolocation', 'gservice', 'google.places']);
addCtrl.controller('addCtrl', function($scope, $http, geolocation, gservice){

  // Initializes Variables
  // ----------------------------------------------------------------------------

  // autocomplete place var bound to addCtrl scope
  $scope.place = '';

  $scope.formData = {};
  var coords = {};
  var lat = 0;
  var long = 0;

  // Functions
  // ----------------------------------------------------------------------------

  // Update user's location based on Google places API
  $scope.$watch('place', function() {
    if ( angular.isDefined($scope.place.geometry) ) {
      // v hacky here, but the $scope.place.geometry.location.lat property was a function somehow, not a number
      // converting the object to a json string then back to an object fixed the issue
      tempLoc = angular.fromJson(angular.toJson($scope.place));
      gservice.refresh(tempLoc.geometry.location.lat, tempLoc.geometry.location.lng);
    }
  });

  // Get User's actual coordinates based on HTML5 at window load
  geolocation.getLocation().then(function(data){
    // Set the latitude and longitude equal to the HTML5 coordinates
    coords = {lat:data.coords.latitude, long:data.coords.longitude};
    gservice.refresh(parseFloat(coords.lat).toFixed(3), parseFloat(coords.long).toFixed(3));
  });

  // Creates a new user based on the form fields
  $scope.createUser = function() {

    // Grabs all of the text box 
    tempLoc = angular.fromJson(angular.toJson($scope.place));
    var userData = {
      location: [tempLoc.geometry.location.lng, tempLoc.geometry.location.lat],
      place: angular.toJson($scope.place),
      when: $scope.formData.when,
      username: $scope.formData.username,
      project: $scope.formData.project,
      languages: $scope.formData.languages,
      github: $scope.formData.github
    };
    // Saves the user data to the db
    $http.post('/users', userData)
      .success(function (data) {
        // Once complete, clear the form (except location)
        console.log(data);
        $scope.formData.when = "";
        $scope.formData.username = "";
        $scope.formData.project = "";
        $scope.formData.languages = "";
        $scope.formData.github = "";

        // Refresh the map with new data
        tempLoc = angular.fromJson(angular.toJson($scope.place));
        gservice.refresh(tempLoc.geometry.location.lat, tempLoc.geometry.location.lng);          
      })
      .error(function (data) {
        console.log('Error: ' + data);
      });
  };
});