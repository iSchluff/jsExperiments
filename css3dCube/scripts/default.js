(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var FILTER=0.6;
var FILTER2=0.03;
var TRESHOLD=1e-3;

var prevClass="show-front"
var sourceMat;
var lastPos=new Array(0,0);
var xDiff=0; var yDiff=0; //current difference
var xRot=0; var yRot=0; //total Rotation Value
var xSpeed=0; var ySpeed=0; //Rotation per Frame
var mouseDown=false;
var animating=false;
var inverted=false;


function init(){
    //console.log("Browser:",BrowserDetect.browser);
	$("#cube").mousedown(function(event){ //register mouseDown listener
		mouseDown=true;
		lastPos[0]=event.pageX;
		lastPos[1]=event.pageY;
		xSpeed=0; ySpeed=0;
		xDiff=0; yDiff=0;
		
		console.log(nextnumber(xRot*180/Math.PI)+" "+nextnumber(yRot*180/Math.PI)); //debug
		
		$("#main").mousemove(function(event){ //listen for mouseMove Events
			xDiff = (lastPos[0]-event.pageX)*3;
			yDiff = (lastPos[1]-event.pageY)*3;
			
			xSpeed=xDiff*(1-FILTER)+xSpeed*FILTER;
			ySpeed=yDiff*(1-FILTER)+ySpeed*FILTER;
			
			lastPos[0] = event.pageX;
			lastPos[1] = event.pageY;
		});
		
		$("#main").mouseup(function onMouseUp(){ //on mouseUp remove movelistener
			mouseDown=false;
			$("#main").unbind('mousemove');
			$("#main").unbind('mouseup');
		});
		
		if(!animating){
			requestAnimationFrame(onEnterFrame); //start Animating on Click
			animating=true;
		}
	});
    
	//sourceMat= parse3Mat("matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -150, 1)"); // matrix without rotations
    sourceMat= Matrix.create([
    [1,  0,  0],
    [0,  1,  0],
    [0,  0,  1]
  ]);
} 

//render loop
function onEnterFrame(t){
	if(mouseDown || (xSpeed!=0 || ySpeed!=0)){
		requestAnimationFrame(onEnterFrame);
	}else{
		animating=false; //stop rendering if nothing happens
		console.log("stopped Animation");
	}
	
	//invert rotation if the cube is upside down
	if(nextnumber(yRot*180/Math.PI)==180){
		inverted=true;
	}else{
		inverted=false;
	}

	if(mouseDown){ // Dragging - Animation
		xRot*=180/Math.PI; yRot*=180/Math.PI;
		
		if(!inverted){
			xRot+=xDiff/2.5;
		}else{
			xRot-=xDiff/2.5;
		}

		yRot+=yDiff/2.5;
		xRot+=360; xRot%=360; yRot+=360; yRot%=360
		xRot*=Math.PI/180; yRot*=Math.PI/180
		xDiff=0;yDiff=0;
		
	}else{ // Find Closest Face - Animation
		xRot*=180/Math.PI; yRot*=180/Math.PI;
		if (!inverted) {
			xSpeed=xSpeed*(1-FILTER2)+(nextnumber(xRot)-xRot)*FILTER2;
			xRot+=xSpeed/2.5;
		} else {
			xSpeed=xSpeed*(1-FILTER2)+(-nextnumber(xRot)+xRot)*FILTER2;
			xRot-=xSpeed/2.5; 
		}
		
		ySpeed=ySpeed*(1-FILTER2)+(nextnumber(yRot)-yRot)*FILTER2;
		yRot+=ySpeed/2.5;
		
		ySpeed*=0.95;
		xSpeed*=0.95;
		
		if (xSpeed<TRESHOLD && xSpeed>-TRESHOLD) {
			xSpeed=0;
		}
		if (ySpeed<TRESHOLD && ySpeed>-TRESHOLD) {
			ySpeed=0;
		}
		
		xRot+=360; xRot%=360; yRot+=360; yRot%=360
		xRot*=Math.PI/180; yRot*=Math.PI/180
	}
	
	var newMat = sourceMat.multiply(Matrix.RotationY(xRot).multiply(Matrix.RotationX(-yRot))) // Y then X -> Euler Rotation
	$("#cube").css("-webkit-transform",mat3ToString(newMat));
    $("#cube").css("-ms-transform",mat3ToString(newMat));
	$("#cube").css("transform",mat3ToString(newMat));
}

function checkRange(alpha){
	if(alpha<0){
		alpha+=360;
	}else if(alpha>360){
		alpha-=360;
	}
}

//Wandelt Sylvester-Matrix in css3d Matrix-String um
function mat3ToString(matrix){
    l= animating? 10 : 0;
    s  = "matrix3d(";
    s += matrix.e(1,1).toFixed(l) + "," + matrix.e(1,2).toFixed(l) + "," + matrix.e(1,3).toFixed(l) + ",0,";
    s += matrix.e(2,1).toFixed(l) + "," + matrix.e(2,2).toFixed(l) + "," + matrix.e(2,3).toFixed(l) + ",0,";
    s += matrix.e(3,1).toFixed(l) + "," + matrix.e(3,2).toFixed(l) + "," + matrix.e(3,3).toFixed(l) + ",0,";
    s += "0,0,-150,1)";
    return s;
}

//Sucht die nächste Zahl aus 0,90,180,280 und 360
function nextnumber(wert) {
	var numbers=new Array(0,90,180,270,360); var min=360;
	var diff; var zahl; var index;
	for (var i=0; i<5; i++) {
		zahl=numbers[i];
		diff=wert-zahl;
		if (Math.abs(diff)<min) {
			min=diff;
			index=i;
		}
	}
	return numbers[index];
}