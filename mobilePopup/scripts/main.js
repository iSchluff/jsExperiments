var width;
var animating=false;

function init(){
	document.getElementById("errorBtn").addEventListener("click",function(){popup(deletePopup("Delete Element", "Abort"))});
	document.getElementById("msgBtn").addEventListener("click",function(){popup(dialog("Accept", "Abort"))});
}	

function deletePopup(accept, abort){
	var div=document.createElement("div");
	div.innerHTML="<div id='dialogAccept' class='red formBtn'>"+accept+"</div> <div id='dialogAbort' class='formBtn'>"+abort+"</div>";
	return div;
}

function dialog(accept, abort){
	var div=document.createElement("div");
	div.innerHTML="<div id='dialogAccept' class='formBtn'>"+accept+"</div> <div id='dialogAbort' class='formBtn'>"+abort+"</div>";
	return div;
}

function addHover(div){
	div.addEventListener("touchstart",function(){
		div.classList.add("over");
		var listen=document.body.addEventListener("touchend",function(){
			div.classList.remove("over");
			document.body.removeEventListener("touchend", listen, false);
		}.bind(this), false);
	}.bind(this));
}

function popup(popup){
	var height=popup.offsetHeight;
	var hover=document.createElement("div");
	popup.classList.add("popup");
	hover.classList.add("fade");
	document.body.appendChild(hover);
	document.body.appendChild(popup);
	var preventDefault=document.body.addEventListener('touchmove', function(e){e.preventDefault()})
	
	var abortBtn=document.getElementById("dialogAbort");
	var acceptBtn=document.getElementById("dialogAccept");
	addHover(acceptBtn);
	addHover(abortBtn);
	abortBtn.addEventListener("click",function(){
		popup.parentNode.removeChild(popup);
		hover.parentNode.removeChild(hover);
		document.body.removeEventListener('touchmove', preventDefault);
	}.bind(this));
	acceptBtn.addEventListener("click",function(){
		popup.parentNode.removeChild(popup);
		hover.parentNode.removeChild(hover);
		document.body.removeEventListener('touchmove', preventDefault);
	}.bind(this));
	
	setTimeout(function(){
		popup.style.webkitTransform="translateY(-100%)";
		hover.style.background="rgba(0,0,0,0.4)";
	}.bind(this),10);
}