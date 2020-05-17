var c = document.getElementById("output"); //get canvas
var ctx = c.getContext("2d");
var height = c.height;
var width = c.width;
var recordPosition = width*3/4; //where the note should start entering
var playPosition = width/4;
var noteHeight = height/88; //height of a single note in the canvas
var moveOffset = 2; //speed of the canvas moving left
ctx.fillStyle = "gray"; //fill background
ctx.fillRect(0,0,width,height);
ctx.fillStyle = "blue"; //color of the notes will be blue

//var recorded = []; //An array that will store each note that has been recorded in the form (pressed?,pitch,time in ms)
//Suggested format {"vol": amplitude, "pitch": pitch, "start": start_time, "duration": performance.now() - this.start_time}
 //Keeps track of whether we are recording right now or not. Used in handleNoteOn and handleNoteOff to control whether we write down each note's press or release to the recorded array.

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
/* Legacy playback system
function playRecorded(playMe){
	for (var i = 0; i < playMe.length; ++i) {
		if (playMe[i][0]) {
			setTimeOut(function(){MIDI.noteOn(0,playMe[i][1],80);},playMe[i][2]);
		} else {
			setTimeOut(function(){MIDI.noteOff(0,playMe[i][1]);},playMe[i][2]);
		}
	}
}
*/

function exportRecorded(){
	if (recorded.length > 0) {
		var element = document.createElement('a');
		var timeDelay = recorded[0].start;
		for (var i = 0; i < recorded.length; ++i) {
			recorded[i].start -= timeDelay;
		}
		console.log(recorded);
		var new_json = JSON.stringify(recorded);

		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(new_json));
		element.setAttribute('download', "recording.json");

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		element.remove();
	} else {
		alert("You haven't recorded anything!");
	}
}

function playImported() {
	var files = document.getElementById("impJson").files;
	var path = files[0].name;
	var midiData = [];
	if (files.length !== 0) {
		var reader = new FileReader();
		reader.onload = ((theFile) => {
			return function (e) {
				try {
					var midiData = JSON.parse(e.target.result);
					playing = true;	//Moved ctx.clear to processJSON - we don't want to reset the canvas if the JSON parse failed
					processJSON(midiData);
				} catch (ex) {
					alert('Error when parsing JSON!' + ex);
				}
			}
		})(files[0]);
		reader.readAsText(files[0]);

	}
	else {
		alert("Import JSON file with MIDI instructions first!");
	}
}
//dealing with delay first
const delay = ms => new Promise (res=>setTimeout(res, ms));
const processJSON = async(json) => {
	ctx.moveTo(recordPosition,0);	//Instead of clearing the canvas we draw a line to mark the start of playback - maybe we should make the line a different color for recording and playback
	ctx.lineTo(recordPosition,height);
	ctx.stroke();
	playing = true;
	render();
	var lowestPitch = parseInt($("#lowestPitch").val());
	for (var i = 0; i < json.length; ++i) {
		pressed[json[i].pitch - lowestPitch] = true;
		MIDI.noteOn(0, json[i].pitch, json[i].vol);
		var jump = false;
		if (json[i].type === 1 || json[i].type === 2) {
			MIDI.noteOn(0, json[i + 1].pitch, json[i].vol);
			MIDI.noteOn(0, json[i + 2].pitch, json[i].vol);
			pressed[json[i + 1].pitch - lowestPitch] = true;
			pressed[json[i + 2].pitch - lowestPitch] = true;
			jump = true;
		}
		await delay(json[i].duration);
		pressed[json[i].pitch - lowestPitch] = false;
		MIDI.noteOff(0, json[i].pitch);

		if (json[i].type === 1 || json[i].type === 2) {
			MIDI.noteOff(0, json[i + 1].pitch);
			MIDI.noteOff(0, json[i + 2].pitch);
			pressed[json[i + 1].pitch - lowestPitch] = false;
			pressed[json[i + 2].pitch - lowestPitch] = false;
		}
		if (i < json.length - 1) {
			if (jump && i < json.length - 3) {
				await delay(json[i + 3].start - json[i].start - json[i].duration);
			}
			else await delay(json[i + 1].start - json[i].start - json[i].duration);
		}
		if (jump) i += 2;
	}
	playing = false;
}
