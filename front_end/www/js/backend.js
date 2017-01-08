(function() {

  var MAPQUEST_KEY = 'WVNR0GB13tGBhlYkmTbLi8hSvNNJyr4y';

  function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();

    xhr.onload = function() {
      callback(JSON.parse(xhr.responseText));
    };

    // TODO onerror

    xhr.open('GET', url);
    xhr.send();
  }

  window.queryLocations = function queryLocations(q, callback) {
    var url = 'http://open.mapquestapi.com/nominatim/v1/search.php?key=' + MAPQUEST_KEY
      + '&format=json&limit=10&accept-language=pl&bounded=1&viewbox=20.80,52.27,21.23,52.05&q='
      + encodeURIComponent(q);

    return getJSON(url, callback);
  };

  window.queryRoute = function queryRoute(data, callback) {
    var url = 'http://api.ceburilo.pl/route'
      + '?beg_lat=' + data.begin_lat
      + '&beg_lon=' + data.begin_lon
      + '&dest_lat=' + data.end_lat
      + '&dest_lon=' + data.end_lon;

    return getJSON(url, callback);
  };

})();
