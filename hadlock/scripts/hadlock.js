(function(){
  
  window.HadlockCell= function(x, y, labelled) {
    this.x = x;
    this.y = y;
    this.value = 0; //steps walked away from target
    this.labelled = labelled || false;
  }
  
  var delay= 30;

  window.Hadlock= function(g, source, target, walls) {
    this.g = g; //grid
    this.labelled = new Array(); //labelled Cells (always ordered)
    this.source = source; //source cell
    this.target = target; //target cell
    this.walls = walls;
    //this.currValue = 0;

    // initialize map
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
    this.labelNext(source);

    this.markCells = (function () { //Execute in Single Cells
      var currentCell = this.labelled.pop();
      this.labelNext(currentCell);
      
      // loop until target is reached
      if (!this.reached) {
        setTimeout(this.markCells, delay);
        requestAnimationFrame(redraw);
        
      // if target is reached track back 
      } else {
        requestAnimationFrame(redraw);
        this.currValue=this.target.value;
        this.tracePath();
      }
    }).bind(this);

    //--------------------------- Follow the way back to the Source ----------------------------------

    this.currentCell = this.target;
    this.xDiff = 0;
    this.yDiff = 0;
    
    this.DEFAULT= 0;
    this.CONTINUOUS= 1;
    this.state = this.DEFAULT;

    this.path = new Array();
    this.tracePath = function () {
      this.move(this.getNext());
      
      if (this.currentCell !== this.source) {
        setTimeout(this.tracePath.bind(this), delay);
        this.g.getCell(this.currentCell.x, this.currentCell.y).update("","#f0af9a");
        
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
//        this.g.ctx.stroke();
        fsm.stop();
      }
      requestAnimationFrame(redraw);
    }

    //start
    this.markCells();
  }

  Hadlock.prototype = {
    createCell : function (x, y) {
      return this.map[x][y] = new HadlockCell(x, y);
    },
    
    // returns true if coordinates are available for moving
    badCoords : function (x, y) {
      return (y < 0 ||
              x < 0 ||
              y >= this.g.cellCount ||
              x >= this.g.cellCount ||
              this.walls[x][y] == 1);
    },
    
    getAdjacentCell : function (cell, direction, createCells) {
      // determine coordinates
      if(!cell){return};
      var x, y;
      // 1 - top, 3 - bottom
      if ((direction & 1) === 1) {
        x = cell.x;
        y = cell.y + direction - 2;

      // 2 - left, 4 - right
      } else {
        x = cell.x + direction - 3;
        y = cell.y;
      }
      
      if (this.badCoords(x, y)) {
        return null;
        
      } else if (x == this.target.x && y == this.target.y) {
        this.reached = true;
        return this.target;
        
      } else if (this.map[x][y]) {
        return this.map[x][y];
        
      } else if (createCells) {
        return this.createCell(x, y);
        
      }
      
      return null;
    },
    
    manhattanDist : function(cell){
      return Math.abs(this.target.x - cell.x) + Math.abs(this.target.y - cell.y);
    },
    
    hadlockDist : function(cell){
      return Math.abs(this.target.x - cell.x) + Math.abs(this.target.y - cell.y) - 2*this.target.value + 2* cell.value;
    },
    
    labelCell : function (cell, prevCell) {
      if (cell === null || cell.labelled) { return false; }

      // give the cell its value (label it)
      cell.value = prevCell.value + (this.manhattanDist(cell) > this.manhattanDist(prevCell) ? 1 : 0);
      cell.labelled = true;
      
      // visualize
      if(cell != this.target){
        this.g.getCell(cell.x, cell.y).update(cell.value.toString(), "#d5fab5", "#56656c");
      }else{
        console.log("####################FOO: "+cell.value+" "+prevCell.value+" "+this.manhattanDist(cell)<this.manhattanDist(prevCell));
      }
      
      // append to labelled list
      if (this.labelled.length !== 0 && this.labelled[this.labelled.length - 1].value >= cell.value) { 
        this.labelled.push(cell);
        
      // search for the right position for insert
      } else {
        var pos = this.binSearch(cell.value); 
        this.labelled.splice(pos, 0, cell);
      }
      return true;
    },
    
    nextDirections : function(cell){
      var d= [false, false, false, false];
            if(cell.y > this.target.y){ d[0]= true;
      }else if(cell.y < this.target.y){ d[2]= true; }
      
            if(cell.x > this.target.x){ d[1]= true;
      }else if(cell.x < this.target.x){ d[3]= true; }
      return d;
    },
    
    // label cells in direction of the target
    labelNext : function (cell) {
      var directions= this.nextDirections(cell),
      changed= false;
      
      // try to label cells in target direction
      for(var i=0; i<4; i++){
        if(directions[i]){
          changed= this.labelCell(this.getAdjacentCell(cell, i+1, true), cell);
        }
      }
      
      // move away from the target otherwise
      if(!changed){
        for(var i=0; i<4; i++){
          if(!directions[i]){
            this.labelCell(this.getAdjacentCell(cell, i+1, true), cell);
          }
        }
      }
        
      if(cell != this.source){
        this.g.getCell(cell.x, cell.y).update(cell.value.toString(), "#c2e0f6", "#56656c");
      }
    },
    
    printCellValues : function () {
      var a = new Array();
      for (var i = 0; i < this.l.length; i++) {
        a.push(this.l[i].value);
      }
      console.log(a);
    },

    move : function (cell) { //move 1 cell towards the source
      this.xDiff = cell.x- this.currentCell.x ;
      this.yDiff = cell.y- this.currentCell.y ;
      this.currValue = cell.value;
      this.currentCell = cell;
      return cell;
    },

    getNext : function () { //get next cell towards the source
      
      if (this.state === this.CONTINUOUS) {
        if (!this.badCoords(this.currentCell.x + this.xDiff, this.currentCell.y + this.yDiff) &&
            this.map[this.currentCell.x + this.xDiff][this.currentCell.y + this.yDiff] !== null) {
          var newCell = this.map[this.currentCell.x + this.xDiff][this.currentCell.y + this.yDiff];

          if (newCell.value <= this.currValue) {
            return newCell;
          }
        }
        this.state = this.DEFAULT;
      }
      
      if (this.state === this.DEFAULT) {
        this.path.push(this.currentCell);
        this.state = this.CONTINUOUS;
        
        var arr = new Array();
        for (var i = 1; i <= 4; i++) { //create / label cell in every direction
          var adjCell = this.getAdjacentCell(this.currentCell, i, false);
          if(adjCell !== null){
//            this.g.getCell(adjCell.x, adjCell.y).update(adjCell.value.toString(),"#e36941")
            
            console.log(adjCell);
            console.log(this.currValue, this.target.value,
                       (adjCell.x != this.currentCell.x - this.xDiff ||
                        adjCell.y != this.currentCell.y - this.yDiff));
            //console.log(this.g.getCell(adjCell.x, adjCell.y));
            
            if(adjCell.value <= this.currValue &&
             (adjCell.x !== this.currentCell.x - this.xDiff ||
              adjCell.y !== this.currentCell.y - this.yDiff )){
            arr.push(adjCell);
            } 
          }
        }

        requestAnimationFrame(redraw);
        for(var i= 0; i < arr.length; i++){
          var cell= arr[i]
          if(this.hadlockDist(cell) > this.hadlockDist(this.currentCell)){
            return cell;
          }
        }
        console.log("nope.avi");
        return arr.pop();
      }
    },
    binSearch : function (find) { //standard binary search implementation
      var low = 0,
      high = this.labelled.length - 1,
      i;
      while (low <= high) {
        i = Math.floor((low + high) / 2);
        if (this.labelled[i].value > find) {
          low = i + 1;
          continue;
        };
        if (this.labelled[i].value < find) {
          high = i - 1;
          continue;
        };
        return i;
      }
      return low;
    },
    constructor : Hadlock
  }
}())