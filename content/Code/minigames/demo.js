$.get('/javascripts/Code/minigames/comperator.js', function(data) {
    $('#comperator').append('<code>' + data + '</code>');
});

$.get('/javascripts/Code/minigames/hangman.js', function(data) {
    $('#hangman-container code').textContent = data;
});
