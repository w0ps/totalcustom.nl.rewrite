function initMiniCircular(){
	var miniCircularCanvas = new SmartCanvas({}, $('#miniCircular')),
			miniCircle = new DataCircle(randomCircleData1(100, 50, 75));
  miniCircularCanvas.add(miniCircle);
}

function initMiniSeed(){
	var miniSeedCanvas = new SmartCanvas({}, $('#miniSeed')),
			seed = new SFF({n:7, radii: 33, color: {r: 1, g: 1, b:1 } });
	miniSeedCanvas.add(seed);
}

initMiniCircular();
initMiniSeed();
