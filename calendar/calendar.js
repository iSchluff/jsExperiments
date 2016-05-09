/*global domHelper:false, locale:false, tmpl:false */
/*jshint jquery:true, devel:true, browser:true, curly:true, latedef:true, newcap:true, eqeqeq:true, es3:true, immed:true, undef:true*/

window.locale= {
  lang: "en",
  monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  dayNames: [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
};

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function() {
  var cache = {};

  this.tmpl = function tmpl(str, data) {
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
    cache[str] = cache[str] ||
    tmpl(document.getElementById(str).innerHTML) :

    // Generate a reusable function that will serve as a template
    // generator (and which will be cached).
    new Function("data",
    "var p=[],print=function(){p.push.apply(p,arguments);};" +

    // Introduce the data as local variables using with(){}
    "p.push('" +

    // Convert the template into pure JavaScript
    str.replace(/[\r\t\n]/g, " ")
    .replace(/'(?=[^%]*%>)/g,"\t")
    .split("'").join("\\'")
    .split("\t").join("'")
    .replace(/<%=(.+?)%>/g, "',$1,'")
    .split("<%").join("');")
    .split("%>").join("p.push('") +
    "');return p.join('');");

    // Provide some basic currying to the user
    return data ? fn(data) : fn;
  };
})();

window.domHelper= {
  index: function(el){
    var siblings= el.parentNode.childNodes;
    var index= 0;
    for(var i= 0; i < siblings.length; i++){
      var sibling= siblings[i];
      if(sibling === el){
        return index;
      }else if(sibling.nodeType === 1){
        index++;
      }
    };
  },
  forSiblings: function(el, func){
    var siblings= el.parentNode.childNodes;
    for(var i= 0; i < siblings.length; i++){
      var sibling= siblings[i];
      if(sibling.nodeType === 1 && sibling !== el){
        func(sibling, i);
      }
    }
  }
};

window.calendar = function(container, startDate){
  "use strict";

  var data= {};
  var currentLayout="days";
  var date= startDate;
  var today= new Date(date);
  var currentDecadeStart= date.getFullYear() - date.getFullYear() % 10;

  var events= {
    SELECTDAY: "selectday",
    SELECTMONTH: "selectmonth",
    SELECTYEAR: "selectyear"
  };

  // trigger Custom Event
  var trigger= function(eventType, data){
    data= data || {};
    data.date= date;
    var event= new CustomEvent(eventType, {detail: data});
    container.dispatchEvent(event);
  };

  // dayTitles don't change
  data.dayTitles= [];
  locale.dayNames.forEach(function(name){
    data.dayTitles.push({
      name: name.substring(0,3)
    });
  });

  // methods for populating calendar with data
  var create= {
    years: function(){
      data.years = [];

      for(var i= currentDecadeStart-1; i < currentDecadeStart + 11; i++){
        data.years.push({
          name: i,
          properties: i === today.getFullYear() ? "current" : ""
        });
      }
    },
    months: function(){
      data.months = [];

      var currentMonth;
      if(date.getFullYear() === today.getFullYear()){
        currentMonth = today.getMonth();
      }

      locale.monthNames.forEach(function(name, index){
        data.months.push({
          name: name.substring(0,3),
          properties: currentMonth === index ? "current" : ""
        });
      });
    },
    daysInMonth:function(year, month){
      return new Date(year, month+1, 0).getDate();
    },
    days: function(){
      data.days = [];

      // days of previous month
      var prevDays = new Date(date.getFullYear(), date.getMonth(), 0).getDay();
      prevDays = prevDays === 0 ? 7 : prevDays;

      var prevDayCount = this.daysInMonth(date.getFullYear(), date.getMonth()-1);
      for(var i= prevDays; i>0; i--){
        data.days.push({
          name: (prevDayCount-i+1),
          properties: "prev"
        });
      }

      var dayCount = this.daysInMonth(date.getFullYear(), date.getMonth());
      var day = new Date(date);
      for(i= 0; i < dayCount;i++){
        day.setDate(i+1);

        data.days.push({
          name: day.getDate(),
          properties: day.getTime() === today.getTime() ? "current" : ""
        });
      }

      // days of next month
      var nextDays = 42 - prevDays - dayCount;
      for(i= 0; i < nextDays; i++){
        data.days.push({
          name: (i+1),
          properties: "next"
        });
      }
    }
  };


  // Render new Calendar Template depending on Layout
  var render = function(){
    data.layout= currentLayout;

    if(currentLayout === "years"){
      data.title = currentDecadeStart + "-" + (currentDecadeStart + 9);
      create.years();
    }else if(currentLayout === "months"){
      data.title = date.getFullYear();
      create.months();
    }else{
      data.title = locale.monthNames[date.getMonth()] + " " + date.getFullYear();
      create.days();
    }

    container.innerHTML= "";
    container.innerHTML= tmpl("calendarTemplate", data);
  };

  // Handle Clicks on Left/Right Buttons (Depending on layout)
  var nextDate= function(direction){
    switch(currentLayout){
      case "years":
        currentDecadeStart+= 10*direction;
        render();
        break;
      case "months":
        date.setFullYear(date.getFullYear() + direction);
        render();

        trigger(events.SELECTYEAR);
        break;
      default:
        date.setMonth(date.getMonth() + direction + 1);
        date.setDate(0);
        render();
        trigger(events.SELECTMONTH);
    }
  };

  var switchLayout= function(layout){
    // update decade
    if(layout === "years"){
      currentDecadeStart= date.getFullYear() - date.getFullYear()%10;
    }
    currentLayout = layout;
    render();
  };

  // Click Event Handling
  var handleEvent= function(event){
    var el= event.target;

    if(el.classList.contains("next")){
      nextDate(1);
    }else if(el.classList.contains("prev")){
      nextDate(-1);
    }else if(el.classList.contains("title")){
      switch(currentLayout){
        case "years":
          break;
        case "months":
          switchLayout("years");
          break;
        default:
          switchLayout("months");
      }

    }else if(el.classList.contains("year")){
      date.setYear(el.textContent);
      switchLayout("months");
      trigger(events.SELECTYEAR);

    }else if(el.classList.contains("month")){
      date.setMonth(domHelper.index(el));
      switchLayout("days");
      trigger(events.SELECTMONTH);

    // click on already selected day
    }else if(el.classList.contains("day") && el.classList.contains("selected")){
      el.classList.remove("selected");
      trigger(events.SELECTMONTH);

    }else if(el.classList.contains("day")){
      date.setDate(el.textContent);
      el.classList.add("selected");

      // remove selected from siblings
      domHelper.forSiblings(el, function(sibling){
        if(sibling.classList.contains("selected")){
          sibling.classList.remove("selected");
        }
      });

      trigger(events.SELECTDAY);
    }
  };


  var that= {};

  // highlights days with events
  that.setEventDays= function(eventDays){
    var days= document.querySelectorAll(".calendar .day:not(.prev):not(.next)");
    for(var i=0; i<days.length; i++){
      if(eventDays[i]){
        days[i].classList.add("event");
      }
    }
  };

  // requests a calendar at a specific date
  that.setDate= function(resetDate){
    date= resetDate;
    render();
  };

  container.classList.add("calendar");
  container.addEventListener("click", handleEvent);
  render();

  return that;
};
