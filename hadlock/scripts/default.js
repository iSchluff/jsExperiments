(function () {
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;
})();

fadeHex = (function (hex, hex2, ratio) {
	var r = hex >> 16;
	var g = hex >> 8 & 0xFF;
	var b = hex & 0xFF;
	r += ((hex2 >> 16) - r) * ratio;
	g += ((hex2 >> 8 & 0xFF) - g) * ratio;
	b += ((hex2 & 0xFF) - b) * ratio;
	return (r << 16 | g << 8 | b);
})

//global variables
var grid; //Grid-Instance
var hadlock; //Hadlock-Instance
var dragObj = null;
var drawMode = 0;
var walls = new Array();
var s;
var t;

var fsm = StateMachine.create({
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
				drawMode ? grid.getCell(pos.x, pos.y).update("", "555") : grid.getCell(pos.x, pos.y).update();
			},
			onstart : function (event, from, to) {
				hadlock = new Hadlock(grid, s, t, walls);
			}
		}
	});

function init() {
	var canvas = document.getElementById("canvas");
	reset();
	var is_touch_device = 'ontouchstart' in document.documentElement;
	if(is_touch_device){
		$("#canvas").touchstart(handleMouse);
		$("#canvas").touchend(handleMouse);
		$("#canvas").touchmove(handleMouse);
	}else{
		$("#canvas").mousedown(handleMouse);
		$("#canvas").mouseup(handleMouse);
		$("#canvas").mousemove(handleMouse);
	}

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

function clear(){
	for (var i = 0; i < grid.cellCount; i++) {
		for (var j = 0; j < grid.cellCount; j++) {
			if(!walls[i][j]){
				grid.getCell(i,j).update("","");
			}
		}
	}
	grid.getCell(t.x, t.y).update("T", "BF3A30");
	grid.getCell(s.x, s.y).update("S", "259238");
	walls[s.x][s.y] = 2;
	walls[t.x][t.y] = 2;
	requestAnimationFrame(enterFrame);
}

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

function getMousePos(offset) {
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
	var pos = getMousePos($("#canvas").offset());
	if (event.type != "mousemove" && event.type != "touchmove") {
		console.log(fsm.current + " " + pos.x + " " + pos.y);
	}
	if (event.type == "mousedown" || event.type== "touchstart" && fsm.is("init")) {
		dragObj = (samePos(pos, s) || samePos(pos, t));
		dragObj ? fsm.startDrag() : fsm.startDraw(pos);
		console.log(dragObj);
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

function enterFrame() {
	if (grid.redraw()) {
		requestAnimationFrame(enterFrame);
	}
}

function HadlockCell(x, y, labelled) {
	this.x = x;
	this.y = y;
	this.value = 0; //steps walked away from target
	this.labelled = labelled || false;
}

function Hadlock(g, source, target, walls) {
	this.g = g; //grid
	this.l = new Array(); //labelled Cells (always ordered)
	this.source = source; //source cell
	this.target = target; //target cell
	this.walls = walls;
	//this.currValue = 0;
	
	this.map = new Array();
	for (var i = 0; i < this.g.cellCount; i++) {
		this.map[i] = new Array();
		for (var j = 0; j < this.g.cellCount; j++) {
			this.map[i][j] = null;
		}
	}
	
	this.map[this.source.x][this.source.y] = this.source;
	this.map[this.target.x][this.target.y] = this.target;
	
	//--------------------------- Mark Cells from Source to Target ----------------------------------
	this.reached = false; //terminate marking cells when true
	this.labelAdjacent(source);
	
	this.markCells = (function () { //Execute in Single Cells
		var currentCell = this.l.pop();
		this.labelAdjacent(currentCell);
		if (!this.reached) {
			setTimeout(this.markCells, 20);
			requestAnimationFrame(enterFrame);
		} else {
			requestAnimationFrame(enterFrame);
			this.currValue=this.target.value;
			this.tracePath();
		}
	}).bind(this);
	
	//--------------------------- Follow the way back to the Source ----------------------------------
	
	this.currCell = this.target;
	this.xDiff = 0;
	this.yDiff = 0;
	this.state = 0;
	
	this.path = new Array();
	this.tracePath = function () {
		this.move(this.getNext());
		if (this.currCell != this.source) {
			setTimeout(this.tracePath.bind(this), 50);
			this.g.getCell(this.currCell.x, this.currCell.y).update("","89CEFF");
		} else {
			console.log("tadaaah");
			this.path.push(this.source);
			this.g.ctx.lineWidth=2;
			this.g.ctx.moveTo((this.path[0].x+.5)*this.g.cellWidth, (this.path[0].y+.5)*this.g.cellWidth);
			for(var i=1;i<this.path.length;i++){
				var cell=this.path[i];
				this.g.ctx.lineTo((cell.x+.5)*this.g.cellWidth, (cell.y+.5)*this.g.cellWidth);
				//this.g.getCell(cell.x,cell.y).update("","FF0000");
			}
			//this.g.ctx.stroke();
			fsm.stop();
		}
		requestAnimationFrame(enterFrame);
	}
	
	//start
	this.markCells();
}

Hadlock.prototype = {
	labelAdjacent : function (cell) {
		for (var i = 1; i <= 4; i++) { //create / label cell in every direction
			this.labelCell(this.getAdjacentCell(cell, i, true), cell);
			if(cell!=this.source){
				this.g.getCell(cell.x, cell.y).update(cell.value.toString(), "CDE3F3", "555");
			}
		}
	},
	printCellValues : function () {
		var a = new Array();
		for (var i = 0; i < this.l.length; i++) {
			a.push(this.l[i].value);
		}
		console.log(a);
	},
	createCell : function (x, y) {
		var cell = new HadlockCell(x, y);
		this.map[x][y] = cell;
		return cell;
	},
	labelCell : function (cell, prevCell) {
		if (cell != null && !cell.labelled) {
			//give the cell its value (label it)
			cell.value = prevCell.value + this.towards(prevCell, cell);
			cell.labelled = true;
			if(cell.value<prevCell.value){
				
			}
			//visualize
			if(cell!=this.target){
				this.g.getCell(cell.x, cell.y).update(cell.value.toString(), "D4FFDB", "555");
			}else{
				console.log("####################FOO: "+cell.value+" "+prevCell.value+" "+this.towards(prevCell,cell));
			}
			//insert into labelled list
			if (this.l.length != 0 && this.l[this.l.length - 1].value == cell.value) { //try to progress in a straight line
				this.l.push(cell);
			} else {
				var pos = this.binSearch(cell.value); //search for the right position for insert
				this.l.splice(pos, 0, cell); //insert
			}
		}
	},
	towards : function (cell, adjacentCell) { //1 if farther away / 0 if closer
		if (cell.x == adjacentCell.x) {
			return Math.abs(this.target.y - adjacentCell.y) < Math.abs(this.target.y - cell.y) ? 0 : 1;
		} else {
			return Math.abs(this.target.x - adjacentCell.x) < Math.abs(this.target.x - cell.x) ? 0 : 1;
		}
	},
	getAdjacentCell : function (cell, direction, createCells) {
		var x;
		var y;
		if ((direction & 1) == 0) {
			x = cell.x + direction - 3;
			y = cell.y;
		} else {
			x = cell.x;
			y = cell.y + direction - 2;
		}
		if (this.badCoords(x, y)) {
			return null;
		} else if (x == this.target.x && y == this.target.y) {
			this.reached = true;
			return this.target;
		} else if (this.map[x][y] != null) {
			return this.map[x][y];
		} else if (createCells) {
			return this.createCell(x, y);
		} else {
			return null;
		}
	},
	badCoords : function (x, y) {
		return (y < 0 || x < 0 || y >= this.g.cellCount || x >= this.g.cellCount || this.walls[x][y] == 1);
	},
	move : function (cell) { //move 1 cell towards the source
		//console.log("nextCell "+cell.x);
		//console.log("currCell "+this.currCell.x);
		this.xDiff = cell.x- this.currCell.x ;
		this.yDiff = cell.y- this.currCell.y ;
		this.currValue = cell.value;
		this.currCell = cell;
		return cell;
	},
	dist:function(cell){
		return Math.abs(cell.x-this.target.x)+Math.abs(cell.y-this.target.y)+2*this.target.value-2*cell.value;
	},
	getNext : function () { //get next cell towards the source
		if (this.state == 1) {
			if (!this.badCoords(this.currCell.x + this.xDiff, this.currCell.y + this.yDiff) && this.map[this.currCell.x + this.xDiff][this.currCell.y + this.yDiff]!=null) {
				var newCell = this.map[this.currCell.x + this.xDiff][this.currCell.y + this.yDiff];

				if (newCell.value <= this.currValue) {
					return newCell;
				}
			}
			this.state = 0;
		}
		if (this.state == 0) {
			this.path.push(this.currCell);
			this.state = 1;
			var arr = new Array();
			for (var i = 1; i <= 4; i++) { //create / label cell in every direction
				var adjCell = this.getAdjacentCell(this.currCell, i, false);
				if(adjCell!=null){
					this.g.getCell(adjCell.x, adjCell.y).update(adjCell.value.toString(),"993333")
					console.log(adjCell);
					console.log(this.currValue+" "+this.target.value+" "+(adjCell.x != this.currCell.x - this.xDiff || adjCell.y != this.currCell.y - this.yDiff));
					//console.log(this.g.getCell(adjCell.x, adjCell.y));
				}
				requestAnimationFrame(enterFrame);
				if (adjCell != null && adjCell.value<=this.currValue && (adjCell.x != this.currCell.x - this.xDiff || adjCell.y != this.currCell.y - this.yDiff) ) {
					arr.push(adjCell);
				}
			}
			
			
			//console.log(arr+" "+this.xDiff+" "+this.yDiff);
			
			requestAnimationFrame(enterFrame);
			for(var i=0;i<arr.length;i++){
				var cell=arr[i]
				if(this.towards(this.currCell,cell)){
					return cell;
				}
			}
			console.log("nope.avi");
			return arr.pop();
		}
	},
	binSearch : function (find) { //standard binary search implementation
		var low = 0,
		high = this.l.length - 1,
		i;
		while (low <= high) {
			i = Math.floor((low + high) / 2);
			if (this.l[i].value > find) {
				low = i + 1;
				continue;
			};
			if (this.l[i].value < find) {
				high = i - 1;
				continue;
			};
			return i;
		}
		return low;
	},
	constructor : Hadlock
}