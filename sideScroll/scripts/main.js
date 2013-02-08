function init() {
	//Set up Functions
	var views = document.getElementsByClassName("view");
	var getView = function (id) {
		for (var i = 0; i < views.length; i++) {
			if (views[i].id == id)
				return views[i];
		}
	}
	var addToAll=function(className, type, listener){
		var btns = document.getElementsByClassName(className);
		for (var i = 0; i < btns.length; i++) {
			btns[i].addEventListener(type, listener);
		}
	}
	var setEventListeners = function () {
		console.log("registering event listeners");
		
		addToAll("btn","click", function () {
			backButton=false;
			display.switchView(getView("view2"), onSwitchView, true, -1);
		});
		
		addToAll("addBtn", "click", function () {
			for (var i = 0; i < 200; i++) {
				var div = document.createElement("div");
				if((i%10)==0){
					div.classList.add("button");
					div.classList.add("btn");
					div.innerHTML = "Button <div class='triangle-right'></div>";
				}else{
					div.classList.add("listItem");
					div.innerHTML = "<p>" + i + "</p>"
				}
				getView("view1").appendChild(div);
			}
			display.switchView(getView("view1"), onSwitchView);
		});
	}
	
	var onSwitchView=function(animate, prevHash, prevScroll, direction){
		setEventListeners();
		if(animate && !backButton && prevHash!=window.location.hash){
			stack.push({"direction":direction, "hash":prevHash, "scrollTop":prevScroll});
			backButton=true;
		}
	}
	
	//Create Main Component
	var id = window.location.hash.split("#")[1] || "view1";
	var parent = document.getElementById("parent");
	var backButton=true;
	var display = new Display(getView(id), parent);
	display.resetSize(80);
	
	//Create Stack
	var stack=new Array();
	
	//Add EventListeners
	setEventListeners();
	
	window.addEventListener("orientationchange", function () {
		console.log("Event: orientationchange | new orientation: " + window.orientation); //possibilities: 0 90 -90
		display.resetSize(80);
	});
	
	window.addEventListener("hashchange", function () {
		console.log("Event: hashchange | new hash: " + window.location.hash); //hash with pre #
		if(backButton){ //differentiate between button inputs and browser controls
			var lastSwitch=stack.pop();
			if(lastSwitch && window.location.hash==lastSwitch["hash"]){ //prevents chaos and destruction
				display.switchView(getView(window.location.hash.split("#")[1]), onSwitchView, true, -lastSwitch["direction"], lastSwitch["scrollTop"]);
			}else{ //user must've entered hash in address bar
				display.switchView(getView(window.location.hash.split("#")[1]), onSwitchView );
			}
		}
	});
}
