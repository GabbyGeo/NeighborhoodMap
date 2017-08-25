  var map;
      // Create a new blank array for all the listing markers.
  var markers = [];

  var initialData = {
    filters: ["None", "Ancient Ruins", "Markets", "Churches"],
    items: [{title:'Colosseum', type: 'Ancient Ruins'}, 
            {title:'Campo de Fiori', type: 'Markets'}, 
            {title:'Santa Maria in Trastevere', type: 'Churches'},
            {title: 'Basilica de San Clemente al Laterano', type: 'Churches'},
            ],
        };

  var locations = [
          {title: 'Colosseum', location: {lat: 41.8902, lng: 12.4922}},
          {title: 'Campo de Fiori', location: {lat: 41.8956, lng: 12.4722}},
          {title: 'Santa Maria in Trastevere', location: {lat: 41.8895, lng: 12.4697}},
          {title: 'Basilica de San Clemente al Laterano', location: {lat: 41.8893, lng: 12.4976}}
        ];

      function initMap() {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 41.9028, lng: 12.4964},
          zoom: 13,
          mapTypeControl: false
        });

        
        
        var largeInfowindow = new google.maps.InfoWindow();
        // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < locations.length; i++) {
          // Get the position from the location array.
          var position = locations[i].location;
          var title = locations[i].title;
          // Create a marker per location, and put into markers array.
           var marker = new google.maps.Marker({
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
        }
        document.getElementById('show-sights').addEventListener('click', showSights);
        document.getElementById('hide-sights').addEventListener('click', hideSights);
      }
      // This function populates the infowindow when the marker is clicked. We'll only allow
      // one infowindow which will open at the marker that is clicked, and populate based
      // on that markers position.
      function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<div>' + marker.title + '</div>');
          infowindow.open(map, marker);
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
        }
      }
      // This function will loop through the markers array and display them all.
      function showSights() {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
      }
      // This function will loop through the listings and hide them all.
      function hideSights() {
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
      };

  var Sights = function(data) {
    this.title = ko.observable(data.items);
  }

  this.sightList = ko.observableArray([]);

    initialData.items.forEach(function(sightItem) {
    self.sightList.push( new Sights(sightItem) );
  });

 var ViewModel = function(data) {
    var self = this;
    self.filters = ko.observableArray(data.filters);
    self.filter = ko.observable('');
    self.items = ko.observableArray(data.items);
    self.filteredItems = ko.computed(function() {
        var filter = self.filter();
        if (!filter || filter == "None") {
            return self.items();
        } else {
            return ko.utils.arrayFilter(self.items(), function(i) {
                return i.type == filter;
            });
        }
    });
  };

  ko.applyBindings(new ViewModel(initialData));