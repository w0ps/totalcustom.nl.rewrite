function fieldsLoader(options, cb){
	console.log(fieldsMeta);

	if(typeof options === 'function'){
		cb = options;
		options = {};
	} else options = options || {};

	var fields = {},
    	canvas = document.createElement('canvas'),
    	width = canvas.width = exportX,
    	height = canvas.height = exportY,
    	ctx = canvas.getContext('2d'),
    	fieldNames = Object.keys(fieldsMeta),
    	total = fieldNames.length,
    	done = 0;

	fieldNames.forEach(function(name){
		var nameSplit = name.split('-'),
  			variant = nameSplit[0],
  			T = nameSplit[1],
  			img = new Image(),
        nullValue = (variant === 'avg' && T === 1) ? NaN : 0; // this is for creating spawnArray from first field

		fields[variant] = fields[variant] || [];

		img.src = (options.path || '/fields/') + name + '.png';

    img.onerror = function(err){
      cb(new Error('image failed to load: ' + (options.path || '/fields/') + name + '.png'));
      cb = function(){};
    }

		img.onload = setTimeout.bind(window, function(){
		 	var max = fieldsMeta[name],
  		 		fitBack = fitFactory(1, 255, -max, max),
  		 		maxSpd = defaults.motionDisplay.particleMaxSpeed,
  		 		field = new Float32Array(width * height * 2);

		 	ctx.drawImage(img, 0, 0, width, height);

		 	var imageData = ctx.getImageData(0, 0, width, height),
  		 		buffer = imageData.data,
  		 		length = buffer.length,
  		 		i = 0, r, g;

		 	while(i < length){
		 		if(buffer[i]){
		 			r = fitBack(buffer[i]);
		 			g = fitBack(buffer[i + 1]);

		 			field[i / 2] = safeDeLog(r) - getSign(r); // remove one because log/delogging creates artifacts below 1
		 			field[i / 2 + 1] = safeDeLog(g) - getSign(g); // and one has been added before to prevent this
		 		}

		 		else{
		 			field[i / 2] = nullValue;
		 			field[i / 2 + 1] = nullValue;
		 		}

		 		i += 4;
		 	}

		 	fields[variant][T] = field;

		 	done++;
		 	if(done === total) cb(null, fields);
		});
	});
}
