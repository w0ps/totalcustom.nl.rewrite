var aNavigainer;

$('#start').on('click', function(){
  aNavigainer = new Navigainer();
  aNavigainer.start();

  //throw in some tryout stuff
  var aMap = new Map();

  aNavigainer.map = aMap;
  aMap.game = aNavigainer;
  aNavigainer.scene.add(aMap.scene);

  var aCrossing = new CC.Crossroad({ game: aNavigainer, map: aMap, scene: aNavigainer.scene });

  aCrossing.position.x = Math.random() * 5;
  aCrossing.position.z = Math.random() * 6;
  aCrossing.position.z = Math.random() * 2;

  aMap.add(aCrossing);
  materialsLoad.done(function(){
    aCrossing.showHandles();
  });

  initNavigainerInterface();
});
