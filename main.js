var NORMAL_STROKE = 1;
var SEQUENCEFLOW_STROKE = 1.5;
var TASK_STROKE = 1;
var CALL_ACTIVITY_STROKE = 2;
var ENDEVENT_STROKE = 3;
var CURRENT_ACTIVITY_STROKE = 2;

var COMPLETED_COLOR = "#2674aa";
var TEXT_COLOR = "#373e48";
var CURRENT_COLOR = "#66AA66";
var HOVER_COLOR = "#666666";
var ACTIVITY_STROKE_COLOR = "#bbbbbb";
var ACTIVITY_FILL_COLOR = "#f9f9f9";
var MAIN_STROKE_COLOR = "#585858";

var TEXT_PADDING = 3;
var ARROW_WIDTH = 4;
var MARKER_WIDTH = 12;

var TASK_FONT = {
  font: "11px Arial",
  opacity: 1,
  fill: Raphael.rgb(0, 0, 0)
};

// icons
var ICON_SIZE = 16;
var ICON_PADDING = 4;

var INITIAL_CANVAS_WIDTH;
var INITIAL_CANVAS_HEIGHT;

var paper;
var viewBox;
var viewBoxWidth;
var viewBoxHeight;

var canvasWidth;
var canvasHeight;

var definitionId = $("#bpmnModel").attr("data-definition-id");
var instanceId = $("#bpmnModel").attr("data-instance-id");
var historyInstanceId = $("#bpmnModel").attr("data-history-id");
var serverId = $("#bpmnModel").attr("data-server-id");

var elementsAdded = new Array();
var elementsRemoved = new Array();
var changeStateStartElementIds = new Array();
var changeStateStartElements = new Array();
var changeStateStartGlowElements = new Array();
var changeStateEndElementIds = new Array();
var changeStateEndElements = new Array();
var changeStateEndGlowElements = new Array();

function _showTip(htmlNode, element) {
  var documentation = "";
  if (element.name && element.name.length > 0) {
    documentation += "<b>Name</b>: <i>" + element.name + "</i><br/><br/>";
  }

  var text;
  if (element.name && element.name.length > 0) {
    text = element.name;
  } else {
    text = element.id;
  }

  htmlNode.qtip({
    content: {
      text: documentation,
      title: {
        text: text
      }
    },
    position: {
      my: "top left",
      at: "bottom center",
      viewport: $(window)
    },
    hide: {
      fixed: true,
      delay: 100,
      event: "click mouseleave"
    },
    style: {
      classes: "ui-tooltip-kisbpm-bpmn"
    }
  });
}

function _addHoverLogic(element, type, defaultColor) {
  var strokeColor = _bpmnGetColor(element, defaultColor);
  var topBodyRect;
  if (type === "rect") {
    topBodyRect = paper.rect(
      element.x,
      element.y,
      element.width,
      element.height
    );
  } else if (type === "circle") {
    var x = element.x + element.width / 2;
    var y = element.y + element.height / 2;
    topBodyRect = paper.circle(x, y, 15);
  } else if (type === "rhombus") {
    topBodyRect = paper.path(
      "M" +
        element.x +
        " " +
        (element.y + element.height / 2) +
        "L" +
        (element.x + element.width / 2) +
        " " +
        (element.y + element.height) +
        "L" +
        (element.x + element.width) +
        " " +
        (element.y + element.height / 2) +
        "L" +
        (element.x + element.width / 2) +
        " " +
        element.y +
        "z"
    );
  }

  var opacity = 0;
  var fillColor = "#ffffff";
  if ($.inArray(element.id, elementsAdded) >= 0) {
    opacity = 0.2;
    fillColor = "green";
  }

  if ($.inArray(element.id, elementsRemoved) >= 0) {
    opacity = 0.2;
    fillColor = "red";
  }

  topBodyRect.attr({
    opacity: opacity,
    stroke: "none",
    fill: fillColor
  });
  _showTip($(topBodyRect.node), element);

  topBodyRect.mouseover(function() {
    paper.getById(element.id).attr({ stroke: HOVER_COLOR });
  });

  topBodyRect.mouseout(function() {
    paper.getById(element.id).attr({ stroke: strokeColor });
  });

  topBodyRect.click(function() {
    var startElementIndex = $.inArray(element.id, changeStateStartElementIds);
    var endElementIndex = $.inArray(element.id, changeStateEndElementIds);
    if (startElementIndex >= 0) {
      var glowElement = changeStateStartGlowElements[startElementIndex];
      glowElement.remove();

      changeStateStartGlowElements.splice(startElementIndex, 1);
      changeStateStartElementIds.splice(startElementIndex, 1);
      changeStateStartElements.splice(startElementIndex, 1);
    } else if (endElementIndex >= 0) {
      var glowElement = changeStateEndGlowElements[endElementIndex];
      glowElement.remove();

      changeStateEndGlowElements.splice(endElementIndex, 1);
      changeStateEndElementIds.splice(endElementIndex, 1);
      changeStateEndElements.splice(endElementIndex, 1);
    } else {
      if (element.current) {
        var startGlowElement = topBodyRect.glow({ color: "blue" });
        changeStateStartGlowElements.push(startGlowElement);
        changeStateStartElementIds.push(element.id);
        changeStateStartElements.push(element);
      } else {
        var endGlowElement = topBodyRect.glow({ color: "red" });
        changeStateEndGlowElements.push(endGlowElement);
        changeStateEndElementIds.push(element.id);
        changeStateEndElements.push(element);
      }
    }

    if (
      changeStateStartElements.length > 0 &&
      changeStateEndElements.length > 0
    ) {
      $("#changeStateButton").show();
    } else {
      $("#changeStateButton").hide();
    }
  });
}

function _zoom(zoomIn) {
  var tmpCanvasWidth, tmpCanvasHeight;
  if (zoomIn) {
    tmpCanvasWidth = canvasWidth * (1.0 / 0.9);
    tmpCanvasHeight = canvasHeight * (1.0 / 0.9);
  } else {
    tmpCanvasWidth = canvasWidth * (1.0 / 1.1);
    tmpCanvasHeight = canvasHeight * (1.0 / 1.1);
  }

  if (tmpCanvasWidth != canvasWidth || tmpCanvasHeight != canvasHeight) {
    canvasWidth = tmpCanvasWidth;
    canvasHeight = tmpCanvasHeight;
    paper.setSize(canvasWidth, canvasHeight);
  }
}

function _showProcessDiagram() {
  data = {
    elements: [
      {
        id: "startEvent1",
        name: "",
        x: 100.0,
        y: 163.0,
        width: 30.0,
        height: 30.0,
        type: "StartEvent",
        interrupting: true,
        properties: []
      },
      {
        id: "sid-CC7109A5-FB3B-47CC-99C7-F8D2519C4E8B",
        name: "Hello World",
        x: 175.0,
        y: 138.0,
        width: 100.0,
        height: 80.0,
        type: "UserTask",
        properties: []
      },
      {
        id: "sid-4AB3E4D7-A920-4993-BD39-F8F6B1DC5C59",
        name: "Decision",
        x: 356.5,
        y: 138.0,
        width: 100.0,
        height: 80.0,
        type: "ServiceTask",
        properties: [
          {
            name: "Field extensions",
            type: "list",
            value: ["decisionTaskThrowErrorOnNoHits - false"]
          },
          {
            name: "Use local scope for result variable",
            value: "false"
          }
        ]
      },
      {
        id: "sid-D5DF62D0-29DC-4DC0-BB9A-C27FE6FE2008",
        name: "",
        x: 501.5,
        y: 158.0,
        width: 40.0,
        height: 40.0,
        type: "ExclusiveGateway"
      },
      {
        id: "sid-6055CB82-CAE1-48D4-972A-860B7F7E166F",
        name: "Good",
        x: 615.0,
        y: 30.0,
        width: 100.0,
        height: 80.0,
        type: "UserTask",
        properties: []
      },
      {
        id: "sid-9EA275C1-B129-4A4A-80C2-C8F54359B8DB",
        name: "Bad",
        x: 615.0,
        y: 138.0,
        width: 100.0,
        height: 80.0,
        type: "UserTask",
        properties: []
      },
      {
        id: "sid-B34A2299-A935-4911-A13B-B14F501681B0",
        name: "",
        x: 760.0,
        y: 56.0,
        width: 28.0,
        height: 28.0,
        type: "EndEvent",
        properties: []
      },
      {
        id: "sid-8768C62A-0876-46F9-BDD1-4BC366F5DFF7",
        name: "",
        x: 760.0,
        y: 164.0,
        width: 28.0,
        height: 28.0,
        type: "EndEvent",
        properties: []
      }
    ],
    flows: [
      {
        id: "sid-732E3C14-47F9-4BC0-8A7D-C8FFD575D6D1",
        type: "sequenceFlow",
        sourceRef: "startEvent1",
        targetRef: "sid-CC7109A5-FB3B-47CC-99C7-F8D2519C4E8B",
        waypoints: [
          {
            x: 129.9499984899576,
            y: 178.0
          },
          {
            x: 174.9999999999917,
            y: 178.0
          }
        ],
        properties: []
      },
      {
        id: "sid-07975859-DB99-49D8-90C2-3E9B9E4AAF18",
        type: "sequenceFlow",
        sourceRef: "sid-CC7109A5-FB3B-47CC-99C7-F8D2519C4E8B",
        targetRef: "sid-4AB3E4D7-A920-4993-BD39-F8F6B1DC5C59",
        waypoints: [
          {
            x: 274.95000000000005,
            y: 178.0
          },
          {
            x: 356.5,
            y: 178.0
          }
        ],
        properties: []
      },
      {
        id: "sid-76492551-5E1E-44BA-B3E2-84D726659077",
        type: "sequenceFlow",
        sourceRef: "sid-4AB3E4D7-A920-4993-BD39-F8F6B1DC5C59",
        targetRef: "sid-D5DF62D0-29DC-4DC0-BB9A-C27FE6FE2008",
        waypoints: [
          {
            x: 456.4499999999977,
            y: 178.21623376623376
          },
          {
            x: 501.9130434782554,
            y: 178.41304347826085
          }
        ],
        properties: []
      },
      {
        id: "sid-EF1E4A60-3754-4A52-A591-7C9FD543A20A",
        type: "sequenceFlow",
        sourceRef: "sid-6055CB82-CAE1-48D4-972A-860B7F7E166F",
        targetRef: "sid-B34A2299-A935-4911-A13B-B14F501681B0",
        waypoints: [
          {
            x: 714.9499999999791,
            y: 70.0
          },
          {
            x: 760.0,
            y: 70.0
          }
        ],
        properties: []
      },
      {
        id: "sid-9C1899EC-CB64-4169-8A1E-4D9A0A98CC69",
        type: "sequenceFlow",
        sourceRef: "sid-9EA275C1-B129-4A4A-80C2-C8F54359B8DB",
        targetRef: "sid-8768C62A-0876-46F9-BDD1-4BC366F5DFF7",
        waypoints: [
          {
            x: 714.9499999999999,
            y: 178.0
          },
          {
            x: 760.0,
            y: 178.0
          }
        ],
        properties: []
      },
      {
        id: "sid-206DA555-F456-4902-9C45-5E54FB8D8EC4",
        type: "sequenceFlow",
        sourceRef: "sid-D5DF62D0-29DC-4DC0-BB9A-C27FE6FE2008",
        targetRef: "sid-6055CB82-CAE1-48D4-972A-860B7F7E166F",
        waypoints: [
          {
            x: 522.0,
            y: 158.5
          },
          {
            x: 522.0,
            y: 70.0
          },
          {
            x: 615.0,
            y: 70.0
          }
        ],
        properties: [
          {
            name: "Condition expression",
            value: "${decision}"
          }
        ]
      },
      {
        id: "sid-F4AA95AE-4366-4826-B95A-095D6800F1FB",
        type: "sequenceFlow",
        sourceRef: "sid-D5DF62D0-29DC-4DC0-BB9A-C27FE6FE2008",
        targetRef: "sid-9EA275C1-B129-4A4A-80C2-C8F54359B8DB",
        waypoints: [
          {
            x: 541.0098001402466,
            y: 178.43333333333334
          },
          {
            x: 614.999999999995,
            y: 178.17465034965034
          }
        ],
        properties: [
          {
            name: "Condition expression",
            value: "${!decision}"
          }
        ]
      }
    ],
    diagramBeginX: 115.0,
    diagramBeginY: 30.0,
    diagramWidth: 788.0,
    diagramHeight: 218.0
  };

  if (!data.elements || data.elements.length == 0) return;

  INITIAL_CANVAS_WIDTH = data.diagramWidth + 20;
  INITIAL_CANVAS_HEIGHT = data.diagramHeight + 50;
  canvasWidth = INITIAL_CANVAS_WIDTH;
  canvasHeight = INITIAL_CANVAS_HEIGHT;
  viewBoxWidth = INITIAL_CANVAS_WIDTH;
  viewBoxHeight = INITIAL_CANVAS_HEIGHT;

  var x = 0;
  if ($(window).width() > canvasWidth) {
    x = ($(window).width() - canvasWidth) / 2 - data.diagramBeginX / 2;
  }

  $("#bpmnModel").width(INITIAL_CANVAS_WIDTH);
  $("#bpmnModel").height(INITIAL_CANVAS_HEIGHT);
  paper = Raphael(
    document.getElementById("bpmnModel"),
    canvasWidth,
    canvasHeight
  );
  paper.setViewBox(0, 0, viewBoxWidth, viewBoxHeight, false);
  paper.renderfix();

  if (data.pools) {
    for (var i = 0; i < data.pools.length; i++) {
      var pool = data.pools[i];
      _drawPool(pool);
    }
  }

  var modelElements = data.elements;
  for (var i = 0; i < modelElements.length; i++) {
    var element = modelElements[i];
    //try {
    //console.log(element.type);
    var drawFunction = eval("_draw" + element.type);
    drawFunction(element);
    //} catch(err) {console.log(err);}
  }

  if (data.flows) {
    for (var i = 0; i < data.flows.length; i++) {
      var flow = data.flows[i];
      _drawFlow(flow);
    }
  }
}

$(document).ready(function() {
  $(document).on("click", "#changeStateButton", function(e) {
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
  });
});

$(document).ready(function() {
  _showProcessDiagram();
});
