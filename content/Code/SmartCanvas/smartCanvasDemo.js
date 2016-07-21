function initDemoTable(e, eventData){
  if(eventData.href !== '/Code/SmartCanvas') return;

  $('.canvasdemo').each(initDemo);
}

function initDemo(){
  var $container = $(this),
      data = $container.data(),
      smartCanvas = new SmartCanvas({}, $container);

  _.each(data, function(value, key){
    numericalValue = +value;
    if(!isNaN(numericalValue)){
      data[key] = numericalValue;
      return;
    }
    if(!value) delete data[key];
  });

  var zeroZeroCircle = new Circle('green', 10, 0, 0),
      oneOneCircle = new Circle('blue', 10, 50, 50),
      minusOneMinusOneCircle = new Circle('red', 10, -50, -50);

  smartCanvas.add([zeroZeroCircle, oneOneCircle, minusOneMinusOneCircle]);

  zeroZeroCircle.click = function(point){
    console.log(point, this.inside(point));
  };
  oneOneCircle.click = zeroZeroCircle.click;
}

$(document.body).on('pageTransitionEnd.initSmartCanvasDemoTable', initDemoTable);
