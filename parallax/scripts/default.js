(function(){
  var mobileWidth= 1040;

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  // init controller
  var controller = new ScrollMagic({vertical: true});

  var images= $(".parallax > img"),
  scenes= [];
  var $window= $(window),
  windowHeight= $window.height();

  var parallaxInitialized= false;

  // create Parallax Tweens after Initialization or Resize
  var setTweens= debounce(function(){
    for(var i=0; i<images.length; i++){
      image= $(images[i]);
      TweenLite.set(images, {y:0});
      maxHeight= image.data("maxheight") || 300;
      tween= TweenLite.from(image, 1, {y: Math.min(Math.max(-image.height() + maxHeight, -600),0), ease: Linear.easeNone});
      scenes[i].setTween(tween);
    }
  }, 150);

  // Create a scrollscene for each image
  var createParallax= function(){
    var scene, image, tween, maxHeight;
    for(var i=0; i<images.length; i++){
      image= $(images[i]);
      maxHeight= image.data("maxheight") || 400;
      scene= new ScrollScene({triggerHook: 1, triggerElement: image.parent(), duration: windowHeight+maxHeight});
      scene.addTo(controller);
      scenes.push(scene);
    }
    parallaxInitialized= true;
  };

  // disable scrollmagic on mobile
  var test= true,
  mobile= true;
  var testMobile= function(){
    test= $window.width() < mobileWidth;
    if(test !== mobile){
      mobile= test;

      console.log("parallax active:", !test);

      for(var i=0; i < scenes.length; i++){
        scenes[i].enabled(!test);
      }

      if(!mobile){
        if(!parallaxInitialized){
          createParallax();
        }
        setTweens();
      }
    }

  };

  $window.on("resize", testMobile);
  $window.on("orientationchange", testMobile);
  testMobile();
}());
