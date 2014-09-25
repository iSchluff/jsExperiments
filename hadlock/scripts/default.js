(function () {
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;

  var fadeHex = (function (hex, hex2, ratio) {
    var r = hex >> 16;
    var g = hex >> 8 & 0xFF;
    var b = hex & 0xFF;
    r += ((hex2 >> 16) - r) * ratio;
    g += ((hex2 >> 8 & 0xFF) - g) * ratio;
    b += ((hex2 & 0xFF) - b) * ratio;
    return (r << 16 | g << 8 | b);
  })

  // variables
  var grid; //Grid-Instance
  var hadlock; //Hadlock-Instance
  var dragObj = null;
  var drawMode = 0;
  var walls = new Array();
  var s;
  var t;

  window.fsm = StateMachine.create({
    initial : "init",
    events : [{
      name : "startDrag",
      from : "init",
      to : "drag"
    }, {
      name : "startDraw",
      from : "init",
      to : "draw"
    }, {
      name : "stop",
      from : "*",
      to : "init"
    }, {
      name : "start",
      from : "init",
      to : "running"
    }
    ],
    callbacks : {
      onstartDraw : function (event, from, to, pos) {
        drawMode = 1 - walls[pos.x][pos.y];
        walls[pos.x][pos.y] = drawMode;
        drawMode ? grid.getCell(pos.x, pos.y).update("", "#a4b1b7") : grid.getCell(pos.x, pos.y).update();
      },
      onstart : function (event, from, to) {
        hadlock = new Hadlock(grid, s, t, walls);
      }
    }
  });
  
  window.redraw = function() {
    if (grid.redraw()) {
      requestAnimationFrame(redraw);
    }
  }
  
  var init= function() {
    var $canvas = $("#canvas");
    reset();
/*    if('ontouchstart' in document.documentElement){
      $canvas.on("touchstart", handleMouse);
      $canvas.on("touchend", handleMouse);
      $canvas.on("touchmove", handleMouse);
    }else{*/
      $canvas.mousedown(handleMouse);
      $canvas.mouseup(handleMouse);
      $canvas.mousemove(handleMouse);
    //}

    $("#startBtn").click(function () {
      if (fsm.is("init")) {
        fsm.start();
      }
    });
    $("#clearBtn").click(function () {
      if (fsm.is("init")) {
        clear();
      }
    });
    $("#resetBtn").click(function () {
      if (fsm.is("init")) {
        reset();
      }
    });
  }
  init();

  function clear(){
    for (var i = 0; i < grid.cellCount; i++) {
      for (var j = 0; j < grid.cellCount; j++) {
        if(!walls[i][j]){
          grid.getCell(i,j).update("","");
        }
      }
    }
    grid.getCell(t.x, t.y).update("T", "#3e9de1");
    grid.getCell(s.x, s.y).update("S", "#6ad50e");
    walls[s.x][s.y] = 2;
    walls[t.x][t.y] = 2;
    requestAnimationFrame(redraw);
  }

  // 
  function reset(){
    grid = new Grid(canvas);
    wall = new Array();
    for (var i = 0; i < grid.cellCount; i++) {
      walls[i] = new Array();
      for (var j = 0; j < grid.cellCount; j++) {
        walls[i][j] = 0;
      }
    }
    s = new HadlockCell(grid.cellCount / 3 - 1, grid.cellCount / 2, true);
    t = new HadlockCell(2 * grid.cellCount / 3, grid.cellCount / 2, false);
    clear();
  }

  function samePos(position, cell) {
    return position.x == cell.x && position.y == cell.y ? cell : null;
  }

  function getMousePos(event, offset) {
    var localX = event.pageX - offset["left"];
    var localY = event.pageY - offset["top"];
    var pos = {
      x : Math.floor(localX / grid.cellWidth),
      y : Math.floor(localY / grid.cellWidth),
      index : this.y * grid.cellCount + this.x
    }
    return pos;
  }

  function handleMouse(event) {
    var pos = getMousePos(event, $("#canvas").offset());
    
    if (event.type != "mousemove" && event.type != "touchmove") {
      console.log(fsm.current + " " + pos.x + " " + pos.y);
    }
    
    if (event.type == "mousedown" || event.type== "touchstart" && fsm.is("init")) {
      dragObj = (samePos(pos, s) || samePos(pos, t));
      dragObj ? fsm.startDrag() : fsm.startDraw(pos);
      console.log(dragObj);
    } else if (event.type == "mouseup" || event.type == "touchend") {
      fsm.stop();
    } else if ((event.type == "mousemove" || event.type == "touchmove") &&
               pos.x >= 0 && pos.y >= 0 &&
               pos.x < grid.cellCount && pos.y < grid.cellCount) {
      
      if (fsm.is("drag") && walls[pos.x][pos.y] == 0) {
        grid.getCell(dragObj.x, dragObj.y).update();
        walls[dragObj.x][dragObj.y] = 0;
        dragObj.x = pos.x;
        dragObj.y = pos.y;
        dragObj == s ? grid.getCell(pos.x, pos.y).update("S", "#6ad50e") : grid.getCell(pos.x, pos.y).update("T", "#3e9de1");
        walls[pos.x][pos.y] = 2;
      } else if (fsm.is("draw") && walls[pos.x][pos.y] != 2) {
        walls[pos.x][pos.y] = drawMode;
        drawMode ? grid.getCell(pos.x, pos.y).update("", "#a4b1b7") : grid.getCell(pos.x, pos.y).update();
      }
    }
    requestAnimationFrame(redraw);
  }
})();
