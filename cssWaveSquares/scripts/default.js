(function(){
  (function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
  })();

  var size=70;
  var max=10;
  var squares= [];
  var running=false;

  (function(){
  	var n;

  	for(var i=0;i<max;i++){
  		for(var j=0;j<max;j++){
  			n=i*max+j; //unique number for id
  			$(".container").append(" <div id='num"+n+"' class='square'></div> ");
  			squares.push(document.getElementById("num"+n));
  			squares[n].style.top=i*size+"px";
  			squares[n].style.left=j*size+"px";
  			squares[n].style.webkitTransform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)";
              squares[n].style.transform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)";
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
  }());

  function onEnterFrame(time){
  	running=true;
  	var update=false;
  	for(var i=0; i < squares.length; i++){
  		if(squares[i].animated){
  			update= true;

  			//get current z-Position
  			var transform= squares[i].style.webkitTransform || squares[i].style.transform;
  			var z= Number(transform.split(", ")[14]);

  			//calculate new z
  			var newZ= z + (squares[i].targetZ -z ) / 8;
  			var dz= squares[i].targetZ - newZ;

  			//check if target was reached
  			if(Math.abs(dz) < 0.5){
  				newZ= squares[i].targetZ;

  				if(squares[i].targetZ === 0){ //reached target
  					squares[i].animated= false;
  				}else{
  					squares[i].targetZ= 0; //swap direction
  				}
  			}

  			//calculate color
  			var c= Math.floor(0x77*(newZ/150)+0x88);
  			var col= c<<16 | c<<8 | c;

  			//apply css style changes
  			squares[i].style.background="#"+col.toString(16);
  			squares[i].style.webkitTransform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, "+newZ+", 1)";
              squares[i].style.transform="matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, "+newZ+", 1)";
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
}());
