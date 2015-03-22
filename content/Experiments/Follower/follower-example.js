$('#start').on('click', followerInit);

function followerInit(){
  createTrailers(100);
}

function createTrailers(numFollowers){
  var $overlay = $('body').overlay(),
      width = $overlay.width(),
      height = $overlay.height(),
      $canvas = $('<canvas width="' + width + '" height="' + height + '">')
        .appendTo($overlay)
        .css({border: '1px solid black', position: 'absolute' }),
      context = $canvas[0].getContext('2d'),
      $secondCanvas = $('<canvas width="' + width + '" height="' + height + '" style="position: absolute; opacity: 0.5">')
        .prependTo($overlay)
      secondContext = $secondCanvas[0].getContext('2d'),
      leader = new Circle('rgb(255,0,0)', 10, 50, 70),
      followers = [];
  
  context.clear = function(){
    context.clearRect(0,0,width,height);
  }
  secondContext.fillWithColor = function(color){
    context.fillStyle = color;
    context.fillRect(0,0,width,height);
  }
  
  while(followers.length < numFollowers){
    followers.push(new Arrow(
      'rgb(' + Math.round(Math.random()*255) + ',' + Math.round(Math.random()*255) + ',' + Math.round(Math.random()*255) + ')',
      20, 500, 0, 0
    ));
  }
  //leader.draw(context);
  //firstArrow.draw(context);
  
  var $doc = $(document),
      dragging;
  
  function mouseMove(e){
    var coords = getRelMouseCoords($canvas[0], {x: e.clientX, y: e.clientY});
    dragMove(coords);
  }
  
  function touchMove(e){
    e.preventDefault;
    var coords = new Generics.Point2D(Math.random()*1000, Math.random() * 1000);
    
    dragMove(coords);
  }
  function dragMove(relCoords){
    context.clear();
    var offset = $canvas.offset(),
        follower;
    leader.x = relCoords.x;
    leader.y = relCoords.y;
    leader.draw(context);
    for(var i in followers){
      follower = followers[i];
      if(i == 0) follower.follow(leader, 20, 0);
      else follower.follow(followers[i-1], 20, 0);
      follower.draw(context);
      follower.draw(secondContext);
    }
  }
  
  $canvas.on({
    'touchmove.dragFollower': touchMove,
    'mousemove.dragFollower': mouseMove
  });
}

function Circle(color, radius, x, y){
  this.color = color;
  this.radius = radius;
  this.x = x;
  this.y = y;
}
Circle.prototype.draw = function(context){
  context.save();
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 0, 2*Math.PI, true);
  context.fillStyle = this.color;
  context.fill();
  context.restore();
};

function Arrow(color, size, x, y, orientation){
  this.color = color;
  this.size = size;
  this.x = x;
  this.y = y;
  this.orientation = orientation || 0;
}
Arrow.prototype.draw = function(context){
  context.save();
  var size = this.size;
  context.translate(this.x,this.y);
  context.rotate(this.orientation + Math.PI/2);
  context.beginPath();
  context.moveTo(0, -size/2);
  context.lineTo(size/3, size/5);
  context.lineTo(size/6, size/4);
  context.lineTo(size/6, size/2);
  context.lineTo(-size/6, size/2);
  context.lineTo(-size/6, size/4);
  context.lineTo(-size/3, size/5);
  context.lineTo(0, -size/2);
  context.fillStyle = this.color;
  context.fill();
  context.restore();
};
Arrow.prototype.follow = function(leader, maxDistance, minDistance){
  var dX = leader.x - this.x,
      dY = leader.y - this.y,
      angle = Math.atan2(dY, dX),
      distance = Math.sqrt(Math.pow(dX,2) + Math.pow(dY, 2)),
      tooFar = distance > maxDistance,
      tooNear = distance < minDistance;
  if(tooNear || tooFar){
    var distanceToMove = tooFar ? distance - maxDistance : distance - minDistance,
        nX = Math.cos(angle) * distanceToMove,
        nY = Math.sin(angle) * distanceToMove;
    
    this.x += nX;
    this.y += nY;
  }
  this.orientation = angle;
};
