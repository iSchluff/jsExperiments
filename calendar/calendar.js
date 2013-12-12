/*global _:false, locale:false */
/*jshint jquery:true, devel:true, browser:true, curly:true, latedef:true, newcap:true, eqeqeq:true, es3:true, immed:true, undef:true*/

window.locale= {
  lang: "en",
  monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
};

window.calendar = function(container, startDate){
  "use strict";

  var data= {};
  var currentLayout="days";
  var date= startDate;
  var today= new Date(date);
  var currentDecadeStart= date.getFullYear()-date.getFullYear()%10;
  
  var events= {
    SELECT_YEAR: "selectYear",
    SELECT_MONTH: "selectMonth",
    SELECT_DAY: "selectDay"
  };
  
  var trigger= function(eventType){
    console.log("triggered", eventType, date);
    container.trigger(eventType, new Date(date));
  };
  
  // dayTitles don't change  
  data.dayTitles = [];
  _.each(locale.dayNames, function(element){
    data.dayTitles.push({
      name: element.substring(0,2)
    });
  });
  
  // methods for populating calendar with data
  var create= {
    years: function(){
      data.years = [];
      
      for(var i=currentDecadeStart-1; i<currentDecadeStart+11; i++){
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
      
      _.each(locale.monthNames, function(element, index){
        data.months.push({
          name: element.substring(0,3),
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
      var prevDays = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
      prevDays = prevDays === 0 ? 7 : prevDays;
      
      var prevDayCount = this.daysInMonth(date.getFullYear(), date.getMonth()-1);
      for(var i=prevDays; i>0; i--){
        data.days.push({
          name: (prevDayCount-i+1),
          properties: "prev"
        });
      }
      
      var dayCount = this.daysInMonth(date.getFullYear(), date.getMonth());
      var day = new Date(date);
      for(i=0;i<dayCount;i++){
        day.setDate(i+1);
        
        data.days.push({
          name: day.getDate(),
          properties: day.getTime() === today.getTime() ? "current" : ""
        });
      }
      
      // days of next month
      var nextDays = 42 - prevDays - dayCount;
      for(i=0;i<nextDays;i++){ 
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
      data.title = currentDecadeStart + "-" + (currentDecadeStart+9);
      create.years();
    }else if(currentLayout === "months"){
      data.title = date.getFullYear();
      create.months();
    }else{
      data.title = locale.monthNames[date.getMonth()] + " " + date.getFullYear();
      create.days();
    }
    
    container.html("");
    container.append(_.templates.calendar(data));
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
        trigger(events.SELECT_YEAR);
        break;
      default:
        date.setMonth(date.getMonth() + direction);
        render();
        trigger(events.SELECT_MONTH);
    }
  };
  
  var switchLayout= function(layout){
    // update decade
    if(layout === "years"){
      currentDecadeStart= date.getFullYear()-date.getFullYear()%10;
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
      date.setYear(+$(el).text());
      switchLayout("months");
      trigger(events.SELECT_YEAR);
      
    }else if(el.classList.contains("month")){
      date.setMonth($(el).index());
      switchLayout("days");
      trigger(events.SELECT_MONTH);
      
    // click on already selected day
    }else if(el.classList.contains("day") && el.classList.contains("selected")){
      $(el).removeClass("selected");
      trigger(events.SELECT_MONTH);
    
    }else if(el.classList.contains("day")){
      date.setDate(+$(el).text());
      $(el).addClass("selected").siblings(".selected").removeClass("selected");
      trigger(events.SELECT_DAY);
    }
  };
  
  var that= {};
  
  // highlights days with events
  that.setEventDays= function(eventDays){
    _.each($(".day:not(.prev, .next)",container), function(element, index){
      if(eventDays[index]){
        element.classList.add("event");
      }
    });
  };
  
  // requests an calendar at a specific date
  that.setDate= function(resetDate){
    date= resetDate;
    render();
  };
  
  container.addClass("calendar");
  container.on("click", handleEvent);
  render();
  return that;
};