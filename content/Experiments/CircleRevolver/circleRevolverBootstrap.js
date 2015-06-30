function initDemoTable(e, eventData){
  if(eventData.href !== '/Experiments/CircleRevolver') return;
  
  //setTimeout(function(){
    $('.spiralversion').each(initDemo);
  //}, 100);
}

function initDemo(){
  var $container = $(this),
      smartCanvas = new SmartCanvas({}, $container),
      options = {
        startingRadius: $container.attr('data-starting-radius'),
        additionalCircleRadius: $container.attr('data-additional-circle-radius'),
        layerRadius: $container.attr('data-layer-radius'),
        limit: $container.attr('data-limit'),
        newCircleScaleExponent: $container.attr('data-new-circle-scale-exponent'),
        newLayerScaleExponent: $container.attr('data-new-layer-scale-exponent'),
        randomizeCircleSize: $container.attr('data-randomize-circle-size'),
        randomizeLayerRadius: $container.attr('data-randomize-layer-radius')
      },
      circleSpiral;

  _.each(options, function(value, key){
    numericalValue = +value;
    if(!isNaN(numericalValue)){
      options[key] = numericalValue;
      return;
    }
    if(!value) delete options[key];
  });

  circleSpiral = new CircleSpiral(options);

  while(!circleSpiral.constructed){
    circleSpiral.construct();
  }

  smartCanvas.add(circleSpiral);
  smartCanvas.draw();
}

$('#startCircleSpiral').on('click', initCircleSpiralDemo);

function initCircleSpiralDemo(){
  var $overlay = $('body').overlay();
    
    $overlay.css({background: 'black'});

    var mySmartCanvas = new SmartCanvas({}, $overlay),
      myCam = mySmartCanvas.camera;

    var circleSpiral = new CircleSpiral({
      startingRadius: 20,
      additionalCircleRadius: 20,
      layerRadius: 1,
      limit: 200,
      //newCircleScaleExponent: 1.2,
      //newLayerScaleExponent: 0.998,
      //randomizeCircleSize: 0.3,
      //randomizeLayerRadius: 0.5,
      drawConstructionCircles: true
    });

    mySmartCanvas.add( circleSpiral );

    delay = 50;

    setTimeout(function(){
      //mySmartCanvas.camera.rotation += .001;
      
      mySmartCanvas.draw();
      //if(!circleSpiral.constructed){
        setTimeout(arguments.callee, delay);
      //}
    }, delay);
}

$(document.body).on('pageTransitionEnd.initCircleRevolverDemoTable', initDemoTable);