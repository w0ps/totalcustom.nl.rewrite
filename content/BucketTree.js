function BucketTree( children ) {
  var half = Math.floor( children.length / 2 ),
      lower = children.slice( 0, half ),
      higher = children.slice( half );
  this.threshold = higher[ 0 ].start;
  this.lower = lower.length > 1 ? new BucketTree( lower ) : lower[ 0 ];
  this.higher = higher.length > 1 ? new BucketTree( higher ) : higher[ 0 ];
}

BucketTree.prototype.getLeaf = function( t ) {
  var dir = t < this.threshold ? 'lower' : 'higher',
      node = this[ dir ];
  
  return node.getLeaf ? node.getLeaf( t ) : node;
};

BucketTree.prototype.getLeafs = function( leafs ) {
  if( this.lower.getLeafs ) this.lower.getLeafs( leafs );
  else leafs.push( this.lower );
  if( this.higher.getLeafs ) this.higher.getLeafs( leafs );
  else leafs.push( this.higher );
  return leafs;
};