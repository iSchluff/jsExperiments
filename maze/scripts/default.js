(function () {
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;
})();

function init() {
	var canvas = document.getElementById("canvas");
	
	new Life(50, function(n){ //0 die 1 born 2 alive
		return (n>0 && n<6) ? ( n==3 ?  1 : 2) : 0;
	});

}

function enterFrame() {
	if (grid.redraw()) {
		requestAnimationFrame(enterFrame);
	}
}

/* Moore Neighborhood */
function Life(size, neighborfunction){
	this.cells=new Array();
	this.getNextCellValue=neighborfunction;
	for(var i=0;i<size;i++){
		cells[i]=new Array();
		for(var j=0;j<size;j++){
			cells[i][j]=0;
		}
	}
	
}

Life.prototype = {
	step : function(){
		for(var i=0;i<this.cells.length;i++){
			for(var j=0;j<this.cells.length;j++){
				var val=cells[i][j];
				var newVal=this.getNextCellValue(this.countNeighbors(i,j));
				cells[i][j]= val==0 ? (newVal==1 ? 1 : 0) : (newVal==2 ? 1 : 0);
			}
		}
	},
	
	countNeighbors : function(i,j){
		
	},
	
	getValue : function(i,j){
		
	}
}


