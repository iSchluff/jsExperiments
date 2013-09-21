/*
 * Slider
 * Requires Lodash.js && TweenMax.js (GSAP)
 * 
 * author: Anton Schubert
 * */

var slider = function(container, config){
  "use strict";
  
  // default config values
  var options = _.extend({
    width: 200,
    transitionTime: .3,
    disableScroll: false
  }, config);
  
  var element = container.children[0];
  var slides = element.children;
  var width = options.width;
  var containerOffset, offset, index;
  
  // check browser capabilities
  var browser = {
    addEventListener: !!window.addEventListener,
    touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
    transitions: (function(temp) {
      var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
      for ( var i in props ) if (temp.style[ props[i] ] !== undefined) return true;
      return false;
    })(document.createElement('swipe'))
  };
  
  // moves the slider to current index + parametric offset
  var translate = function(diff, time){
    offset = diff;
    TweenMax.to(element, time, {x: ((-width * index)+ diff + containerOffset)});
  }
  
  // animate to index
  var animate = function(to){
    index = to;
    translate(0, options.transitionTime);
  }
  
  // event vars
  var start = {};
  var delta = {};
  var isScrolling;      

  // setup event capturing
  var events = {
    handleEvent: function(event) {
      console.log("huhu");
      switch (event.type) {
        case 'touchstart': this.start(event); break;
        case 'touchmove': this.move(event); break;
        case 'touchend': this.end(event); break;
      }
    },
    start: function(event) {
      var touches = event.touches[0];
      
      // initial position and time
      start = {
        x: touches.pageX, 
        y: touches.pageY,
        time: +new Date()
      };
      
      // used for testing first move event
      isScrolling = undefined;

      // reset delta and end measurements
      delta = {};

      // attach touchmove and touchend listeners
      element.addEventListener('touchmove', this, false);
      element.addEventListener('touchend', this, false);
    },
    move: function(event) {
      // ensure swiping with one touch and not pinching
      if ( event.touches.length > 1 || event.scale && event.scale !== 1) return

      if (options.disableScroll) event.preventDefault();

      var touches = event.touches[0];

      // measure change in x and y
      delta = {
        x: touches.pageX - start.x,
        y: touches.pageY - start.y
      }

      // determine if scrolling test has run - one time test
      if ( typeof isScrolling == 'undefined') {
        isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
      }

      // if user is not trying to scroll vertically
      if (!isScrolling) {

        // prevent native scrolling 
        event.preventDefault();

        // increase resistance if first or last slide
        delta.x = 
          delta.x / 
            ( (!index && delta.x > 0               // if first slide and sliding left
              || index == slides.length - 1        // or if last slide and sliding right
              && delta.x < 0                       // and if sliding at all
            ) ?                      
            ( Math.abs(delta.x) / width + 1 )      // determine resistance level
            : 1 );                                 // no resistance if false
        
        // wrap to next slide if delta > width of slide
        if(Math.abs(delta.x) >= width){ 
          console.log("WRAP");
        }
        
        // translate 1:1
        translate(delta.x, 0);
      }
    },
    end: function(event) {
      var duration = +new Date() - start.time;

      // determine if slide attempt triggers next/prev slide
      var isValidSlide = 
            Number(duration) < 250               // if slide duration is less than 250ms
            && Math.abs(delta.x) > 20            // and if slide amt is greater than 20px
            || Math.abs(delta.x) > width/2;      // or if slide amt is greater than half the width

      // determine if slide attempt is past start and end
      var isPastBounds = 
            !index && delta.x > 0                            // if first slide and slide amt is greater than 0
            || index == slides.length - 1 && delta.x < 0;    // or if last slide and slide amt is less than 0

      // if not scrolling vertically
      if (!isScrolling) {
        if (isValidSlide && !isPastBounds) {
          
          //determine direction
          if(delta.x < 0){
            animate(index +1);
          }else{
            animate(index -1);
          }
          
        // snap back to current slide
        }else{
          animate(index);
        }
      }

      // kill touchmove and touchend event listeners until touchstart called again
      element.removeEventListener('touchmove', events, false)
      element.removeEventListener('touchend', events, false)
    }
  }
  
  // make sure the slider is centered
  var updateOffset = _.debounce(function(){
    containerOffset = (container.getBoundingClientRect().width/2 || container.offsetWidth/2) - (width / 2);
    translate(offset, .1);
  }, 250);
  
  // Set up Css and Eventlisteners
  var setup = function(){
    // init widths
    element.style.width = (slides.length * width) + "px";
    _.each(slides, function(slide){
      slide.style.width = width + "px"
    });
    
    var style= element.style;
    style.webkitBackfaceVisibility = 
    style.msBackfaceVisibility = 
    style.mozBackfaceVisibility = 
    style.backfaceVisibility = "hidden";
    
    // center in the beginning
    containerOffset = (container.getBoundingClientRect().width/2 || container.offsetWidth/2) - (width / 2);
    index = Math.floor(slides.length / 2);
    translate(0, 0);
    
    if(browser.addEventListener){
      if(browser.touch){ element.addEventListener('touchstart', events, false); }
      window.addEventListener("resize", updateOffset);
    }else{
      window.onresize = updateOffset;
    }
    
    container.style.visibility = "visible";
  };
  
  setup();
  
  // exported functionality
  var that = {};
  that.next = function(){
    if(index < slides.length-1){ animate(index+1); }
  }
  that.prev = function(){
    if(index){ animate(index-1); }
  }
  
  return that; 
}