function Display(view) { //parent optional - default is document.body
	this.container = document.createElement("div");
	this.container.id = "container";
	
	var parent = document.body;
	parent.appendChild(this.container);
	this.container.classList.add("container");
	
	this.animating = false;
	this.switchView(view);
}

Display.prototype = {
	resetSize : function (heightDiff) {
		heightDiff = 0 || heightDiff;
		this.container.style.height=(window.innerHeight - heightDiff) + "px";
	},
	switchView : function (view, callback, animate, direction, scrollPosition) { //direction -1/+1
		if (!view || this.animating)
			return;
			
		var animate = animate || false;
		var direction = direction || 1;
		var scrollPosition = scrollPosition || 0;
		var prevHash = window.location.hash;
		var prevScroll = this.container.scrollTop;
		
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
			tmpContainer.classList.add("container");
			tmpContainer.classList.add(direction==1?"right":"left");
			tmpContainer.style.height=this.container.style.height;
			
			//set content of the new Container to view
			var height = window.innerHeight;
			tmpContainer.appendChild(view.cloneNode(true));
					
			//insert into dom
			this.container.parentNode.insertBefore(tmpContainer, this.container);
			tmpContainer.scrollTop=scrollPosition; //set Scroll
			
			//function to execute when animation finishes
			var finishFn = function () {
				tmpContainer.classList.remove("animatable")
	
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
			}.bind(this);
			
			//wait until tmpContainer is ready
			setTimeout(function(){
				container.addEventListener("webkitTransitionEnd", finishFn)
				//start animation
				tmpContainer.classList.add("animatable");
				this.container.classList.add("animatable");
				
				tmpContainer.classList.remove(direction==1?"right":"left");
				this.container.classList.add(direction==1?"left":"right");
			}.bind(this), 100);
		} else {
			//replace current container content with new View
			this.container.innerHTML = "";
			this.container.appendChild(view.cloneNode(true));
			this.container.scrollTop = scrollPosition;
			if (callback) {
				callback(animate, prevHash, prevScroll);
			}
		}
	}
}
