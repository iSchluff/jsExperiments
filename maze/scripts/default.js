(function () {
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;
})();

function init() {
	/* CONSTANTS */
	COLOR_DEAD = "fff";
	COLOR_ALIVE = "";
	
	FSM = StateMachine.create({
			initial : "stopped",
			events : [{
					name : "start",
					from : "stopped",
					to : "running"
				}, {
					name : "stop",
					from : "*",
					to : "stopped"
				}, {
				name : "startDraw",
				from : "init",
				to : "draw"
				}
			]
		});
	
	/* Create Objects */
	var size = 30;
	var canvas = document.getElementById("canvas");
	
	var grid = new Grid(canvas, size);
	var life = new Life(grid, function (n) { //0 die 1 born 2 alive
			return (n > 0 && n < 6) ? (n == 3 ? 1 : 2) : 0;
		});
	
	/* Setup Animation Loop */
	var enterFrame = function () {
		if (FSM.is("running")) {
			life.step();
		}
		if (grid.redraw()) {
			requestAnimationFrame(enterFrame);
		}
	}
	
	/* Create Event Listeners */
	document.getElementById("startBtn").addEventListener("click",function(){
		if(FSM.can("start")){
			FSM.start();
			requestAnimationFrame(enterFrame);
		}
	});
	
	document.getElementById("clearBtn").addEventListener("click",function(){
		life.clear();
		if(FSM.can("start")){
			FSM.start();
		}
		requestAnimationFrame(enterFrame);
	});
	
	document.getElementById("canvas").addEventListener("mousedown",handleMouse);
	document.getElementById("canvas").addEventListener("mouseup",handleMouse);
	document.getElementById("canvas").addEventListener("mousemove",handleMouse);
}

function handleMouse(event) {
	var pos = grid.getMouseOver(event.pageX, event.pageY);
	if (event.type == "mousedown" && fsm.is("stopped")) {
		fsm.startDraw(pos);
	} else if (event.type == "mouseup" || event.type == "touchend") {
		fsm.stop();
	} else if ((event.type == "mousemove" || event.type == "touchmove") && pos.x >= 0 && pos.y >= 0 && pos.x < grid.cellCount && pos.y < grid.cellCount) {
		if (fsm.is("drag") && walls[pos.x][pos.y] == 0) {
			grid.getCell(dragObj.x, dragObj.y).update();
			walls[dragObj.x][dragObj.y] = 0;
			dragObj.x = pos.x;
			dragObj.y = pos.y;
			dragObj == s ? grid.getCell(pos.x, pos.y).update("S", "259238") : grid.getCell(pos.x, pos.y).update("T", "BF3A30");
			walls[pos.x][pos.y] = 2;
		} else if (fsm.is("draw") && walls[pos.x][pos.y] != 2) {
			walls[pos.x][pos.y] = drawMode;
			drawMode ? grid.getCell(pos.x, pos.y).update("", "555") : grid.getCell(pos.x, pos.y).update();
		}
	}
	requestAnimationFrame(enterFrame);
}

/* Moore Neighborhood */
function Life(grid, neighborfunction) {
	this.cells = new Array();
	this.grid = grid;
	this.getNextCellValue = neighborfunction;
	this.clear();
}

Life.prototype = {
	step : function () {
		for (var i = 0; i < this.cells.length; i++) {
			for (var j = 0; j < this.cells.length; j++) {
				var val = this.cells[i][j];
				var rule = this.getNextCellValue(this.countNeighbors(i, j));
				var newVal= (val == 0) ? (rule == 1 ? 1 : 0) : (rule == 2 ? 1 : 0);
				if(newVal!=val){
					this.getCell[i][j]=newVal;
					this.grid.getCell(i, j).update(newVal ? COLOR_ALIVE : COLOR_DEAD);
				}
			}
		}
	},
	
	countNeighbors : function (i, j) {
		var sum = this.getValue(i - 1, j) + this.getValue(i + 1, j); //horizontal
		sum += this.getValue(i, j - 1) + this.getValue(i, j + 1); //vertical
		sum += this.getValue(i + 1, j + 1) + this.getValue(i - 1, j - 1); //diagonal 1
		sum += this.getValue(i - 1, j + 1) + this.getValue(i + 1, j - 1); //diagonal 2
		return sum;
	},
	
	getValue : function (i, j) {
		if (i < 0 || i >= this.cells.length || j < 0 || j >= this.cells.length) {
			return 0;
		} else {
			return this.cells[i][j];
		}
	},
	
	clear : function(){
		for (var i = 0; i < this.grid.cellCount; i++) {
			this.cells[i] = new Array();
			for (var j = 0; j < this.grid.cellCount; j++) {
				this.cells[i][j] = 0;
			}
		}
	}
}
