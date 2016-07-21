var words = {
			english: [
				'deep',
				'rather',
				'wholesome',
				'naught',
				'indispensable',
				'directly',
				'commutative',
				'needles',
				'bright',
				'wanton',
				'doodle',
				'oozing',
				'dented'
			],
			dutch: [
				'diep',
				'nogal',
				'gezond',
				'niets',
				'onmisbaar',
				'direct',
				'commutatieve',
				'naalden',
				'helder',
				'baldadig',
				'doedel',
				'lekkend',
				'gedeukt'
			]
		},
		currentWord,
		guessedCharactersWrong = [],
		guessedCharactersRight = [];

function pickWord( language ) {
	var languageWords = words[ language ],
			randomIndex = Math.floor( languageWords.length * Math.random() );
	
	return languageWords[ randomIndex ];
	// return words[ language ][ Math.floor( words[ language ].length * Math.random() ) ];
}

function guess( character ) {
	var isInWord = currentWord.indexOf( character ) > -1,
			guessedBefore = guessedCharactersRight.indexOf( character ) === -1 || guessedCharactersWrong.indexOf( character ) === -1;
	
	if ( isInWord ) {
		if( guessedBefore ) {
			guessedCharactersRight.push( character );
			showGuess();
		}
	} else if( guessedBefore ) {
		guessedCharactersWrong.push( character );
		showGuessedCharacters();
		showHangman();
	}
}

function showGuess() {
	var visibleWord = '';

	currentWord.split( '' ).forEach( function( character ) {
		var isGuessed = guessedCharactersRight.indexOf( character ) > -1;

		visibleWord += isGuessed ? character : '-';
	} );

	document.getElementById( 'your-guess' ).textContent = visibleWord;
}

function showGuessedCharacters() { document.getElementById( 'already-guessed' ).textContent = guessedCharactersWrong.join( ' ' ); }

function showHangman() {
	var parts = document.getElementById( 'hangman' ).children;
	console.log( typeof parts );
}
