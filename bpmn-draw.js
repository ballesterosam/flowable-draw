  var Raphael = require('raphael');
  var icons = require('./bpmn-icons.js');
  var Polyline = require('./Polyline.js').Polyline;
  
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

  var elementsAdded = new Array();
  var elementsRemoved = new Array();
  var changeStateStartElementIds = new Array();
  var changeStateStartElements = new Array();
  var changeStateStartGlowElements = new Array();
  var changeStateEndElementIds = new Array();
  var changeStateEndElements = new Array();
  var changeStateEndGlowElements = new Array();

  var onClick = function() {};

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
    if (elementsAdded.indexOf(element.id) >= 0) {
      opacity = 0.2;
      fillColor = "green";
    }

    if (elementsRemoved.indexOf(element.id) >= 0) {
      opacity = 0.2;
      fillColor = "red";
    }
    if (!topBodyRect) return;

    topBodyRect.attr({
      opacity: opacity,
      stroke: "none",
      fill: fillColor
    });
    // _showTip($(topBodyRect.node), element);

    topBodyRect.mouseover(function() {
      var el = paper.getById(element.id);
      if (el) el.attr({ stroke: HOVER_COLOR });
    });

    topBodyRect.mouseout(function() {
      var el = paper.getById(element.id);
      if (el) el.attr({ stroke: strokeColor });
    });

    topBodyRect.click(function() {
      onClick(element);
      // var startElementIndex = changeStateEndElementIds.indexOf(element.id);
      // var endElementIndex = changeStateEndElementIds.indexOf(element.id);
      // if (startElementIndex >= 0) {
      //   var glowElement = changeStateStartGlowElements[startElementIndex];
      //   glowElement.remove();

      //   changeStateStartGlowElements.splice(startElementIndex, 1);
      //   changeStateStartElementIds.splice(startElementIndex, 1);
      //   changeStateStartElements.splice(startElementIndex, 1);
      // } else if (endElementIndex >= 0) {
      //   var glowElement = changeStateEndGlowElements[endElementIndex];
      //   glowElement.remove();

      //   changeStateEndGlowElements.splice(endElementIndex, 1);
      //   changeStateEndElementIds.splice(endElementIndex, 1);
      //   changeStateEndElements.splice(endElementIndex, 1);
      // } else {
      //   if (element.current) {
      //     var startGlowElement = topBodyRect.glow({ color: "blue" });
      //     changeStateStartGlowElements.push(startGlowElement);
      //     changeStateStartElementIds.push(element.id);
      //     changeStateStartElements.push(element);
      //   } else {
      //     var endGlowElement = topBodyRect.glow({ color: "red" });
      //     changeStateEndGlowElements.push(endGlowElement);
      //     changeStateEndElementIds.push(element.id);
      //     changeStateEndElements.push(element);
      //   }
      // }

      // if (
      //   changeStateStartElements.length > 0 &&
      //   changeStateEndElements.length > 0
      // ) {
      //   // $("#changeStateButton").show();
      // } else {
      //   // $("#changeStateButton").hide();
      // }
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

  export function showProcessDiagram(data, element, onClick_) {
    
    if (!data.elements || data.elements.length == 0) return;
    if (onClick_) onClick = onClick_;

    INITIAL_CANVAS_WIDTH = data.diagramWidth + 20;
    INITIAL_CANVAS_HEIGHT = data.diagramHeight + 50;
    canvasWidth = INITIAL_CANVAS_WIDTH;
    canvasHeight = INITIAL_CANVAS_HEIGHT;
    viewBoxWidth = INITIAL_CANVAS_WIDTH;
    viewBoxHeight = INITIAL_CANVAS_HEIGHT;

    var x = 0;
    var width = window.innerWidth;

    if (width > canvasWidth) {
      x = (width - canvasWidth) / 2 - data.diagramBeginX / 2;
    }

    element.style.width = INITIAL_CANVAS_WIDTH + 'px';
    element.style.height = INITIAL_CANVAS_HEIGHT + 'px';
    paper = Raphael(
      element,
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

  function _bpmnGetColor(element, defaultColor)
  {
      var strokeColor;
      if(element && element.current) {
          strokeColor = CURRENT_COLOR;
      } else if(element && element.completed) {
          strokeColor = COMPLETED_COLOR;
      } else {
          strokeColor = defaultColor;
      }
      return strokeColor;
  }

  function _drawPool(pool) {
    var rect = paper.rect(pool.x, pool.y, pool.width, pool.height);

    rect.attr({
      "stroke-width": 1,
      stroke: MAIN_STROKE_COLOR,
      fill: "white"
    });

    if (pool.name) {
      var poolName = paper
        .text(pool.x + 14, pool.y + pool.height / 2, pool.name)
        .attr({
          "text-anchor": "middle",
          "font-family": "Arial",
          "font-size": "12",
          fill: MAIN_STROKE_COLOR
        });

      poolName.transform("r270");
    }

    if (pool.lanes) {
      for (var i = 0; i < pool.lanes.length; i++) {
        var lane = pool.lanes[i];
        _drawLane(lane);
      }
    }
  }

  function _drawLane(lane) {
    var rect = paper.rect(lane.x, lane.y, lane.width, lane.height);

    rect.attr({
      "stroke-width": 1,
      stroke: MAIN_STROKE_COLOR,
      fill: "white"
    });

    if (lane.name) {
      var laneName = paper
        .text(lane.x + 10, lane.y + lane.height / 2, lane.name)
        .attr({
          "text-anchor": "middle",
          "font-family": "Arial",
          "font-size": "12",
          fill: MAIN_STROKE_COLOR
        });

      laneName.transform("r270");
    }
  }

  function _drawSubProcess(element) {
    var rect = paper.rect(
      element.x,
      element.y,
      element.width,
      element.height,
      4
    );

    var strokeColor = _bpmnGetColor(element, MAIN_STROKE_COLOR);

    rect.attr({
      "stroke-width": 1,
      stroke: strokeColor,
      fill: "white"
    });
  }

  function _drawEventSubProcess(element) {
    var rect = paper.rect(
      element.x,
      element.y,
      element.width,
      element.height,
      4
    );
    var strokeColor = _bpmnGetColor(element, MAIN_STROKE_COLOR);

    rect.attr({
      "stroke-width": 1,
      stroke: strokeColor,
      "stroke-dasharray": ".",
      fill: "white"
    });
  }

  function _drawStartEvent(element) {
    var startEvent = _drawEvent(element, NORMAL_STROKE, 15);
    startEvent.click(function() {
      _zoom(true);
    });
    _addHoverLogic(element, "circle", MAIN_STROKE_COLOR);
  }

  function _drawEndEvent(element) {
    var endEvent = _drawEvent(element, ENDEVENT_STROKE, 14);
    endEvent.click(function() {
      _zoom(false);
    });
    _addHoverLogic(element, "circle", MAIN_STROKE_COLOR);
  }

  function _drawEvent(element, strokeWidth, radius) {
    var x = element.x + element.width / 2;
    var y = element.y + element.height / 2;

    var circle = paper.circle(x, y, radius);

    var strokeColor = _bpmnGetColor(element, MAIN_STROKE_COLOR);
    circle.attr({
      "stroke-width": strokeWidth,
      stroke: strokeColor,
      fill: "#ffffff"
    });

    circle.id = element.id;

    icons._drawEventIcon(paper, element);

    return circle;
  }

  function _drawSendTask(element)
{
    _drawTask(element);
    icons._drawSendTaskIcon(paper, element.x + 4, element.y + 4);
    _addHoverLogic(element, "rect", ACTIVITY_STROKE_COLOR);
}

  function _drawServiceTask(element) {
    _drawTask(element);
    if (element.taskType === "mail") {
      icons._drawSendTaskIcon(paper, element.x - 4, element.y - 4, element);
    } else if (element.taskType === "camel") {
      icons._drawCamelTaskIcon(paper, element.x + 4, element.y + 4);
    } else if (element.taskType === "mule") {
      icons._drawMuleTaskIcon(paper, element.x + 4, element.y + 4);
    } else if (element.taskType === "http") {
      icons._drawHttpTaskIcon(paper, element.x + 4, element.y + 4);
    } else if (element.taskType === "dmn") {
      icons._drawDecisionTaskIcon(paper, element.x + 4, element.y + 4);
    } else if (element.taskType === "shell") {
      icons._drawShellTaskIcon(paper, element.x + 4, element.y + 4);
    } else if (element.stencilIconId) {
      paper.image(
        "../service/stencilitem/" + element.stencilIconId + "/icon",
        element.x + 4,
        element.y + 4,
        16,
        16
      );
    } else {
      icons._drawServiceTaskIcon(paper, element.x + 4, element.y + 4, element);
    }
    _addHoverLogic(element, "rect", ACTIVITY_STROKE_COLOR);
  }

  function _drawHttpServiceTask(element) {
    _drawTask(element);
    _drawHttpTaskIcon(paper, element.x + 4, element.y + 4);
    _addHoverLogic(element, "rect", ACTIVITY_STROKE_COLOR);
  }

  function _drawCallActivity(element) {
    var width = element.width - CALL_ACTIVITY_STROKE / 2;
    var height = element.height - CALL_ACTIVITY_STROKE / 2;

    var rect = paper.rect(element.x, element.y, width, height, 4);

    var strokeColor = _bpmnGetColor(element, ACTIVITY_STROKE_COLOR);

    rect.attr({
      "stroke-width": CALL_ACTIVITY_STROKE,
      stroke: strokeColor,
      fill: ACTIVITY_FILL_COLOR
    });

    rect.id = element.id;

    if (element.name) {
      _drawMultilineText(
        element.name,
        element.x,
        element.y,
        element.width,
        element.height,
        "middle",
        "middle",
        11
      );
    }
    _addHoverLogic(element, "rect", ACTIVITY_STROKE_COLOR);
  }

  function _drawScriptTask(element) {
    _drawTask(element);
    icons._drawScriptTaskIcon(paper, element.x + 4, element.y + 4, element);
    _addHoverLogic(element, "rect", ACTIVITY_STROKE_COLOR);
  }

  function _drawUserTask(element) {
    _drawTask(element);
    icons._drawUserTaskIcon(paper, element.x + 4, element.y + 4, element);
    _addHoverLogic(element, "rect", ACTIVITY_STROKE_COLOR);
  }

  function _drawBusinessRuleTask(element) {
    _drawTask(element);
    _drawBusinessRuleTaskIcon(paper, element.x + 4, element.y + 4, element);
    _addHoverLogic(element, "rect", ACTIVITY_STROKE_COLOR);
  }

  function _drawManualTask(element) {
    _drawTask(element);
    icons._drawManualTaskIcon(paper, element.x + 4, element.y + 4, element);
    _addHoverLogic(element, "rect", ACTIVITY_STROKE_COLOR);
  }

  function _drawReceiveTask(element) {
    _drawTask(element);
    icons._drawReceiveTaskIcon(paper, element.x, element.y, element);
    _addHoverLogic(element, "rect", ACTIVITY_STROKE_COLOR);
  }

  function _drawTask(element) {
    var width = element.width - TASK_STROKE / 2;
    var height = element.height - TASK_STROKE / 2;

    var rect = paper.rect(element.x, element.y, width, height, 4);

    var strokeColor = _bpmnGetColor(element, ACTIVITY_STROKE_COLOR);
    var strokeWidth = element.current ? CURRENT_ACTIVITY_STROKE : TASK_STROKE;
    rect.attr({
      "stroke-width": strokeWidth,
      stroke: strokeColor,
      fill: ACTIVITY_FILL_COLOR
    });

    rect.id = element.id;

    if (element.name) {
      _drawMultilineText(
        element.name,
        element.x,
        element.y,
        element.width,
        element.height,
        "middle",
        "middle",
        11,
        _bpmnGetColor(element, TEXT_COLOR)
      );
    }
  }

  function _drawExclusiveGateway(element) {
    _drawGateway(element);
    var quarterWidth = element.width / 4;
    var quarterHeight = element.height / 4;

    var strokeColor = _bpmnGetColor(element, MAIN_STROKE_COLOR);

    var iks = paper.path(
      "M" +
        (element.x + quarterWidth + 3) +
        " " +
        (element.y + quarterHeight + 3) +
        "L" +
        (element.x + 3 * quarterWidth - 3) +
        " " +
        (element.y + 3 * quarterHeight - 3) +
        "M" +
        (element.x + quarterWidth + 3) +
        " " +
        (element.y + 3 * quarterHeight - 3) +
        "L" +
        (element.x + 3 * quarterWidth - 3) +
        " " +
        (element.y + quarterHeight + 3)
    );
    iks.attr({ "stroke-width": 3, stroke: strokeColor });

    _addHoverLogic(element, "rhombus", MAIN_STROKE_COLOR);
  }

  function _drawParallelGateway(element) {
    _drawGateway(element);

    var strokeColor = _bpmnGetColor(element, MAIN_STROKE_COLOR);

    var path1 = paper.path("M 6.75,16 L 25.75,16 M 16,6.75 L 16,25.75");
    path1.attr({
      "stroke-width": 3,
      stroke: strokeColor,
      fill: "none"
    });

    path1.transform("T" + (element.x + 4) + "," + (element.y + 4));

    _addHoverLogic(element, "rhombus", MAIN_STROKE_COLOR);
  }

  function _drawInclusiveGateway(element) {
    _drawGateway(element);

    var strokeColor = _bpmnGetColor(element, MAIN_STROKE_COLOR);

    var circle1 = paper.circle(
      element.x + element.width / 2,
      element.y + element.height / 2,
      9.75
    );
    circle1.attr({
      "stroke-width": 2.5,
      stroke: strokeColor,
      fill: "none"
    });

    _addHoverLogic(element, "rhombus", MAIN_STROKE_COLOR);
  }

  function _drawEventGateway(element) {
    _drawGateway(element);

    var strokeColor = _bpmnGetColor(element, MAIN_STROKE_COLOR);

    var circle1 = paper.circle(
      element.x + element.width / 2,
      element.y + element.height / 2,
      10.4
    );
    circle1.attr({
      "stroke-width": 0.5,
      stroke: strokeColor,
      fill: "none"
    });

    var circle2 = paper.circle(
      element.x + element.width / 2,
      element.y + element.height / 2,
      11.7
    );
    circle2.attr({
      "stroke-width": 0.5,
      stroke: strokeColor,
      fill: "none"
    });

    var path1 = paper.path(
      "M 20.327514,22.344972 L 11.259248,22.344216 L 8.4577203,13.719549 L 15.794545,8.389969 L 23.130481,13.720774 L 20.327514,22.344972 z"
    );
    path1.attr({
      "stroke-width": 1.39999998,
      stroke: strokeColor,
      fill: "none",
      "stroke-linejoin": "bevel"
    });

    path1.transform("T" + (element.x + 4) + "," + (element.y + 4));

    _addHoverLogic(element, "rhombus", MAIN_STROKE_COLOR);
  }

  function _drawGateway(element) {
    var strokeColor = _bpmnGetColor(element, MAIN_STROKE_COLOR);

    var rhombus = paper.path(
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

    rhombus.attr("stroke-width", 2);
    rhombus.attr("stroke", strokeColor);
    rhombus.attr({ fill: "#ffffff" });

    rhombus.id = element.id;

    return rhombus;
  }

  function _drawBoundaryEvent(element) {
    var x = element.x + element.width / 2;
    var y = element.y + element.height / 2;

    var circle = paper.circle(x, y, 15);

    var strokeColor = _bpmnGetColor(element, MAIN_STROKE_COLOR);

    circle.attr({
      "stroke-width": 1,
      stroke: strokeColor,
      fill: "white"
    });

    var innerCircle = paper.circle(x, y, 12);

    innerCircle.attr({
      "stroke-width": 1,
      stroke: strokeColor,
      fill: "none"
    });

    icons._drawEventIcon(paper, element);
    _addHoverLogic(element, "circle", MAIN_STROKE_COLOR);

    circle.id = element.id;
    innerCircle.id = element.id + "_inner";
  }

  function _drawIntermediateCatchEvent(element) {
    var x = element.x + element.width / 2;
    var y = element.y + element.height / 2;

    var circle = paper.circle(x, y, 15);

    var strokeColor = _bpmnGetColor(element, MAIN_STROKE_COLOR);

    circle.attr({
      "stroke-width": 1,
      stroke: strokeColor,
      fill: "white"
    });

    var innerCircle = paper.circle(x, y, 12);

    innerCircle.attr({
      "stroke-width": 1,
      stroke: strokeColor,
      fill: "none"
    });

    icons._drawEventIcon(paper, element);
    _addHoverLogic(element, "circle", MAIN_STROKE_COLOR);

    circle.id = element.id;
    innerCircle.id = element.id + "_inner";
  }

  function _drawThrowEvent(element) {
    var x = element.x + element.width / 2;
    var y = element.y + element.height / 2;

    var circle = paper.circle(x, y, 15);

    var strokeColor = _bpmnGetColor(element, MAIN_STROKE_COLOR);

    circle.attr({
      "stroke-width": 1,
      stroke: strokeColor,
      fill: "white"
    });

    var innerCircle = paper.circle(x, y, 12);

    innerCircle.attr({
      "stroke-width": 1,
      stroke: strokeColor,
      fill: "none"
    });

    icons._drawEventIcon(paper, element);
    _addHoverLogic(element, "circle", MAIN_STROKE_COLOR);

    circle.id = element.id;
    innerCircle.id = element.id + "_inner";
  }

  function _drawMultilineText(
    text,
    x,
    y,
    boxWidth,
    boxHeight,
    horizontalAnchor,
    verticalAnchor,
    fontSize,
    color
  ) {
    if (!text || text == "") {
      return;
    }

    var textBoxX = 0,
      textBoxY;
    var width = boxWidth - 2 * TEXT_PADDING;

    if (horizontalAnchor === "middle") {
      textBoxX = x + boxWidth / 2;
    } else if (horizontalAnchor === "start") {
      textBoxX = x;
    }

    textBoxY = y + boxHeight / 2;

    if (!color) {
      color = TEXT_COLOR;
    }
    var t = paper.text(textBoxX + TEXT_PADDING, textBoxY + TEXT_PADDING).attr({
      "text-anchor": horizontalAnchor,
      "font-family": "Arial",
      "font-size": fontSize,
      fill: color
    });

    var abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    t.attr({
      text: abc
    });
    var letterWidth = t.getBBox().width / abc.length;

    t.attr({
      text: text
    });
    var removedLineBreaks = text.split("\n");
    var x = 0,
      s = [];
    for (var r = 0; r < removedLineBreaks.length; r++) {
      var words = removedLineBreaks[r].split(" ");
      for (var i = 0; i < words.length; i++) {
        var l = words[i].length;
        if (x + l * letterWidth > width) {
          s.push("\n");
          x = 0;
        }
        x += l * letterWidth;
        s.push(words[i] + " ");
      }
      s.push("\n");
      x = 0;
    }
    t.attr({
      text: s.join("")
    });

    if (verticalAnchor && verticalAnchor === "top") {
      t.attr({ y: y + t.getBBox().height / 2 });
    }
  }

  function _drawFlow(flow) {
    var polyline = new Polyline(
      flow.id,
      flow.waypoints,
      SEQUENCEFLOW_STROKE,
      paper
    );

    var strokeColor = _bpmnGetColor(flow, MAIN_STROKE_COLOR);

    polyline.element = paper.path(polyline.path);
    polyline.element.attr({ "stroke-width": SEQUENCEFLOW_STROKE });
    polyline.element.attr({ stroke: strokeColor });

    polyline.element.id = flow.id;

    var lastLineIndex = polyline.getLinesCount() - 1;
    var line = polyline.getLine(lastLineIndex);

    if (flow.type == "connection" && flow.conditions) {
      var middleX = (line.x1 + line.x2) / 2;
      var middleY = (line.y1 + line.y2) / 2;
      var image = paper.image(
        "../editor/images/condition-flow.png",
        middleX - 8,
        middleY - 8,
        16,
        16
      );
    }

    var polylineInvisible = new Polyline(
      flow.id,
      flow.waypoints,
      SEQUENCEFLOW_STROKE,
      paper
    );

    polylineInvisible.element = paper.path(polyline.path);
    polylineInvisible.element.attr({
      opacity: 0,
      "stroke-width": 8,
      stroke: "#000000"
    });

    //_showTip($(polylineInvisible.element.node), flow);


    polylineInvisible.element.mouseout(function() {
      var el = paper.getById(polyline.element.id);
      if (el) el.attr({ stroke: strokeColor });
    });

    _drawArrowHead(line, strokeColor);
  }

  function _drawArrowHead(line, color) {
    var doubleArrowWidth = 2 * ARROW_WIDTH;

    var arrowHead = paper.path(
      "M0 0L-" +
        (ARROW_WIDTH / 2 + 0.5) +
        " -" +
        doubleArrowWidth +
        "L" +
        (ARROW_WIDTH / 2 + 0.5) +
        " -" +
        doubleArrowWidth +
        "z"
    );

    // anti smoothing
    if (1 % 2 == 1) (line.x2 += 0.5), (line.y2 += 0.5);

    arrowHead.transform("t" + line.x2 + "," + line.y2 + "");
    arrowHead.transform(
      "...r" + Raphael.deg(line.angle - Math.PI / 2) + " " + 0 + " " + 0
    );

    arrowHead.attr("fill", color);

    arrowHead.attr("stroke-width", SEQUENCEFLOW_STROKE);
    arrowHead.attr("stroke", color);

    return arrowHead;
  }
  
