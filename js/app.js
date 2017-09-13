    var map;

     var markers = [];

     var placeMarkers = [];

     function initMap() {
        map = new google.maps.Map(document.getElementById('map'), 
          {
        center: {lat: 39.7392, lng: -104.9903 },
        zoom: 9
      });
      
      //Create a searchbox 
     var searchBox = new google.maps.places.SearchBox(
          document.getElementById('places-search'));
     searchBox.setBounds(map.getBounds());
       
     var locations = [
      {title: 'UC Health', location: {lat: 39.742336, lng: -104.841558}},
      {title: 'Childrens Hospital', location: {lat: 39.22222, lng: -104.222222}}
      ];

     var largeInfowindow = new google.maps.InfoWindow();

      //initialize the drawing manager
     var drawingManager = new google.maps.drawing.DrawingManager();
      drawingManager.setMap(map);
    
        
      
      //The following group uses the location array to create an array of markers on initialize
      for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        var marker = new google.maps.Marker({
          position: position,
          title: title,
          animation: google.maps.Animation.DROP
        });
        //Push the marker to our array of markers
        markers.push(marker);
    
        //Create an onclick event to open an infowindow at each marker
        marker.addListener('click', function() {
          populateInfoWindow(this, largeInfowindow);
        });
      }
     
      document.getElementById('show-hospitals').addEventListener('click', showHospitals);
      document.getElementById('hide-hospitals').addEventListener('click', hideHospitals);
    };

      //event listener for searchbox
      searchBox.addListener('places_changed', function(){
        searchBoxPlaces(this);
      });

      document.getElementById('go-places').addEventListener('click', textSearchPlaces);

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

      function showHospitals() {
        var bounds = new google.maps.LatLngBounds();
        //extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
      }

      function hideMarkers(markers) {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
      }
    }

     // This function fires when the user selects a searchbox picklist item.
      // It will do a nearby search using the selected query string or place.
      function searchBoxPlaces(searchBox) {
        hideMarkers(placeMarkers);
        var places = searchBox.getPlaces();
        // For each place, get the icon, name and location.
        createMarkersForPlaces(places);
        if (places.length == 0) {
          window.alert('We did not find any places matching that search!');
        }
      }

      // This function firest when the user select "go" on the places search.
      // It will do a nearby search using the entered query string or place.
      function textSearchPlaces() {
        var bounds = map.getBounds();
        hideMarkers(placeMarkers);
        var placesService = new google.maps.places.PlacesService(map);
        placesService.textSearch({
          query: document.getElementById('places-search').value,
          bounds: bounds
        }, function(results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            createMarkersForPlaces(results);
          }
        });
      }
