/*global Matrix:false*/
/*jshint jquery:true, devel:true, browser:true, curly:true, latedef:true, newcap:true, unused:true*/
(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var cube= function(){
  "use strict";
  
  var FILTER=0.6;
  var FILTER2=0.03;
  var TRESHOLD=1e-3;
  
  var sourceMat;
  var lastPos= [0,0];
  var xDiff=0, yDiff=0; //current difference
  var xRot=0, yRot=0; //total Rotation Value
  var xSpeed=0, ySpeed=0; //Rotation per Frame
  var mouseDown=false;
  var animating=false;
  var inverted=false;
  
  var setup = function(){
    
    //register mouseDown listener
    $("#cube").mousedown(function(event){ 
      mouseDown=true;
      lastPos[0]=event.pageX;
      lastPos[1]=event.pageY;
      xSpeed=0; ySpeed=0;
      xDiff=0; yDiff=0;
  
       //listen for move Events
      $("#main").mousemove(function(event){
        xDiff = (lastPos[0]-event.pageX)*3;
        yDiff = (lastPos[1]-event.pageY)*3;
        
        xSpeed=xDiff*(1-FILTER)+xSpeed*FILTER;
        ySpeed=yDiff*(1-FILTER)+ySpeed*FILTER;
        
        lastPos[0] = event.pageX;
        lastPos[1] = event.pageY;
      });
      
      // on mouseUp remove movelistener
      $("#main").mouseup(function onMouseUp(){ 
        mouseDown=false;
        $("#main").unbind('mousemove');
        $("#main").unbind('mouseup');
      });
      
     //start Animating on Click
      if(!animating){
        window.requestAnimationFrame(render);
        animating=true;
      }
    });
    
    sourceMat= Matrix.create([
      [1,  0,  0],
      [0,  1,  0],
      [0,  0,  1]
    ]);
  };
  
  // Convert Sylvester Matrix to CSS Matrix String
  var mat3ToString = function(matrix){
    var l= animating? 10 : 0;
    var s= "matrix3d(";
    s += matrix.e(1,1).toFixed(l) + "," + matrix.e(1,2).toFixed(l) + "," + matrix.e(1,3).toFixed(l) + ",0,";
    s += matrix.e(2,1).toFixed(l) + "," + matrix.e(2,2).toFixed(l) + "," + matrix.e(2,3).toFixed(l) + ",0,";
    s += matrix.e(3,1).toFixed(l) + "," + matrix.e(3,2).toFixed(l) + "," + matrix.e(3,3).toFixed(l) + ",0,";
    s += "0,0,-150,1)";
    return s;
  };
  
  // Get next full front-rotation [0,90,180,270,360]
  var nextNumber = function(wert){
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
  };
  
  //render loop
  function render(){
    
    //stop rendering if nothing happens
    if(mouseDown || (xSpeed!==0 || ySpeed!==0)){
      window.requestAnimationFrame(render);
    }else{
      animating=false; 
    }
    
    //invert rotation if the cube is upside down
    if(nextNumber(yRot*180/Math.PI)==180){
      inverted=true;
    }else{
      inverted=false;
    }
    
    // Dragging
    if(mouseDown){ 
      xRot*=180/Math.PI; yRot*=180/Math.PI;
      
      //invert dragging if the cube is upside down
      if(!inverted){
          xRot+=xDiff/2.5;
      }else{
          xRot-=xDiff/2.5;
      }
  
      
      yRot+= yDiff / 2.5;
      xRot+= 360; xRot%= 360; yRot+= 360; yRot%=360;
      xRot*= Math.PI / 180; yRot*=Math.PI / 180;
      xDiff=0; yDiff=0;
        
      // Find Closest Face - Animation
    }else{
      xRot*=180/Math.PI; yRot*=180/Math.PI;
      
      // Smooth out Animation
      if (!inverted) {
          xSpeed= xSpeed * (1 -FILTER2) + (nextNumber(xRot) - xRot) * FILTER2;
          xRot+= xSpeed / 2.5;
      } else {
          xSpeed= xSpeed * (1 -FILTER2) + (-nextNumber(xRot) + xRot) * FILTER2;
          xRot-= xSpeed / 2.5; 
      }
      
      ySpeed= ySpeed * (1-FILTER2) + (nextNumber(yRot)-yRot) * FILTER2;
      yRot+= ySpeed / 2.5;
      
      // Slowly Stop Animating
      ySpeed*=0.95;
      xSpeed*=0.95;
      
      if (xSpeed<TRESHOLD && xSpeed>-TRESHOLD) {
          xSpeed=0;
      }
      if (ySpeed<TRESHOLD && ySpeed>-TRESHOLD) {
          ySpeed=0;
      }
      
      xRot+= 360; xRot%= 360; yRot+= 360; yRot%= 360;
      xRot*=Math.PI / 180; yRot*=Math.PI / 180;
    }
    
    // Y then X -> Euler Rotation
    var newMat = sourceMat.multiply(Matrix.RotationY(xRot).multiply( Matrix.RotationX(-yRot) ));
    $("#cube").css("-webkit-transform", mat3ToString(newMat));
    $("#cube").css("-ms-transform", mat3ToString(newMat));
    $("#cube").css("transform", mat3ToString(newMat));
  }
  
  setup();
};

$(document).ready(cube);