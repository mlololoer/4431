var c = document.getElementById("output"); //get canvas
var ctx = c.getContext("2d");
var height = c.height;
var width = c.width;
var recordPosition = width*3/4; //where the note should start entering
var playPosition = width/4;
var noteHeight = height/88; //height of a single note in the canvas
var moveOffset = 2; //speed of the canvas moving left
var customized = false;

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

function customizerChange() {
	if (document.getElementById("cust-on").checked) {
		customized = true;
	}
	else {
		customized = false;
	}
}

function colorHandler(){
	var backgroundColor;	var noteColor;
	switch($("#colorSelect").val()) {
		case "defaultblue":{backgroundColor = "grey"; noteColor = "blue"; break;}
		case "defaultred":{backgroundColor = "grey"; noteColor = "red"; break;}
		case "defaultgreen":{backgroundColor = "grey"; noteColor = "green"; break;}
		case "defaultyellow":{backgroundColor = "grey"; noteColor = "yellow"; break;}
		case "sunset": {backgroundColor = "#7772B6"; noteColor = "#F7987F"; break;}
		case "ocean":  {backgroundColor = "#136ADD"; noteColor = "#86C6E6"; break;}
		case "map":  {backgroundColor = "#405DD7"; noteColor = "#64FC59"; break;}
		case "greyscale": {backgroundColor = "#444444"; noteColor = "#BBBBBB"; break;}
		case "BandW": {backgroundColor = "black"; noteColor = "white"; break;}
	}
	ctx.fillStyle = backgroundColor; //fill background
	ctx.fillRect(0,0,width,height);
	ctx.fillStyle = noteColor; //color of the notes will be blue
}

function speedHandler(){
	moveOffset=$("#speedSelect").val();
}

function render(){
	if (recording || playing) {
		for (var i = 0; i < 88; ++i) {
			if(pressed[i]) {
				if (customized) {
<<<<<<< HEAD
					ctx.fillRect(recordPosition,(108-parseInt($("#pitch-bend").val())-i)*noteHeight,moveOffset,noteHeight);
				}
				else
					ctx.fillRect(recordPosition,(108-i)*noteHeight,moveOffset,noteHeight);
=======
					ctx.fillRect(recordPosition,(88-parseInt($("#pitch-bend").val())-i-1)*noteHeight,moveOffset,noteHeight);
				}
				else
					ctx.fillRect(recordPosition,(88-i-1)*noteHeight,moveOffset,noteHeight);
>>>>>>> bf6f21713a9a73eff59f5627a2a5ed23d7cb8213
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
	try {var path = files[0].name;} catch {alert("Import JSON file with MIDI instructions first!"); return;}
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
		var inst = parseInt($("#instrumentSelect").val());
		//var customized = document.getElementById("customizer").checked;

		var pitchBend = parseInt($("#pitch-bend").val());
		var velocity = parseFloat($("#velocity").val());
		var tempoMultiplier = 1/parseFloat($("#tempo-multiplier").val());


		MIDI.programChange(0,inst);
		if (customized) {
			if (json[i].pitch+pitchBend <= 108 && json[i].pitch+pitchBend >= 21) {
				MIDI.noteOn(0,json[i].pitch+pitchBend, json[i].vol*velocity);
<<<<<<< HEAD
				pressed[json[i].pitch +pitchBend] = true;
			}
		} else {
			MIDI.noteOn(0, json[i].pitch, json[i].vol);
			pressed[json[i].pitch] = true;
=======
				pressed[json[i].pitch +pitchBend -21] = true;
			}
		} else {
			MIDI.noteOn(0, json[i].pitch, json[i].vol);
			pressed[json[i].pitch -21] = true;
>>>>>>> bf6f21713a9a73eff59f5627a2a5ed23d7cb8213
		}


		var jump = false;
		if (json[i].type === 1 || json[i].type === 2) {
			if(customized){
				if (json[i + 1].pitch+pitchBend <= 108 && json[i + 1].pitch+pitchBend >= 21) {
					MIDI.noteOn(0, json[i + 1].pitch+pitchBend, json[i+1].vol*velocity);
<<<<<<< HEAD
					pressed[json[i + 1].pitch+pitchBend] = true;
				}
				if (json[i + 2].pitch+pitchBend <= 108 && json[i + 2].pitch+pitchBend >= 21) {
					MIDI.noteOn(0, json[i + 2].pitch+pitchBend, json[i+2].vol*velocity);
					pressed[json[i + 2].pitch+pitchBend] = true;
				}
			}else {
				MIDI.noteOn(0, json[i + 1].pitch, json[i+1].vol);
				pressed[json[i + 1].pitch] = true;
				MIDI.noteOn(0, json[i + 2].pitch, json[i+2].vol);
				pressed[json[i + 2].pitch] = true;
=======
					pressed[json[i + 1].pitch+pitchBend - 21] = true;
				}
				if (json[i + 2].pitch+pitchBend <= 108 && json[i + 2].pitch+pitchBend >= 21) {
					MIDI.noteOn(0, json[i + 2].pitch+pitchBend, json[i+2].vol*velocity);
					pressed[json[i + 2].pitch+pitchBend - 21] = true;
				}
			}else {
				MIDI.noteOn(0, json[i + 1].pitch, json[i+1].vol);
				pressed[json[i + 1].pitch - 21] = true;
				MIDI.noteOn(0, json[i + 2].pitch, json[i+2].vol);
				pressed[json[i + 2].pitch - 21] = true;
>>>>>>> bf6f21713a9a73eff59f5627a2a5ed23d7cb8213
			}
			jump = true;
		}

		if (customized) await delay(json[i].duration*tempoMultiplier);
		else await delay(json[i].duration)

		if (customized) {
			if (json[i].pitch+pitchBend <= 108 && json[i].pitch+pitchBend >= 21) {
				MIDI.noteOff(0, json[i].pitch+pitchBend);
<<<<<<< HEAD
				pressed[json[i].pitch+pitchBend] = false;
=======
				pressed[json[i].pitch+pitchBend - 21] = false;
>>>>>>> bf6f21713a9a73eff59f5627a2a5ed23d7cb8213
			}
			if (json[i].type === 1 || json[i].type === 2) {
				if (json[i + 1].pitch+pitchBend <= 108 && json[i + 1].pitch+pitchBend >= 21) {
					MIDI.noteOff(0, json[i + 1].pitch+pitchBend);
<<<<<<< HEAD
					pressed[json[i + 1].pitch+pitchBend] = false;
				}
				if (json[i + 2].pitch+pitchBend <= 108 && json[i + 2].pitch+pitchBend >= 21) {
					MIDI.noteOff(0, json[i + 2].pitch+pitchBend);
					pressed[json[i + 2].pitch+pitchBend] = false;
=======
					pressed[json[i + 1].pitch+pitchBend - 21] = false;
				}
				if (json[i + 2].pitch+pitchBend <= 108 && json[i + 2].pitch+pitchBend >= 21) {
					MIDI.noteOff(0, json[i + 2].pitch+pitchBend);
					pressed[json[i + 2].pitch+pitchBend - 21] = false;
>>>>>>> bf6f21713a9a73eff59f5627a2a5ed23d7cb8213
				}
			}
		} else {
			MIDI.noteOff(0, json[i].pitch);
<<<<<<< HEAD
			pressed[json[i].pitch] = false;
			if (json[i].type === 1 || json[i].type === 2) {
				MIDI.noteOff(0, json[i + 1].pitch);
				MIDI.noteOff(0, json[i + 2].pitch);
				pressed[json[i + 1].pitch] = false;
				pressed[json[i + 2].pitch] = false;
=======
			pressed[json[i].pitch - 21] = false;
			if (json[i].type === 1 || json[i].type === 2) {
				MIDI.noteOff(0, json[i + 1].pitch);
				MIDI.noteOff(0, json[i + 2].pitch);
				pressed[json[i + 1].pitch - 21] = false;
				pressed[json[i + 2].pitch - 21] = false;
>>>>>>> bf6f21713a9a73eff59f5627a2a5ed23d7cb8213
			}
		}

		if (i < json.length - 1) {
			if (jump && i < json.length - 3) {
				if (customized) await delay(tempoMultiplier*(json[i + 3].start - json[i].start - json[i].duration));
				else await delay(json[i + 3].start - json[i].start - json[i].duration);
			}
			else {
				if (customized) await delay(tempoMultiplier*(json[i + 1].start - json[i].start - json[i].duration));
				else await delay(json[i + 1].start - json[i].start - json[i].duration);
			}
		}
		if (jump) i += 2;
	}
	for (var i = 0; i < 88; ++i) pressed[i] = false;
	playing = false;
}
