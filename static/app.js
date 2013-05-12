var Tools = {
    precision: function(n) {
        var accuracy = 10000;
        return parseInt(n * accuracy) / accuracy;
    }
};

function Map(element, engine) {
    this.plaques = {};
    this.engine = engine;
    this.map = this.engine.map(element, {
        center: [51.507222, -0.1275],
        zoom: 16
    });
    this.engine.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
}

Map.prototype.setCentre = function(location) {
    var icon = this.engine.icon({
        iconUrl: '/static/you-are-here.png'
    }),
    marker = this.engine.marker(location, {icon: icon, title: 'You are here'});
    this.map.panTo(location);
    marker.addTo(this.map);
    return this;
}

Map.prototype.hasPlaque = function(plaque) {
    var p = this.plaques[plaque.id];
    return p ? true : false;
}

Map.prototype.addPlaque = function(plaque) {
    if (!this.hasPlaque(plaque)) {
        console.log("Adding plaque", plaque.id);
        var marker = this.engine.marker(plaque.latlng()).addTo(this.map);
        marker.bindPopup(plaque.info());
        this.plaques[plaque.id] = plaque;
    } else {
        console.log("Not adding plaque", plaque.id);
    }
    return this;
}

Map.prototype.getBounds = function() {
    return this.map.getBounds();
}

Map.prototype.onMoveEnd = function(callback) {
    this.map.on('moveend', callback);
    return this;
}

function Plaque(data) {
    this.data = data['plaque'];
    this.id = this.data.id;
}

Plaque.prototype.latlng = function() {
    var latlng = [];
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
    if (this.data['photographed?']) {
        info += '<p><img src="' + this.data['thumbnail_url'] + '"></p>';
    }
    return info;
}

function Client() {
    this.xhr = new XMLHttpRequest();
}

Client.prototype.getPlaques = function(bounds, callback) {
    var self = this,
        se = bounds.getSouthEast(),
        nw = bounds.getNorthWest();
    this.xhr.open('GET', '/plaques/' + 
        Tools.precision(nw.lat) + '/' + 
        Tools.precision(nw.lng) + '/' + 
        Tools.precision(se.lat) + '/' + 
        Tools.precision(se.lng) 
    );
    this.xhr.onreadystatechange = function(e) {
        if (self.xhr.readyState == self.xhr.DONE) {
            var json = JSON.parse(self.xhr.response);
            callback(json);
        }
    }
    this.xhr.send();
    return this;
}

function App(mapElement, mapEngine, navigator) {
    this.mapElement = mapElement;
    this.mapEngine = mapEngine;
    this.nav = navigator;
    this.map = new Map(this.mapElement, this.mapEngine);
}

App.prototype.hasGeo = function() {
    var hasGeo = false;
    if (this.nav.geolocation.getCurrentPosition) {
        hasGeo = true;
    }
    return hasGeo;
}

App.prototype.init = function() {
    var self = this;
    if (this.hasGeo()) {
        this.nav.geolocation.getCurrentPosition(function(e) {
            var lat = Tools.precision(e.coords.latitude),
                lng = Tools.precision(e.coords.longitude),
                location = [lat, lng];
            self.setup(location);
        });
    }
}

App.prototype.setup = function(location) {
    var self = this;
    this.map.setCentre(location);
    function getPlaques() {
        var client = new Client(),
            bounds = self.map.getBounds(),
            addPlaquesToMap = function(data) {
                var plaques = data.map(function(p){return new Plaque(p);});
                var addPlaque = function(plaque) {
                    self.map.addPlaque.call(self.map, plaque)
                }
                plaques.forEach(addPlaque);
            };
        client.getPlaques(bounds, addPlaquesToMap);
    }
    getPlaques();
    this.map.onMoveEnd(getPlaques);
}
