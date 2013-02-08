function setCss(element, props) {
	for (var key in props) {
		element.style.setProperty(key, props[key], false);
	}
}

/**
 * Remove an element and provide a function that inserts it into its original position
 * @param element {Element} The element to be temporarily removed
 * @return {Function} A function that inserts the element into its original position
 **/
function removeToInsertLater(element) {
  var parentNode = element.parentNode;
  var nextSibling = element.nextSibling;
  parentNode.removeChild(element);
  return function() {
    if (nextSibling) {
      parentNode.insertBefore(element, nextSibling);
    } else {
      parentNode.appendChild(element);
    }
  };
}

function cloneChildren(element, toClone, left) {
  var insertFunction = removeToInsertLater(element);
	while (left-- > 0) {
		element.appendChild(toClone.childNodes[0]);
	}
  insertFunction();
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
		"-webkit-overflow-scrolling" : "touch",
		"-webkit-transform" : "translate3d(0,0,0.1)"
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
			tmpContainer.style.top=(this.container.parentNode.scrollTop - scrollPosition)+"px";
			TweenLite.to(tmpContainer, 0, {x:(-direction * width)});

			//fill in enough elements for animation
			var height = window.innerHeight;
			var clone = view.cloneNode(true);
			var left = clone.childNodes.length;
			while (left-- && tmpContainer.offsetHeight < height+scrollPosition) {
				tmpContainer.appendChild(clone.childNodes[0]);
			}
			
			this.container.parentNode.insertBefore(tmpContainer, this.container);
			
			//function to execute when animation finishes
			var finishFn = function () {
				//move tmpContainer to the right scrollPositionition
				tmpContainer.style.top = 0;
				this.container.parentNode.scrollTop = scrollPosition;
				
				//fill in the the previously omitted elements
				//cloneChildren(tmpContainer, clone,left);
				
				//make tmpContainer the new container
				var tmpRef = this.container;
				this.container = tmpContainer;
				this.container.id = "container";
				tmpRef.parentNode.removeChild(tmpRef);
				
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
				TweenLite.to(tmpContainer, 0.35, {x:0, onComplete:finishFn});
				TweenLite.to(container, 0.35, {x:(direction * width)});
			}
				.bind(this));
			
		} else {
			//replace current container content with the views content
			this.container.innerHTML = "";
			var clone = view.cloneNode(true);
			var left = clone.childNodes.length;
			/*while (left--) {
				this.container.appendChild(clone.childNodes[0]);
			}*/
			cloneChildren(this.container, clone, left);
			
			this.container.parentNode.scrollTop = scrollPosition;
			if (callback) {
				callback(animate, prevHash, prevScroll);
			}
		}
	}
}
