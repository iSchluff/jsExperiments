function init() {
	var views = document.getElementsByClassName("view");
	var getView = function (id) {
		for (var i = 0; i < views.length; i++) {
			if (views[i].id == id)
				return views[i];
		}
	}
	
	var setEventListeners = function () {
		console.log("registering event listeners");
		document.getElementById("rightBtn").addEventListener("click", function () {
			display.switchView(getView("view1"), setEventListeners, true, 1);
		});
		
		document.getElementById("leftBtn").addEventListener("click", function () {
			display.switchView(getView("view1"), setEventListeners, true, -1);
		});
		
		document.getElementById("addRows").addEventListener("click", function () {
			for (var i = 0; i < 300; i++) {
				var div = document.createElement("div");
				div.className = "listItem";
				div.innerHTML = "<p>" + i + "</p>"
					getView("view1").appendChild(div);
			}
			display.switchView(getView("view1"), setEventListeners);
		});
		console.log(document.getElementById("rightBtn"));
	}
	
	var id = window.location.hash.split("#")[1] || "view1";
	var display = new Display(getView(id));
	setEventListeners();
	
	window.onorientationchange = function () {
		console.log("Event: hashchange | new orientation: " + window.orientation); //possibilities: 0 90 -90
	}
	
	window.onhashchange = function () {
		console.log("Event: hashchange | new hash: " + window.location.hash); //hash with pre #
		display.switchView(getView(window.location.hash.split("#")[1]), setEventListeners);
	};
}

function setCss(element, props) {
	for (var key in props) {
		element.style.setProperty(key, props[key], false);
		//element.style[key]=[props[key]]
	}
}

function Display(view) {
	this.currentView = view;
	this.container = document.createElement("div");
	this.container.id = "container";
	document.body.insertBefore(this.container, document.getElementById("views"));
	this.animating = false;
	
	this.switchView(view);
	
	setCss(document.body, {
		"width" : "100%",
		"overflow-x" : "hidden"
	});
	
	setCss(this.container, this.containerCss);
}

Display.prototype = {
	containerCss : { //helper object
		"-webkit-transform-style" : "preserve-3d",
		"-webkit-backface-visibility" : "hidden",
		"-webkit-box-sizing" : "border-box",
		"box-sizing" : "border-box",
		"position" : "absolute",
		"top" : 0,
		"width" : "100%"
	},
	switchView : function (view, callback, animate, direction) { //direction -1/+1
		console.log(view + " " + this.animating + " " + animate + " " + direction);
		if (!view || this.animating)
			return;
		if (animate && (direction == 1 || direction == -1)) {
			var width = window.innerWidth;
			var move = function (element, value) {
				setCss(element, {
					"-webkit-transition" : "-webkit-transform .35s ease-in-out",
					//"-webkit-transform": "translate3d("+value+", 0px, 0px)"
					"-webkit-transform" : "translateX(" + value + ")"
				})
			};
			
			this.animating = true;
			
			//create new Container
			tmpContainer = document.createElement("div");
			tmpContainer.id = "tmpContainer";
			tmpContainer.innerHTML = view.innerHTML
				
				//set it's css
				setCss(tmpContainer, this.containerCss);
			setCss(tmpContainer, {
				//"-webkit-transform": "translate3d("+(-direction*100)+"%, 0, 0)"
				"-webkit-transform" : "translateX(" + (-direction * 100) + "%)"
			});
			document.body.insertBefore(tmpContainer, this.container);
			
			//force visual update of the element
			//tmpContainer.style.height="auto";
			//var height=tmpContainer.offsetHeight;
			//tmpContainer.style.height=tmpContainer.offsetHeight;
			
			//alernatively timeout delay 0
			webkitRequestAnimationFrame(function () {
				//start animation
				move(tmpContainer, 0);
				move(container, (direction * 100) + "%");
				
				//callback after animation ended. better use animationend event
				setTimeout(function () {
					var tmpRef = this.container
						this.container = tmpContainer;
					tmpRef.parentNode.removeChild(tmpRef);
					this.container.id = "container";
					if (callback) {
						callback();
					}
					this.animating = false;
				}
					.bind(this), 500);
			}
				.bind(this));
		} else {
			this.currentView = view;
			if (window.location.hash != this.currentView.id) {
				window.location.hash = this.currentView.id;
			}
			this.container.innerHTML = this.currentView.innerHTML;
			if (callback) {
				callback();
			}
		}
	}
}
