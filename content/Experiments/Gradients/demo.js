var gradientContainer = document.createElement( 'div' );
gradientContainer.setAttribute( 'style', 'width: 100%; height: 500px; border: 1px solid white; position: relative' );

document.getElementById('Gradients').appendChild(gradientContainer);

var stops = 8,
    colors = 5,
    workBuffer = [],
    buffers = [
      createRandomColorBuffer( stops, colors ),
      createRandomColorBuffer( stops, colors )
    ],
    t = 0,
    frequency = 5000, lastT = Date.now();

setTimeout( function() {
  var nt = Date.now(),
      dt = nt - lastT;
  
  lastT = nt;

  t += dt / frequency;

  if( t > Math.PI ) {
    while( t > Math.PI ) t -= Math.PI;
    buffers.shift();
    buffers.push( createRandomColorBuffer( stops, colors ) );
  }

  gradientContainer.textContent = '';
  fillContainerWithBuffer( combineBuffers(buffers[0], buffers[1], (Math.cos(t) / -2 + 0.5), workBuffer) );

  window.requestAnimationFrame( arguments.callee );
} );

function createRandomColorBuffer( n, colorsAmt ) {
  var colors = [];
  
  while( colors.length < colorsAmt ) colors.push( getNiceColorRGB() );  

  var buffer = randomColorBufferA( { n: n, colors: colors } );
  buffer.pop();
  buffer.shift();

  return buffer;
}

function fillContainerWithBuffer( buffer ) {
  var colorStopsAmt = buffer.length,
      maxMultiplier = 20;

  // too bad they're not compatible. todo
  var gradient = buffer.map( function( point ) {
    var color = point.color;
    return {
      pos: point.t,
      r: color[ 0 ],
      g: color[ 1 ],
      b: color[ 2 ]
    }
  } );

  var patchedGradients = [],
      currentMultiplier = maxMultiplier,
      currentReducing = colorStopsAmt,
      scalars = [ 'r', 'g', 'b' ],
      threshold = 0;

  while( currentMultiplier ) {
    patchedGradients.push( getBuckets( gradient, scalars, 0, Math.floor( colorStopsAmt * currentMultiplier-- ) ) );
  }
  while( --currentReducing >= 1 ) {
    patchedGradients.push( getBuckets( gradient, scalars, 0, currentReducing ) );
  }

  var trueGradientElement = document.createElement( 'div' ),
      height = 100 / ( patchedGradients.length + 1 ) + '%';
  trueGradientElement.setAttribute( 'style', 'height: ' + height + '; background: linear-gradient(to right, ' + colorBufferToString( buffer ) );
  gradientContainer.appendChild( trueGradientElement );

  patchedGradients.forEach( function insertPatchedGradient( patchedGradient ) {
    var patchedGradientElement = document.createElement( 'div' );
    patchedGradientElement.setAttribute( 'style', 'width: 100%; height: ' + height + '; position: relative;' );
    gradientContainer.appendChild( patchedGradientElement );

    patchedGradient.forEach( function insertPatch( patch ) {
      var patchElement = document.createElement( 'div' ),
          color = patch.values;
      patchElement.setAttribute( 'style', 'height: 100%; position: absolute; left: ' + ( patch.start * 100 + '%' ) + '; right: ' + ( 100 - patch.end * 100 + '%' ) + '; background-color: ' + colorToString( [ color.r, color.g, color.b ] ) );
      patchedGradientElement.appendChild( patchElement );
    } );
  } );
}
