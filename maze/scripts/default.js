(function () {
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;
})();

(function(){
	function init() {
		/* CONSTANTS */
		COLOR_DEAD = "#fff";
		COLOR_ALIVE = "#777";

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
		var size = 200;
		var canvas = document.getElementById("canvas");

		var grid = new Grid(canvas, size);
		//0 dies 1 born 2 alive
		// 12345/3 Rule
		var life = new Life(grid, function (n) {
			return (n > 0 && n < 6) ? (n === 3 ? 1 : 2) : 0;
		});

		/* Create Event Listeners */
		document.getElementById("startBtn").addEventListener("click",function(){
			console.log("start", FSM.can("start"))
			if(FSM.can("start")){
				life.start();
			}
		});
	}

	/* Moore Neighborhood */
	function Life(grid, neighborfunction) {
		this.cells= [];
		this.grid= grid;
		this.getNextCellValue= neighborfunction;
	}

	Life.prototype = {
		start: function(){
			FSM.start();
			var iterations= 0;
			var finished= false;

			var render= function(){ //renderloop
				if(!finished){
					finished= !this.grid.redraw();
					requestAnimationFrame(render);
				}
			}.bind(this);

			var run= function(){ // runloop
				var now= Date.now();
				this.step();

				if(!finished){
					finished= ++iterations > this.cells.length*4;
					setTimeout(run, 4);
				}else{
					console.log("stop", iterations);
					FSM.stop();
				}
			}.bind(this);

			this.clear();
			this.grid.redraw();
			setTimeout(function(){
				run();
				requestAnimationFrame(render);
			}, 500);
		},
		step : function () {
			var next= [];
			var size= this.cells.length;
			for (var i= 0; i < size; i++) {
				next.push([]);
				for (var j= 0; j < size; j++) {
					if(i === 0 || j === 0 || i === size-1 || j === size-1){
						next[i][j]= 0; continue;
					}

					var val= this.cells[i][j];
					var count= this.countNeighbors(i, j);
					var rule= this.getNextCellValue(count);
					var newVal= (val === 1) ? (rule > 0 ? 1 : 0) : (rule === 1 ? 1 : 0);

					if(newVal !== val){
						this.grid.getCell(i, j).update("", newVal ? COLOR_ALIVE : COLOR_DEAD);
					}
					next[i][j]= newVal;
				}
			}
			this.cells= next;
		},

		countNeighbors : function (i, j) {
			var sum= this.cells[i-1][j] + this.cells[i+1][j];
			sum+= this.cells[i][j-1] + this.cells[i][j+1];
			sum+= this.cells[i-1][j-1] + this.cells[i-1][j+1];
			sum+= this.cells[i+1][j-1] + this.cells[i+1][j+1];
			return sum;
		},

		clear : function(){
			var size= this.grid.cellCount;
			var lowerCenter= Math.round(size/2) - 3;
			var upperCenter= Math.round(size/2) + 3;
			console.log("mid", lowerCenter, upperCenter);

			for (var i = 0; i < size; i++) {
				this.cells[i] = new Array();
				for (var j = 0; j < size; j++) {

					// outer walls
					if(i === 0 || j === 0 || i === size-1 || j === size-1){
						this.cells[i][j]= 0;
					}else{
						// starting zone
						if(i>lowerCenter && i<upperCenter && j>lowerCenter && j<upperCenter){
							this.cells[i][j]= Math.random()> 0.5 ? 1 : 0;

						}else{
							this.cells[i][j]= 0;
						}
					}

					this.grid.getCell(i, j).update("", this.cells[i][j] ? COLOR_ALIVE : COLOR_DEAD);
				}
			}
		}
	}

	init();
}());
