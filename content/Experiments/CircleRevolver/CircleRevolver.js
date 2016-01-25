var tau = 2 * Math.PI;

function convertRandomFactor(factor){
  return 1 + (Math.random() * (factor / 2) ) - factor;
}

function CircleSpiral(options){
  options = options || {};

  this.drawConstructionCircles = options.drawConstructionCircles;

  this.additionalCircleRadius = options.additionalCircleRadius || 10;
  this.layerRadius = options.layerRadius || 0;

  this.limit = options.limit || 20;
  
  this.newCircleScaleExponent = options.newCircleScaleExponent || 1;
  this.newLayerScaleExponent = options.newLayerScaleExponent || 1;

  this.randomizeCircleSize = options.randomizeCircleSize || 0;
  this.randomizeLayerRadius = options.randomizeLayerRadius || 0;

  this.iterations = 0;

  this.circleArrays = [new ConcentricCircleArray({
    radius: options.startingRadius !== undefined ? options.startingRadius : this.additionalCircleRadius
  })];

  this.onCircleArray = this.circleArrays[0];
  this.elementsToDraw = [this.circleArrays[0].circles[0]];
}

CircleSpiral.prototype.draw = function(ctx){
  if(!this.constructed){
    this.construct(ctx);
  }

  ctx.globalCompositeOperation = 'destination-over';
  //ctx.strokeStyle = 'white';

  _.each(this.elementsToDraw, function(element){
    element.draw(ctx);
  });
};

CircleSpiral.prototype.construct = function(ctx){
  if(this.iterations < this.limit){
    this.addLayer(ctx);
    this.iterations++;
  } else {
    this.constructed = true;
  }
};



CircleSpiral.prototype.addLayer = function(ctx){
  var radius = this.layerRadius,
    f;

  if(this.layerRadius){

    radius *= Math.pow(this.newLayerScaleExponent, this.iterations);

    if(this.randomizeLayerRadius){
      if(typeof this.randomizeLayerRadius === 'function'){
        f = this.randomizeLayerRadius();
      } else if(typeof this.randomizeLayerRadius === 'number'){
        f = convertRandomFactor(this.randomizeLayerRadius);
      }

      radius *= f;
    }

    _.each(this.circleArrays, function(circleArray){    
      var layer = circleArray.expand(radius, this.iterations);
      if(layer){
        this.elementsToDraw.push(layer);
      }
    }.bind(this));
  }

  this.elementsToDraw.push( this.addCircleArray(ctx, this.iterations) );
};

CircleSpiral.prototype.addCircleArray = function(ctx){
  var newCircleRadius = this.additionalCircleRadius,
      previousCircleArrayConstructionCircle,
      currentOnCircleArrayConstructionCircle,
      nextOnCircleArrayConstructionCircle,
      newCircleArray, f;

  if(this.randomizeCircleSize){
    if(typeof this.randomizeCircleSize === 'number'){
      f = convertRandomFactor(this.randomizeCircleSize);
    } else if(typeof this.randomizeCircleSize === 'function'){
      f = this.randomizeCircleSize(); 
    }
    newCircleRadius *= f;
  }

  newCircleRadius *= Math.pow(this.newCircleScaleExponent, this.iterations);
  
  if(this.circleArrays.length === 1){
    newCircleRadius *= Math.pow(this.newCircleScaleExponent, this.iterations);

    newCircleArray = new ConcentricCircleArray({
      color: 'white',
      radius: newCircleRadius,
      position: { x: 0, y: this.circleArrays[0].currentRadius + newCircleRadius }
    });

  } else {

    var lastCircleArray = _.last(this.circleArrays);

    previousCircleArrayConstructionCircle = new IntelligentCircle({
      color: 'red',
      position: { x: lastCircleArray.position.x, y: lastCircleArray.position.y },
      radius: lastCircleArray.currentRadius + newCircleRadius
    });
    
    currentOnCircleArrayConstructionCircle = new IntelligentCircle({
      color: 'yellow',
      position: { x: this.onCircleArray.position.x, y: this.onCircleArray.position.y },
      radius: this.onCircleArray.currentRadius + newCircleRadius
    });
        
    if(this.drawConstructionCircles) previousCircleArrayConstructionCircle.draw(ctx);
    
    var intersections = currentOnCircleArrayConstructionCircle.getIntersections(previousCircleArrayConstructionCircle);

    var distToOnCircleArrayX = this.onCircleArray.position.x - intersections[0].x,
        distToOnCircleArrayY = this.onCircleArray.position.y - intersections[0].y,
        distToOnCircleArray = Math.pytha(distToOnCircleArrayX, distToOnCircleArrayY) - this.onCircleArray.currentRadius,
        nextOnCircleArray = this.circleArrays[1],
        distToNextOnCircleArrayX = nextOnCircleArray.position.x - intersections[0].x,
        distToNextOnCircleArrayY = nextOnCircleArray.position.y - intersections[0].y,
        distToNextOnCircleArray = Math.pytha(distToNextOnCircleArrayX, distToNextOnCircleArrayY) - nextOnCircleArray.currentRadius;

    if(distToOnCircleArray <= distToNextOnCircleArray || this.circleArrays.length < 3){

      if(this.drawConstructionCircles) currentOnCircleArrayConstructionCircle.draw(ctx);

      newCircleArray = new ConcentricCircleArray({
        color: 'white',
        radius: newCircleRadius,
        position: { x: intersections[0].x, y: intersections[0].y },
      });

    } else {

      this.circleArrays.shift();
      this.onCircleArray = this.circleArrays[0];

      nextOnCircleArrayConstructionCircle = new IntelligentCircle({
        color: 'blue',
        position: { x: this.onCircleArray.position.x, y: this.onCircleArray.position.y },
        radius: this.onCircleArray.currentRadius + newCircleRadius
      });

      if(this.drawConstructionCircles) nextOnCircleArrayConstructionCircle.draw(ctx);

      intersections = nextOnCircleArrayConstructionCircle.getIntersections(previousCircleArrayConstructionCircle);

      newCircleArray = new ConcentricCircleArray({
        color: 'white',
        radius: newCircleRadius,
        position: { x: intersections[0].x, y: intersections[0].y },
      });
    }
    
  }

  this.circleArrays.push(newCircleArray);

  return newCircleArray.circles[0];
};


function ConcentricCircleArray(options){
  this.position = options.position ? new THREE.Vector2(options.position.x, options.position.y) : new THREE.Vector2();
  this.currentRadius = options.radius !== undefined ? options.radius : 100;
  this.circles = [new IntelligentCircle({
    position: this.position,
    radius: this.currentRadius,
    color: 'white',
    fill: 'black'
  })];
}

ConcentricCircleArray.prototype.expand = function(amount){
  if(!amount) return;

  this.currentRadius += amount;

  var newCircle = new IntelligentCircle({
    position: this.position,
    radius: this.currentRadius,
    color: 'white',
    fill: 'black'
  });

  this.circles.push(newCircle);

  return newCircle;
};
