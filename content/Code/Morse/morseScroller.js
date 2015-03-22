$(document).ready(function() {
	var winwidth = Number(window.innerWidth);
	var winheight = Number(window.innerHeight);
	var graph = document.createElement("canvas");
	graph.setAttribute("id", "twentythree");
	graph.setAttribute("width", winwidth); 
	graph.setAttribute("height", winheight);
	document.body.appendChild(graph);
	var canvas = document.getElementById("twentythree");
	if (typeof canvas.getContext != "undefined"){
		var context = canvas.getContext("2d");	
	}
	var ctx = canvas.getContext('2d');
	
	ctx.lineWidth="3";
	ctx.lineJoin='miter';
	ctx.save();
	
	var klik = 0;
	
	var instance;
	var trails = 1;
	var mx = 0;
	var my = 0;
	var redraw = 0;
	var finalrender = 0;
	var environment = 'black';
	ctx.strokeStyle='white';
	ctx.fillStyle = 'red';
	var tekst = [];
	var mode = 'morse';
	var typetimer = 1;

	$().mousemove(function(e){
        mx = e.pageX;
	my = e.pageY;
    })
	
	document.onkeydown = down;
	document.onkeyup = up;
	document.onmousedown = press;
	document.onmouseup = release;
	document.onresize = resize;
	var rfill = 0;
	
	function resize(){
		alert(23);
	}
	
	function down(e){
		if(e){
			Keyp = e.which;
		}else{
			Keyp = window.event.keyCode;
		}
	
		if(Keyp == 65){ tekst.push('.','-',' ');}
		if(Keyp == 66){ tekst.push('-','.','.','.',' ');}
		if(Keyp == 67){ tekst.push('-','.','-','.',' ');}
		if(Keyp == 68){ tekst.push('-','.','.',' ');}
		if(Keyp == 69){ tekst.push('.',' ');}
		if(Keyp == 70){ tekst.push('.','.','-','.',' ') ;}
		if(Keyp == 71){ tekst.push('-','-','.',' ');}
		if(Keyp == 72){ tekst.push('.','.','.','.',' ');}
		if(Keyp == 73){ tekst.push('.','.',' ');}
		if(Keyp == 74){ tekst.push('.','-','-','-',' ');}
		if(Keyp == 75){ tekst.push('-','.','-',' ');}
		if(Keyp == 76){ tekst.push('.','-','.','.',' ');}
		if(Keyp == 77){ tekst.push('-','-',' ');}
		if(Keyp == 78){ tekst.push('-','.',' ');}
		if(Keyp == 79){ tekst.push('-','-','-',' ');}
		if(Keyp == 80){ tekst.push('.','-','-','.',' ');}
		if(Keyp == 81){ tekst.push('-','-','.','-',' ');}
		if(Keyp == 82){ tekst.push('.','-','.',' ');}
		if(Keyp == 83){ tekst.push('.','.','.',' ');}
		if(Keyp == 84){ tekst.push('-',' ');}
		if(Keyp == 85){ tekst.push('.','.','-',' ');}
		if(Keyp == 86){ tekst.push('.','.','.','-',' ');}
		if(Keyp == 87){ tekst.push('.','-','-',' ');}
		if(Keyp == 88){ tekst.push('-','.','.','-',' ');}
		if(Keyp == 89){ tekst.push('-','.','-','-',' ');}
		if(Keyp == 90){ tekst.push('-','-','.','.',' ');}
		if(Keyp == 32){ tekst.push(' ',' ');}
		if(Keyp == 17){ 
			trails *= -1;
			trails += 1;
		}
		if(Keyp==8){
			tekst.splice(0,tekst.length);
		}
		if(Keyp==220){
			rfill *= -1;
			rfill += 1;
		}
		if(Keyp == 192){
			if(mode == 'type'){
				mode = 'morse';
				alert('mouse mode');
			}else{
				mode = 'type';
				alert('type mode');
			}
			console.log(mode);
		}
		console.log(Keyp);
		console.log(tekst);
	}

	function up(e){
		if(e){
			Keyp = e.which;
		}else{
			Keyp = window.event.keyCode;
		}
	}
	
	function press(e){
		speakers[0].action = true;
		console.log(e);
	}
	
	function release(e){
		speakers[0].action = false;
		console.log(e);
	}
	
	function randomfill(){
		Keyp = Math.round(Math.random()*35)+65;
		if(Keyp == 65){ tekst.push('.','-',' ');}
		if(Keyp == 66){ tekst.push('-','.','.','.',' ');}
		if(Keyp == 67){ tekst.push('-','.','-','.',' ');}
		if(Keyp == 68){ tekst.push('-','.','.',' ');}
		if(Keyp == 69){ tekst.push('.',' ');}
		if(Keyp == 70){ tekst.push('.','.','-','.',' ') ;}
		if(Keyp == 71){ tekst.push('-','-','.',' ');}
		if(Keyp == 72){ tekst.push('.','.','.','.',' ');}
		if(Keyp == 73){ tekst.push('.','.',' ');}
		if(Keyp == 74){ tekst.push('.','-','-','-',' ');}
		if(Keyp == 75){ tekst.push('-','.','-',' ');}
		if(Keyp == 76){ tekst.push('.','-','.','.',' ');}
		if(Keyp == 77){ tekst.push('-','-',' ');}
		if(Keyp == 78){ tekst.push('-','.',' ');}
		if(Keyp == 79){ tekst.push('-','-','-',' ');}
		if(Keyp == 80){ tekst.push('.','-','-','.',' ');}
		if(Keyp == 81){ tekst.push('-','-','.','-',' ');}
		if(Keyp == 82){ tekst.push('.','-','.',' ');}
		if(Keyp == 83){ tekst.push('.','.','.',' ');}
		if(Keyp == 84){ tekst.push('-',' ');}
		if(Keyp == 85){ tekst.push('.','.','-',' ');}
		if(Keyp == 86){ tekst.push('.','.','.','-',' ');}
		if(Keyp == 87){ tekst.push('.','-','-',' ');}
		if(Keyp == 88){ tekst.push('-','.','.','-',' ');}
		if(Keyp == 89){ tekst.push('-','.','-','-',' ');}
		if(Keyp == 90){ tekst.push('-','-','.','.',' ');}
	}
	speakers = [];
	speakers.push(new speaker);
	
	function speaker(){
		this.color = [];
		this.color.push(Math.round(Math.random()*255),Math.round(Math.random()*255),Math.round(Math.random()*255),1);
		//alert(this.color);
		this.height = winheight/10;
		this.action = false;
		this.repeat = false;
		this.bleeps = [];
		this.curbleep = "";
	}
	
	function bleep(offx,offy,time,velo,kleur){
		this.x = offx;
		this.height = offy;
		this.duration = time;
		this.color = [];
		this.color.push(kleur[0],kleur[1],kleur[2],kleur[3]);
		this.copied = false;
		this.speed = velo;
	}
	
	function type(){
		if(tekst.length>0){
			typetimer -= 0.5;
			//console.log(typetimer);
			if(typetimer == 0){
				speakers[0].action = false;
				tekst.splice(0,1);
				//console.log(tekst[0]);
				console.log(tekst.length);
				typetimer = 9;
			}
			if(typetimer == 6){
				if(tekst[0] !== ' '){
					speakers[0].action = true;
				}
			}
			if(typetimer == 5 && tekst[0] == '.'){
				speakers[0].action = false;
				typetimer = 0.5;
			}
		}else if(rfill == 1){
			randomfill();
		}
	}
	
	function script(){	
		type();
		
		if(trails==1){
			ctx.fillStyle = 'rgba(0,0,0,0.2)'	;
			ctx.fillRect(0,0,winwidth,winheight);
		} else{
			ctx.clearRect(0,0,winwidth,winheight);
		}
		i = 0;
		while(i<speakers.length){
			if(speakers[i].action==true){
				if(speakers[i].repeat==false){
					speakers[i].bleeps.push(new bleep(winwidth,speakers[i].height,0,0,speakers[i].color));
					speakers[i].curbleep = speakers[i].bleeps[speakers[i].bleeps.length-1];
					speakers[i].repeat = true;
				}
				speakers[i].curbleep.duration+=2;
			} else {
				speakers[i].repeat = false;
				speakers[i].curbleep = "";
			}
			j = 0;
			if(speakers[i].bleeps.length>0){
				while(j<speakers[i].bleeps.length){
					ctx.strokeStyle = 'rgba('+speakers[i].bleeps[j].color[0]+','+speakers[i].bleeps[j].color[1]+','+speakers[i].bleeps[j].color[2]+','+speakers[i].bleeps[j].color[3]+')';
					ctx.fillStyle = 'rgba('+speakers[i].bleeps[j].color[0]+','+speakers[i].bleeps[j].color[1]+','+speakers[i].bleeps[j].color[2]+','+speakers[i].bleeps[j].color[3]+')';
					ctx.beginPath()
					if(speakers[i].bleeps[j].duration<8){
						ctx.arc(speakers[i].bleeps[j].x,speakers[i].bleeps[j].height,4+speakers[i].bleeps[j].speed,0,2*Math.PI,true);
						//ctx.closePath();
						ctx.fill();
					} else {
						ctx.lineWidth = 3+speakers[i].bleeps[j].speed;
						ctx.moveTo(speakers[i].bleeps[j].x-speakers[i].bleeps[j].speed,speakers[i].bleeps[j].height);
						if(speakers[i].bleeps[j].x+speakers[i].bleeps[j].speed<winwidth){
							ctx.lineTo(speakers[i].bleeps[j].x+speakers[i].bleeps[j].speed+speakers[i].bleeps[j].duration,speakers[i].bleeps[j].height);
						} else {
							ctx.lineTo(winwidth,speakers[i].bleeps[j].height);
						}
						ctx.closePath();
						ctx.stroke();
					}
					
					speakers[i].bleeps[j].x-=2+speakers[i].bleeps[j].speed;
					
					if((speakers[i].bleeps[j].x-speakers[i].bleeps[j].speed)<0){
						if(speakers[i].bleeps[j].copied == false){
							speakers[i].bleeps.push(new bleep(winwidth+speakers[i].bleeps[j].speed,speakers[i].bleeps[j].height+15+speakers[i].bleeps[j].speed*2,speakers[i].bleeps[j].duration,speakers[i].bleeps[j].speed+0.5,speakers[i].bleeps[j].color));
							speakers[i].bleeps[j].copied = true;
						}
						if(speakers[i].bleeps[j].height>winheight){
							speakers[i].bleeps.splice[j,1];
						}
						if(speakers[i].bleeps[j].x<speakers[i].bleeps[j].duration*-1){
							speakers[i].bleeps.splice(j,1);
						}
					}
					j+=1;
				}
			}
			i+=1;	
		}
	}
	var loopInterval = setInterval(script,50);
});
