const bpmnDraw = require("./bpmn-draw");

var data1 = require("./examples/example01.json");
var data2 = require("./examples/example02.json");

function onElementClicked(element) {
    console.log("CLICKED ON ELEMENT", element.type, element.name);
}

bpmnDraw.showProcessDiagram(data1, document.getElementById("bpmnModel"), onElementClicked);
bpmnDraw.showProcessDiagram(data2, document.getElementById("bpmnModel2"), onElementClicked);
