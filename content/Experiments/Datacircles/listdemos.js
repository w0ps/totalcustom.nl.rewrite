function initMiniCircular(){
	var $miniCircularContainer = $('#miniCircular').empty(),
		miniCircularCanvas = new SmartCanvas({}, $miniCircularContainer),
			miniCircle = new DataCircle(randomCircleData1(100, 50, 75));
  miniCircularCanvas.add(miniCircle);

  $miniCircularContainer.one('click.recreate', function(){
  	//$('#miniCircular').off('click.recreate');
  	initMiniCircular();
  });
}

initMiniCircular();

