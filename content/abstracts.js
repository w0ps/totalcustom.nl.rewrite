// interpolate between scalar a and b with theta [0-1]
function ipl(a, b, t){
  return a * (1 - t) + b * t;
}

function assign(){
  for(var i in arguments){
    var pair = arguments[i];
    for(var p in pair.props) (pair.scope || this)[p] = pair.props[p];
  }
}

var Color = Class.extend({
  init: function(r,g,b,a){
    this.r = r || 0;
    this.g = g || 0;
    this.b = b || 0;
    this.a = a || 1;
  },
  toArray: function(){ return [this.r, this.g, this.b, this.a]; },
  toString: function(){ return 'rgba(' + [this.r, this.g, this.b, this.a].join(',') + ')'; },
  invert: function(){ return new Color(255 - this.r, 255 - this.g, 255 - this.b, 1); },
  clone: function(){ return new Color(this.r, this.g, this.b, this.a); },
  randomize: function(){ return new Color(Math.floor(Math.random() * 256 ),Math.floor(Math.random() * 256 ),Math.floor(Math.random() * 256 )); },
  averageWith: function(colors){
		if(colors instanceof Color) colors = [colors];
		var newColor = this.clone(), length = colors.length + 1,
				i = ['r', 'g', 'b', 'a'],  index, cIndex
		for(cIndex in colors){ for(index in i){ newColor[i[index]] = colors[cIndex][i[index]]; } }
		for(index in i){ newColor[i[index]] = Math.floor( newColor[i[index]] / length ); }
		return newColor;
	}
});


$('body').on('focus', '[contenteditable]', function() {
	var $this = $(this);
  $this.data('before', $this.html());
	return $this;
}).on('blur keyup paste input', '[contenteditable]', function() {
	var $this = $(this);
	if ($this.data('before') !== $this.html()) {
		$this.data('before', $this.html());
		$this.trigger('change');
	}
	return $this;
});

function getObjectFromString(string){
	string = string.split('<br>').join('');

	var object;
	try{
		eval("object = " + string);
	}
	catch(e){
		console.log(e);
		return false;
	}
	return object;
}

function LogSlider(options) {
  options = options || {};
  this.minpos = options.minpos || 0;
  this.maxpos = options.maxpos || 100;
  this.minlval = Math.log(options.minval || 1);
  this.maxlval = Math.log(options.maxval || 100000);
  this.scale = ( this.maxlval - this.minlval ) / ( this.maxpos - this.minpos );
  this.onChange = options.onChange;

  var control = this,
      slider = this.slider = options.slider,
      input = this.input = options.input;

  slider.addEventListener( 'change', function() {
    var val = control.value( +slider.value );
    input.value = val.toFixed(0);
    control.onChange && control.onChange( val );
  } );

  input.addEventListener( 'keyup', function() {
      var val = +input.value,
          pos = control.position( val );

      if( !val || val < 0 ) return;

      slider.value = pos;
      control.onChange && control.onChange( val );
  } );
  
  slider.value = this.position( input.value = options.initVal );
}

LogSlider.prototype = {
  // Calculate value from a slider position
  value: function( position ) {
    return Math.exp( ( position - this.minpos ) * this.scale + this.minlval );
  },
  // Calculate slider position from a value
  position: function( value ) {
    return this.minpos + ( Math.log(value ) - this.minlval ) / this.scale;
  }
};


