var myWorkers = cw({
	renderField: function( field, cb ) {
		var cX = 0, cY = 0,
				p;

			while(cY < height){
				field.push.apply(field, pixelRenderer ? pixelRenderer(cX, cY, width, height, t) : [0,0]);

				cX++;

				if(cX === width){
					cX = 0;
					cY++;
				}
			}

			return field;
	},
});

var defaults = {
		motionDisplay: {
      // Set the amount of particles per pixel
			particleRatio: 0.005,
      // Set the max age of the particles in simulation steps
			particleMaxAge: 100,
      // Only used for creating testing fields
			particleMaxSpeed: 5,
      // The speed of the particle flow
			particleSpdFactor: 1,
		},
		grid: {
			generatedTSteps: 2 + Math.floor(Math.random() * 10),
			//circleDeviation: 1/4,//1/32,
			circleRevolutions: 1 + Math.floor(Math.random() * Math.random() * Math.random() * 50),
			circleBumps: 1 + Math.floor(Math.random() * 6),
			circleRotationFrequency: Math.floor(Math.random() * 12),
			multiplyBumps: !!Math.round(Math.random()),
			distanceExponent: 1,//Math.random() > 2/3 ? 1/100 : Math.random() < 1/3 ? 100 : 1,
			sineXTile: 3,
			sineYTile: 3,
			createField: function(width, height, t, pixelRenderer){
				var field = new Float32Array( width * height );


				console.log(t);
				var field = [],
					cX = 0, cY = 0,
					p;

				while(cY < height){
					field.push.apply(field, pixelRenderer ? pixelRenderer(cX, cY, width, height, t) : [0,0]);

					cX++;

					if(cX === width){
						cX = 0;
						cY++;
					}
				}

				return field;
			},
			defaultFieldGenerator: 'sineTuple',
			//defaultFieldGenerator: 'identityTuple',
			//defaultFieldGenerator: 'randomTuple',
			//defaultFieldGenerator: 'sineTuple',
			identityTuple: function(x,y, width, height, t){
				var maxSpd = defaults.motionDisplay.particleMaxSpeed;

				return [x / width * maxSpd * Math.sin(t * τ), y / width * maxSpd * Math.sin(t * τ)];
			},
			randomTuple: function(x, y, width, height, t){
				var maxSpd = defaults.motionDisplay.particleMaxSpeed;

				return [
					Math.random() * maxSpd * (Math.random() > 0.5 ? 1 : -1),
					Math.random() * maxSpd * (Math.random() > 0.5 ? 1 : -1)
				];
			},
			circularFieldTuple: function(x, y, width, height, t){
				var maxSpd = defaults.motionDisplay.particleMaxSpeed,
					centerX = width / 2,
					centerY = height / 2,
					deviation = defaults.grid.circleDeviation * τ || 0,
					frequency = defaults.grid.circleRotationFrequency,
					revolutions = defaults.grid.circleRevolutions,
					bumps = defaults.grid.circleBumps,
					multiplyBumps = defaults.grid.multiplyBumps,
					distanceExponent = defaults.grid.distanceExponent,
					dX = centerX - x,// - x,
					dY = centerY - y,// - y,
					dist = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2)),
					maxDist = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2)),
					angle = (Math.atan2(dY, dX) + Math.PI / 2 + deviation + t * τ * frequency) * revolutions,
					bumps = multiplyBumps ? Math.cos(angle * bumps + t * τ) * Math.sin(angle * bumps + t * τ) : Math.cos(angle * bumps + t * τ) + Math.sin(angle * bumps + t * τ),
					speed = Math.sin( (dist * 0.01 + t * τ * 10) + bumps );

				if(angle < 0) angle += τ;
				if(angle > τ) angle -= τ;

				return [
					// fit(Math.cos(angle) * Math.sqrt(dist), -Math.sin(1 * τ), Math.sin(1 * τ), -maxSpd, maxSpd),
					// fit(Math.sin(angle) * Math.sqrt(dist), -Math.sin(1 * τ), Math.sin(1 * τ), -maxSpd, maxSpd)
					fit(Math.cos(angle) * speed, -1, 1, -maxSpd, maxSpd),
					fit(Math.sin(angle) * speed, -1, 1, -maxSpd, maxSpd)
				];
			},
			sineTuple: function(x, y, width, height, t){
				var sineXTile = defaults.grid.sineXTile,
					sineYTile = defaults.grid.sineYTile,
					maxSpd = defaults.motionDisplay.particleMaxSpeed,
					relPositionX = x / width,
					relPositionY = y / height;
					// u = x * τ * sineXTile,
					// v = y * τ * sineYTile;
				return [Math.sin(relPositionX * τ * sineYTile + t * τ) * maxSpd, Math.sin(relPositionY * τ * sineYTile + t * τ) * maxSpd];
			}
		}
	};
