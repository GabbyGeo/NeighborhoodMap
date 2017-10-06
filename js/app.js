 var map;
 var marker;
 var largeInfowindow;
 var bounds;
 var searchBox;
 var initialData = [
     {
         title: 'Campo de Fiori',
         LatLng: {
             lat: 41.8956,
             lng: 12.4722
         },
         type: 'Markets'
     },
     {
         title: 'Colosseum',
         LatLng: {
             lat: 41.8902,
             lng: 12.4922
         },
         type: 'Ancient Sights'
     },
     {
         title: 'Galleria Nazionale Arte Moderna',
         LatLng: {
             lat: 41.9170,
             lng: 12.4822
         },
         type: 'The Arts'
     },
     {
         title: 'Musea Vaticana',
         LatLng: {
             lat: 41.9029,
             lng: 12.4534
         },
         type: 'Churches'
     },
     {
         title: 'Pantheon',
         LatLng: {
             lat: 41.8986,
             lng: 12.4769
         },
         type: 'Ancient Sights'
     },
     {
         title: 'Santa Maria in Trastevere',
         LatLng: {
             lat: 41.8895,
             lng: 12.4697
         },
         type: 'Churches'
     },
     {
         title: 'Teatro dell Opera di Roma',
         LatLng: {
             lat: 41.9009,
             lng: 12.4953
         },
         type: 'The Arts'
     },
 ];

 //sights class
 var Location = function(data) {
     this.title = ko.observable(data.title);
     this.LatLng = ko.observable(data.LatLng);
     this.type = ko.observable(data.type);
     this.visible = ko.observable(true);
 };

//view model
 var ViewModel = function() {
     var self = this;
     self.currentSight = ko.observable();

     //create empty filter list array
     self.filterList = [];

     initialData.map(location => {
         if (!self.filterList.includes(location.type)) {
             self.filterList.push(location.type);
         }
     });
     self.locationsArray = ko.observableArray(initialData);
     self.type = ko.observableArray(self.filterList);
     self.selectedCategory = ko.observable();

     //filters the list of sights 
     self.filteredItems = ko.computed(() => {
         if (!self.selectedCategory()) {
             self.locationsArray().forEach(function(location) {
                 if (location.marker) {
                     location.marker.setVisible(true);
                 }
             });
             return self.locationsArray();
         } else {
             largeInfowindow.close();
             return ko.utils.arrayFilter(self.locationsArray(), location => {
                 var match = location.type === self.selectedCategory();
                 location.marker.setVisible(match);
                 return match;
             });
         }
     });

     self.getVenues = function(location) {
         map.setZoom(16);
         map.setCenter(location.marker.getPosition());
         if (location.marker.getAnimation() !== null) {
             location.marker.setAnimation(null);
         } else {
             location.marker.setAnimation(google.maps.Animation.BOUNCE);
             setTimeout(function() {
                 location.marker.setAnimation(null);
             }, 1400); // stop after 2 bounces
         }
         // reset content 
         largeInfowindow.setContent('');
         largeInfowindow.open(map, location.marker);


         $.ajax({
             url: 'https://api.foursquare.com/v2/venues/search?ll=' + location.LatLng.lat + ',' + location.LatLng.lng + '&intent=match&name=' + location.title + '&client_id=JMBQJXEH5V0OWT1WJ4SI0HROBCEE2NZRPWDNRYZQ4ENK3RVF&client_secret=ZWZC2S3KW4XAN33HJHCMY0L1Q0X5MOKELZHS4SVI5J5CM25D&v=20170526'
         }).done(function(data) {
             var venue = data.response.venues[0];
             //set fetched info as properties of location object
             location.id = ko.observable(venue.id);
             // use id to get photo
             $.ajax({
                 url: 'https://api.foursquare.com/v2/venues/' + location.id() + '?oauth_token=R5YPRIGI1HFJXM15BEWHFGKPVIJBTXJOKK5BMODOQFZFB115&v=20170530'
             }).done(function(data) {
                 // set first photo url as the location photo property
                 var photos = data.response.venue.photos.groups["0"].items || "there is no photo";
                 var url = data.response.venue.url || 'No url provided';
                 var name = data.response.venue.name || 'No name provided';
                 var rating = data.response.venue.rating || 'No rating provided';

                 largeInfowindow.setContent('<div class="infowindow"><h6>' + name + '</h6> Rating: ' + '<span class="rating">' + rating + '</span>' + '<img class="sq" src="' + photos[0].prefix + 'width200' + photos[0].suffix + '"><h8> Website <a class="web-links" href="http://' + url + '" target="_blank">' + url + '</a>' + ' </h8></div>');
                 // set current location and scroll user to information
                 self.scrollTo('#map');
             }).fail(function(err) {
                 // if there is an error, set error status 
                 alert("Sorry, there is an error in viewing the information");
             });
         }).fail(function(err) {
             // if there is an error, set error status
             alert("Sorry, there is an error in viewing the information");
         });
     }; // end getVenues 
     self.scrollTo = function(el) {
         $('html, body').animate({
             scrollTop: $(el).offset().top
         }, "slow");
     };
 };


 function initMap() {
     // Constructor creates a new map 
     var mapCreate = {
         center: new google.maps.LatLng(41.8850, 12.4964),
         zoom: 12,
         mapTypeControl: false
     };

     map = new google.maps.Map(document.getElementById("map"), mapCreate);
     largeInfowindow = new google.maps.InfoWindow();
     showMarkers(vm.locationsArray());
 }



 function showMarkers(locations) {
     var markers = [];
     bounds = new google.maps.LatLngBounds();
     // The following group uses the location array to create an array of markers on initialize.
     for (var i = 0; i < locations.length; i++) {
         // Get the position from the location array.
         var position = locations[i].LatLng;
         var title = locations[i].name;
         // Create a marker per location, and put into markers array.
         marker = new google.maps.Marker({
             map: map,
             position: position,
             title: title,
             animation: google.maps.Animation.DROP,
             id: i
         });
         // Push the marker to our array of markers.
         markers.push(marker);
         vm.locationsArray()[i].marker = marker;
         // click handler for google maps marker
         google.maps.event.addListener(marker, 'click', (function(location, vm) {
             return function() {
                 // tell viewmodel to show this place
                 map.setZoom(16);
                 map.setCenter(location.marker.getPosition());
                 vm.getVenues(location);

             };
         })(locations[i], vm));
         bounds.extend(markers[i].position);
     }

 }

 var vm = new ViewModel();
 ko.applyBindings(vm);
