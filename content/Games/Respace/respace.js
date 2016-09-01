var SpaceGame = Game.extend({
  init: function(){
    this.entities = [];
    this.bullets = [];

    this.players = [];

    this.viewport = new Viewport();

    var game = this;
    this.viewport.$overlay.on('remove', function(){
      console.log('stopping');
      game.stop();
    });

  },
  constants: {
    CIRCLE: 2 * Math.PI,
    HALFCIRCLE: Math.PI
  },
  add: function(type, id, location, orientation, color){
    var entity = new AgentTypes[type]({
      game: this,
      id: id,
      location: location,
      orientation: orientation,
      color: color
    });
    console.log(this, entity);
    this.entities.push(entity);
    switch (type){
      case 'Player': this.players.push(entity);
    }
    this.viewport.smartCanvas.add(entity);
  },
  remove: function(id, noExplosion){
    var game = this;
    this.getShipById(id, function(ship, i){
      if(noExplosion) game.entities.splice(i, 1);
      else ship.destroy();
    });
  },
  getShipById: function(id, callback){
    find: for(var i in this.entities){
      if(this.entities[i].id === id){
        callback(this.entities[i], i);

        break find;
      }
    }
  },
  step: function(dt){
    if (this.inAStep) { console.log('stepOverflow'); return; }
    this.inAStep = true;
    //PRETURN
    var i = 0,
        len = this.entities.length,
        entity;
    while (i < len) {
      this.entities[i].preTurn(dt);
      i++;
    }

    //TURN
    i = 0;
    while (i < len) {
      this.entities[i].step(dt);
      i++;
    }

    this.draw();

    this.inAStep = false;
  },
  draw: function(){
    this.viewport.smartCanvas.draw();
  }
});
var AgentTypes = {};
AgentTypes.Entity = Object2D.extend({
  init: function(options){
    options = options || {};

    Object2D.prototype.init.call(this, options);

    this.game = options.game;
    this.id = options.id;
    this.location = options.location instanceof Generics.Point2D ? options.location.clone() : new Generics.Point2D(options.location && options.location.x || 0, options.location && options.location.y || 0);
    this.color = options.color || 'white';
    this.orientation = options.orientation || 0;
    this.speed = options.speed || 0;
  },
  health: 1,
  damage: 0,
  regeneration: 0,
  mass: 1,
  size: 1,
  payload: 1,
  rotation: 0,
  explode: function(){
    //
  },
  preTurn: function(t){

  },
  step: function(t){
    Object2D.step.call(this, t);

    if(this.damage > this.health || this.destroyed){
      this.explode();
      this.game.remove(this);
    }
    this.damageSparks(t);
    this.damage = Math.max(this.damage - (this.regeneration * t), 0);
  },
  draw: function(context){}
});
AgentTypes.BasicShip = AgentTypes.Entity.extend({
  maxSpeed: 1,
  minSpeed: -1,
  maxSteer: 0.05,
  steer: 0,
  throttle: 0,
  power: 1,
  shield: 0,
  friction: 0.95,
  rotationalFriction: 0.83,
  damageSparks: function(){
    //
  },
  control: function(t){
    //add thrust vector to this.momentum
    if(this.steer) this.rotationSpd += this.steer;

  },
  engineTrail: function(){
    //generate engine sparks
  },
  granularity: 100,
  draw: function(context){

  },
  step: function(t){
    this.control(t);
    this.engineTrail(t);
    this.damageSparks(t);

    this.damage = Math.max(this.damage - (this.regeneration * t), 0);
    if(this.damage > this.health || this.destroyed){
      this.explode();
      this.game.remove(this);
    }
  }
});
AgentTypes.Triangle = AgentTypes.BasicShip.extend({
  draw: function(context){
    context.translate(this.location.x, this.location.y);
    context.beginPath();
    context.moveTo(0,-5);
    context.lineTo(4, 5);
    context.lineTo(-4,5);
    context.lineTo(0,-5);
    context.strokeStyle = this.color;
    context.stroke();
  }
});

AgentTypes.Player = AgentTypes.Triangle.extend({
  init: function(){
    AgentTypes.Entity.prototype.init.apply(this, arguments);

    this.keyListener = new KL.KeyListener();
    this.keyListener.addKey(new KL.Key({keyName: 'up', whilePressed: { run: function(){ console.log(new Date); }, interval: 25 } }));

    window.player1 = this;
  }
});

function Viewport() {
  this.$overlay = $('body').overlay();
  this.smartCanvas = new SmartCanvas({container: this.$overlay});
}

var aSpaceGame = new SpaceGame();
aSpaceGame.add('Player', 'randomID', {x:0, y:0}, 0, 'red');
aSpaceGame.start();
