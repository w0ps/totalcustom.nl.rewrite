var points = {
    topRearLeft:   [  1, -1, -1 ],
    topRearRight:  [  1, -1,  1 ],
    topFrontLeft:  [  1,  1, -1 ],
    topFrontRight: [  1,  1,  1 ],
    botRearLeft:   [ -1, -1, -1 ],
    botRearRight:  [ -1, -1,  1 ],
    botFrontLeft:  [ -1,  1, -1 ],
    botFrontRight: [ -1,  1,  1 ]
}

var edges = {
    topRear: { a: points.topRearLeft, b: points.topRearRight },
    topFront: { a: points.topFrontLeft, b: points.topFrontRight },
    topLeft: { a: points.topRearLeft, b: points.topFrontLeft },
    topRight: { a: points.topRearRight, b: points.topFrontRight },
    botRear: { a: points.botRearLeft, b: points.botRearRight },
    botFront: { a: points.botFrontLeft, b: points.botFrontRight },
    botLeft: { a: points.botRearLeft, b: points.botFrontLeft },
    botRight: { a: points.botRearRight, b: points.botFrontRight },
    leftRear: { a: points.topRearLeft, b: points.botRearLeft },
    leftFront: { a: points.topFrontLeft, b: points.botFrontLeft },
    rightRear: { a: points.topRearRight, b: points.botRearRight },
    rightFront: { a: points.topFrontRight, b: points.botFrontRight }
}

function getPointOnEdge(edge, t){
    if(t <= 0) return edge.a.slice();
    if(t >= 1) return edge.b.slice();
    
    var tInv = 1 - t;
    
    return [
        (edge.a[0] * t) + (edge.b[0] * tInv),
        (edge.a[1] * t) + (edge.b[1] * tInv),
        (edge.a[2] * t) + (edge.b[2] * tInv),
    ];
}

var offsetX = 200,
    offsetY = 200,
    offsetZ = -50;
    

scale = 20;
    
var its = 6;

var arcs = {};

Object.keys(edges).forEach(function(key){
    var i = 0;
    while(i < its){
        arcs[drawArcForPoint( getPointOnEdge(edges[key], i / its) )] = true;
        i++;
    }
});

function drawArcForPoint(point){
    var radius = point[2] * scale + offsetZ;
    var x = point[0] * scale + offsetX;
    var y = point[1] * scale + offsetY;
    
    var startX = x - radius;
    var endX = x + radius;
    return 'M' + startX + ',' + y + ' A 10,10 0 1,0 ' + endX + ',' + y;
}

var str = '<path d="' + Object.keys(arcs).join(' ') + '" stroke="white" fill="transparent" stroke-width="1"></path>';

$('svg')[0].innerHTML = str;