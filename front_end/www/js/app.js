function main() {
  showTemplate('main');

  var input_begin = locationAutocompleteWidget(document.getElementById('input_begin'), 'begin');
  var input_end = locationAutocompleteWidget(document.getElementById('input_end'), 'end');
  var gps_button = document.getElementById('button_location');

  // potrzebne dla geolokalizacji
  document.addEventListener("deviceready", onDeviceReady, false);
  function onDeviceReady() {
    console.log("navigator.geolocation works well");
  }

  document.getElementById('button_search').addEventListener('click', function() {
    var begin = input_begin.getSelectedItem(); // TODO check null
    var end = input_end.getSelectedItem();

    goTo('map', {
      begin_lat: begin.lat,
      begin_lon: begin.lon,
      end_lat: end.lat,
      end_lon: end.lon,
    });
  });

  gps_button.addEventListener('click', function() {
    navigator.geolocation.getCurrentPosition(gpsSuccess(input_begin), onGpsError,
        { enableHighAccuracy: true });
  });

  var aboutLink = document.querySelector('.about-link');
  aboutLink.addEventListener('click', function(event) {
    event.preventDefault();
    var parent = aboutLink.parentNode;
    parent.replaceChild(copyTemplate('about'), aboutLink);
  });
}

function gpsSuccess(widget) {

  return function onGpsSuccess(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;

    item = {};
    item.display_name = lat + " " + lon;
    item.lat = lat;
    item.lon = lon;
    widget.setSelectedItem(item);
    };
}

function onGpsError(error) {
  console.log('code: ' + error.code + '\n' +
        'message: ' + error.message + '\n');
  showErrorMessage("Nie udało się pobrać współrzędnych z GPS");
}

function delayed(fn, ms) {
  var timer;

  return function() {
    if(timer) {
      clearTimeout(timer);
    }

    var self = this, args = arguments;

    timer = setTimeout(function() {
      fn.apply(self, args);
    }, ms);
  };
}

function map(params) {
  showTemplate('map');

  var mymap = L.map("mapid", {
    zoomControl: false
  });
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(mymap);

  var beginPoint = parsePoint(params.begin_lat, params.begin_lon);
  var endPoint = parsePoint(params.end_lat, params.end_lon);
  mymap.fitBounds(L.latLngBounds([beginPoint, endPoint]), {});

  queryRoute(params, function(data) {

    var walkPathColor = '#aaa';
    var beginPointColor = '#ff8000';
    var endPointColor = '#00d000';
    var routeColor = '#000080';
    var stationColor = '#0000d0';

    addPoint(beginPoint, beginPointColor);
    addPoint(endPoint, endPointColor);

    if (data.path.points == null) {
      addPath([beginPoint, endPoint], walkPathColor);
      showPanicMessage();
      return;
    }

    var routePoints = data.path.points.coordinates.map(fixLatLng);
    var stations = data.stations;

    mymap.fitBounds(L.latLngBounds(routePoints.concat([beginPoint, endPoint])), {});

    addPath([beginPoint, stations[0].location], walkPathColor);
    addPath([stations[stations.length - 1].location, endPoint], walkPathColor);

    addPath(routePoints, routeColor);

    data.stations.forEach(function(station) {
      var label = station.number + ' ' + station.name;
      addPoint(station.location, stationColor, label);
    });

    function addPath(path, color) {
      return L.polyline(path, {
        color: color, opacity: 0.8,
      }).addTo(mymap);
    }

    function addPoint(point, color, label) {
      var marker = L.circleMarker(point,
          { color: color, opacity: 0.8, fillOpacity: 0.8, radius: 7 });

      if(label)
        marker.bindLabel(label, { noHide: true });

      marker.addTo(mymap);
      return marker;
    }

    document.querySelector('.route-time').innerText = formatTime(data.path.time);
    document.querySelector('.route-distance').innerText = formatDistance(data.path.distance);

  });

  function fixLatLng(point) {
    return [point[1], point[0]];
  }

  function parsePoint(lat, lon) {
    return [parseFloat(lat), parseFloat(lon)];
  }

  function formatTime(ms) {
    var seconds = ms / 1000;

    var hoursStr = '';

    if(seconds > 3600) {
      var hours = Math.floor(seconds / 3600);
      hoursStr = hours + ' godz. '; 
      seconds -= hours * 3600;
    }

    return hoursStr + Math.ceil(seconds / 60) + ' min';
  }

  function formatDistance(distance) {
    return Math.round(distance / 1000, 1) + ' km';
  }
}

window.addEventListener('load', function() {
  loadRoute();
});
