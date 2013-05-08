(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var size=50;
var max=14;
var squares=new Array();
var running=false;

function init(){
	var n;
	
	for(var i=0;i<max;i++){
		for(var j=0;j<max;j++){
			n=i*max+j; //unique number for id
			$(".container").append(" <div id='num"+n+"' class='square'></div> ");
			squares.push(document.getElementById("num"+n));
			squares[n].style.top=i*size+"px";
			squares[n].style.left=j*size+"px";
			squares[n].style.webkitTransform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)";
			squares[n].animated=false;
			squares[n].targetZ=0;
			squares[n].i=i;
			squares[n].j=j;
			
			squares[n].onclick= function(event){ //register mouse Event Listeners
				var square=event.currentTarget;
				animate(square);
				if(!running){
					requestAnimationFrame(onEnterFrame);
				}
			};
		}
	}
}

function onEnterFrame(time){
	running=true;
	var update=false;
	for(var i=0;i<squares.length;i++){
		if(squares[i].animated){
			update=true;
			var transform=squares[i].style.webkitTransform;
			var z=Number(transform.split(", ")[14]);
			var newZ=z+(squares[i].targetZ-z)/10;
			var dz=squares[i].targetZ-newZ;
			
			if(Math.abs(dz)<0.5){
				newZ=squares[i].targetZ;
				
				if(squares[i].targetZ==0){ //reached target
					squares[i].animated=false;
				}else{
					squares[i].targetZ=0; //swap direction
				}
			}
			squares[i].style.webkitTransform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, "+newZ+", 1)";
		}
	}
	if(update){
		requestAnimationFrame(onEnterFrame);
	}else{
		running=false;
	}
}

function animate(square){
		if(!square.animated){
		square.animated=true;
		square.targetZ=150;	
		var x=square.j;
		var y=square.i;

		turnSquare(x+1,y);
		turnSquare(x-1,y);
		turnSquare(x,y+1);
		turnSquare(x,y-1);

	}
}

function turnSquare(x,y){
	var c=x+max*y;
	if(x>-1 && x<max && y>-1 && y<max && !squares[c].animated){
		setTimeout(function(){
			animate(squares[c]);
		},75);
	}
}
