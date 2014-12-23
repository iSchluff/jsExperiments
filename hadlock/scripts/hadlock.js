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
    this.l= []; //cells to be labelled (always ordered)
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
    this.checkAdjacent(source, 0);

    //Execute in Single Cells
    this.markCells= (function () {
      var item= this.l.pop();
      var labelled= item[0].labelled;
      this.checkAdjacent(item[0], item[1]);
      if (!this.reached) {
        if(labelled){
          setTimeout(this.markCells(), 0);
        }else{
          setTimeout(this.markCells, 20);
        }

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

    // create cells in every direction and add to labelling list
    checkAdjacent: function(cell, value){
      this.labelCell(cell, value);

      for (var i= 1; i <= 4; i++) {
        var adj= this.getAdjacentCell(cell, i, true);

        if(!adj || adj.labelled){ continue; }
        var adjValue= cell.value + this.towards(cell, adj, this.target);

        if(adj !== this.source){
          this.g.getCell(adj.x, adj.y).update(adjValue.toString(), "#c2e0f6", "#56656c");
        }

        // try to progress in a straight line
        if (this.l.length !== 0 && this.l[this.l.length - 1][1] === adjValue) {
          this.l.push([adj, adjValue]);
        } else {
          // find correct spot for insertion
          var pos= this.binSearch(adjValue);
          this.l.splice(pos, 0, [adj, adjValue]);
        }
      }
    },
    printCellValues: function () {
      var a = [];
      for (var i = 0; i < this.l.length; i++) {
        a.push(this.l[i][1]);
      }
      console.log(a);
    },
    createCell: function (x, y) {
      var cell= new HadlockCell(x, y);
      this.map[x][y]= cell;
      return cell;
    },
    labelCell: function (cell, value) {
      if (cell && !cell.labelled) {
        //give the cell its value (label it)
        cell.value= value;
        cell.labelled= true;

        // check for target
        if(cell === this.target){
          this.reached= true;
          console.log("target labelled");

        // visualize
        }else{
          this.g.getCell(cell.x, cell.y).update(cell.value.toString(), "#d5fab5", "#56656c");
        }
      }
    },
    towards: function (cell, adjacentCell, target) { //1 if farther away / 0 if closer
      if (cell.x === adjacentCell.x) {
        return Math.abs(target.y - adjacentCell.y) < Math.abs(target.y - cell.y) ? 0 : 1;
      } else {
        return Math.abs(target.x - adjacentCell.x) < Math.abs(target.x - cell.x) ? 0 : 1;
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
      this.xDiff= cell.x - this.currCell.x;
      this.yDiff= cell.y - this.currCell.y;
      this.currValue= cell.value;
      this.currCell= cell;
      return cell;
    },

    //get next cell towards the source
    getNext: function () {

      // move in a straight line
      if (this.state === 1) {
        var x= this.currCell.x + this.xDiff;
        var y= this.currCell.y + this.yDiff;
        if (!this.badCoords(x, y) &&
             this.map[x][y]) {
          var newCell= this.map[x][y];

          console.log("towards", this.towards(this.currCell, newCell, this.source))

          if (newCell.labelled && newCell.value <= this.currValue && this.towards(newCell, this.currCell, this.source)) {
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

        // get adjacent cells
        for (var i= 1; i <= 4; i++) {
          var adjCell= this.getAdjacentCell(this.currCell, i, false);
          // if(adjCell){
          // 	this.g.getCell(adjCell.x, adjCell.y).update(adjCell.value.toString(), "#e36941");
          // }
          // requestAnimationFrame(enterFrame);
          if (adjCell && adjCell.labelled &&
              adjCell.value <= this.currValue &&

             // FIXME this breaks things if moving away from source: choose another direction
             (adjCell.x !== this.currCell.x - this.xDiff ||
              adjCell.y !== this.currCell.y - this.yDiff)){

            arr.push(adjCell);
          }
        }

        for(i= 0; i < arr.length; i++){
          var cell= arr[i];

          console.log(cell, this.towards(this.currCell, cell, this.source));

          if(this.towards(cell, this.currCell, this.source)){
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
        if (this.l[i][1] > find) {
          low= i + 1;
          continue;
        }
        if(this.l[i][1] < find) {
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
