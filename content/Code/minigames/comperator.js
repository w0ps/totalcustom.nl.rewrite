function playComperator(){
	
	var startTime = new Date(),
		score = 0,
		noMistake = true, //game ends when mistake
		a, b,			  //to store both numbers in
		timeTaken, avgTimeTaken;
	
	while(noMistake){
		a = Math.ceil(Math.random()*20);
		b = Math.ceil(Math.random()*20);
		
		if(a == b) {
			continue;	//skip double numbers for fun
		}
		
		noMistake = confirm(a + ' > ' + b + ' ?') == a > b;	//this is where the magic happens
	
		if(noMistake) score++;
	}

	timeTaken = new Date().getTime() - startTime.getTime();
	avgTimeTaken = timeTaken / score;	//score equals pairs asked, make average with it
	avgTimeTaken /= 1000;					//divide by 1000, milisecs in second
	avgTimeTaken = avgTimeTaken.toFixed(2);	//round to 2

	alert('fail!');
	alert('Score: ' + score + ',\nAvg time taken: ' + avgTimeTaken + 's.' );

};


function playDenseComperator(){
	var startTime = new Date(),
		score = 0,
		noMistake = true, //game ends when mistake
		a, b,			  //to store both numbers in
		avgTimeTaken;
	
	do{
		a = Math.ceil(Math.random()*20);
		b = Math.ceil(Math.random()*20);
		
		if(a == b) {
			continue;	//skip double numbers for fun
		}
	} while ( confirm(a + ' > ' + b + ' ?') == a > b && ++score );

	avgTimeTaken = ( ( ( new Date().getTime() - startTime.getTime() ) / score) / 1000 ).toFixed(2);

	alert('fail!');
	alert('Score: ' + score + ',\nAvg time taken: ' + avgTimeTaken + 's.' );
}