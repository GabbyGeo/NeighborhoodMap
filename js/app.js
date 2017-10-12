 /*jshint esversion: 6 */
 
 var map;
 var marker;
 var largeInfowindow;
 var bounds;
 var markers = [];
 var locations = [{
         title: 'Campo de Fiori',
         location: {
             lat: 41.8956,
             lng: 12.4722
         },
         type: 'Markets',
     },
     {
         title: 'Colosseum',
         location: {
             lat: 41.8902,
             lng: 12.4922
         },
         type: 'Ancient Sights'
     },
     {
         title: 'Galleria Nazionale Arte Moderna',
         location: {
             lat: 41.9170,
             lng: 12.4822
         },
         type: 'The Arts'
     },
     {
         title: 'Musea Vaticana',
         location: {
             lat: 41.9029,
             lng: 12.4534
         },
         type: 'Churches'
     },
     {
         title: 'Pantheon',
         location: {
             lat: 41.8986,
             lng: 12.4769
         },
         type: 'Ancient Sights'
     },
     {
         title: 'Santa Maria in Trastevere',
         location: {
             lat: 41.8895,
             lng: 12.4697
         },
         type: 'Churches'
     },
     {
         title: 'Teatro dell Opera di Roma',
         location: {
             lat: 41.9009,
             lng: 12.4953
         },
         type: 'The Arts'
     },
 ];

 //create the map 
 function initMap() {
     // Constructor creates a new map 
     var mapCreate = {
         center: new google.maps.LatLng(41.8850, 12.4964),
         zoom: 12,
         mapTypeControl: false
     };

     map = new google.maps.Map(document.getElementById("map"), mapCreate);
     largeInfowindow = new google.maps.InfoWindow();
     var bounds = new google.maps.LatLngBounds();

     //created function to avoid function declared within loop  
     function clickActivate() {
         populateInfoWindow(this, largeInfowindow);
     }

     function clickBounce() {
         toggleBounce(this);
     }

     for (var i = 0; i < locations.length; i++) {

         // Get the position from the location array.
         var position = locations[i].location;
         var title = locations[i].title;
         // Create a marker per location, and put into markers array.
         var marker = new google.maps.Marker({
             map: map,
             position: position,
             title: title,
             animation: google.maps.Animation.DROP,
             id: i
         });
         // Push the marker to our array of locations.
         locations[i].marker = marker;
         // Create an onclick event to open an infowindow at each marker.

         marker.addListener('click', clickActivate);

         marker.addListener('click', clickBounce);

         bounds.extend(locations[i].location);
     }

     // Extend the boundaries of the map for each marker
     map.fitBounds(bounds);

 }
 // This function populates the infowindow when the marker is clicked. 
 function populateInfoWindow(marker, infowindow) {
     var index = marker.id;
     var location = locations[index];

     // reset content 
     largeInfowindow.setContent('');
     largeInfowindow.open(map, location.marker);
     //get foursquae info
     $.ajax({
         url: 'https://api.foursquare.com/v2/venues/search?ll=' + locations[index].location.lat + ',' + locations[index].location.lng + '&intent=match&name=' + location.title + '&client_id=KDAKM2KYDGZAJCFQK4ZKZTTPNSCYT5ERMVDBRQK5EWLCCEQV' + '&client_secret=BR5ACIFXJRXEDJK0XICTMYK4UAUQUJ1S12QZCF1ZYB4IHNK4' + '&v=20170526'
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
 }
 self.scrollTo = function(el) {
     $('html, body').animate({
         scrollTop: $(el).offset().top
     }, "slow");
 };



 //adding bounce functionality to the marker when clicked.
 //code obtained from https://developers.google.com/maps/documentation/javascript/examples/marker-animations
 function toggleBounce(marker) {

     if (marker.getAnimation() !== null) {
         marker.setAnimation(null);
     } else {
         marker.setAnimation(google.maps.Animation.BOUNCE);
         //to make the bouncing stop after a few ms
         setTimeout(function() {
             marker.setAnimation(null);
         }, 1500);
     }
 }
 //location class
 var Location = function(data) {
     this.title = ko.observable(data.title);
     this.location = ko.observable(data.location);
     this.type = ko.observable(data.type);
     this.visible = ko.observable(true);
 };

 //view model
 var ViewModel = function() {
     var self = this;
     self.currentSight = ko.observable();
     //allow locations to be filtered based on type
     //create empty filter list array
     self.filterList = [];

     locations.map(location => {
         if (!self.filterList.includes(location.type)) {
             self.filterList.push(location.type);
         }
     });
     self.locationsArray = ko.observableArray(locations);
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
     //trigger click event when list is clicked
     //zoom to marker and center
     self.getVenues = function(clickedItem) {
         map.setZoom(17);
         map.setCenter(clickedItem.marker.getPosition());
         var index = clickedItem.id;
         var marker = clickedItem.marker;
         google.maps.event.trigger(marker, 'click');
     };
 };

 //error handling
 mapError = () => {
  alert("Sorry, there is a problem loading this page.  Please try again.");
 };

 var vm = new ViewModel();
 ko.applyBindings(vm);

