$('#initDemo').on('click', init);

function init(){
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

	// var winAspect = $overlay.innerWidth / $overlay.innerHeight(),
	// 	fieldAspect = importedGridOptions.width / importedGridOptions.height,
		// 	wider = fieldAspect > winAspect,
		// 	scale = wider ? $overlay.innerWidth() / importedGridOptions.width : $overlay.innerHeight() / importedGridOptions.height;

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

			if(e.keyCode === 86){
				motionDisplay.grid.nextVariant();
				return;
			}

			if(e.keyCode === 84){
				motionDisplay.grid.nextTime();
				return;
			}

			if(e.keyCode === 80){
				motionDisplay.grid.toggleTimePassing();
			}
		});

		$(motionDisplay.canvas).on('click', function(e){
			console.log(motionDisplay.grid.getLocalV(
				e.offsetX / (motionDisplay.width / motionDisplay.grid.width),
				e.offsetY / (motionDisplay.height / motionDisplay.grid.height)
			));
		});

	//});
}
