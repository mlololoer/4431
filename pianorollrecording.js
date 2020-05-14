var c = document.getElementById("output"); //get canvas
var ctx = c.getContext("2d");
var height = c.height; 
var width = c.width;
var recordPosition = width*3/4; //where the note should start entering
var playPosition = width/4;
var noteHeight = height/88; //height of a single note in the canvas
var moveOffset = 2; //speed of the canvas moving left
ctx.fillStyle = "white"; //fill background
ctx.fillRect(0,0,width,height);
ctx.fillStyle = "blue"; //color of the notes will be blue

var recorded = []; //An array that will store each note that has been recorded in the form (pressed?,pitch,time in ms)

var recording = false; //Keeps track of whether we are recording right now or not. Used in handleNoteOn and handleNoteOff to control whether we write down each note's press or release to the recorded array.

var playing = false; //Keeps track of whether we are playing a song right now

function startRecord() {
	if (document.getElementById("record-on").checked) {
		recorded = []; //empty the recorded array
		ctx.moveTo(recordPosition,0); //draw recording start line
		ctx.lineTo(recordPosition,height);
		ctx.stroke();
		recording = true;
		timeStart = Math.round(performance.now());//Recording begins. Set timestart to the time right now.
		render(); //start the rendering loop
	} else {
		recording = false;
	}
}

function render(){
	if (recording || playing) {
		var lowestPitch = parseInt($("#lowestPitch").val())
		for (var i = 0; i < 32; ++i) {
			if(pressed[i]) {
				ctx.fillRect(recordPosition,(108-lowestPitch-i)*noteHeight,moveOffset,noteHeight);
			}
		}
		ctx.drawImage(ctx.canvas,moveOffset,0,width-moveOffset,height,0,0,width-moveOffset,height);
		requestAnimationFrame(render);
	}
}

function playRecorded(playMe){
	for (var i = 0; i < playMe.length; ++i) {
		if (playMe[i][0]) {
			setTimeOut(function(){MIDI.noteOn(0,playMe[i][1],80);},playMe[i][2]);
		} else {
			setTimeOut(function(){MIDI.noteOff(0,playMe[i][1]);},playMe[i][2]);
		}
	}
}

function exportRecorded(){
	if (recorded.length > 0) {
		var element = document.createElement('a');
		var exportMe = "";
		for (var i = 0; i < recorded.length; ++i) {
			exportMe += recorded[i][0] + "," + recorded[i][1] + "," + recorded[i][2] + "\n";
		}
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(exportMe));
		element.setAttribute('download', "recording.json");

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	} else alert("You haven't recorded anything!");
}