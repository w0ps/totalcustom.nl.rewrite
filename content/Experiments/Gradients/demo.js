function GradientDemo( options ) {
  var mixercontainer = document.getElementById( 'gradientmixercontainer' ),
      gradientContainer = document.getElementById( 'true-gradientcontainer' ),
      patchedGradientsContainer = document.getElementById( 'patchedgradientscontainer' ),
      colorContainer = document.getElementById( 'current-colors' ),
      sideScrolling = false,
      swapped = false,
      dither = false,
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
      stops = 7,
      bucketMultiplier =  7,
      colorsAmt = 10,
      ditherTotal = 30,
      maxPoolSize = 7,
      nextColorPool = [],
      colorsToChooseFrom = [],
      overlay, $overlay,
      hidden = document.hidden || document.visibilityState !== 'visible';

  getNewColors( nextColorPool );

  var workBuffer = [],
      buffers = [ createRandomColorBuffer( stops - 2, nextColorPool ) ],
      t = 0,
      frequency = 1000,
      lastT = Date.now(),
      offset = 0,
      offsetShiftFrequency = 10000,
      stopGradientsDemo;

  getNewColors( nextColorPool );
  
  buffers.push( createRandomColorBuffer( stops - 2, nextColorPool) );

  installHandlers();

  setTimeout( step );
  
  // return;

  function getNewColors(colors) {
    colors.splice( 0, colors.length - Math.ceil( Math.random() * colors.length - 1 ) );
    
    var poolSize = Math.ceil( Math.random() * maxPoolSize );

    while( colors.length < colorsAmt ) {
      colors.push( newPoolColor( colors, poolSize, 0.8 ) );
    }

    colorContainer.textContent = '';
    colorsToChooseFrom.forEach( function( color ) {
      var swatch = document.createElement( 'div' );
      swatch.setAttribute( 'style', 'float: left; width: ' + (100 / colorsAmt + '%') + '; height: 100%; background-color: ' + colorToString( color ) );
      colorContainer.appendChild( swatch );
    } );
  }

  function newPoolColor( colors, poolSize, invertChance ) {
    var colorPool = [],
        color;

    while( colorPool.length < poolSize ) {
      color = getNiceColorRGB();

      colorPool.push( {
        color: color,
        diff: !colors.length ? 0 : colors.reduce( function addDifference( memo, oldColor ) {
          return Math.min( memo, oldColor.reduce( function getDifference( total, channel, index ) {
            return total + Math.abs( channel - color[ index ] );
          }, 0 ) );
        }, Infinity )
      } );
    }
    
    colorPool.sort( function( a, b ) {
      return a.diff - b.diff;
    } );

    return Math.random() < invertChance ? colorPool[ 0 ].color : colorPool[ colorPool.length - 1 ].color;
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
      while( t > Math.PI ) t -= Math.PI;
      buffers.shift();
      buffers.push( createRandomColorBuffer( stops - 2, nextColorPool ) );
      getNewColors( nextColorPool );
    }

    patchedGradientsContainer.textContent = '';
    fillContainerWithBuffer( combineBuffers( buffers[ 0 ], buffers[ 1 ], ( Math.cos( t ) / -2 + 0.5 ), workBuffer ), t );

    window.requestAnimationFrame( arguments.callee );
  }

  function createRandomColorBuffer( n ) {
    return randomColorBufferA( { n: n, colors: nextColorPool, forceStartStop: true, forceEndStop: true, loopAround: false } );
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
        threshold = 0,
        normalBuckets, ditheredBuckets;
    if( !dither ) {
      if( sideScrolling && overlay ) while( --buckets >= 1 ) {
        patchedGradients.push( rotatePatchedGradient( getBuckets( gradient, scalars, threshold, buckets ), offset ) );
      } else while( --buckets >= 1 ) {
        patchedGradients.push( getBuckets( gradient, scalars, threshold, buckets ) );
      }
    } else while(--buckets >= 1 ) {
      normalBuckets = getBuckets( gradient, scalars, threshold, stops );
      ditheredBuckets = normalBuckets.reduce( function( memo, bucket, index ) {
        if( index ) [].push.apply( memo.newBuckets, ditheredGradient( memo.prev.values, bucket.values, Math.ceil( buckets * ( bucket.t - memo.prev.t ) ), memo.prev.t, bucket.t ) );

        memo.prev = bucket;

        return memo;
      }, { prev: null, newBuckets: [] } ).newBuckets;

      patchedGradients.push( ditheredBuckets );
    }

    var height = ( overlay ? 50 : 100 ) / ( patchedGradients.length ) + '%';

    gradientContainer.style.background = 'linear-gradient(to right, ' + colorBufferToString( buffer );

    if( overlay && !swapped ) {
      patchedGradients.slice().reverse().forEach( insertPatchedGradient );
    }
    patchedGradients.forEach( insertPatchedGradient );
    if( overlay && swapped ) {
      patchedGradients.slice().reverse().forEach( insertPatchedGradient );
    }

    function insertPatchedGradient( patchedGradient ) {
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
    }
  }

  function installHandlers() {
    $( document.body ).one( 'pageTransitionBegin', destroyDemo );
    document.querySelector( 'input#dither' ).addEventListener( 'click', toggleDither );
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

  function toggleDither() {
    dither = !dither;
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

function ditheredGradient( state1, state2, n, domainStart, domainEnd ){
  var swatches = [],
      pairWidth = ( ( domainEnd || 1 ) - ( domainStart || 0 ) ) / n,
      swatchUnit = pairWidth / ( n + 1 ),
      i = 0,
      pairStart,
      boundary;

  domainStart = domainStart || 0;

  while( i < n ) {
    pairStart = domainStart + pairWidth * i;
    boundary = pairStart + pairWidth - swatchUnit * ( i + 1 );
    
    swatches.push( {
      start: pairStart,
      end: boundary,
      values: state1
    }, {
      start: boundary,
      end: pairStart + pairWidth,
      values: state2
    } );

    ++i;
  }

  return swatches;
}

