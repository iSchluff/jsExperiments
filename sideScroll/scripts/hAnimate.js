function setCss(element, props) {
	for (var key in props) {
		element.style.setProperty(key, props[key], false);
	}
}

function removeToInsertLater(element) {
  var parentNode = element.parentNode;
  var nextSibling = element.nextSibling;
	var filler=document.createElement("div");
	filler.style.width=element.style.width;
	filler.style.height=element.style.height;
	parentNode.replaceChild(filler, element);
  return function() {
    parentNode.replaceChild(element, filler);
  };
}

function Display(view, parent) { //parent optional - default is document.body
	this.container = document.createElement("div");
	this.container.id = "container";
	this.filler=document.createElement("div");
	this.filler.id="filler";
	this.filler.style.positioning="absolute";
	var parent = parent || document.body;
	parent.appendChild(this.container);
//	parent.appendChild(this.filler);
	
	this.animating = false;
	
	setCss(this.container.parentNode, {
		"overflow-x" : "hidden",
		"overflow-y" : "scroll",
		"-webkit-overflow-scrolling" : "touch"
	});
	
	setCss(this.container, this.containerCss);
	this.switchView(view);
}

Display.prototype = {
	containerCss : { //helper object
		"-webkit-transform-style" : "preserve-3d",
		"-webkit-backface-visibility" : "hidden",
		"-webkit-box-sizing" : "border-box",
		"position" : "absolute",
		"width" : "100%",
	},
	resetSize : function (heightDiff) {
		heightDiff = 0 || heightDiff;
		if (!this.parentIsBody) {
			setCss(this.container.parentNode, {
				"height" : (window.innerHeight - heightDiff) + "px",
				"width" : (window.innerWidth) + "px"
			});
		}
	},
	switchView : function (view, callback, animate, direction, scrollPosition) { //direction -1/+1
		if (!view || this.animating)
			return;
			
		var animate = animate || false;
		var direction = direction || -1;
		var scrollPosition = scrollPosition || 0;
		var prevHash = window.location.hash;
		var prevScroll = this.container.parentNode.scrollTop;
		console.log("scrollPosition: "+scrollPosition);
		
		if (window.location.hash != view.id) {
			window.location.hash = view.id;
		}
		
		if (animate && (direction == 1 || direction == -1)) {
			var width = window.innerWidth;
			
			this.animating = true;
			
			//create new Container
			tmpContainer = document.createElement("div");
			tmpContainer.id = "tmpContainer";
			
			//set it's css
			setCss(tmpContainer, this.containerCss);
			var top=(this.container.parentNode.scrollTop - scrollPosition);
			console.log("top: "+top);
			setCss(tmpContainer, {
				"-webkit-transform" : "translate3d("+(-direction*100)+"%,"+top+" + px,0)",
				"-webkit-transition" : "-webkit-transform .35s ease-in-out"
			})
			
			//fill in enough elements for animation
			var height = window.innerHeight;
			var clone = view.cloneNode(true);
			var left = clone.childNodes.length;
			while (left-- ){//&& tmpContainer.offsetHeight < height+scrollPosition) {
				tmpContainer.appendChild(clone.childNodes[0]);
			}
			
			//insert into dom
			this.container.parentNode.insertBefore(tmpContainer, this.container);
			//this.filler.style.height=tmpContainer.style.height;

			//function to execute when animation finishes
			var finishFn = function () {
				tmpContainer.removeEventListener("webkitTransitionEnd", finishFn);
				//tmpContainer.style.webkitTransition="";
				//tmpContainer.style.setProperty("-webkit-transition", "", false);
				console.log("bla");
				setTimeout(function(){
					//move tmpContainer to the right scrollPositionition
					//tmpContainer.style.top = 0; //flicker
					this.container.parentNode.scrollTop = scrollPosition;
					//tmpContainer.style.webkitTransform="translateY(0px)";
					console.log("blue");
					
					//make tmpContainer the new container
					var tmpRef = this.container
					this.container = tmpContainer;
					this.container.id = "container";
					tmpRef.parentNode.removeChild(tmpRef);
					
					//call user-defined callback function
					if (callback) {
						callback(animate, prevHash, prevScroll, direction);
					}
					this.animating = false;
				}.bind(this),500);
			}.bind(this);
			
			//wait until tmpContainer is ready
			setTimeout(function(){
				container.addEventListener("webkitTransitionEnd", finishFn)
				//start animation
				
				setCss(tmpContainer, {
					"-webkit-transform" : "translate3d(0,"+top+" + px,0)"
				})
				
				setCss(this.container, {
					"-webkit-transition" : "-webkit-transform .35s ease-in-out",
					"-webkit-transform" : "translateX(" + (direction * 100) + "%)"
				})
				//setTimeout(finishFn, 500);
			}.bind(this), 100);
		} else {
			//replace current container content with the views content
			this.container.innerHTML = "";
			var clone = view.cloneNode(true);
			var left = clone.childNodes.length;
			while (left--) {
				this.container.appendChild(clone.childNodes[0]);
			}
			this.container.parentNode.scrollTop = scrollPosition;
			if (callback) {
				callback(animate, prevHash, prevScroll);
			}
		}
	}
}
