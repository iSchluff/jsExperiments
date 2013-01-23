(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

function init(){
	var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0];
	x=w.innerWidth||e.clientWidth||g.clientWidth;
	y=w.innerHeight||e.clientHeight||g.clientHeight;
	
	var size=100;
	var max=7;
	
	var counter;
	for (var i=0;i<max;i++){
		for(var j=0;j<max;j++){
			counter=i*max+j;
			$(".container").append(" <div on class='square num" + counter +"'><div class='front'></div><div class='back'></div></div> ");
			$(".num"+counter).css("top",i*size);
			$(".num"+counter).css("left",j*size);
			$(".num"+counter).mouseenter(function(event){ //register mouse Event Listeners
				var square=event.currentTarget;
				square.classList.add("hovered");
				square.addEventListener("mouseout",function(event){
				var intervalVar=setInterval(function(){
					square.classList.remove("hovered");
					this.clearInterval(intervalVar);
				},500);
				});
			});
		}
	}
	
}
