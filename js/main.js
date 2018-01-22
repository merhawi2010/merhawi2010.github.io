var markers = [];
var map;
var locations = [{
    title: 'GOETHEHAUS',
    location: {
        "lat": 50.111288275591086,
        "lng": 8.677793846600604
    }
}, {
    title: 'SCHIRN KUNSTHALLE FRANKFURT',
    location: {
        "lat": 50.110290772309455,
        "lng": 8.68354167036771
    }
}, {
    title: 'MUSEUM FUER MODERNE KUNST',
    location: {
        "lat": 50.11172031491597,
        "lng": 8.684641359306866
    }
}, {
    title: 'MUSEUM ANGEWANDTE KUNST',
    location: {
        "lat": 50.10641342684271,
        "lng": 8.680892624713572
    }
}, {
    title: 'FRANKFURTER KUNSTVEREIN',
    location: {
        "lat": 50.11076046602411,
        "lng": 8.683153467472087
    }
}, {
    title: 'PORTIKUS',
    location: {
        "lat": 50.10802832672125,
        "lng": 8.687376493094742
    }
}];

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 50.110290772309455,
            lng: 8.68354167036771
        },
        zoom: 20
    });
    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    // The following group uses the location array to create an array of markers on initialize.
    locations.forEach(function (location) {
        // Get the position from the location array.
        var position = location.location;
        var title = location.title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function () {
            map.setZoom(15);
            map.setCenter(marker.getPosition());
            populateInfoWindow(this, largeInfowindow);
            animator(this);
        });
        bounds.extend(marker.position);
    });
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);
}
//bounces mark when clicked
function animator(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    // ends animation after 2 seconds
    setTimeout(function () {
        marker.setAnimation(null);
    }, 2000);
}
// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.marker = null;
        });
        //retrive data from Wikipedia and sets as a content of infowindow
        $.ajax({
            url: 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json',
            dataType: 'jsonp',
        }).done(function (data) {
            infowindow.setContent('<h3>' + data[0] + '</h3>' + '<div class="cliped"><p>' + data[2][0] + '</p><a target="_blank" href="' + data[3][0] + '">Read more on Wikipedia</a></div>');
        }).fail(function () {
            errorHandler();
        });
        infowindow.open(map, marker);
    }
}
var MyLocation = function (locations, i) {
    this.position = locations.location;
    this.title = locations.title;
    this.id = i;
};
var listViewModel = function () {
    this.locationList = ko.observableArray([]);
    locations.forEach(function (locations, i) {
        this.locationList.push(new MyLocation(locations, i));
    }, this);
    this.searchTerm = ko.observable('');
    //filters location list based on user's input
    this.filteredItems = ko.dependentObservable(function () {
        var term = this.searchTerm().toUpperCase();
        var filteredLocations = ko.observableArray([]);
        if (!term) {
            markers.forEach(function (marker) {
                marker.setMap(map);
            });
            return this.locationList();
        } else {
            //filters out markers that match users input only and stores it in filtered location array
            this.locationList().forEach(function (location, i) {
                if (location.title.indexOf(term) > -1) {
                    filteredLocations.push(location);
                    markers[i].setMap(map);
                } else {
                    markers[i].setMap(null);
                }
            });
            return filteredLocations();
        }
    }, this);
    //attaches click event to a marker
    this.clickEventMarker = function (location) {
        google.maps.event.trigger(markers[location.id], "click");
    };
    //hamburgerMenu
    this.isOpen = ko.observable(false);
    this.toggle = ko.observable(function () {
        this.isOpen(!this.isOpen());
    }, this);
};
//informs the user when error occurs
var errorHandler = function () {
    alert('Oops! Please check your connection');
};
ko.applyBindings(new listViewModel());