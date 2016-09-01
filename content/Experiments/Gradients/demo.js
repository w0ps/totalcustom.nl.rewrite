// var gradient = [
//       {
//         pos: 0.15,
//         scalar1: 20,
//         scalar2: 3
//       }, {
//         pos: 0.25,
//         scalar1: 50,
//         scalar2: -7
//       }, {
//         pos: 0.26,
//         scalar1: -10,
//         scalar2: 60
//       }, {
//         pos: 0.7,
//         scalar1: -10,
//         scalar2: 60
//       }, {
//         pos: 0.71,
//         scalar1: 100,
//         scalar2: -200
//       }, {
//         pos: 0.8,
//         scalar1: 103,
//         scalar2: -100
//       }
//     ];

// console.log( 0 && getBuckets( gradient, [ 'scalar1', 'scalar2' ], 0, 3 ) );
// console.log( getBuckets( gradient, [ {
//   name: 'scalar1',
//   weight: 2
// }, {
//   name: 'scalar2'
// } ], 2, 20 ) );

var gradientContainer = document.createElement( 'div' );
gradientContainer.setAttribute( 'style', 'width: 100%; height: 500px; border: 1px solid white; position: relative' );

var niceColorsAmt = 6,
    niceColors = [],
    colorStopsAmt = 8,
    maxMultiplier = 10,
    maxDivisor = 10;

while( niceColors.length < niceColorsAmt ) niceColors.push( getNiceColorRGB() );

var colorBuffer = randomColorBufferA( { n: colorStopsAmt, colors: niceColors } );
// colorBuffer.pop();
// colorBuffer.shift();

// too bad they're not compatible. todo
var gradient = colorBuffer.map( function( point ) {
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
while( --currentReducing ) {
  patchedGradients.push( getBuckets( gradient, scalars, 0, currentReducing ) );
}

var trueGradientElement = document.createElement( 'div' ),
    height = 100 / ( patchedGradients.length + 1 ) + '%';
trueGradientElement.setAttribute( 'style', 'height: ' + height + '; background: linear-gradient(to right, ' + colorBufferToString( colorBuffer ) );
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

document.getElementById('Gradients').appendChild(gradientContainer);
