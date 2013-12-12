/*global DocumentTouch:false, TweenLite:false, Power3:false, _:false */
/*jshint jquery:true, devel:true, browser:true, curly:true, latedef:true, newcap:true, eqeqeq:true, es3:true, immed:true, undef:true*/

(function(){
  
  var base= {
    browser: { // browser capabilities
      addEventListener: !!window.addEventListener,
      touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
      ie8: (document.documentElement.className==="ie8")
    }
  };
  
  window.slider = function(container, config){
    "use strict";
  
    // default config values
    var options = _.extend({
      width: 200,
      transitionTime: 0.3,
      disableScroll: false
    }, config);
    
    // slider vars
    var element=container.children[0],
    slides= element.children,
    index= 0,
    width= options.width,
    length= slides.length,
    containerOffset, offset;
  
    // event handling
    var events = {
      start: {},
      delta: {},
      isScrolling: undefined,
      filter: 0.5,
      acceleration: -4000,
      
      handleEvent: function(event) {
        switch (event.type) {
          case 'touchstart': this.onStart(event); break;
          case 'touchmove': this.onMove(event); break;
          case 'touchend': this.onEnd(event); break;
        }
      },
      onStart: function(event) {
        var touches = event.touches[0];
  
        // initial position and time
        this.start = {
          x: touches.pageX,
          y: touches.pageY,
          time: +new Date()
        };
  
        // used for testing first move event
        this.isScrolling = undefined;
  
        // reset delta and end measurements
        this.delta = {
          v: 0,
          x: 0,
          y: 0,
          time: this.start.time
        };
  
        // attach touchmove and touchend listeners
        element.addEventListener('touchmove', this, false);
        element.addEventListener('touchend', this, false);
      },
      onMove: function(event) {
        // ensure swiping with one touch and not pinching
        if ( event.touches.length > 1 || event.scale && event.scale !== 1){ return; }
  
        if (options.disableScroll){ event.preventDefault(); }
  
        var touches = event.touches[0];
        
        // measure x/y change, moving average of velocity, time
        this.delta = {
          v: (this.filter * this.delta.v) +
            ((1-this.filter) * (touches.pageX - this.start.x - this.delta.x) / (+new Date() - this.delta.time)),
          x: touches.pageX - this.start.x,
          y: touches.pageY - this.start.y,
          time: +new Date()
        };
        
        // determine if scrolling test has run - one time test
        if ( typeof this.isScrolling === 'undefined') {
          this.isScrolling = !!( this.isScrolling || Math.abs(this.delta.x) < Math.abs(this.delta.y) );
        }
  
        // if user is not trying to scroll vertically
        if (!this.isScrolling) {
  
          // prevent native scrolling
          event.preventDefault();
  
          // increase resistance if first or last slide
          this.delta.x =
            this.delta.x /
              ( (!index && this.delta.x > 0 ||         // if first slide and sliding left
                 index === length - 1 &&    // or if last slide and sliding right
                 this.delta.x < 0                      // and if sliding at all
              ) ?
              ( Math.abs(this.delta.x) / width + 1 )   // determine resistance level
              : 1 );                              // no resistance if false
  
          // translate 1:1
          translate(this.delta.x, 0);
        }
      },
      
      onEnd: function() {
        var duration = +new Date() - this.start.time;
  
        // determine if slide attempt triggers next/prev slide
        var isValidSlide =
              Number(duration) < 250 &&         // if slide duration is less than 250ms
               Math.abs(this.delta.x) > 20 ||        // and if slide amt is greater than 20px
               Math.abs(this.delta.x) > width/2;     // or if slide amt is greater than half the width
  
        // determine if slide attempt is past start and end
        var isPastBounds =
              !index && this.delta.x > 0 ||                      // if first slide and slide amt is greater than 0
               index === length - 1 && this.delta.x < 0;   // or if last slide and slide amt is less than 0
  
        // if not scrolling vertically
        if (!this.isScrolling) {
          if (isValidSlide && !isPastBounds) {
            
            // limit animation speed
            var v= Math.abs(this.delta.v * 800);
            v %= 3000;
            
            // calculate animation distance based on constant deceleration
            var t= -v / this.acceleration;
            var dist= this.acceleration/2*t*t + v*t;
            var newIndex= index - Math.floor(Math.abs(this.delta.x / width) + dist/width) * Math.abs(this.delta.x)/this.delta.x;
            
            if(t<0.25){ t= 0.25; }
  
            // speed not high enough -> flicking
            if(newIndex === index){
              
              //determine direction
              if(this.delta.x < 0){
                animate(index +1, options.transitionTime);
              }else{
                animate(index -1, options.transitionTime);
              }
              
            }else{
              //limit to bounds and change animation time accordingly
              if(newIndex> length-1){
                t*= (length-1-index) / (newIndex-index);
                newIndex= length-1;
  
              }else if(newIndex < 0){
                t*= (index-0) / (index-newIndex);
                newIndex= 0;
              }
              
              animate(newIndex, t);
            }
  
          // snap back to current slide
          }else{
            animate(index, options.transitionTime);
          }
        }
  
        // kill touchmove and touchend event listeners until touchstart called again
        element.removeEventListener('touchmove', events, false);
        element.removeEventListener('touchend', events, false);
      }
    };
  
    // moves the slider to current index + parametric offset
    var translate = function(diff, time){
      offset = diff;
      if(base.browser.ie8){
        TweenLite.to(element, time, {left: ((-width * index)+ diff + containerOffset), ease:Power3.easeOut});
      }else{
        TweenLite.to(element, time, {x: ((-width * index)+ diff + containerOffset), ease:Power3.easeOut});
      }
    };
  
    // animate to index
    var animate = function(to, time){
      index= to;
      translate(0, time);
    };
    
    // make sure the slider is centered
    var updateOffset = _.debounce(function(){
      containerOffset = (container.getBoundingClientRect().width/2 || container.offsetWidth/2) - (width / 2);
      translate(offset, 0.2);
    }, 250);
    
    // Set up Css and Eventlisteners
    var setup = function(){
      // init widths
      element.style.width = (length * width) + "px";
      _.each(slides, function(slide){
        slide.style.width = width + "px";
      });
  
      var style= element.style;
      style.webkitBackfaceVisibility =
      style.msBackfaceVisibility =
      style.mozBackfaceVisibility =
      style.backfaceVisibility = "hidden";
  
      // initial centering
      containerOffset = (container.getBoundingClientRect().width/2 || container.offsetWidth/2) - (width / 2);
      index = Math.floor(length / 2);
      translate(0, 0);
  
      if(base.browser.addEventListener){
        if(base.browser.touch){ element.addEventListener('touchstart', events, false); }
        window.addEventListener("resize", updateOffset);
      }else{
        window.onresize = updateOffset;
      }
      container.style.visibility = "visible";
    };
  
    setup();
  
    // exported functionality
    var that = {};
    that.goTo = function(to){
      if(to >= 0 && to < slides.length){
        animate(+to, options.transitionTime);
      }
    };
    
    that.next = function(){
      that.goTo(index+1);
    };
    
    that.prev = function(){
      that.goTo(index-1);
    };
  
    return that;
  };
})();
