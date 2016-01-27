function initColorCircle(){
	var $exampleDiv = $( '#colorCircle' ),
			$codeElement = $( 'code#editableRing' ),
			circleData = randomCircleData1( 5, 50, 75 ),
			dataCircle;

	window.simpleSmartCanvas = new SmartCanvas( {}, $exampleDiv );
	simpleSmartCanvas.camera.rotation = -Math.PI / 2;

	createEditableCircle();
	$codeElement.html( JSON.stringify( circleData, null, '\t' ), true );

	$codeElement.on('change', codeChange );

	$exampleDiv.on( 'click', newRandomCircle );

	return;

	function createEditableCircle() {
		dataCircle = new DataCircle( circleData );
		
		simpleSmartCanvas.add( dataCircle );
	}

	function codeChange(e){
		var object = getObjectFromString( $codeElement.html() ),
				index = simpleSmartCanvas.contents.indexOf( dataCircle );
		if(object){
			$codeElement.css( { color: 'white' } );
			simpleSmartCanvas.contents.splice( index, 1 );
			circleData = object;

			createEditableCircle();
		}
		else{
			$codeElement.css( { color: 'red' } );
		}
	}

	function newRandomCircle(){
		circleData = randomCircleData1( 5, 50, 75 );
		simpleSmartCanvas.contents.splice( simpleSmartCanvas.contents.indexOf( dataCircle ), 1 );
		$codeElement.html( JSON.stringify( circleData, null, '\t' ), true );

		createEditableCircle();
	}
}

initColorCircle();
