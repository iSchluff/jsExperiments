(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var size=50;
var cellCount=11;
var squares=new Array();
var grid;

var counter=0;

var target;
var turtle;

var map=[[0,0,0,0,0,0,0,0,0,0,0],
		[0,1,0,1,0,1,0,1,0,1,0],
		[0,1,0,0,0,0,0,0,0,1,0],
		[0,1,0,0,0,0,0,0,0,1,0],
		[0,1,0,0,1,0,1,0,0,1,0],
		[0,0,0,0,0,0,0,0,0,1,0],
		[0,1,0,0,1,0,1,0,0,1,0],
		[0,1,0,0,0,0,0,0,0,1,0],
		[0,1,0,0,0,0,0,0,0,1,0],
		[0,1,0,1,0,1,0,1,0,1,0],
		[0,0,0,0,0,0,0,0,0,0,0]]

function init(){
	grid=new Grid(document.getElementById("canvas"),cellCount);
	for(var i=0;i<cellCount;i++){
		squares[i]=new Array();
		for(var j=0;j<cellCount;j++){
			squares[i][j]=new Square(map[i][j]);
		}
	}
	target=new Target(0,0);
	turtle=new Turtle(0,9);
	
	document.addEventListener("keydown", handleKey);
	document.addEventListener("keyup", handleKey);
	
	requestAnimationFrame(onEnterFrame);
}

function onEnterFrame(time){
	counter++;
	if(counter%8==0){
		target.move();
	}
	if(counter==16){
		turtle.move();
		counter=0;
	}
	
	for(var i=0;i<cellCount;i++){
		for(var j=0;j<cellCount;j++){
			calcLevel(j,i);
		}
	}
	grid.redraw();
	//requestAnimationFrame(onEnterFrame);
	setTimeout(onEnterFrame,41);
}

function calcLevel(x,y){
	var square=squares[x][y];
	if(square.type==0){
		var adj=adjacentLevels(x,y);
		var l=0;
		for(var i=0;i<adj.length;i++){
			l+=adj[i];
		}
		l/=adj.length;
		square.level=l;
	}
	square.determineColor();
	grid.getCell(x,y).update("",square.col);
}

function adjacentLevels(x,y){
	var arr=[getLevel(x+1,y),getLevel(x-1,y),getLevel(x,y+1),getLevel(x,y-1)]
	return arr;
}

//helper method, checks bounds
function getLevel(x,y){
	if(x>=0 && x<cellCount && y>=0 && y<cellCount){
		return squares[x][y].level;
	}
	return 1;
}

function handleKey(){
}

//represents one grid square
function Square(type, level){
	this.type=type;
	this.level=level||1;
	this.determineColor();
}

Square.prototype = {
	constructor: Square,
	col:"",
	determineColor:function(){
		var col;
		var c=255-(Math.log(this.level)*50);
		
		switch(this.type){
			case 0: col=((c<<16)|(c<<8)|c).toString(16); break;
			case 1: col="69e"; break;
			case 2: col="e96"; break;
			case 3: col="9e6"; break;
		}
		this.col=col;
	}
};


//moves in lines
function Target(x,y){
	this.position=x*cellCount+y;
	this.x=x;
	this.y=y;
	this.storeSquare=squares[x][y];
	this.update();
}

Target.prototype = {
	constructor: Target,
	update: function(){
		var x=this.position%cellCount;
		var y=Math.floor(this.position/cellCount);
		squares[this.x][this.y]=this.storeSquare;
		this.storeSquare=squares[x][y];
		squares[x][y]=new Square(2,255);
		
		this.x=x;
		this.y=y;
	},
	move: function(){
		this.position++;
		if(this.position>=cellCount*cellCount){
			this.position=0;
		}
		this.update();
	}
}

//chases target
function Turtle(x,y){
	this.x=x;
	this.y=y;
	this.storeSquare=squares[x][y];
	this.update(x,y);
}

Turtle.prototype = {
	constructor: Turtle,
	update: function(x,y){
		squares[this.x][this.y]=this.storeSquare;
		this.storeSquare=squares[x][y];
		squares[x][y]=new Square(3);
		this.x=x;
		this.y=y;
	},
	nextPos: function(){
		var adj=adjacentLevels(this.x,this.y);
		var max=Math.max.apply(Math, adj);
		for(var i=0;i<adj.length;i++){
			if(adj[i]==max){
				switch(i){
				case 0: return {x:this.x+1,y:this.y};
				case 1: return {x:this.x-1,y:this.y};
				case 2: return {x:this.x,y:this.y+1};
				case 3: return {x:this.x,y:this.y-1};
				}
			}
		}
	},
	move: function(){
		var pos=this.nextPos();
		this.update(pos.x, pos.y);
	}
}