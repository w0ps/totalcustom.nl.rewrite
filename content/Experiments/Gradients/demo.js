function GradientDemo( options ) {
  var mixercontainer = document.getElementById( 'gradientmixercontainer' ),
      gradientContainer = document.getElementById( 'true-gradientcontainer' ),
      patchedGradientsContainer = document.getElementById( 'patchedgradientscontainer' ),
      colorContainer = document.getElementById( 'current-colors' ),
      frequency = 1000,
      freqSlider = new LogSlider( {
        maxpos: 100,
        minval: 100,
        maxval: 30000,
        initVal: 1000,
        slider: document.getElementById( 'freq' ),
        input: document.getElementById( 'freq-numerical' ),
        onChange: function( value ) {
          frequency = value;
        }
      } ),
      stops = 10,
      bucketMultiplier = 5,
      colorsAmt = 10,
      maxPoolSize = 7,
      reverseSort = 1,
      colorsToChooseFrom = [ getNiceColorRGB() ],
      overlay, $overlay,
      hidden = document.hidden || document.visibilityState !== 'visible';

  updateColorsToChooseFrom();

  var workBuffer = [],
      buffers = [ createRandomColorBuffer( stops - 2, colorsToChooseFrom ) ],
      t = 0,
      frequency = 1000,
      lastT = Date.now(),
      offset = 0,
      offsetShiftFrequency = 10000,
      stopGradientsDemo;

  updateColorsToChooseFrom();
  
  buffers.push( createRandomColorBuffer( stops - 2, colorsToChooseFrom) );

  installHandlers();

  setTimeout( step );
  
  // return;

  function updateColorsToChooseFrom() {
    colorsToChooseFrom = colorsToChooseFrom.slice( Math.ceil( Math.random() * Math.random() * ( colorsToChooseFrom.length - 2 ) ) + 1 );
    
    var poolSize = Math.ceil( Math.random() * maxPoolSize ),
        color,
        colorPool;

    while( colorsToChooseFrom.length < colorsAmt ) {
      colorPool = [];
      while( colorPool.length < poolSize ) {
        color = getNiceColorRGB();

        colorPool.push( {
          color: color,
          diff: !colorsToChooseFrom.length ? 0 : colorsToChooseFrom.reduce( function addDifference( memo, oldColor ) {
            return Math.min( memo, oldColor.reduce( function getDifference( total, channel, index ) {
              return total + Math.abs( channel - color[ index ] );
            }, 0 ) );
          }, Infinity )
        } );
      }
      
      colorPool.sort( function( a, b ) {
        return a.diff - b.diff * reverseSort;
      } );

      colorsToChooseFrom.push( colorPool[ 0 ].color );
    }

    colorContainer.textContent = '';
    colorsToChooseFrom.forEach( function( color ) {
      var swatch = document.createElement( 'div' );
      swatch.setAttribute( 'style', 'float: left; width: ' + (100 / colorsAmt + '%') + '; height: 100%; background-color: ' + colorToString( color ) );
      colorContainer.appendChild( swatch );
    } );
  }

  function step() {
    if( stopGradientsDemo ) {
      return;
    }

    var nt = Date.now(),
        dt = nt - lastT;
    
    lastT = nt;

    t += dt / frequency;
    offset += dt / offsetShiftFrequency;

    if( t > Math.PI ) {
      updateColorsToChooseFrom();
      while( t > Math.PI ) t -= Math.PI;
      buffers.shift();
      buffers.push( createRandomColorBuffer( stops - 2, colorsToChooseFrom ) );
    }

    patchedGradientsContainer.textContent = '';
    fillContainerWithBuffer( combineBuffers( buffers[ 0 ], buffers[ 1 ], ( Math.cos( t ) / -2 + 0.5 ), workBuffer ), t );

    window.requestAnimationFrame( arguments.callee );
  }

  function createRandomColorBuffer( n ) {
    return randomColorBufferA( { n: n, colors: colorsToChooseFrom, forceStartStop: true, forceEndStop: true, loopAround: false } );
  }

  function fillContainerWithBuffer( buffer, t ) {
    var colorStopsAmt = buffer.length,
        buckets = bucketMultiplier * buffer.length + 1;

    // too bad they're not compatible. todo
    var gradient = buffer.map( function( point ) {
      var color = point.color;
      return {
        t: point.t,
        r: color[ 0 ],
        g: color[ 1 ],
        b: color[ 2 ]
      }
    } );

    var patchedGradients = [],
        scalars = [ 'r', 'g', 'b' ],
        threshold = 0;

    if( 0 && overlay ) while( --buckets >= 1 ) {
      patchedGradients.push( rotatePatchedGradient( getBuckets( gradient, scalars, threshold, buckets ), offset ) );
    } else while( --buckets >= 1 ) {
      patchedGradients.push( getBuckets( gradient, scalars, threshold, buckets ) );
    }

    var height = 100 / ( patchedGradients.length ) + '%';

    gradientContainer.style.background = 'linear-gradient(to right, ' + colorBufferToString( buffer );

    ( !overlay ? patchedGradients : patchedGradients.reverse() ).forEach( function insertPatchedGradient( patchedGradient ) {
      var patchedGradientElement = document.createElement( 'div' );
      patchedGradientElement.className = 'patchedGradient';
      patchedGradientElement.style.height = height;
      patchedGradientElement.dataset.bucketcount = (10 / patchedGradient.length).toFixed(3);
      patchedGradientsContainer.appendChild( patchedGradientElement );

      patchedGradient.forEach( function insertPatch( patch ) {
        var patchElement = document.createElement( 'div' ),
            color = patch.values;
        patchElement.setAttribute( 'style', [
          'left: ' + ( patch.start * 100 + '%' ),
          'right: ' + ( 100 - patch.end * 100 + '%' ),
          'background-color: ' + colorToString( [ color.r, color.g, color.b ] )
        ].join('; ') );
        patchedGradientElement.appendChild( patchElement );
      } );
    } );
  }

  function installHandlers() {
    $( document.body ).one( 'pageTransitionBegin', destroyDemo );
    patchedGradientsContainer.addEventListener( 'click', toggleZoom );
  }


  function pauseGradientDemo() {
    stopGradientsDemo = true;
    console.log('paused', Date.now());
  }

  function resumeGradientDemo() {
    console.log('resumed', Date.now());
    stopGradientsDemo = false;
    step();
  }

  function toggleZoom() {
    if( !overlay ) {
      $overlay = $(document.body).overlay().on( 'remove', function restorePatchedGradientContainer() {
        mixercontainer.insertBefore(patchedGradientsContainer, document.getElementById( 'controls' ) );
        overlay = null;
      } );
      overlay = $overlay[ 0 ];

      overlay.appendChild(patchedGradientsContainer);
    
    } else $overlay.trigger( 'remove' );
  }

  function destroyDemo() {
    pauseGradientDemo();
    delete window.gradientsDemo;
    destroyDemo = function(){};
    pauseGradientDemo = function(){};
  }
}

$( document.body ).on( 'pageTransitionEnd', function(e){
  if( location.pathname === '/Experiments/Gradients') window.gradientsDemo = new GradientDemo();
} );

// it doesn't rotate back, if you want to rotate it back pass it 1 - t
function rotatePatchedGradient( swatches, t ) {
  var newSwatch;

  swatches.forEach( function rotateSwatch( swatch ) {
    swatch.start += t;
    swatch.end += t;
    
    while( swatch.start > 1 ) {
      --swatch.start;
      --swatch.end;
      --swatch.t;
    }

    if( swatch.end > 1 ) {
      newSwatch = {
        t: swatch.t,
        start: 0,
        end: swatch.end - 1,
        values: swatch.values
      };

      swatch.end = 1;
    }
  } );

  if( newSwatch ) {
    swatches.push( newSwatch );
  } else {
    debugger;
  }

  return swatches;
}

