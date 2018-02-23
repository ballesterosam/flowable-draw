function _changeStateButton() {
  e.preventDefault();

  var startElementText = "";
  for (var i = 0; i < changeStateStartElements.length; i++) {
    if (startElementText.length > 0) {
      startElementText += ", ";
    }
    startElementText += changeStateStartElements[i].name;
  }

  var endElementText = "";
  for (var i = 0; i < changeStateEndElements.length; i++) {
    if (endElementText.length > 0) {
      endElementText += ", ";
    }
    endElementText += changeStateEndElements[i].name;
  }

  $.confirm({
    title: "Change current activity?",
    content:
      "Are you sure you want to move the current state from (" +
      startElementText +
      ") to (" +
      endElementText +
      ")",
    buttons: {
      confirm: function() {
        $.ajax({
          type: "post",
          url:
            "./app/rest/admin/process-instances/" +
            instanceId +
            "/change-state",
          contentType: "application/json; charset=utf-8",
          data: JSON.stringify({
            cancelActivityIds: changeStateStartElementIds,
            startActivityIds: changeStateEndElementIds
          }),
          success: function() {
            paper.clear();
            _showProcessDiagram();
          }
        });
      },
      cancel: function() {}
    }
  });
}