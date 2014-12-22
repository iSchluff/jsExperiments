(function(){
  "use strict";

  window.HadlockCell= function(x, y, labelled){
    this.x = x;
    this.y = y;
    this.value = 0; //steps walked away from target
    this.labelled = labelled || false;
  }

  window.Hadlock= function(grid, source, target, walls){
    window.h= this; //debug access

    this.g= grid; //grid
    this.l= []; //labelled Cells (always ordered)
    this.source= source; //source cell
    this.target= target; //target cell
    this.walls= walls;

    this.map= [];
    for (var i= 0; i < this.g.cellCount; i++) {
      this.map[i]= [];
      for (var j= 0; j < this.g.cellCount; j++) {
        this.map[i][j]= null;
      }
    }

    this.map[this.source.x][this.source.y]= this.source;
    this.map[this.target.x][this.target.y]= this.target;

    //--------------------------- Mark Cells from Source to Target ----------------------------------
    //terminate marking cells when true
    this.reached= false;
    this.labelAdjacent(source);

    //Execute in Single Cells
    this.markCells= (function () {
      var currentCell= this.l.pop();
      this.labelAdjacent(currentCell);
      if (!this.reached) {
        setTimeout(this.markCells, 20);
        requestAnimationFrame(enterFrame);
      } else {
        requestAnimationFrame(enterFrame);
        this.currValue= this.target.value;
        this.tracePath();
      }
    }).bind(this);

    //--------------------------- Follow the path back to the Source ----------------------------------
    this.currCell= this.target;
    this.xDiff= 0;
    this.yDiff= 0;
    this.state= 0;

    this.path= [];
    this.tracePath= function () {
      var nextCell= this.getNext();

      this.move(nextCell);
      if (this.currCell !== this.source) {
        setTimeout(this.tracePath.bind(this), 50);
        this.g.getCell(this.currCell.x, this.currCell.y).update("","#f0af9a");

      } else {
        console.log("tadaaah");
        this.path.push(this.source);
        this.g.ctx.lineWidth= 2;
        this.g.ctx.moveTo((this.path[0].x + 0.5) * this.g.cellWidth, (this.path[0].y + 0.5) * this.g.cellWidth);
        for(var i= 1; i < this.path.length; i++){
          var cell= this.path[i];
          this.g.ctx.lineTo((cell.x + 0.5) * this.g.cellWidth, (cell.y + 0.5) * this.g.cellWidth);
          //this.g.getCell(cell.x,cell.y).update("","FF0000");
        }
        //this.g.ctx.stroke();
        fsm.stop();
      }
      requestAnimationFrame(enterFrame);
    };

    //start
    this.markCells();
  }

  Hadlock.prototype= {
    labelAdjacent: function (cell) {
      for (var i= 1; i <= 4; i++) { //create / label cell in every direction
        this.labelCell(this.getAdjacentCell(cell, i, true), cell);
        if(cell !== this.source){
          this.g.getCell(cell.x, cell.y).update(cell.value.toString(), "#c2e0f6", "#56656c");
        }
      }
    },
    printCellValues: function () {
      var a = [];
      for (var i = 0; i < this.l.length; i++) {
        a.push(this.l[i].value);
      }
    },
    createCell: function (x, y) {
      var cell= new HadlockCell(x, y);
      this.map[x][y]= cell;
      return cell;
    },
    labelCell: function (cell, prevCell) {
      if (cell && !cell.labelled) {

        //give the cell its value (label it)
        cell.value = prevCell.value + this.towards(prevCell, cell);
        cell.labelled = true;

        //visualize
        if(cell === this.target){
          this.reached= true;
          console.log("target labelled");
        }else{
          this.g.getCell(cell.x, cell.y).update(cell.value.toString(), "#d5fab5", "#56656c");
        }

        //insert into labelled list
        if (this.l.length !== 0 && this.l[this.l.length - 1].value === cell.value) { //try to progress in a straight line
          this.l.push(cell);
        } else {
          var pos = this.binSearch(cell.value); //search for the right position for insert
          this.l.splice(pos, 0, cell); //insert
        }
      }
    },
    towards: function (cell, adjacentCell) { //1 if farther away / 0 if closer
      if (cell.x == adjacentCell.x) {
        return Math.abs(this.target.y - adjacentCell.y) < Math.abs(this.target.y - cell.y) ? 0 : 1;
      } else {
        return Math.abs(this.target.x - adjacentCell.x) < Math.abs(this.target.x - cell.x) ? 0 : 1;
      }
    },

    getAdjacentCell: function (cell, direction, createCells) {
      var x, y;
      if ((direction & 1) === 0){
        x= cell.x + direction - 3;
        y= cell.y;
      }else{
        x= cell.x;
        y= cell.y + direction - 2;
      }

      return this.getCell(x, y, createCells);
    },

    // get cell from map, if necessary create it
    getCell: function(x, y, createCells){
      if(this.badCoords(x,y)){
        return null;
      }

      if (this.map[x][y]) {
        return this.map[x][y];
      }else if(createCells) {
        return this.createCell(x, y);
      }else{
        return null;
      }
    },

    // check if coordinates are outside the grid
    badCoords: function (x, y) {
      return (y < 0 || x < 0 || y >= this.g.cellCount || x >= this.g.cellCount || this.walls[x][y] == 1);
    },

    //move 1 cell towards the source
    move: function (cell) {
      this.xDiff= cell.x- this.currCell.x;
      this.yDiff= cell.y- this.currCell.y;
      this.currValue= cell.value;
      this.currCell= cell;
      return cell;
    },

    //get next cell towards the source
    getNext: function () {

      // move in a straight line
      if (this.state === 1) {
        if (!this.badCoords(this.currCell.x + this.xDiff, this.currCell.y + this.yDiff) && this.map[this.currCell.x + this.xDiff][this.currCell.y + this.yDiff]) {
          var newCell = this.map[this.currCell.x + this.xDiff][this.currCell.y + this.yDiff];

          if (newCell.value <= this.currValue) {
            return newCell;
          }
        }

        // default to searching
        this.state= 0;
      }

      // search best adjacent cell
      if (this.state === 0) {
        this.path.push(this.currCell);
        this.state= 1;
        var arr= [];
        for (var i= 1; i <= 4; i++) { //create / label cell in every direction
          var adjCell= this.getAdjacentCell(this.currCell, i, false);
          // if(adjCell){
          // 	this.g.getCell(adjCell.x, adjCell.y).update(adjCell.value.toString(), "#e36941");
          // }
          requestAnimationFrame(enterFrame);
          if (adjCell && adjCell.value <= this.currValue && (adjCell.x != this.currCell.x - this.xDiff || adjCell.y != this.currCell.y - this.yDiff) ) {
            arr.push(adjCell);
          }
        }


        requestAnimationFrame(enterFrame);
        for(i= 0; i < arr.length; i++){
          var cell= arr[i];

          if(this.towards(this.currCell, cell)){
            return cell;
          }
        }

        return arr.pop();
      }
    },

    //standard binary search implementation
    binSearch: function(find) {
      var low= 0,
      high= this.l.length - 1,
      i;
      while(low <= high) {
        i= Math.floor((low + high) / 2);
        if (this.l[i].value > find) {
          low= i + 1;
          continue;
        }
        if(this.l[i].value < find) {
          high= i - 1;
          continue;
        }
        return i;
      }
      return low;
    },
    constructor : Hadlock
  };

}());
