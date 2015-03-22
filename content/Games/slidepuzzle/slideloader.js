$('img[data-src="/images//Games/slidepuzzle/slidepuzzle.png"]').remove();

function loadPreviewImage(src){
  $('#slidePuzzlePreviewImage').remove();
  var origSrc = imageLoader.getRawSrc(src),
      $img = $('<img>', {id: 'slidePuzzlePreviewImage', src: imageLoader.makeSizedSrc(origSrc, 250,250), 'data-noIntent': true	}),
			biggestSize = $img.width() > $img.height() ? 'width' : 'height';
	if($img[biggestSize]() > 250){
		$img.css(biggestSize, 250 + 'px');
	}
  $('#slidepuzzle.exclusive').append($img);
  
  var previousImages = getStoredObject('prevSlidePuzzles');
  if(!previousImages) previousImages = [];
  
  var inPreviousListIndex = previousImages.indexOf(origSrc);
  if(inPreviousListIndex == -1) previousImages.push(origSrc);
  else previousImages.unshift(previousImages.splice(inPreviousListIndex, 1)[0]);
  setStoredObject('prevSlidePuzzles', previousImages);
  
  
  var $previousContainer = $('#previousImagesContainer');
  for(var index in previousImages){
    $previousContainer.append($('<img>', {src: imageLoader.makeSizedSrc(previousImages[index], 250,250), css: { width: '75px', height: '75px'}})); 
  }
}

function loadImageFromHash(hash){
  loadPreviewImage(location.hash.substr(1));
}

$(window).on('hashchange', function(){
  loadImageFromHash(location.hash);
});

if($('#slidepuzzle.exclusive').length){
  $('img').live('click', function(){
		$(this).lightbox({bare: true}, function($img, ready){
			$img.slidePuzzle({ x: +$('#x').val(), y: +$('#y').val() });
			ready();
		});
  });
}

if(location.hash) loadImageFromHash(location.hash);

$('#imageSrc').on('keydown', function(e){
  if(e.keyCode == 13 /* enter */) location.hash = $(this).val();
});
