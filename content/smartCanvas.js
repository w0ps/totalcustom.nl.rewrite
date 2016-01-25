//Author Ivo de Kler - totalcustom.nl

var root = window; //todo set appropriately

function wrap(val, max, min) {
	var range;
	if (!max) max = 1;
	if (!min) min = 0;
	range = max - min;
	if (val < min) return val + range;
	if (val > max) return val - range;
	return val;
}
function fit(value, min, max, start, end) {
	value = Math.max(Math.min(value, max), min);
	var range1 = max - min,
			range2 = end - start;
	return (((value - min) / range1) * range2) + start;
}


function SmartCanvas(options, $parentElement){
	var smartCanvas = this;

	options = options || {};
	$parentElement = $parentElement || $(window);

	var devicePixelRatio = root.devicePixelRatio || 1;

	this.backgroundColor = options.backgroundColor;
	
	this.size = new THREE.Vector2(
		options.size ? options.size.x : $parentElement.innerWidth(),
		options.size ? options.size.y : $parentElement.innerHeight()
	);

	this.scale = 1 / devicePixelRatio;
	this.yScale = options.yScale || 1;
	this.xScale = options.xScale || 1;
	
	this.bufferSize = this.size.clone().multiplyScalar( 1 / this.scale );
	
	this.centerView = this.size.clone().multiplyScalar(0.5);
	this.centerBuffer = this.bufferSize.clone().multiplyScalar(0.5);
	
	this.$canvas = $('<canvas width="' + this.bufferSize.x + '" height="' + this.bufferSize.y + '">')
	.appendTo($parentElement[0] !== window ? $parentElement : document.body)
	.css({ width: this.size.x + 'px', height: this.size.y + 'px' });
	
	this.context = this.$canvas[0].getContext('2d');
	
	this.contents = [];
	
	this.camera = new Object2D();
	
	this.contents.push(this.camera);
	
	this.context.fillStyle = 'black';
	
	this.noDraw = options.noAutoDraw;
	this.noClear = options.autoClear;
	
	if(!this.noDraw) this.draw();

	this.$canvas.on({
    mousemove: this.pointerEvent.bind(this, 'over'),
    click: this.pointerEvent.bind(this, 'click')
  });
}
(function(){
  this.pointerEvent = function (event, e){
  	if(event === 'click') console.log('pe', this.$canvas[0]);
    var camSpacePoint = this.toWorldSpace({x: e.offsetX, y: e.offsetY}),
        contents = this.contents,
        item, i;

    for(i in contents){
      item = contents[i];
      if(item[event] && typeof item[event] == 'function'){
        item[event](this.toItemSpace(item, camSpacePoint));
      }
    }
  };
	this.add = function addItem(item){
		var  tempNoDraw;
		if(item.length){
			tempNoDraw = this.noDraw;
			this.noDraw = true;

			item.forEach(this.add.bind(this));

			this.noDraw = tempNoDraw;
		} else {
			this.contents.push(item);
		}
		if(!this.noDraw) this.draw();
	};
	this.clear = function clearCanvas(){
		if (!this.backgroundColor) this.context.clearRect(0, 0, this.bufferSize.x, this.bufferSize.y);
		else{
			this.context.fillStyle = this.backgroundColor;
			this.context.fillRect(0, 0, this.bufferSize.x, this.bufferSize.y);
		}
	},
	this.step = function step(dt){
		var item;
		for (var i in this.contents) {
			item = this.contents[i];
			if (item.step) {
				item.step(dt);
			}
			if (item.momentum) {
				item.position.add(item.momentum);
			}
			if (item.rotationSpd) {
				item.rotation = wrap(item.rotation + item.rotationSpd, Math.PI * 2);
			}
		}
		if (!this.noDraw) this.draw();
	};
	this.draw = function(){
		this.context.resetTransform();
		
		if(!this.noClear) this.clear();

		this.context.translate(this.centerBuffer.x, this.centerBuffer.y);
		
		this.context.rotate(this.camera.rotation);

		this.context.scale(this.xScale, this.yScale);
		
		this.context.scale( 1 / this.scale * ( this.camera.scale || 1 ), 1 / this.scale * ( this.camera.scale || 1 ) );

		this.context.translate(-this.camera.position.x, -this.camera.position.y);
		
		
		
		var item;
		for(var i in this.contents){
			item = this.contents[i];
			if (!item.draw) continue;
			this.context.save();
			if (item.opacity) this.context.globalAlpha = item.opacity;
			if(item.position) this.context.translate(item.position.x, item.position.y);
			if(item.rotation) this.context.rotate(item.rotation);
			if(item.scale) this.context.scale(item.scale, item.scale);
			
			item.draw(this.context);
			this.context.restore();
		}
		this.context.save();
	};
	this.toWorldSpace = function toWorldSpace(screenPoint){
		var camPoint = new THREE.Vector2(screenPoint.x, screenPoint.y);

		camPoint.sub(this.centerView);

		//camPoint.multiplyScalar( 1 / this.scale );
		
		var sin = Math.sin(-this.camera.rotation),
				cos = Math.cos(-this.camera.rotation);
		
		camPoint.set(
			camPoint.x * cos - camPoint.y * sin,
			camPoint.x * sin + camPoint.y * cos
		);
		
		if(this.camera.scale){
			camPoint.multiplyScalar(1 / this.camera.scale);
		}
		
		camPoint.add(this.camera.position);

		return camPoint;
	};
	this.toItemSpace = function toItemSpace(item, worldSpacePoint){
		var itemSpacePoint = worldSpacePoint.clone();
		if(item.position) itemSpacePoint.sub(item.position);
		if(item.rotation){
			var sin = Math.sin(-item.rotation),
					cos = Math.cos(-item.rotation);
			
			itemSpacePoint.set(
				itemSpacePoint.x * cos - itemSpacePoint.y * sin,
				itemSpacePoint.x * sin + itemSpacePoint.y * cos
			)
		}
		if (item.scale) itemSpacePoint.multiplyScalar(1 / (item.scale || 1));
		return itemSpacePoint;
	};
}).call(SmartCanvas.prototype);
