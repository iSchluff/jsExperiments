/*
 * Slider
 * Requires Lodash.js && TweenMax.js (GSAP)
 *
 * */

/*global DocumentTouch:false, TweenLite:false, Power3:false, _:false */
/*jshint jquery:true, devel:true, browser:true, curly:true, latedef:true, newcap:true, eqeqeq:true, es3:true, immed:true, undef:true*/

var fullWidthSlider = function(container, config){
  "use strict";

  // default config values
  var options = _.extend({
    transitionTime: 0.7,
    disableScroll: true
  }, config);
  
  var browser= {
    addEventListener: !!window.addEventListener,
    touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
    ie8: (document.documentElement.className==="ie8")
  };
  
  var element= container[0].children[0];
  var slides= element.children;
  var index= 0;
  var length= slides.length;
  var containerOffset, offset, width;

  // moves the slider to current index + parametric offset
  var translate = function(diff, time){
    offset = diff;
    
    if(browser.ie8){
      TweenLite.to(element, time, {left: -(100*index)+"%", ease:Power3.easeOut});
    }else{
      TweenLite.to(element, time, {x: (diff-index*width), ease:Power3.easeOut});
    }
  };

  // animate to index
  var animate = function(to, time){
    index= to;
    translate(0, time);
    container.trigger("update", {
      index: index,
      left: (index === 0),
      right: (index === length-1)
    });
  };

  // event vars
  var start = {};
  var delta = {};
  var isScrolling;

  // setup event capturing
  var events = {
    handleEvent: function(event) {
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
      delta = {
        x: 0,
        y: 0
      };

      // attach touchmove and touchend listeners
      element.addEventListener('touchmove', this, false);
      element.addEventListener('touchend', this, false);
    },
    move: function(event) {
      // ensure swiping with one touch and not pinching
      if ( event.touches.length > 1 || event.scale && event.scale !== 1){ return; }

      var touches = event.touches[0];
      
      // measure change in x and y
      delta = {
        x: touches.pageX - start.x,
        y: touches.pageY - start.y
      };
      
      // determine if scrolling test has run - one time test
      if ( typeof isScrolling === 'undefined') {
        isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
      }

      // if user is not trying to scroll vertically
      if (!isScrolling) {

        // prevent native scrolling
        event.preventDefault();

        // increase resistance if first or last slide
        delta.x =
          delta.x /
            ( (!index && delta.x > 0 ||         // if first slide and sliding left
               index === length - 1 &&    // or if last slide and sliding right
               delta.x < 0                      // and if sliding at all
            ) ?
            ( Math.abs(delta.x) / width + 1 )   // determine resistance level
            : 1 );                              // no resistance if false

        // translate 1:1
        translate(delta.x, 0);
      }
    },
    end: function() {
      var duration = +new Date() - start.time;

      // determine if slide attempt triggers next/prev slide
      var isValidSlide =
        Number(duration) < 250 &&         // if slide duration is less than 250ms
        Math.abs(delta.x) > 20 ||        // and if slide amt is greater than 20px
        Math.abs(delta.x) > width/2;     // or if slide amt is greater than half the width

      // determine if slide attempt is past start and end
      var isPastBounds =
        !index && delta.x > 0 ||                      // if first slide and slide amt is greater than 0
         index === length - 1 && delta.x < 0;   // or if last slide and slide amt is less than 0

      // if not scrolling vertically
      if (!isScrolling) {
        if (isValidSlide && !isPastBounds) {
          //determine direction
          if(delta.x < 0){
            animate(index +1, options.transitionTime);
          }else{
            animate(index -1, options.transitionTime);
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

  // Set up Css and Eventlisteners
  var setup = function(){
    // init widths
    width= container.width();

    element.style.width= (length * 100)+"%";
    _.each(slides, function(slide, index){
      var s= $(slide);
      s.width((100/length) + "%");
    });

    var style= element.style;
    style.webkitBackfaceVisibility =
    style.msBackfaceVisibility =
    style.mozBackfaceVisibility =
    style.backfaceVisibility = "hidden";

    if(browser.addEventListener && browser.touch){
      element.addEventListener('touchstart', events, false);
    }
    
    $(window).resize(_.throttle(function(){
      width= container.width();
      translate(0,0);
    },100));
    
    container[0].style.visibility = "visible";
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