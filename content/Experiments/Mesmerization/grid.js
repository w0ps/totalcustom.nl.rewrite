function Grid(options){
	var defs = defaults.grid;

	this.width = options.width || defs.width;
	this.height = options.height || defs.height;

	if(options.fields){
		this.fields = options.fields;
	} else {
		var fields = [],
			t = 0,
			tStep = 1 / defs.generatedTSteps;

		while(fields.length < defs.generatedTSteps){
			fields.push(defs.createField(this.width, this.height, t, defs[defs.defaultFieldGenerator]));
			t += tStep;
		}

		this.fields = { custom: fields };
	}

	this.variants = Object.keys(this.fields);

	console.log(this.variants);

	this.currentVariant = this.variants[0];

	// we need at least 2 timesteps for interpolation not to crash
	if(this.currentVariant.length === 1){
		this.currentVariant.push(this.currentVariant[0]);
	}

	this.setCurrentVariant();

	this.timePassing = this.variant.length ? !!options.timePassing : false;

	if(this.timePassing){
		this.T = this.floorT = 0;
		this.ceilT = 1;
		this.t = 0;
	} else {
		this.T = this.floorT = this.ceilT = this.t = 0;
	}

	this.spawnArray = options.spawnArray || this.createSpawnArray();
}
(function(){
	this.getLocalV = function(x, y){
		var xR = x % 1,
			yR = y % 1,
			width = this.width * 2,
			field = this.variant[this.floorT],
			field2 = this.variant[this.ceilT],
			t = this.t;

		if(xR && yR){
			var sI = this.getFirstIndex(Math.floor(x), Math.floor(y)),
				lXlYx = field[sI],
				lXlYy = field[sI + 1],
				hXlYx = field[sI + 2],
				hXlYy = field[sI + 3],
				lXhYx = field[sI + width],
				lXhYy = field[sI + width + 1],
				hXhYx = field[sI + width + 2],
				hXhYy = field[sI + width + 3],
				lXx = ipl(lXlYx, lXhYx, yR),
				lXy = ipl(lXlYy, lXhYy, yR),
				hXx = ipl(hXlYx, hXlYx, yR),
				hXy = ipl(hXlYy, hXlYy, yR),
				xV = ipl(lXx, hXx, xR),
				yV = ipl(lXy, hXy, xR),
				lXlYx2 = field2[sI],
				lXlYy2 = field2[sI + 1],
				hXlYx2 = field2[sI + 2],
				hXlYy2 = field2[sI + 3],
				lXhYx2 = field2[sI + width],
				lXhYy2 = field2[sI + width + 1],
				hXhYx2 = field2[sI + width + 2],
				hXhYy2 = field2[sI + width + 3],
				lXx2 = ipl(lXlYx2, lXhYx2, yR),
				lXy2 = ipl(lXlYy2, lXhYy2, yR),
				hXx2 = ipl(hXlYx2, hXlYx2, yR),
				hXy2 = ipl(hXlYy2, hXlYy2, yR),
				xV2 = ipl(lXx2, hXx2, xR),
				yV2 = ipl(lXy2, hXy2, xR);

			return [ipl(xV, xV2, t), ipl(yV, yV2, t)];

		} else if(xR){
			var sI = this.getFirstIndex(Math.floor(x), y),
				lXx = field[sI],
				lXy = field[sI + 1],
				hXx = field[sI + width],
				hXy = field[sI + width + 1],
				xV = ipl(lXx, hXx, xR),
				yV = ipl(lXy, lXy, xR),
				lXx2 = field2[sI],
				lXy2 = field2[sI + 1],
				hXx2 = field2[sI + width],
				hXy2 = field2[sI + width + 1],
				xV2 = ipl(lXx2, hXx2, xR),
				yV2 = ipl(lXy2, lXy2, xR);

			return [ipl(xV, xV2, t), ipl(yV, yV2, t)];
		} else if(yR){
			var sI = this.getFirstIndex(x, Math.floor(y)),
				lYx = field[sI],
				lYy = field[sI + 1],
				hYx = field[sI + width],
				hYy = field[sI + width + 1],
				xV = ipl(lYx, hYx, yR),
				yV = ipl(lYy, hYy, yR),
				lYx2 = field2[sI],
				lYy2 = field2[sI + 1],
				hYx2 = field2[sI + width],
				hYy2 = field2[sI + width + 1],
				xV2 = ipl(lYx2, hYx2, yR),
				yV2 = ipl(lYy2, hYy2, yR);

			return [ipl(xV, xV2, t), ipl(yV, yV2, t)];
		}


		var sI = this.getFirstIndex(x, y);

		return [ipl(field[sI], field2[sI], t), ipl(field[sI + 1], field2[sI + 1], t)];
	};
	this.createSpawnArray = function(buffer){
		var spawnArray = [],
			width = this.width,
			height = this.height,
			i = 0,
			x, y, length;

		buffer = buffer || this.variant[0];
		length = buffer.length;

		while(i < length){
			if(!isNaN(buffer[i])){
				x = i / 2;
				y = Math.floor(x / width);
				x -= y * width;
				spawnArray.push(x, y);

				// remove NaN values so they can be interpolated with regular values
				buffer[i] = 0;
				buffer[i + 1] = 0;
			}

			i += 2;
			// while(x < width){
			// 	idx = y * width * 2;

			// 	x++;
			// }
			// y++;
		}

		spawnArray.halfLength = spawnArray.length / 2;

		if(!spawnArray.length) throw('no spawn locations found');

		return spawnArray;
	};
	this.getFirstIndex = function(x,y){
		return (x + y * this.width) * 2;
	};
	this.setCurrentVariant = function(){
		console.log(this.currentVariant + ' t' + this.currentTime);

		this.variant = this.fields[this.currentVariant];
	};
	this.step = function(dt){
		if(!this.timePassing) return;
		var maxLength = this.variant.length,
			T = this.T += dt;
		if(T >= maxLength){
			T = this.T -= this.variant.length;
		}

		this.floorT = Math.floor(T);
		this.ceilT = Math.ceil(T);

		if(this.ceilT === maxLength){
			this.ceilT = 0;
		}

		this.t = T % 1;
	};
	this.nextVariant = function(variant){
		var newVariant;

		if(variant && ~this.variants.indexOf(variant)){
			this.currentVariant = variant;
			newVariant = this.fields[newVariant];
		} else {
			this.currentVariant = this.variants[this.variants.indexOf(this.currentVariant) + 1];
			newVariant = this.fields[this.currentVariant];
		}

		if(!newVariant){
			this.currentVariant = this.variants[0];
		}

		this.setCurrentVariant();
	};
	this.setNextTime = function(time){
		var timesLength = this.fields[this.currentVariant].length;

		if(time !== undefined && time >= 0 && time < timesLength ){
			this.currentTime = time;
		} else {
			this.currentTime++;
			if(this.currentTime === this.fields[this.currentVariant].length){
				this.currentTime = 0;
			}
		}

		this.nextTime = this.currentTime < timesLength - 1 ? this.currentTime + 1 : 0;

		this.setCurrentFields();
	};
	this.toggleTimePassing = function(){
		this.timePassing = !this.timePassing;
	};
}).call(Grid.prototype);
