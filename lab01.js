// Map the key with the key number
var key_mapping = {
    // White keys of the first octave
    "z":  0, "x":  2, "c":  4, "v":  5, "b":  7, "n":  9, "m":  11,
    // Black keys of the first octave
    "s":  1, "d":  3, "g":  6, "h":  8, "j":  10,
    // White keys of the second octave
    "q": 12, "w": 14, "e": 16, "r": 17, "t": 19, "y": 21, "u": 23, "i": 24, "o": 26, "p": 28, "[": 29, "]": 31,
    // Black keys of the second octave
    "2": 13, "3": 15, "5": 18, "6": 20, "7": 22, "9": 25, "0": 27, "=": 30
}
//Keys that are currently pressed - true=pressed, false=not pressed
var pressed = [];
for (var i = 0; i < 32; ++i) pressed[i] = false;

var timeStart; //This will store the time that a recording has started. It will be used to calculate note timings and durations later when recording

var recorded = []; //An array that will store each note that has been recorded in the form (pressed?,pitch,time in ms)

var recording; //Keeps track of whether we are recording right now or not. Used in handleNoteOn and handleNoteOff to control whether we write down each note's press or release to the recorded array.

function handleNoteOn(key_number) {
	if (pressed[key_number]) return;
    // Find the pitch
    var pitch = parseInt($("#lowestPitch").val()) + key_number;
    /*
     * You need to use the slider to get the lowest pitch number above
     * rather than the hardcoded value
     */

    // Extract the amplitude value from the slider
    var amplitude = parseInt($("#amplitude").val());

    // Use the two numbers to start a MIDI note
    MIDI.noteOn(0, pitch, amplitude);
	
	//Mark this note as pressed
	pressed[key_number] = true;
	
	//Record the note if needed
	if (recording)	recorded.push([1,pitch,Math.round(performance.now()-timeStart)]);
    /*
     * You need to handle the chord mode here
     */
	if (document.getElementById("play-mode-major").checked) {
		if (pitch+4 <= 108)
			MIDI.noteOn(0, pitch + 4, amplitude);
			pressed[key_number+4] = true;
		if (pitch+7 <= 108)
			MIDI.noteOn(0, pitch + 7, amplitude);
			pressed[key_number+7] = true;
	} else if (document.getElementById("play-mode-minor").checked) {
		if (pitch+3 <= 108)
			MIDI.noteOn(0, pitch + 3, amplitude);
			pressed[key_number+3] = true;
		if (pitch+7 <= 108)
			MIDI.noteOn(0, pitch + 7, amplitude);
			pressed[key_number+7] = true;
	}
}

function handleNoteOff(key_number) {
	if (!pressed[key_number]) return;

    // Find the pitch
    var pitch = parseInt($("#lowestPitch").val()) + key_number;
    /*
     * You need to use the slider to get the lowest pitch number above
     * rather than the hardcoded value
     */

    // Send the note off message for the pitch
    MIDI.noteOff(0, pitch); 
	
	//Mark this note as released
	pressed[key_number] = false;
	
	//Record the note if needed
	if (recording)	recorded.push([0,pitch,Math.round(performance.now()-timeStart)]);
    /*
     * You need to handle the chord mode here
     */
	if (document.getElementById("play-mode-major").checked) {
		if (pitch+4	 <= 108)
			MIDI.noteOff(0, pitch + 4);
			pressed[key_number+4] = false;
		if (pitch+7 <= 108)
			MIDI.noteOff(0, pitch + 7);
			pressed[key_number+7] = false;
	} else if (document.getElementById("play-mode-minor").checked) {
		if (pitch+3 <= 108)
			MIDI.noteOff(0, pitch + 3);
			pressed[key_number+3] = false;
		if (pitch+7 <= 108)
			MIDI.noteOff(0, pitch + 7);
			pressed[key_number+7] = false;
	}
}

function handlePianoMouseDown(evt) {
    // Determine which piano key has been clicked on
    // evt.target tells us which item triggered this function
    // The piano key number is extracted from the key id (0-23)
    var key_number = $(evt.target).attr("id").substring(4);
    key_number = parseInt(key_number);

	// Start the note
	handleNoteOn(key_number);

	// Show a simple message in the console
	console.log("Piano mouse down event for key " + key_number + "!");
}

function handlePianoMouseUp(evt) {
    // Determine which piano key has been clicked on
    // evt.target tells us which item triggered this function
    // The piano key number is extracted from the key id (0-23)
	
	var key_number = $(evt.target).attr("id").substring(4);
    key_number = parseInt(key_number);

	// Stop the note
	handleNoteOff(key_number);

	// Show a simple message in the console
	console.log("Piano mouse up event for key " + key_number + "!");
}

function handlePageKeyDown(evt) {
    // Exit the function if the key is not a piano key
    // evt.key tells us the key that has been pressed
    if (!(evt.key in key_mapping)) return;
    
    // Find the key number of the key that has been pressed
    var key_number = key_mapping[evt.key];
	
	// Start the note
	handleNoteOn(key_number);

	// Select the key
	$("#key-" + key_number).focus();

	// Show a simple message in the console
	console.log("Page key down event for key " + key_number + "!");
}

function handlePageKeyUp(evt) {
    // Exit the function if the key is not a piano key
    // evt.key tells us the key that has been released
    if (!(evt.key in key_mapping)) return;
	
    // Find the key number of the key that has been released
    var key_number = key_mapping[evt.key];
	
	// Stop the note
	handleNoteOff(key_number);

	// Show a simple message in the console
	console.log("Page key up event for key " + key_number + "!");
}

/*
 * You need to write an event handling function for the instrument
 */
function instrumentHandler(){
	MIDI.programChange(0, parseInt($("#instrumentSelect").val()));
}

$(document).ready(function() {
    // Show a loading window
    //$("#loading").modal({ backdrop: "static", keyboard: false, show: true });

    MIDI.loadPlugin({
        soundfontUrl: "./midi-js/soundfont/",
        instruments: [
           "trumpet",
			"acoustic_grand_piano",
			"acoustic_guitar_nylon",
			"violin","clarinet",
			"flute",
			"alto_sax",
			"cello",
			"acoustic_bass",
			"string_ensemble_1"
            /*
             * You can preload the instruments here if you add the instrument
             * name in the list here
             */
				
        ],
        onprogress: function(state, progress) {
            console.log(state, progress);
        },
        onsuccess: function() {
            // Resuming the AudioContext when there is user interaction
            $("body").click(function() {
                if (MIDI.getContext().state != "running") {
                    MIDI.getContext().resume().then(function() {
                        console.log("Audio Context is resumed!");
                    });
                }
            });

            // Finish loading the page
            //$("#loading").modal("hide");

            // At this point the MIDI system is ready
            MIDI.setVolume(0, 127);     // Set the volume level
            MIDI.programChange(0, 56);  // Use the General MIDI 'piano' number

            // Set up the event handlers for all the buttons
			$("button").on("mousedown", handlePianoMouseDown);
			$("button").on("mouseup", handlePianoMouseUp);
			
			
			$("input[name='recording']").change(startRecord);
			$("input[name='exportbutton']").change("mouseup", exportRecorded);
            
			// Set up key events
            $(document).keydown(handlePageKeyDown);
            $(document).keyup(handlePageKeyUp);

			/*
             * You need to set up the event for the instrument 
             */
			$("#instrumentSelect").change(instrumentHandler);
            
        }
    });
});
