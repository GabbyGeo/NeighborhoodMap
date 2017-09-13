    var map;
      // Create a new blank array for all the listing markers.
  var markers = [];
   function initMap() {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 41.9028, lng: 12.4964},
          zoom: 13,
          mapTypeControl: false
        });  
var initialData = [
            {title:'Colosseum', location: {lat: 41.8902, lng: 12.4922}, type: 'Ancient Ruins'}, 
            {title:'Campo de Fiori', location: {lat: 41.8956, lng: 12.4722}, type: 'Markets'}, 
            {title:'Santa Maria in Trastevere', location: {lat: 41.8895, lng: 12.4697}, type: 'Churches'},
            {title: 'Basilica de San Clemente al Laterano', location: {lat: 41.8893, lng: 12.4976}, type: 'Churches'},
            ];

  

 var largeInfowindow = new google.maps.InfoWindow();

 var bounds = new google.maps.LatLngBounds();

        // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < initialData.length; i++) {
          // Get the position from the location array.
          var position = initialData[i].location;
          var title = initialData[i].title;
          // Create a marker per location, and put into markers array.
          var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
          });
          // Push the marker to our array of markers.
          markers.push(marker);
          // Create an onclick event to open an infowindow at each marker.
          marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
          });
          bounds.extend(markers[i].position);
        }
        // Extend the boundaries of the map for each marker
        map.fitBounds(bounds);
      }
    
        
     //This function populates the infowindow when the marker clicked
      function populateInfoWindow(marker, infowindow) {
        //check to make sure the infowindow is not already opened on this marker
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<div>' + marker.position + '<div>');
          infowindow.open(map, marker);
          //Make sure the marker property is cleared if the infowindow is closed
          infowindow.addListener('closeclick', function() {
            infowindow.setMarker(null);
          });
        }
      }

    var Sight = function(data) {
      this.title = ko.observable(data.title);
    };
    
    var ViewModel = function() {
      var self = this;
      var marker;

      self.sightList = [];

      initialData.forEach(function(place) {
        self.sightList.push(new Place(place));
      });

    // Build Markers via the Maps API and place them on the map.
    self.sightList.forEach(function(place) {
    var markerOptions = {
      map: self.googleMap,
      position: place.location
    };
    
    //place.marker = new google.maps.Marker(markerOptions);
    
    // You might also add listeners onto the marker, such as "click" listeners.
  });
    self.visibleSights = ko.observableArray();

    self.sightList.forEach(function(place) {
    self.visibleSights.push(place);
      });

     // This, along with the data-bind on the <input> element, lets KO keep 
    // constant awareness of what the user has entered. It stores the user's 
   // input at all times.
    self.userInput = ko.observable('');

    // The filter will look at the names of the places the Markers are standing
  // for, and look at the user input in the search box. If the user input string
  // can be found in the place name, then the place is allowed to remain 
  // visible. All other markers are removed.
  self.filterMarkers = function() {
    var searchInput = self.userInput().toLowerCase();
    
    self.visibleSights.removeAll();
    
    // This looks at the name of each places and then determines if the user
    // input can be found within the place name.
    self.sightList.forEach(function(place) {
      location.marker.setVisible(false);
      
      if (place.title.toLowerCase().indexOf(searchInput) !== -1) {
        console.log(place);
        self.visibleSights.push(place);
      }
    });
    
    
    self.visibleSights().forEach(function(place) {
      place.marker.setVisible(true);
    });
  };
  
  
  function Place(dataObj) {
    this.title = dataObj.title;
    this.location = dataObj.location;
    
    // You will save a reference to the Places' map marker after you build the
    // marker:
    this.marker = null;
  }
  
};

  ko.applyBindings(new ViewModel())
