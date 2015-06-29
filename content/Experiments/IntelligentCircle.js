/*
	options/defaults: {
		position:{x: 0, y: 0},
		radius: 100,
		color: 'black',
		width: 2
	}
*/
function IntelligentCircle(options){
	options = options || {};
	
	this.position = options.position ? new THREE.Vector2(options.position.x, options.position.y) : new THREE.Vector2();
	this.radius = options.radius !== undefined ? options.radius : 100;
	if(options.color) this.color = new THREE.Color(options.color);
	if(options.color) this.width = options.width;
	if(options.fill) this.fill = new THREE.Color(options.fill);
}
(function(){
	this.draw = function drawDataCircle(context){
		var position = this.position,
				tau = 2 * Math.PI;

		context.beginPath();
		context.arc(position.x, position.y, this.radius, 0, tau);
		if(this.color) context.strokeStyle = this.color.getStyle();
		if(this.width) context.lineWidth = seg.width;
		else context.lineWidth = 4;
		if(this.fill){
			context.fillStyle = this.fill.getStyle();
			context.fill();
		}
		if(!this.noStroke) context.stroke();
	};
	this.getIntersections = function(object){
		var intersections = [],
				relativeVector,
				distance,
				angle;

		if(object instanceof IntelligentCircle){
			relativeVector = this.position.clone().sub(object.position);
			distance = relativeVector.length();

			var biggerRadius = Math.max(this.radius, object.radius),
					smallerRadius = Math.min(this.radius, object.radius);

			if(distance >  this.radius + object.radius ) return; //further than both radii
			if(distance < biggerRadius - smallerRadius ) return; //big circle fully encloses smaller one
			if(distance == this.radius + object.radius ) {
				return [this.position.clone().add( relativeVector.multiplyScalar(biggerRadius / smallerRadius) )];
			}

			var centerCenterAngle = Math.atan2(relativeVector.y, relativeVector.x),
					cornerAngle = Math.acos(
						(Math.pow(this.radius,2) + Math.pow(distance, 2) - Math.pow(object.radius, 2) ) / (2 * this.radius * distance)
					);
				
			intersections.push(
				this.position.clone().sub( new THREE.Vector2(
					Math.cos(centerCenterAngle - cornerAngle) * this.radius,
					Math.sin(centerCenterAngle - cornerAngle) * this.radius
				) ),
				this.position.clone().sub( new THREE.Vector2(
					Math.cos(centerCenterAngle + cornerAngle) * this.radius,
					Math.sin(centerCenterAngle + cornerAngle) * this.radius
       ) )
			);

			_.each(intersections, function(point){
				point.angle = Math.atan2(point.y - this.position.y, point.x - this.position.x);
			}.bind(this));

			return intersections;
		}
	};
}).call(IntelligentCircle.prototype);
