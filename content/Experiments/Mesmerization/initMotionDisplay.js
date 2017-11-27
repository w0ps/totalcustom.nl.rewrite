function initMiniField(){
	var $miniFieldContainer = $('#minifield').empty(),
			pixelRatio = window.devicePixelRatio || 1,
			width = $miniFieldContainer.innerWidth(),
			height = $miniFieldContainer.innerHeight(),
			dynamicGridOptions = {
				width: width,
				height: height,
				timePassing: true,
				timeStep: 0.01
			};

	var motionDisplay = new MotionDisplay({
		debugField: false,
		gridOptions: dynamicGridOptions,
		width: $miniFieldContainer.innerWidth(),
		height: $miniFieldContainer.innerHeight(),
	});

	$miniFieldContainer.append(motionDisplay.canvas);

	motionDisplay.canvas.style.width = width + 'px';
	motionDisplay.canvas.style.height = height + 'px';
}

initMiniField();


$('#initDemo').on('click', initFullscreen);

function initFullscreen(){
	var $overlay = $('body').overlay().css({
		overflow: 'scroll'
	});

	var pixelRatio = window.devicePixelRatio || 1;

	var width = $overlay.innerWidth(),
			height = $overlay.innerHeight(),
			dynamicGridOptions = {
				width: width,
				height: height,
				timePassing: true,
				timeStep: 0.1
			};

	var motionDisplay = new MotionDisplay({
		debugField: false,
		gridOptions: dynamicGridOptions,
		width: $overlay.innerWidth(),
		height: $overlay.innerHeight(),
	});

	window.md = motionDisplay;

	$overlay.append(motionDisplay.canvas);

	// motionDisplay.canvas.style.width = Math.floor(importedGridOptions.width * scale) + 'px';
	// motionDisplay.canvas.style.height = Math.floor(importedGridOptions.height * scale) + 'px';

	motionDisplay.canvas.style.width = width + 'px';
	motionDisplay.canvas.style.height = height + 'px';

	document.addEventListener('keyup', function(e){
		console.log(e.keyCode);
		if(e.keyCode === 70){
			motionDisplay.debugField = !motionDisplay.debugField;
			return;
			if(motionDisplay.debugField){
				motionDisplay.debugField = false;
				motionDisplay.start();
			} else {
				motionDisplay.debugField = true;
				//motionDisplay.running = false;
			}

			return;
		}
	});
}
