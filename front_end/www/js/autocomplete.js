(function() {
  var autocompleteNode = document.getElementById('autocomplete');
  var contentsNode = autocompleteNode.querySelector('.contents');

  var suppressHide = false;

  autocompleteNode.addEventListener('mousedown', function() {
    suppressHide = true;
  });

  window.addEventListener('mouseup', function() {
    if(!suppressHide) {
      hideAutocomplete();
    }
    suppressHide = false;
  });

  window.showAutocomplete = function showAutocomplete(inputField, contents) {
    var clientRect = inputField.getBoundingClientRect();
    var position = {
      left: clientRect.left + window.scrollX,
      bottom: clientRect.bottom + window.scrollY,
    };

    autocompleteNode.style.display = '';
    autocompleteNode.style.left = position.left + 'px';
    autocompleteNode.style.top = position.bottom + 'px';
    autocompleteNode.style.minWidth = clientRect.width + 'px';


    clearNode(contentsNode);

    contents.forEach(function(element) {
      contentsNode.appendChild(element);
    });
  };

  window.hideAutocomplete = function hideAutocomplete() {
    autocompleteNode.style.display = 'none';
  };
})();
