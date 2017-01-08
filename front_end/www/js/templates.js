(function() {
  var templates = {};

  var templatesNode = document.getElementById('templates');
  [].forEach.call(templatesNode.childNodes, function(element) {
    if(element instanceof HTMLElement) {
      templates[element.attributes.getNamedItem('data-template-name').value] = element;
    }
  });

  templatesNode.parentNode.removeChild(templatesNode);

  window.copyTemplate = function copyTemplate(name) {
    var template = templates[name];

    if(!template) {
      throw new Error('Template not found: ' + name);
    }
    
    return template.cloneNode(true);
  };

  window.showTemplate = function showTemplate(name) {
    var node = copyTemplate(name);

    var appNode = document.getElementById('app');
    clearNode(appNode);
    appNode.appendChild(node);
  };

  window.clearNode = function clearNode(node) {
    while(node.firstChild) { node.removeChild(node.firstChild); }
  };
})();
