(function defineInfrastructure(){
  var CC = this;

  this.Handle = Class.extend({
    
    init: function(owner){
      this.owner = owner;
      this.model = CC.handleModels[this.type].clone();
      if(this.offset) this.model.position = this.offset.clone();
      if(this.rotation) this.model.rotation = this.rotation.clone();
      this.model.handle = this;
    },

    type: 'abstract',
    pickable: true,
    material: defMaterial,
    highlightMaterial: highlightMat,
    highlightOn: function(){
      this.model.material = this.highlightMaterial;
    },
    highlightOff: function(){
      this.model.material = this.material;
    }
  });
  
  this.XZDragHandle = CC.Handle.extend({
    init: function(owner){
      CC.Handle.prototype.init.call(this, owner);
      
      var handle = this,
          splitter = this.owner;
      
      // this.model.mousedown = function(){
      //   this.basicDrag();
      // };
      this.model.drag = function(point){
        var relativeVector = point.sub(splitter.position);
        
        var refPlane = new RefPlane({position: splitter.position.clone()});
        
        splitter.map.scene.add(refPlane);
        
        return {
          pointerMove: function(e){
            var intersects = splitter.map.scene.parent.game.pickPoint(e, [refPlane]);
            if (intersects[0]) {
              var point = intersects[0].point.sub(relativeVector);
              point.y = splitter.position.y;
              splitter.updatePosition(point);
            }
          },
          pointerUp: function(e){
            splitter.map.scene.remove(refPlane);
          }
        };

      };

    },
    type: 'XZDragHandle',
    material: defMaterial//moveIconMaterial --fix uv's or something
  });
  
  this.YDragHandle = CC.Handle.extend({
    init: function(owner){
      CC.Handle.prototype.init.call(this, owner);
      
      var handle = this,
          splitter = this.owner;
      
      //this.model = CC.YDragHandleModel.clone();
      this.model.position.y = 6;
      this.model.drag = function(point){
        var relativeVector = point.sub(splitter.position);
        
        var refPlane = new RefPlane({position: splitter.position.clone()});
        refPlane.rotation.x = 0;
        refPlane.rotation.y = aNavigainer.camera.rotation.y;
        
        splitter.map.scene.add(refPlane);
        
        return {
          pointerMove: function(e){
            var intersects = splitter.map.scene.parent.game.pickPoint(e, [refPlane]);
            if (intersects[0]) {
              var point = intersects[0].point.sub(relativeVector);
              point.x = splitter.position.x;
              point.z = splitter.position.z;
              splitter.updatePosition(point);
            }
          },
          pointerUp: function(e){
            splitter.map.scene.remove(refPlane);
          }
        };

      };

    },
    type: 'YDragHandle',
    offset: new THREE.Vector3(0, 5, 0)
  });
  
  this.SplitterConnectHandle = CC.Handle.extend({
    init: function(owner, start, end){
			this.owner = owner;
      
      this.model = new THREE.Mesh(new RingGeometry({outerRadius: 10.5, innerRadius: 9.5, segmentResolution: 20, startAngle : start, endAngle: end}), this.material);
      if(this.offset) this.model.position = this.offset.clone();
      if(this.rotation) this.model.rotation = this.rotation.clone();
      this.model.rotation.y = start;
      this.model.handle = this;
      
      this.model.drag = function(point){
        return CC.dragConduitFromSplitter.call(this, this.handle, point);
      };

      this.model.mousedown = function(point){

      };
    },
    highlightOn: function(info){
      this.owner.showPreviewConnection(info.point);
    },
    highlightOff: function(){
      this.owner.hidePreviewConnection();
    },
    type: 'SplitterConnectHandle',
    interactiveHover: true,
    rotation: new THREE.Euler(Math.PI/2, 0, 0, "YXZ")
  });

  this.ConnectorBaseHandle = CC.Handle.extend({
    init: function(owner){
      this.owner = owner;

      this.model = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 4), this.material);
      //this.model.rotation.x = Math.PI/2;
      this.model.rotation.z = Math.PI/2;
      this.model.handle = this;

      this.model.drag = function(point){
        var splitter = this.splitter,
            startAngle = splitter.getAngleFromWorldPoint(point);
        
        var refPlane = new RefPlane({position: splitter.position.clone()});
        
        splitter.scene.add(refPlane);
        
        return {
          pointerMove: function(e){
            var intersects = splitter.game.pickPoint(e, [refPlane]);
            if (intersects[0]) {
              var point = intersects[0].point,//.sub(relativeVector),
                  angle = splitter.getAngleFromWorldPoint(point);

              this.rotation.y = this.game.utils.boundRadian(angle + Math.PI / 2);
              this.angle = angle;
              
              this.updatePosition();
            }
          },
          pointerUp: function(e){
            splitter.scene.remove(refPlane);
          }
        };
      };
    }
  });

  this.ConnectorSlideHandle = CC.Handle.extend({
    init: function(owner){
      this.owner = owner;

      this.model = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1), this.material);
      //this.model.rotation.x = Math.PI/2;
      this.model.rotation.x = Math.PI/2;
      this.model.scale.y = this.owner.tangent.length / 2;
      this.model.position.z = this.owner.tangent.length / 2;
      this.model.handle = this;
    }
  });

  this.ConnectorTangentHandle = CC.Handle.extend({
    init: function(owner){
      var tangent = owner.tangent;
      this.owner = owner;

      this.model = new THREE.Mesh(new THREE.CylinderGeometry(0, 1.5, 2), this.material);

      this.model.rotation.x = Math.PI/2;
      this.model.position = tangent;
      this.model.handle = this;

      this.model.drag = function initDragConnectorTangentHandle(point){
        var splitter = this.splitter,
            refPlane = new RefPlane({position: splitter.position.clone()});
        
        splitter.scene.add(refPlane);

        return {
          pointerMove: function dragConnectorTangentHandle(e){
            //steps:
            //  determine relative position to connector location
            //  rotate vector with connector angle
            //  set tangent to vector
            var intersects = splitter.game.pickPoint(e, [refPlane]),
                point, vector;
            if (intersects[0]) {
              point = intersects[0].point;
              vector = point.clone().sub(splitter.position).sub(this.position);

              //console.log(vector);
              vector.applyAxisAngle(this.model.up, this.angle - Math.PI);
              
              console.log('v: ',vector);
              console.log('t: ',this.tangent);
              this.tangent.copy(vector);
              
              this.updatePosition();
            }
          },
          pointerUp: function endDragConnectorTangentHandle(e){
            splitter.scene.remove(refPlane);
          }
        };
      };
    }
  });

}).call(CC);