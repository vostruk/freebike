window.addEventListener('hashchange', loadRoute);

function loadRoute() {
  var hash = parseHash(location.hash);
  var match;

  if(hash.path == 'map') {
    map(hash.params);
  } else {
    main();
  }
}

function parseHash(hash) {
  var match = /^#?(.*?)(\?(.*))?$/.exec(hash);

  var path = match[1];
  var qs = match[3];
  var params = {};
  if(qs) {
    qs.split('&').forEach(function(param) {
      var a = param.split('=');
      var key = a[0];
      var val = a.length > 1? a[1]: true;
      params[key] = val;
    });
  }
  return { path: path, params: params };
}

function goTo(path, params) {
  var hash = '#' + path + '?' + Object.keys(params).map(function(key) { return key + '=' + params[key]; }).join('&');
  location.hash = hash;
}
