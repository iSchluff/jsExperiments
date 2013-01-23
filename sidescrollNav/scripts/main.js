var width;
var animating=false;

function resetWidth(){
	width=$(window).width();
	$(".ac-container article").css({
		"width": width+"px",
		"-webkit-transform": "translate("+width+"px, 0px)",
		"transform": "translate("+width+"px, 0px)"
	});
	$("#back").css({
		"width": width+"px",
		"-webkit-transform": "translate("+width+"px, 0px)",
		"transform": "translate("+width+"px, 0px)"
	});
	$(".container").css("width",width+"px");
}

function shift(){
	$(window.location.hash).addClass("active");
	$("#back").addClass("active");
	$(".container").css({
		"-webkit-transform": "translate(-"+width+"px, 0px)",
		"transform": "translate(-"+width+"px, 0px)"
	});
}

function unshift(){
	$(".container").css({
		"-webkit-transform": "translate(0px, 0px)",
		"transform": "translate(0px, 0px)"
	});
	setTimeout(function(){
		$(".ac-container article").removeClass("active");
		$("#back").removeClass("active");
	},500);
}

 
window.onorientationchange = function() {
	var orientation = window.orientation; //possibilities: 0 90 -90
  	resetWidth();
  	if(window.location.hash) {
		shift();
	}else{
		unshift();
	}
};

function init(){
	resetWidth();
	
	if(window.location.hash) {
		shift();
	}
	
	$(window).bind('hashchange', function() {
		console.log("hashchange on window");
		console.log("new hash: "+window.location.hash);
			if(window.location.hash) {
				shift();
			}else{
				unshift();
			}
	});
	
	$(".ac-container div a").click(function(e){
		var targetId=e.target.parentNode.attributes.href.nodeValue.split("#")[1];
		window.location.hash=targetId;
	});
	
	$("#back").click(function(e){
		window.location.hash="";
	});
	
	$(".container").css({
		"-webkit-transition": "-webkit-transform .5s ease-in-out", /* Safari and Chrome */
		"transition": "transform .5s ease-in-out"
	});
}	


	
