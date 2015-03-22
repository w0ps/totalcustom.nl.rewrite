var circle = 2 * Math.PI;

var Object2D = Class.extend({
	init: function(options){
		options = options || {};

		this.position = options.position ?
			(options.position instanceof THREE.Vector2 ?
				options.position : new THREE.Vector2(options.position.x, options.positions.y) )
			: new THREE.Vector2();
		this.rotation = options.rotation || 0;
		this.rotationSpd = options.rotationSpd || 0;
		this.momentum = new THREE.Vector2();
	},
	step: function(dt){
		if(this.friction){
			this.momentum.multiplyScalar(this.frictionCoefficient);
		}
		if(this.angularFriction){
			this.rotationSpd = Number((this.rotationSpd * this.rotationalFriction).toFixed(4));
		}

		this.position.add(this.momentum.multiplyScalar(dt || 1));
		this.rotation = this.rotation + this.rotationSpd;

		//is this really necessary?
  	if(this.rotation < 0){
  		this.rotation += circle;
  	}
  	else if(this.rotation > circle){
  		this.rotation -= circle;
  	}
	}
});