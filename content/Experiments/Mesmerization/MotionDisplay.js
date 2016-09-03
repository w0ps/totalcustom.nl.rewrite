function MotionDisplay(options){
	var defs = defaults.motionDisplay,
  		pixelRatio = window.devicePixelRatio || 1;

	this.grid = options.grid || new Grid(options.gridOptions || {});
	this.width = options.width || this.grid.width;
	this.height = options.height || this.grid.height;
	this.xScale = this.width * pixelRatio / this.grid.width;
	this.yScale = this.height * pixelRatio / this.grid.height;
	this.scale = ipl(this.xScale, this.yScale, 0.5);

	this.canvas = document.createElement('canvas');
	this.canvas.setAttribute('width', Math.floor(this.width * pixelRatio));
	this.canvas.setAttribute('height', Math.floor(this.height * pixelRatio));

	this.context = this.canvas.getContext('2d');
	this.context.scale(this.xScale, this.yScale);
	this.context.lineCap = 'round';
	this.context.strokeStyle = 'white';
	this.context.lineWidth = (options.lineWidth || 1) * pixelRatio;
  this.context.save();

	enrichContext(this.context);

	this.numParticles = options.numParticles || Math.min(defs.particleRatio, 1) * ( this.grid.spawnArray || this.grid.variant[0] ).length / 2;
	this.background = options.background || 'rgba(0,0,0,0.03)';

	this.showFieldSpeed = options.showFieldSpeed ? true : options.showFieldSpeed === false ? false : false;

	if(options.clipPath){
		this.clipPath = options.clipPath;
		this.setClip();
	}

	if(options.debugField){
		return this.renderField();
	}

	// var buffer = randomColorBufferA( { n: 10, colors: [getNiceColorRGB(), getNiceColorRGB(), getNiceColorRGB()], forceStartStop: true, forceEndStop: true });
  var gradient = [
  			{
  				t: 0,
  				r: 0,
  				g: 0,
  				b: 255
  			}, {
  				t: 0.5,
  				r: 0,
  				g: 255,
  				b: 0
  			}, {
  				t: 1,
  				r: 255,
  				g: 0,
  				b: 0
  			}
		  ];
	//var gradient = buffer.map( function( point ) {
  //   var color = point.color;
  //   return {
  //     t: point.t,
  //     r: color[ 0 ],
  //     g: color[ 1 ],
  //     b: color[ 2 ]
  //   }
  // } );
  var buckets = getBuckets( gradient, [ 'r', 'g', 'b' ], 0, 6, function( bucket ) {
  	bucket.children = [];
  	bucket.clear = function() {
  		bucket.children = [];
  	};
  	var color = bucket.values;
  	bucket.color = colorToString( [ color.r, color.g, color.b ] );
  } );
  
  var bucketTree = new BucketTree( buckets );

  this.getLeaf = function getLeaf( t ) {
  	return bucketTree.getLeaf( t );
  }

  this.leafs = bucketTree.getLeafs([]).reverse();

  console.log(bucketTree);
  // debugger;

	this.createParticles();

	document.addEventListener('visibilitychange', function(e){
		if(document.hidden){
			this.stop();
		} else {
			this.start();
		}
	}.bind(this));

  this.timeStep = options.timeStep || 0.01;
	this.start();
}
(function(){
	this.createParticles = function(){
		var grid = this.grid,
				t = 0,
				l = this.numParticles,
				particles = this.particles = [],
				particle;

		while(t++ < l){
			particle = new Particle({
				x: -1,
				y: -1,
				age: 1,
			});
			particle.step(grid);
			particles.push(particle);
		}
	};
	this.start = function(){
		var motionDisplay = this;

		if(this.running) return;

		this.running = true;

		this.nextStep = setTimeout(function outerStep(){
			motionDisplay.step();

			if(motionDisplay.running) motionDisplay.nextStep = setTimeout(outerStep.bind(motionDisplay));
		});
	};
	this.stop = function(){
		this.running = false;
		clearTimeout(this.nextStep);
	};
	this.step = function(){
		var grid = this.grid,
				ctx = this.context;

		this.grid.step(this.timeStep);

		if(this.debugField){
			return this.renderField();
		}

		ctx.globalCompositeOperation = 'source-over';

		ctx.fillStyle = this.background;
		ctx.fillRect(0, 0, this.grid.width, this.grid.height);

		ctx.globalCompositeOperation = 'lighter';

		var i = 0,
				particles = this.particles,
				l = particles.length,
				maxSpd = defaults.motionDisplay.particleSpdFactor,// / defaults.motionDisplay.particleMaxSpeed,
				spd,
				p,
				bucketRenderer;

		while(i < l){
			p = particles[i++];
			p.step(grid);

			spd = Math.sqrt( Math.pow( p.dx, 2) + Math.pow( p.dy, 2 ) );
			if( spd !== spd) debugger;//continue; //sometimes they get NaN

			this.getLeaf( spd / maxSpd ).children.push( p );
		}

		bucketRenderer = function drawParticlesInBucket( particles, bucket ) {
			if (!bucket.children.length ) return;
			
			ctx.beginPath();
			ctx.strokeStyle = bucket.color;

			i = 0;
			while( i < l ) {
				p = particles[i++];
				ctx.moveTo( p.x, p.y );
				ctx.lineTo( p.x - p.dx, p.y - p.dy );
			}

			ctx.stroke();

			bucket.clear();
		}.bind(null, particles );

		this.leafs.forEach( bucketRenderer );
	};
	this.renderField = function(){
		var pt = Date.now(),
			grid = this.grid,
			ctx = this.context,
			xScale = this.xScale,
			yScale = this.yScale,
			TFloor = Math.floor(this.grid.T),
			max = fieldsMeta[this.grid.currentVariant + '-' + TFloor],
			max2 = fieldsMeta[this.grid.currentVariant + '-' + (TFloor + 1 !== this.grid.variant.length ? TFloor + 1 : 0) ],
			maxSpd = max && max2 ? ipl(max, max2, this.grid.t) : defaults.motionDisplay.particleMaxSpeed,
			imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height),
			width = imageData.width,
			data = imageData.data,
			getValue = fitFactory(-maxSpd, maxSpd, 0, 255),
			getValue2 = fitFactory(0, maxSpd, 0, 255),
			x = 0, y = 0,
			v, idx = 0;

		while(idx < data.length){
			y = Math.floor(idx / 4 / width);
			x = idx / 4 - y * width;

			if(data[idx + 3]){
				v = this.grid.getLocalV(x / xScale, y / yScale);

				data[idx] = Math.floor( getValue( v[0] ) );
				data[idx + 1] = Math.floor( getValue( v[1] ) );
				data[idx + 2] = !this.showFieldSpeed ? 0 : Math.floor( getValue( Math.sqrt( Math.pow( v[0], 2 ) + Math.pow( v[1], 2) ) ) );
				data[idx + 3] = 255;
			}

			idx += 4;
		}

		ctx.putImageData(imageData, 0, 0);

		console.log('field rendered in ' + (Date.now() - pt) + 'ms');
	};
	this.setClip = function(){
		polygons = this.clipPath;

		var holes = [],
			outerPaths = [],
			ctx = this.context,
			pixelRatio = window.devicePixelRatio || 1;

		ctx.clearRect(0, 0, this.width * pixelRatio, this.height * pixelRatio);

		polygons.forEach(function(polygon){
			var copy = polygon.slice();
			outerPaths.push(copy.shift());
			holes.push.apply(holes, copy);
		});

		ctx.beginPath();
		outerPaths.forEach(drawPath);

		this.context.fillStyle = this.background;

		ctx.clip();

		this.context.fill();

		return;

		function drawPath(path){
			ctx.moveTo(path[0][0], path[0][1]);

			path.slice(1).forEach(function(coordinates){
				ctx.lineTo(coordinates[0], coordinates[1]);
			});

			//move back to beginning
			ctx.lineTo(path[0][0], path[0][1]);
		}
	};
}).call(MotionDisplay.prototype);

function enrichContext(ctx){
	ctx.circle = function(x, y, radius){
		ctx.arc(x, y, radius, 0, τ, true);
	}
}
