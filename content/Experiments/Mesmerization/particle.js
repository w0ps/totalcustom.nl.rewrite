function Particle(options){
  this.x = options.x;
  this.y = options.y;
  this.dx = 0;
  this.dy = 0;
  this.age = options.age || Math.ceil(Math.random() * pMaxAge);
}
(function(){
  this.step = function(grid){
    var particleSpdFactor = defaults.motionDisplay.particleSpdFactor,
        spawnArray = grid.spawnArray,
        index;

    this.x += this.dx;
    this.y += this.dy;

    // faster particles are more interesting so they live longer. Reduce age with 100 divided by distance traveled
    // this.age -= 1 / ( Math.pow(this.dx, 2) + Math.pow(this.dy, 2) );
    this.age--;

    if(this.age < 0 || (!this.dx && !this.dy) || !(this.x >= 0 && this.x < grid.width && this.y >= 0 && this.y < grid.width)){ //died of old age or exited bounds
      this.age = Math.ceil(Math.random() * pMaxAge);

      index = Math.floor(Math.random() * spawnArray.length / 2) * 2;

      this.x = spawnArray[index];
      this.y = spawnArray[index + 1];
    }

    var v = grid.getLocalV(this.x, this.y);

    // if( v[0] !== v[0] ) debugger;

    this.dx = v[0] * particleSpdFactor;
    this.dy = v[1] * particleSpdFactor;
  };
}).call(Particle.prototype);
