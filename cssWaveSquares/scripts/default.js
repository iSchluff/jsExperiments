(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var size=50;
var max=14;
var counter=0;
var squares=new Array();

function init(){
	var counter;
	
	for (var i=0;i<max;i++){
		for(var j=0;j<max;j++){
			counter=i*max+j;
			$(".container").append(" <div on class='square num" + counter +"'></div> ");
			squares.push($(".num"+counter));
			squares[counter].css("top",i*size);
			squares[counter].css("left",j*size);
			squares[counter].css("-webkit-transform","matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)");
			squares[counter][0].hovered=false;
			squares[counter][0].i=i;
			squares[counter][0].j=j;
			squares[counter][0].speed=0;
			
			squares[counter].click(function(event){ //register mouse Event Listeners
				var square=event.currentTarget;
				console.log("huhu");
				turn(square);
				requestAnimationFrame(onEnterFrame);
			});
		}
	}
}

function onEnterFrame(time){
	var update=true;
	counter++;
	for(var i=0;i<squares.length;i++){
		if(squares[i][0].hovered){
			var transform=squares[i].css("-webkit-transform");
			if(transform !="matrix(1, 0, 0, 1, 0, 0)"){ 
				var dz=transform.split(", ")[14];
				var speed=0.2*(150-dz)+0.8*squares[i][0].speed
				dz+=squares[i][0].speed;
				console.log(dz+" "+speed);
				squares[i].css("-webkit-transform","matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, "+dz+", 1)");
				squares[i][0].speed=speed*0.9;
				if(Math.abs(speed)<0.0001){
					speed=0;
				}
			}else{
				squares[counter].css("-webkit-transform","matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1)");
			}
		}else{
		}
	}
	
	if(counter<500)requestAnimationFrame(onEnterFrame);
}

function turn(square){
		if(!square.hovered){
		square.hovered=true;	
		var x=square.i;
		var y=square.j;
	
		square.timeLeft=500;

		/*turnSquare(x+1,y);
		turnSquare(x-1,y);
		turnSquare(x,y+1);
		turnSquare(x,y-1);*/

	}
}

function turnSquare(x,y){
	var c=x+max*y;
	if(x>-1 && x<max && y>-1 && y<max && !squares[c][0].hovered){
		setTimeout(function(){
			turn(squares[c][0]);
		},75);
	}
}
