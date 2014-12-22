(function(){
  "use strict";

  window.Cell = function(x, y, text, color, textColor) {
    this.x = x;
    this.y = y;
    this.update(text, color, textColor);
  };

  Cell.prototype = {
    redraw : true,
    update : function (t, c, tc) {
      this.text = t || "";
      this.color = c || "#fff";
      this.textColor = tc || "#fff";
      this.redraw = true;
    }
  };

  window.Grid = function(c, cellCount) {
    this.w = c.width;
    this.h = c.height;

    this.cellCount = cellCount || 30;
    this.cellWidth = Math.round((this.w / this.cellCount));

    this.ctx = c.getContext("2d");

    this.ctx.fillStyle = "#f3f4f5";
    this.ctx.fillRect(0,0, this.w, this.h);

    for (var i = 0; i < this.cellCount; i++) {
      for (var j = 0; j < this.cellCount; j++) {
        this.cells.push(new Cell(j, i, ""));
      }
    }

    this.redraw();
  }

  Grid.prototype = {
    cells: [],
    renderCell : function (cell) {
      this.ctx.fillStyle = "#fff";
      this.ctx.fillRect(cell.x * (this.cellWidth) , cell.y * (this.cellWidth) , this.cellWidth-1 , this.cellWidth-1);
      this.ctx.fillStyle = cell.color;
      this.ctx.fillRect(cell.x * (this.cellWidth) , cell.y * (this.cellWidth) , this.cellWidth-1 , this.cellWidth-1);
      if (cell.text !== "") {
        this.ctx.fillStyle = cell.textColor;
        this.ctx.font = "16px Source Sans Pro";
        var xOffset= 9;
        var yOffset= 19;
        xOffset -= (cell.text.length - 1)*4; // center text

        this.ctx.fillText(cell.text, cell.x * this.cellWidth + xOffset, cell.y * this.cellWidth + yOffset);
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

      if (redrawCount === 0) {
        return false;
      }
      return true;
    },
    getCell: function(x,y){
      return this.cells[this.cellCount*y+x];
    }
  };

}());
