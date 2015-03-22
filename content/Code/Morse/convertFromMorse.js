function convertMorseToText(morsestring){
  var string = '',
      words = morsestring.split(' / ');
  while(words.length){
    convertWord(words.shift());
  }

  return string;

  function convertWord(word){
    var chars = word.split(' '),
        char;
    for(var i in chars){
      char = chars[i];
      string += lookup[char] ? lookup[char] : '(' + char + ')';
    }
    if(words.length) string += ' ';
  }
}


 var lookup = {
  '.-': 'a',
  '-...': 'b',
  '-.-.': 'c',
  '-..': 'd',
  '.': 'e',
  '..-.': 'f',
  '--.': 'g',
  '....': 'h',
  '..': 'i',
  '---.': 'j',
  '-.-': 'k',
  '.-..': 'l',
  '--': 'm',
  '-.': 'n',
  '---': 'o',
  '.--.': 'p',
  '--.-': 'q',
  '.-.': 'r',
  '...': 's',
  '-': 't',
  '..-': 'u',
  '...-': 'v',
  '.--': 'w',
  '-..-': 'x',
  '-.--': 'y',
  '--..': 'z'
 };