function locationAutocompleteWidget(inputElement, name) {
  var selectedItem = null;
  var lastInput = '';

  var lastSelected = getLastSelected();
  if(lastSelected) {
    setSelectedItem(lastSelected);
  }

  function triggerSearch() {
    if(document.activeElement == inputElement && (inputElement.value == '' ||
          selectedItem != null)) {
      var locations = getRecentLocations();
      displayAutocompleteResults(locations, true);
      return;
    }

    if(inputElement.value == lastInput) {
      return;
    }

    lastInput = inputElement.value;

    queryLocations(inputElement.value, function(results) {
      displayAutocompleteResults(results);
    });
  }

  triggerSearch = delayed(triggerSearch, 300);

  inputElement.addEventListener('input', function onInput() {
    selectedItem = null;
    triggerSearch();
  });

  inputElement.addEventListener('focus', function onFocus() {
    inputElement.select();
    triggerSearch();
  });

  function displayAutocompleteResults(results, isRecent) {
    showAutocomplete(inputElement,
        renderTopMarker().concat(results.map(renderItem)));

    function renderTopMarker() {
      if(isRecent) {
        return [copyTemplate('autocomplete-recent-marker')];
      } else if (results.length < 1) {
        return [copyTemplate('autocomplete-notavailable')];
      } else {
        return [];
      }
    }

    function renderItem(item) {
      var elem = copyTemplate('autocomplete-item');
      elem.querySelector('.name').innerText = item.display_name;

      elem.addEventListener('click', function() {
        setSelectedItem(item);
        addRecentLocation(item);
        saveLastSelected(item);
        hideAutocomplete();
      });
      return elem;
    }
  }

  function getRecentLocations() {
    try {
      return JSON.parse(localStorage.recentLocations);
    } catch (e) {
      return [];
    }
  }

  function addRecentLocation(item) {
    var locations = getRecentLocations();
    var newLocations = [].concat.apply([item],
        locations
        .filter(function(x) { return x.display_name != item.display_name; })
        .slice(0, 5))
    localStorage.recentLocations = JSON.stringify(newLocations);
  }

  function setSelectedItem(item) {
    selectedItem = item;
    lastInput = item.display_name;
    inputElement.value = item.display_name;
  }

  function saveLastSelected(item) {
    localStorage['lastSelected_' + name] = JSON.stringify(item);
  }

  function getLastSelected() {
    try {
      return JSON.parse(localStorage['lastSelected_' + name]);
    } catch (e) {
      return null;
    }
  }

  return {
    getSelectedItem: function() { return selectedItem; },
    setSelectedItem: setSelectedItem,
  };
}
