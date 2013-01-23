function Cell(x, y, text, color, textColor) {
	this.x = x;
	this.y = y;
	this.update(text, color, textColor);
}

Cell.prototype = {
	redraw : true,
	update : function (t, c, tc) {
		this.text = t || "";
		this.color = c || "FFFFFF";
		this.textColor = tc || "eee";
		this.redraw = true;
	},
	constructor : Cell
};

function Grid(c, cellCount) {
	this.w = c.width;
	this.h = c.height;
	
	this.cellCount = cellCount || 30;
	this.cellWidth = Math.round((this.w / this.cellCount));
	
	this.ctx = c.getContext("2d");
	
	this.ctx.fillStyle = "ddd";
	this.ctx.fillRect(0,0, this.w, this.h);
	
	for (var i = 0; i < this.cellCount; i++) {
		for (var j = 0; j < this.cellCount; j++) {
			this.cells.push(new Cell(j, i, ""));
		}
	}
	
	this.redraw();
}

Grid.prototype = {
	cells: new Array(),
	renderCell : function (cell) {
		this.ctx.fillStyle = "ffffff";
		this.ctx.fillRect(cell.x * (this.cellWidth) , cell.y * (this.cellWidth) , this.cellWidth-1 , this.cellWidth-1);
		this.ctx.fillStyle = cell.color;
		this.ctx.fillRect(cell.x * (this.cellWidth)+2 , cell.y * (this.cellWidth)+2 , this.cellWidth-5 , this.cellWidth-5);
		if (cell.text != "") {
			this.ctx.fillStyle = cell.textColor;
			this.ctx.font = "16px Tahoma";
			this.ctx.fillText(cell.text, cell.x * this.cellWidth + 8, cell.y * this.cellWidth + 19);
		}
	},
	redraw : function () {
		var redrawCount = 0;
		for (var i = 0; i < this.cells.length; i++) {
			var cell = this.cells[i];
			if (cell.redraw) {
				cell.redraw = false;
				this.renderCell(cell);
				redrawCount++;
			}
		}
		
		if (redrawCount == 0) {
			return false;
		}
		return true;
	},
	getCell: function(x,y){
		return this.cells[this.cellCount*y+x];
	},
	constructor: Grid
};