
function Map(element, engine, centre) {
    this.engine = engine;
    this.map = this.engine.map(element).setView(centre, 13);
    this.engine.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    var marker = this.engine.marker(centre).addTo(this.map);
}

Map.prototype.addPlaque = function(plaque) {
    var marker = this.engine.marker(plaque.latlng()).addTo(this.map);
    marker.bindPopup(plaque.info());
    return this;
}

function Plaque(data) {
    this.data = data['plaque'];
}

Plaque.prototype.latlng = function() {
    var latlng = [];
    console.log(this.data);
    latlng[0] = this.data['latitude'];
    latlng[1] = this.data['longitude'];
    return latlng;
}

Plaque.prototype.info = function() {
    var info = '';
    info += '<h2>' + this.data['title'] + '</h2>';
    info += '<p>' + this.data['inscription'] + '</p>';
    if (this.data['erected_at']) {
        info += '<p>Erected: ' + this.data['erected_at'] + '</p>';
    }
    return info;
}

function Client(lat, lng) {
    this.xhr = new XMLHttpRequest();
    this.xhr.open('GET', '/plaques/' + lat + '/' + lng);
}

Client.prototype.getPlaques = function(callback, errorback, context) {
    var self = this;
    this.xhr.onreadystatechange = function(e) {
        if (self.xhr.readyState == self.xhr.DONE) {
            var json = JSON.parse(self.xhr.response);
            if (context) {
                callback.call(context, json);
            } else {
                callback(json);
            }
        }
    }
    this.xhr.send();
    return this;
}

function App(mapElement, mapEngine) {
    this.mapElement = mapElement;
    this.mapEngine = mapEngine;
    
    var self = this;
    if (this.hasGeo(navigator)) {
        navigator.geolocation.getCurrentPosition(function(e) {
            var location = [e.coords.latitude, e.coords.longitude];
            self.setup(location);
        });
    }
}

App.prototype.hasGeo = function(navigator) {
    var hasGeo = false;
    if (navigator.geolocation.getCurrentPosition) {
        hasGeo = true;
    }
    return hasGeo;
}

App.prototype.setup = function(location) {
    var map = new Map(this.mapElement, this.mapEngine, location);
    var client = new Client(location[0], location[1]);
    var addPlaquesToMap = function(data) {
        var plaques = data.map(function(p){return new Plaque(p);});
        var addPlaque = function(plaque) {
            map.addPlaque.call(map, plaque)
        }
        plaques.forEach(addPlaque);
    };
    client.getPlaques(addPlaquesToMap);
}
