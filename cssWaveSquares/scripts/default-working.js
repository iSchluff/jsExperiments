(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var size=50;
var max=14;
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
			
			squares[counter].click(function(event){ //register mouse Event Listeners
				var square=event.currentTarget;
				turn(square);

			});
		}
	}
}

function turn(square){
		if(!square.classList.contains("hovered")){
		square.classList.add("hovered");
		
		var c=-1;
		for(var i=0;i<square.classList.length;i++){
		var str=square.classList.item(i);
		if(str.search("num") != -1){
				c=str.split("num")[1];
			}
		}
		
		setTimeout(function(){
			square.classList.remove("hovered");
		},500);

		var x=c%max;
		var y=Math.floor(c/max);

		turnSquare(x+1,y);
		turnSquare(x-1,y);
		turnSquare(x,y+1);
		turnSquare(x,y-1);

	}
}

function turnSquare(x,y){
	var c=x+max*y;
	
	if(x>-1 && x<max && y>-1 && y<max && !$(".num"+c)[0].classList.contains("hovered")){
		
		setTimeout(function(){
			turn(squares[c][0]);
		},75);
	}
}
