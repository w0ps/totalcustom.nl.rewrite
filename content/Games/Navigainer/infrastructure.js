
//var CC = {};

(function defineInfrastructure(){
  var CC = this;
  
  /* generic infrastructure superclass */
  this.driveableInfrastructure = Class.extend({
    init: function(options){
      options = options || {};
      if(!options.position) this.position = new THREE.Vector3();
      if(options.scene) this.scene = options.scene;
      if(options.map) this.map = options.map;
      if(options.game) this.game = options.game;

      this.model = new THREE.Object3D();
      this.model.position = this.position;
      this.position = this.model.position;
    },
    type: 'abstract',
    construct: function(){
      console.log('This class has no geometryGenerator yet');
    },
    showHandles: function(){
      console.log('This class has no handles yet');
    }
  });
  
  /* road superclass */
  this.Conduit = this.driveableInfrastructure.extend({
    init: function initConduit(a,b){
      this.sides = {left: [{lanes: [], borders: []}], right: [{lanes: [], borders: []}] };
      this.a = a;
      this.b = b;

      var vertexes = [a.position, a.tangent, b.tangent, b.position];
    },
    update: function updateConduit(){
      this.destruct();
      this.construct();
    },
    construct: function constructConduit(){
      var splitterPosA = this.a.position.clone().add(this.a.splitter.position),
          splitterPosB = this.b.position.clone().add(this.b.splitter.position);

      this.path = new THREE.CubicBezierCurve3(
        splitterPosA,
        this.a.tangent.clone().applyEuler(this.a.rotation).add(splitterPosA),
        this.b.tangent.clone().applyEuler(this.b.rotation).add(splitterPosB),
        splitterPosB
      );
      this.length = this.path.getLength();
      
      this.segments = Math.round(this.length / 2);
      this.radius = 5;
      //todo generate rest of conduit model in own construct functions
      //DIRTY HACK abuse deprecated Street for constructor
      this.model = new THREE.Mesh(new RoadGeometry(this.radius, Street.prototype.getSpacedOrientedData.call(this, this.segments), /* debug: */ false), roadMaterial);
    },
    type: 'Conduit'
  });

  Object.defineProperty(this.Conduit.prototype, 'width', { get: function getterConduitWidth(){
    console.log('getter', this, this.radius);
    return this.radius; //todo: retrieve radius from last sections
  } });

  this.Road = this.Conduit.extend({
    init: function(a,b){
      CC.Conduit.prototype.init.call(this, a, b);
    },
    type: 'Road'
  });
  this.Road.prototype = _.extend(_.extend({}, this.Conduit.prototype), this.Road.prototype);
  
  /* intersection superclass */
  this.Splitter = this.driveableInfrastructure.extend({
    init: function(options){
      CC.driveableInfrastructure.prototype.init.call(this, options);
      
      this.connections = [];
      this.borders = [];
      this.handles = {};
    },
    radius: 10,
    defaultConduitType: 'Road',
    sortConnections: function(){
      this.connections.sort(function(a, b){
        return a.angle - b.angle;
      });
    },
    updatePosition: function(point){
      this.position.copy(point);

      _.each(this.connections, function(connection){ connection.updatePosition(); });
    },
    getAngleFromWorldPoint: function splitterGetAngleFromWorldPoint(point){
      var relativeVector = point.clone().sub(this.position);
      return -Math.atan2(relativeVector.z, relativeVector.x);
    },
    replace: function replaceSplitter(splitter){
      if(splitter instanceof CC.Splitter){
        var connections = this.connections,
            borders = this.borders,
            position = this.position;
      }
    },
    createHandles: function createSplitterHandles(){
      this.handles.xzDragHandle = new CC.XZDragHandle(this);
      this.handles.yDragHandle = new CC.YDragHandle(this);
      this.handles.splitterConnectHandle = new CC.SplitterConnectHandle(this,0, 2 * Math.PI);
    },
    showHandles: function showSplitterHandles(){
      var splitter = this;
      if(!this.handles.length) this.createHandles();
      
      _.each(this.handles, function showSplitterHandle(handle){
        splitter.model.add(handle.model);
        splitter.map.pickables.push(handle.model);
      });
    },
    hideHandles: function hideSplitterHandles(){
      var splitter = this;
      _.each(this.handles, function hideSplitterHandle(handle){
        splitter.model.remove(handle.model);
        splitter.map.pickables.splice(splitter.map.pickables.indexOf(handle.model), 1);
      });
    },
    showPreviewConnection: function showSplitterPreviewConnection(point){
      this.hidePreviewConnection();
      var previewConnection = testSphere.clone();
      this.previewConnection = previewConnection;
      
      var angle = this.getAngleFromWorldPoint(point)//Math.atan2(point.z, point.x);
      console.log('preview angle: ', angle);
      
      //console.log(dist, xDiff, zDiff, angle / Math.PI);
      
      var position = new THREE.Vector3(Math.cos(-angle) * this.radius, 0, Math.sin(-angle) * this.radius);
      
      previewConnection.position.copy(position);
      
      this.model.add(previewConnection);
    },
    hidePreviewConnection: function(){
      if (this.previewConnection) {
        this.model.remove(this.previewConnection);
      }
    }
  });
  
  this.Connector = this.driveableInfrastructure.extend({
    init: function(splitter, conduit, angle, tangent, options){
      CC.driveableInfrastructure.prototype.init.call(this, options);

      this.splitter = splitter;
      this.conduit = conduit;
      this.angle = angle;
      this.tangent = tangent || new THREE.Vector3(0, 0, this.splitter.tangentSize || this.splitter.radius * 2) || getVectorFromAngle(0, this.splitter.tangentSize);
      this.position.copy( new THREE.Vector3(1,0,0).multiplyScalar(this.splitter.radius).applyEuler(new THREE.Euler(0, this.angle)) );
      console.log(this);
      this.model.rotation.y = this.game.utils.boundRadian( this.angle + Math.PI / 2 );

      this.rotation = this.model.rotation;
      this.updatePosition();
      this.sides = {left: {}, right: {}};
      this.edges = {left: {}, right: {}};
      
      this.handles = {};

      this.splitter.model.add(this.model);
    },
    createHandles: function createConnectorHandles(){
      this.handles.baseHandle = new CC.ConnectorBaseHandle(this);
      this.handles.slideHandle = new CC.ConnectorSlideHandle(this);
      this.handles.tangentHandle = new CC.ConnectorTangentHandle(this);
    },
    showHandles: function showConnectorHandles(){
      var connector = this;
      if(!this.handles.length) this.createHandles();
      
      _.each(this.handles, function showConnectorHandle(handle){
        connector.model.add(handle.model);
        connector.splitter.map.pickables.push(handle.model);
      });
    },
    hideHandles: function hideConnectorHandles(){
      var connector = this,
          splitter = this.splitter;
      _.each(this.handles, function hideConnectorHandle(handle){
        connector.model.remove(handle.model);
        splitter.map.pickables.splice(splitter.map.pickables.indexOf(handle.model), 1);
      });
    },
    updatePosition: function updateConnectorPosition(){
      var conduit = this.conduit,
          scene;

      this.position.copy( new THREE.Vector3(1,0,0).multiplyScalar(this.splitter.radius).applyEuler(new THREE.Euler(0, this.angle)) );
      if(this.conduit){
        scene = this.splitter.map.scene;

        if(conduit.model) scene.remove(conduit.model);
        conduit.construct();
        scene.add(conduit.model);
      }
    },
    construct: function constructConnector(){
      var intersectionPoints = this.splitter.getIntersectPointsWithConnector ?
        this.splitter.getIntersectPointsWithConnector(this) :
        this.getIntersectPointsWithSplitter();
      

    },
    getIntersectPointsWithSplitter: function getIntersectPointsWithSplitter(){
      var centerVector, leftVector, rightVector;

      var previewSphere = testSphere.clone();
      previewSphere.position.copy(centerVector);
      
      var position = new THREE.Vector3(Math.cos(this.angle), 0, Math.sin(this.angle)).multiplyScalar(this.splitter.radius);

      var previewSphere2 = testSphere.clone();
      previewSphere2.position.copy(position);

      console.log(centerVector, position);
      
      this.splitter.model.add(previewSphere);
      this.splitter.model.add(previewSphere2);

      //return centerVector;
    },
    type: 'Connector'
  });

  Object.defineProperty(this.Connector.prototype, 'width', { get: function getConnectorWidth(){
    return this.conduit.width; //todo specify which end!
  } });
  
  this.Lane = this.driveableInfrastructure.extend({
    init: function(start, end, options){
      this.sections = [];
      this.start = start;
      this.end = end;
      
      if(options.sections){
        //add
      }
      else{
        this.sections.push(new CC.Section());
      }
    }
  });
  
  this.Section = this.Lane.extend({
    init: function(lane, start, end, options){
      this.lane = lane;
      Lane.prototype.init.call();
    }
  });
  
  this.RoadEnd = this.Splitter.extend({
    init: function(options){
      CC.Splitter.prototype.init.call(this, options || {});
    }
  });
  
  this.Crossroad = this.Splitter.extend({
    init: function(options){
      CC.Splitter.prototype.init.call(this, options || {});
    },
    type: 'Crossroad'
  });

  this.dragConduitFromSplitter = function dragConduitFromSplitter(handle, point){
    var basicOptions = { game: this.game, map: this.map, scene: this.scene },
        firstAngle = this.getAngleFromWorldPoint(point),
        newSplitter = new CC.Crossroad(basicOptions),
        oppositeAngle = this.game.utils.boundRadian( firstAngle + Math.PI ),
        newConnectorA = new CC.Connector(this, undefined, firstAngle, undefined, basicOptions),
        newConnectorB = new CC.Connector(newSplitter, undefined, oppositeAngle, undefined, basicOptions),
        tangentA = newConnectorA.tangent,
        tangentB = newConnectorB.tangent,
        newConduit = new CC[this.defaultConduitType](newConnectorA, newConnectorB, basicOptions),
        otherSplitter,
        map = this.map,
        refPlane = new RefPlane({position: this.position.clone()}),
        hitList = [refPlane],
        pickables = map.pickables;
        //_street = new Street();

    newConnectorA.conduit = newConnectorB.conduit = newConduit;

    this.connections.push(newConnectorA);
    newSplitter.connections.push(newConnectorB);
    
    for (var i in map.pickables) {
      if (pickables[i].handle.type == 'SplitterConnectHandle') {
        hitList.push(pickables[i]);
      }
    }
    
    map.scene.add(refPlane);
    
    point.y = this.position.y;
    
    newSplitter.position.copy(point);
    map.add(newSplitter);

    this.handles.splitterConnectHandle.highlightOff();
    
    newSplitter.showHandles();
    newSplitter.handles.xzDragHandle.highlightOn();
    
    return {
      pointerMove: function(e){
        var intersects = this.game.pickPoint(e, hitList);
        if (intersects[0]) {
          var firstIntersect = intersects[0].object,
              point = intersects[0].point;
          
          point.y = this.position.y;
          
          if (firstIntersect.isRefPlane) {
            if (otherSplitter) {
              otherSplitter.handles.splitterConnectHandle.highlightOff();
              newSplitter = new CC.Crossroad(basicOptions);
              newConnectorB.splitter = newSplitter;
              newSplitter.connections.push(newConnectorB);
              map.add(newSplitter);
              newSplitter.showHandles();
              newSplitter.handles.xzDragHandle.highlightOn();
              
              otherSplitter = null;
            }
            newSplitter.updatePosition(point);
          }
          else if (firstIntersect.handle && firstIntersect.handle.type == 'SplitterConnectHandle') {
            if (!otherSplitter) {
              otherSplitter = firstIntersect.handle.owner;
              newSplitter.map.remove(newSplitter);
              newSplitter = null;

              newConnectorB.splitter = otherSplitter;
              otherSplitter.connections.push(newConnectorB);
            }
            firstIntersect.handle.highlightOn({point: point});
          }
          newConnectorB.updatePosition();
          if(newConduit.model) map.scene.remove(newConduit.model);
          newConduit.construct();
          map.scene.add(newConduit.model);
          
        }
      },
      pointerUp: function(e){
        var splitter = newSplitter || otherSplitter;
        splitter.handles.xzDragHandle.highlightOff();
        splitter.handles.splitterConnectHandle.highlightOff();
        map.scene.remove(refPlane);

        newConnectorA.showHandles();
        newConnectorB.showHandles();
      }
    };
  }
  
;
}).call(CC);
