window.showErrorMessage = function(message) {
  var node = copyTemplate("error-msg");
  node.querySelector('.msg').innerText = message;
  var appNode = document.getElementById('app');
  appNode.insertBefore(node, appNode.childNodes[0]);
  setTimeout(function() {
    node.parentNode.removeChild(node);
    }, 5000);
}

window.showPanicMessage = function() {
  var modal = document.getElementById('myModal');
  var btn = document.getElementById("button_back");

  modal.style.display = "block";

  btn.onclick = function() {
    modal.style.display = "none";
    goTo("", "");
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
      goTo("", "");
    }
  }
}
