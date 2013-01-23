function setCss(element, props) {
	for (var key in props) {
		element.style.setProperty(key, props[key], false);
	}
}

function Display(view, parent) { //parent optional - default is document.body
	this.container = document.createElement("div");
	this.container.id = "container";
	var parent = parent || document.body;
	parent.appendChild(this.container);
	
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
			var move = function (element, value) {
				setCss(element, {
					"-webkit-transition" : "-webkit-transform .35s ease-in-out",
					"-webkit-transform" : "translate3d(" + value + ", 0px, 0px)"
				})
			};
			
			this.animating = true;
			
			//create new Container
			tmpContainer = document.createElement("div");
			tmpContainer.id = "tmpContainer";
			this.container.parentNode.insertBefore(tmpContainer, this.container);
			
			//set it's css
			setCss(tmpContainer, this.containerCss);
			setCss(tmpContainer, {
				"-webkit-transform" : "translate3d(" + (-direction * 100) + "%, 0, 0)",
				"top" : (this.container.parentNode.scrollTop - scrollPosition) + "px"
			});
			
			console.log(this.container.parentNode.scrollTop - scrollPosition);
			
			//fill in enough elements for animation
			var height = window.innerHeight;
			var clone = view.cloneNode(true);
			var left = clone.childNodes.length;
			while (left-- && tmpContainer.offsetHeight < height+scrollPosition) {
				tmpContainer.appendChild(clone.childNodes[0]);
			}
			
			//function to execute when animation finishes
			var finishFn = function () {
				//move tmpContainer to the right scrollPositionition
				tmpContainer.style.top = 0;
				this.container.parentNode.scrollTop = scrollPosition;
				
				//make tmpContainer the new container
				var tmpRef = this.container
				this.container = tmpContainer;
				tmpRef.parentNode.removeChild(tmpRef);
				this.container.id = "container";
				
				//fill in the the previously omitted elements
				while (left-- > 0) {
					tmpContainer.appendChild(clone.childNodes[0]);
				}
				
				tmpContainer.removeEventListener("webkitTransitionEnd", finishFn);
				
				//call user-defined callback function
				if (callback) {
					callback(animate, prevHash, prevScroll, direction);
				}
				this.animating = false;
			}
			.bind(this)
			
			//wait until tmpContainer is ready
			webkitRequestAnimationFrame(function () {
				tmpContainer.addEventListener("webkitTransitionEnd", finishFn)
				
				//start animation
				move(tmpContainer, 0);
				move(container, (direction * 100) + "%");
			}
				.bind(this));
			
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
