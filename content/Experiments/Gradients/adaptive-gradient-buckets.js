// todo a way to solve hard cuts aka very high difference in value over short distances
function getBuckets( gradient, scalars, diffThreshold, maxBuckets ) {
  
  var bucketCount = 0,
  // first create a set of functions to give differences between points
      scalarDifferentiators = scalars.map( function getScalarDifferentiator( scalar ) {
        var name = scalar.name || scalar,
            weight = scalar.weight || 1;

        return function differentiator( point1, point2 ) {     
          return weight * Math.abs( point1[ name ] - point2[ name ] );
        }
      } ),
  // now establish all transitions between differing points
      transitions = gradient.reduce( function observeChangedScalars( memo, point2, index, points ) {
        
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
            ++bucketCount;
          }
        }

        return memo;
      }, { transitions: [], startPoint: gradient[ 0 ] } ).transitions;

  // we need to cull the transitions in order of least difference
  var transitionsByDiff = transitions.slice( 1, transitions.length - 1 ).sort( function compareTransitionsByDiff( a, b ) {
        return b.diff - a.diff;
      } ),
      cullingEnabled = true;

  while( transitions.length > maxBuckets || cullingEnabled ) {
    if (
      transitions.length > maxBuckets
      || ( cullingEnabled = transitionsByDiff.length && transitionsByDiff[ transitionsByDiff.length - 1 ].diff < diffThreshold )
    ) {
      transitions.splice( transitions.indexOf( transitionsByDiff.pop() ), 1 );
      --bucketCount;
    }
  }

  // adding detail to the transitions is done in order of diff * length
  var transition;
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