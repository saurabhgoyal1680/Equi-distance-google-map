var myLatLng = { lat: 38.3460, lng: -0.4907 };
var mapOptions = {
    center: myLatLng,
    zoom: 7,
    mapTypeId: google.maps.MapTypeId.ROADMAP

};

var previousMarkers = [];

var map = new google.maps.Map(document.getElementById('map'), mapOptions);

var directionsService = new google.maps.DirectionsService();

var directionsDisplay = new google.maps.DirectionsRenderer();

directionsDisplay.setMap(map);

function clearPreviousMarkers() {
    previousMarkers.forEach(function(marker){
        marker.setMap(null);
    });
    previousMarkers = [];
}

function calcRoute() {
    clearPreviousMarkers();
    directionsDisplay.setDirections(null);
    var request = {
        origin: document.getElementById("from").value,
        destination: document.getElementById("to").value,
        travelMode: google.maps.TravelMode.DRIVING, //WALKING, BYCYCLING, TRANSIT
        unitSystem: google.maps.UnitSystem.METRIC
    }

    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
            addMarkings(result);
        } else {
            directionsDisplay.setDirections({ routes: [] });
            map.setCenter(myLatLng);
        }
    });
}

function addMarkings(result) {
    var markerDistance = parseInt(document.getElementById("markingDistance").value);
    if(isNaN(markerDistance)) markerDistance = 50;
    document.getElementById("searchInfo").innerHTML = "Total Distance: "+result.routes[0].legs[0].distance.text+"<br>Marking distance: "+markerDistance+" meters";
    var steps = result.routes[0].legs[0].steps;
    var path = [];
    steps.forEach(function(step){
        path = path.concat(step.path);
    });
    
    var currDist = 0;
    for(var i=1;i<path.length;i++){
        var dist = path[i-1].distanceFrom(path[i]);
        currDist += dist;
        if(currDist >= markerDistance){
            path[i-1] = moveTowards(path[i-1], path[i], dist - (currDist - markerDistance));
            addMarker(path[i-1]);
            currDist = 0;
            i--;
        }
    }
}

Number.prototype.toRad = function () {
    return this * Math.PI / 180;
}

Number.prototype.toDeg = function () {
    return this * 180 / Math.PI;
}

function moveTowards(point1, point2, distance) {
    var lat1 = point1.lat().toRad();
    var lon1 = point1.lng().toRad();
    var lat2 = point2.lat().toRad();
    var lon2 = point2.lng().toRad();
    var dLon = (point2.lng() - point1.lng()).toRad();

    // Find the bearing from this point to the next.
    var brng = Math.atan2(Math.sin(dLon) * Math.cos(lat2),
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) *
        Math.cos(dLon));

    var angDist = distance / 6371000;  // Earth's radius.

    // Calculate the destination point, given the source and bearing.
    lat2 = Math.asin(Math.sin(lat1) * Math.cos(angDist) +
        Math.cos(lat1) * Math.sin(angDist) *
        Math.cos(brng));

    lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(angDist) *
        Math.cos(lat1),
        Math.cos(angDist) - Math.sin(lat1) *
        Math.sin(lat2));

    if (isNaN(lat2) || isNaN(lon2)) return null;

    return new google.maps.LatLng(lat2.toDeg(), lon2.toDeg());
}


google.maps.LatLng.prototype.distanceFrom = function (newLatLng) {
    var R = 6378100; // meters
    var lat1 = this.lat();
    var lon1 = this.lng();
    var lat2 = newLatLng.lat();
    var lon2 = newLatLng.lng();
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

function addMarker(location){
    const marker = new google.maps.Marker({
        position: location,
        map: map,
    });
    previousMarkers.push(marker);
}



//create autocomplete objects for all inputs
var options = {
    types: ["address"]
}

var input1 = document.getElementById("from");
var autocomplete1 = new google.maps.places.Autocomplete(input1, options);

var input2 = document.getElementById("to");
var autocomplete2 = new google.maps.places.Autocomplete(input2, options);
