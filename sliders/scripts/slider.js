/*global DocumentTouch:false, TweenLite:false, Power3:false, _:false */

/*
* html structure:
*   .slider
*     .slider-wrap
*       div
*       div
*       div
*
* parameters:
*   container - html object
*   options - slider options
*
* returns: slider object
*
* methods:
*  animate(to, time)
*  goto(to)
*  next()
*  prev()
*
*/
(function(){
  if(typeof window._ === "undefined"){
    window._ = {
      extend: function(obj) {
        $.each(Array.prototype.slice.call(arguments, 1), function(index, source) {
          if (source) {
            for (var prop in source) {
              obj[prop] = source[prop];
            }
          }
        });
        return obj;
      },
      debounce: function(fn, delay) {
        var timer = null;
        return function () {
          var context = this, args = arguments;
          clearTimeout(timer);
          timer = setTimeout(function () {
            fn.apply(context, args);
          }, delay);
        };
      },

    };
  }

  var sliderBase= function(container, options){
  "use strict";

    var that= {
      container: (container instanceof jQuery ? container : $(container)),
      options: options,
      index: 0,

      // check browser capabilities
      browser: {
        addEventListener: !!window.addEventListener,
        touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
        transforms: (function(temp) {
          var props = ['transform', 'msTransform', 'MozTransform', 'OTransform', 'WebkitTransform'];
          for ( var i in props ){
            if (temp.style[ props[i] ] !== undefined){
              return true; 
            }
          }
          return false;
        })(document.createElement('swipe'))
      },

      // animate to index
      animate: function(to, time){
        this.index= to;
        this.translate(0, time);
        this.container.trigger("update", {
          index: this.index,
          length: that.length,
          left: (this.index === 0),
          right: (this.index === this.length-1)
        });
      },
      translate: function(diff, time){},
      goTo: function(to){
        if(to >= 0 && to < this.length){
          this.animate(+to, options.transitionTime);
        }else if(options.endless){
          to = (+to + this.length) % this.length;
          this.animate(to, options.transitionTime);
        }
      },
      next: function(){
        this.goTo(this.index+1);
      },
      prev: function(){
        this.goTo(this.index-1);
      }
    };

    console.log("Browser Transform Support:", that.browser.transforms);
    // set up self-referencing members
    that.element= that.container[0].children[0];
    that.slides= that.element.children;
    that.length= that.slides.length;
    that.width= that.container.width();

    // sanity check
    if(that.width === 0){
      console.error("Slider Error: Container width is 0. The Element should not be hidden!");
    }

    return that;
  };

  // adds touch events to slider object
  var addTouch= function(that){

    // event vars
    var start = {};
    var delta = {};
    var isScrolling;

    var onStart= function(event){
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
      that.element.addEventListener('touchmove', that.handleTouch, false);
      that.element.addEventListener('touchend', that.handleTouch, false);
    };

    var onMove= function(event){
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
          ( (!that.index && delta.x > 0 ||         // if first slide and sliding left
            that.index === length - 1 &&    // or if last slide and sliding right
            delta.x < 0                      // and if sliding at all
          ) ?
          ( Math.abs(delta.x) / that.width + 1 )   // determine resistance level
          : 1 );                              // no resistance if false

          // translate 1:1
          that.translate(delta.x, 0);
        }
      };

      var onEnd= function(event){
        var duration = +new Date() - start.time;

        // determine if slide attempt triggers next/prev slide
        var isValidSlide =
        Number(duration) < 250 &&         // if slide duration is less than 250ms
        Math.abs(delta.x) > 20 ||        // and if slide amt is greater than 20px
        Math.abs(delta.x) > that.width/2;     // or if slide amt is greater than half the width

        // determine if slide attempt is past start and end
        var isPastBounds =
        !that.index && delta.x > 0 ||                      // if first slide and slide amt is greater than 0
        that.index === that.length - 1 && delta.x < 0;   // or if last slide and slide amt is less than 0

        // if not scrolling vertically
        if (!isScrolling) {
          if (isValidSlide && !isPastBounds) {
            //determine direction
            if(delta.x < 0){
              that.animate(that.index +1, that.options.transitionTime);
            }else{
              that.animate(that.index -1, that.options.transitionTime);
            }

            // snap back to current slide
          }else{
            that.animate(that.index, that.options.transitionTime);
          }
        }

        // kill touchmove and touchend event listeners until touchstart called again
        that.element.removeEventListener('touchmove', that.handleTouch, false);
        that.element.removeEventListener('touchend', that.handleTouch, false);
      };

      // setup event capturing
      that.handleTouch= function(event){
        switch (event.type) {
          case 'touchstart': onStart(event); break;
          case 'touchmove': onMove(event); break;
          case 'touchend': onEnd(event); break;
        }
      };

      // Create Event listener
      if(that.browser.addEventListener && that.browser.touch){
        that.element.addEventListener('touchstart', that.handleTouch, false);
      }

      return that;
    };

    // unbinds touch event handlers and removes touch property
    var removeTouch= function(that){
      if(that.browser.addEventListener && that.browser.touch){
        that.element.removeEventListener('touchstart', that.handleTouch, false);
      }

      delete that.handleTouch;
      return that;
    };

    // Single Element Slider
  window.responsiveSlider = function(container, config){
    "use strict";

    // default config values
    var options= _.extend({
      transitionTime: 0.7,
      disableScroll: false,
      endless: true,
    }, config);

    var that= addTouch(sliderBase(container, options));

    // create animation function
    // @override moves the slider to current index + offset
    that.translate = function(diff, time){
      if(that.browser.transforms){
        TweenLite.to(that.element, time, {x: (diff-that.index*that.width), ease:Power3.easeOut});
      }else{
        TweenLite.to(that.element, time, {left: -(100*that.index)+"%", ease:Power3.easeOut});
      }
    };

    // scale parent element
    that.element.style.width= (that.length * 100)+"%";

    // scale slide elements
    for(var i=0; i<that.length; i++){
      var s=$(that.slides[i]);
      s.width((100/that.length) + "%");
    }

    var style= that.element.style;
    style.webkitBackfaceVisibility =
    style.msBackfaceVisibility =
    style.mozBackfaceVisibility =
    style.backfaceVisibility = "hidden";

    // keep translation constant on resize
    $(window).resize(function(){
      that.width= that.container.width();
      that.translate(0,0);
    });

    that.container.trigger("update", {
      index: that.index,
      length: that.length,
      left: (that.index === 0),
      right: (that.index === that.length-1)
    });

    container.style.visibility = "visible";

    return that;
  };
}());
