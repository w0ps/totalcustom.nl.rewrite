// todo: max buckets 2 doesn't work
// also, improve performance by replacing transitions during reduction instead of calculating all of them from scratch
function getBuckets( gradient, scalars, diffThreshold, max ) {
  var maxBuckets = Math.max( 1, max ),
      workingGradient = gradient.slice().sort( function comparePoints( a, b ) {
        return a.pos - b.pos;
      } ),
  // first create a set of functions to give differences between points
      scalarDifferentiators = scalars.map( function getScalarDifferentiator( scalar ) {
        var name = scalar.name || scalar,
            weight = scalar.weight || 1;

        return function differentiator( point1, point2 ) {     
          return weight * Math.abs( point1[ name ] - point2[ name ] );
        }
      } ),
      transitions, pointsByDiff, point1, point2, relativeD1;
  do {
    // now establish all transitions between differing points
    transitions = workingGradient.reduce( function observeChangedScalars( memo, point2, index, points ) {
      
      // a transition is the interaction between two control points, so ignore the first point
      if( index ) {
        var point1 = points[ index - 1 ],
            difference = scalarDifferentiators.reduce( function getScalarDelta( total, scalarDifferentiator ) {
          
              return total + scalarDifferentiator( point1, point2 );  
            }, 0 );

        if( difference ) {
          memo.transitions.push( {
            start: memo.startPoint,
            end: point2,
            length: point2.pos - memo.startPoint.pos,
            diff: difference,
            biasedLength: ( point2.pos - memo.startPoint.pos ) * difference,
            steps: 1,
            index: index
          } );

          memo.startPoint = point2;
        }
      }

      return memo;
    }, { transitions: [], startPoint: workingGradient[ 0 ] } ).transitions;

    // we need to cull the transitions in order of least difference
    pointsByDiff = ( workingGradient.length >= 3 ? workingGradient : [] ).slice( 1, workingGradient.length - 1 ).map( function createPointDiff( point, index, points ) {
      var transition1 = transitions[ index ],
          transition2 = transitions[ index + 1 ];

      return {
        diff: transition1.diff + transition2.diff,
        point: point
      };
    } ).sort( function comparepointsByDiff( a, b ) {
      return b.diff - a.diff;
    } );

    if (
      workingGradient.length > maxBuckets
      || ( pointsByDiff.length && pointsByDiff[ pointsByDiff.length - 1 ].diff < diffThreshold )
    ) {
      if( !pointsByDiff.length ) {
        point1 = workingGradient[ 0 ];
        point2 = workingGradient[ 1 ];
        relativeD1 = ( point1.pos || !point2.pos ) ? point1.pos / ( point1.pos + ( 1 - point2.pos ) ) : 0.5;
        
        if( maxBuckets === 2 ) {
          return [{
            start: 0,
            end: relativeD1,
            t: point1.pos,
            values: scalars.reduce( function getValues( memo, scalar ) {
              return memo[ scalar.name || scalar ] = point1[ scalar.name || scalar ], memo;
            }, {} )
          }, {
            start: relativeD1,
            end: 1,
            t: point2.pos,
            values: scalars.reduce( function getValues( memo, scalar ) {
              return memo[ scalar.name || scalar ] = point2[ scalar.name || scalar ], memo;
            }, {} )
          }];
        } else {
          return [ {
            start: 0,
            end: 1,
            t: ( workingGradient[ 0 ].pos + workingGradient[ 1 ] ) / 2,
            values: scalars.reduce( function getValues( memo, scalar ) {
              return memo[ scalar.name || scalar ] = ipl(
                point1[ scalar.name || scalar ],
                point2[ scalar.name || scalar ],
                relativeD1
              ), memo;
            }, {} )
          } ];
        }
      }
      workingGradient.splice( workingGradient.indexOf( pointsByDiff.pop().point ), 1 );
    }

  } while ( workingGradient.length > maxBuckets );

  // adding detail to the transitions is done in order of diff * length
  var bucketCount = workingGradient.length,
      transition,
      transitionsByDiff;

  while( bucketCount < maxBuckets ) {
    transitionsByDiff = transitions.slice().sort( function( a, b ) {
      return b.biasedLength - a.biasedLength;
    } );

    ( transition = transitionsByDiff[ 0 ] ).biasedLength = transition.length * transition.diff / ++transition.steps;
    ++bucketCount;
  }

  // now create the buckets
  var lastPosition = 0,
      transitionsAmt = transitions.length,
      buckets = transitions.reduce( function createBuckets( buckets, transition, index, list ) {
        var step = 0,
            steps = transition.steps,
            point1 = transition.start,
            point2 = transition.end,
            start = point1.pos,
            end = point2.pos,
            stepSize = transition.length / steps,
            bucket, edge, t;

        while( step < steps ) {
          t = ipl( start, end, step / steps );
          edge = start + stepSize * step + stepSize / 2;
          bucket = {
            start: lastPosition,
            end: edge,
            t: t,
            values: getValues( t )
          };

          buckets.push( bucket );

          lastPosition = edge;

          ++step;
        }

        if ( index + 1 === transitionsAmt ) {
          buckets.push( {
            start: lastPosition,
            end: 1,
            t: 1,
            values: getValues( 1 )
          } );
        }

        return buckets;

        function getValues( t ) {
          return scalars.reduce( function( memo, scalar ) {
            return memo[ scalar.name || scalar ] = ipl( point1[ scalar.name || scalar ], point2[ scalar.name || scalar ], step / steps ), memo;
          }, {} );
        }
      }, [] );

  return buckets;
}