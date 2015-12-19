//    abc_midi_renderer.js: Create the actual format for the midi.
//    Copyright (C) 2010,2015 Gregory Dyke (gregdyke at gmail dot com) and Paul Rosen
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.midi)
	window.ABCJS.midi = {};

(function() {
	"use strict";
	function setAttributes(elm, attrs) {
		for (var attr in attrs)
			if (attrs.hasOwnProperty(attr))
				elm.setAttribute(attr, attrs[attr]);
		return elm;
	}

	var MIDIPlugin;
	//TODO-PER: put this back in when the MIDIPlugin works again.
	//window.oldunload = window.onbeforeunload;
	//window.onbeforeunload = function() {
	//    if (window.oldunload)
	//        window.oldunload();
	//  if (typeof(MIDIPlugin) !== "undefined" && MIDIPlugin) { // PER: take care of crash in IE 8
	//    MIDIPlugin.closePlugin();
	//  }
	//};


	function MidiProxy(javamidi, qtmidi) {
		this.javamidi = javamidi;
		this.qtmidi = qtmidi;
	}

	MidiProxy.prototype.setTempo = function(qpm) {
		this.javamidi.setTempo(qpm);
		this.qtmidi.setTempo(qpm);
	};

	MidiProxy.prototype.startTrack = function() {
		this.javamidi.startTrack();
		this.qtmidi.startTrack();
	};

	MidiProxy.prototype.endTrack = function() {
		this.javamidi.endTrack();
		this.qtmidi.endTrack();
	};

	MidiProxy.prototype.setInstrument = function(number) {
		this.javamidi.setInstrument(number);
		this.qtmidi.setInstrument(number);
	};

	MidiProxy.prototype.startNote = function(pitch, loudness, abcelem) {
		this.javamidi.startNote(pitch, loudness, abcelem);
		this.qtmidi.startNote(pitch, loudness, abcelem);
	};

	MidiProxy.prototype.endNote = function(pitch, length) {
		this.javamidi.endNote(pitch, length);
		this.qtmidi.endNote(pitch, length);
	};

	MidiProxy.prototype.addRest = function(length) {
		this.javamidi.addRest(length);
		this.qtmidi.addRest(length);
	};

	MidiProxy.prototype.embed = function(parent) {
		this.javamidi.embed(parent);
		this.qtmidi.embed(parent, true);
	};

	function JavaMidi(midiwriter) {
		this.playlist = []; // contains {time:t,funct:f} pairs
		this.trackcount = 0;
		this.timecount = 0;
		this.tempo = 60;
		this.midiapi = MIDIPlugin;
		this.midiwriter = midiwriter;
		this.noteOnAndChannel = "%90";
	}

	JavaMidi.prototype.setTempo = function(qpm) {
		this.tempo = qpm;
	};

	JavaMidi.prototype.startTrack = function() {
		this.silencelength = 0;
		this.trackcount++;
		this.timecount = 0;
		this.playlistpos = 0;
		this.first = true;
		if (this.instrument) {
			this.setInstrument(this.instrument);
		}
		if (this.channel) {
			this.setChannel(this.channel);
		}
	};

	JavaMidi.prototype.endTrack = function() {
		// need to do anything?
	};

	JavaMidi.prototype.setInstrument = function(number) {
		this.instrument = number;
		this.midiapi.setInstrument(number);
		//TODO push this into the playlist?
	};

	JavaMidi.prototype.setChannel = function(number) {
		this.channel = number;
		this.midiapi.setChannel(number);
	};

	JavaMidi.prototype.updatePos = function() {
		while (this.playlist[this.playlistpos] &&
		this.playlist[this.playlistpos].time < this.timecount) {
			this.playlistpos++;
		}
	};

	JavaMidi.prototype.startNote = function(pitch, loudness, abcelem) {
		this.timecount += this.silencelength;
		this.silencelength = 0;
		if (this.first) {
			//nothing special if first?
		}
		this.updatePos();
		var self = this;
		this.playlist.splice(this.playlistpos, 0, {
			time: this.timecount,
			funct: function() {
				self.midiapi.playNote(pitch);
				self.midiwriter.notifySelect(abcelem);
			}
		});
	};

	JavaMidi.prototype.endNote = function(pitch, length) {
		this.timecount += length;
		this.updatePos();
		var self = this;
		this.playlist.splice(this.playlistpos, 0, {
			time: this.timecount,
			funct: function() {
				self.midiapi.stopNote(pitch);
			}
		});
	};

	JavaMidi.prototype.addRest = function(length) {
		this.silencelength += length;
	};

	JavaMidi.prototype.embed = function(parent) {


		this.playlink = setAttributes(document.createElement('a'), {
			style: "border:1px solid black; margin:3px;"
		});
		this.playlink.innerHTML = "play";
		var self = this;
		this.playlink.onmousedown = function() {
			if (self.playing) {
				this.innerHTML = "play";
				self.pausePlay();
			} else {
				this.innerHTML = "pause";
				self.startPlay();
			}
		};
		parent.appendChild(this.playlink);

		var stoplink = setAttributes(document.createElement('a'), {
			style: "border:1px solid black; margin:3px;"
		});
		stoplink.innerHTML = "stop";
		//var self = this;
		stoplink.onmousedown = function() {
			self.stopPlay();
		};
		parent.appendChild(stoplink);
		this.i = 0;
		this.currenttime = 0;
		this.playing = false;
	};

	JavaMidi.prototype.stopPlay = function() {
		this.i = 0;
		this.currenttime = 0;
		this.pausePlay();
		this.playlink.innerHTML = "play";
	};

	JavaMidi.prototype.startPlay = function() {
		this.playing = true;
		var self = this;
		// repeat every 16th note TODO see the min in the piece
		this.ticksperinterval = 480 / 4;
		this.doPlay();
		this.playinterval = window.setInterval(function() {self.doPlay(); },
			(60000 / (this.tempo * 4)));
	};

	JavaMidi.prototype.pausePlay = function() {
		this.playing = false;
		window.clearInterval(this.playinterval);
		this.midiapi.stopAllNotes();
	};

	JavaMidi.prototype.doPlay = function() {
		while (this.playlist[this.i] &&
		this.playlist[this.i].time <= this.currenttime) {
			this.playlist[this.i].funct();
			this.i++;
		}
		if (this.playlist[this.i]) {
			this.currenttime += this.ticksperinterval;
		} else {
			this.stopPlay();
		}
	};

	function Midi() {
		this.trackstrings = "";
		this.trackcount = 0;
		this.noteOnAndChannel = "%90";
	}

	Midi.prototype.setTempo = function(qpm) {
		//console.log("setTempo",qpm);
		if (this.trackcount === 0) {
			this.startTrack();
			this.track += "%00%FF%51%03" + toHex(Math.round(60000000 / qpm), 6);
			this.endTrack();
		}
	};

	Midi.prototype.setGlobalInfo = function(qpm, name) {
		//console.log("setGlobalInfo",qpm, key, time, name);
		if (this.trackcount === 0) {
			this.startTrack();
			this.track += "%00%FF%51%03" + toHex(Math.round(60000000 / qpm), 6);
			// TODO-PER: we could also store the key and time signatures, something like:
			//00 FF 5902 03 00 - key signature
			//00 FF 5804 04 02 30 08 - time signature
			if (name) {
				this.track += "%00%FF%03" + toHex(name.length, 2);
				for (var i = 0; i < name.length; i++)
					this.track += toHex(name.charCodeAt(i), 2);
			}
			this.endTrack();
		}
	};

	Midi.prototype.startTrack = function() {
		//console.log("startTrack");
		this.track = "";
		this.silencelength = 0;
		this.trackcount++;
		this.first = true;
		if (this.instrument) {
			this.setInstrument(this.instrument);
		}
	};

	Midi.prototype.endTrack = function() {
		//console.log("endTrack");
		var tracklength = toHex(this.track.length / 3 + 4, 8);
		this.track = "MTrk" + tracklength + // track header
			this.track +
			'%00%FF%2F%00'; // track end
		this.trackstrings += this.track;
	};

	Midi.prototype.setInstrument = function(number) {
		//console.log("setInstrument", number);
		if (this.track)
			this.track = "%00%C0" + toHex(number, 2) + this.track;
		else
			this.track = "%00%C0" + toHex(number, 2);
		this.instrument = number;
	};

	Midi.prototype.setChannel = function(number) {
		//console.log("setChannel", number);
		this.channel = number - 1;
		this.noteOnAndChannel = "%9" + this.channel.toString(16);
	};

	Midi.prototype.startNote = function(pitch, loudness) {
		//console.log("startNote", pitch, loudness);
		this.track += toDurationHex(this.silencelength); // only need to shift by amount of silence (if there is any)
		this.silencelength = 0;
		if (this.first) {
			this.first = false;
			this.track += this.noteOnAndChannel;
		}
		this.track += "%" + pitch.toString(16) + toHex(loudness, 2); //note
	};

	Midi.prototype.endNote = function(pitch, length) {
		//console.log("endNote", pitch, length);
		this.track += toDurationHex(this.silencelength+length); // only need to shift by amount of silence (if there is any)
		this.silencelength = 0;
//		this.track += toDurationHex(length); //duration
		this.track += "%" + pitch.toString(16) + "%00";//end note
	};

	Midi.prototype.addRest = function(length) {
		//console.log("addRest", length);
		this.silencelength += length;
	};

	Midi.prototype.getData = function() {
		return "data:audio/midi," +
			"MThd%00%00%00%06%00%01" + toHex(this.trackcount, 4) + "%01%e0" + // header
			this.trackstrings;
	};

	Midi.prototype.embed = function(parent, noplayer) {

		var data = this.getData();

		var link = setAttributes(document.createElement('a'), {
			href: data
		});
		link.innerHTML = "download midi";
		parent.insertBefore(link, parent.firstChild);

		if (noplayer) return;

		var embed = setAttributes(document.createElement('embed'), {
			src: data,
			type: 'video/quicktime',
			controller: 'true',
			autoplay: 'false',
			loop: 'false',
			enablejavascript: 'true',
			style: 'display:block; height: 20px;'
		});
		parent.insertBefore(embed, parent.firstChild);
	};

	// s is assumed to be of even length
	function encodeHex(s) {
		var ret = "";
		for (var i = 0; i < s.length; i += 2) {
			ret += "%";
			ret += s.substr(i, 2);
		}
		return ret;
	}

	function toHex(n, padding) {
		var s = n.toString(16);
		while (s.length < padding) {
			s = "0" + s;
		}
		return encodeHex(s);
	}

	function toDurationHex(n) {
		var res = 0;
		var a = [];

		// cut up into 7 bit chunks;
		while (n !== 0) {
			a.push(n & 0x7F);
			n = n >> 7;
		}

		// join the 7 bit chunks together, all but last chunk get leading 1
		for (var i = a.length - 1; i >= 0; i--) {
			res = res << 8;
			var bits = a[i];
			if (i !== 0) {
				bits = bits | 0x80;
			}
			res = res | bits;
		}

		var padding = res.toString(16).length;
		padding += padding % 2;

		return toHex(res, padding);
	}

	window.ABCJS.midi.rendererFactory = function(isJava) {
		return (isJava) ? new MidiProxy(new JavaMidi(this), new Midi()) : new Midi();
	};

	window.ABCJS.midi.initializeJava = function() {
		MIDIPlugin = document.MIDIPlugin;
		setTimeout(function() { // run on next event loop (once MIDIPlugin is loaded)
			try { // activate MIDIPlugin
				MIDIPlugin.openPlugin();

			} catch(e) { // plugin not supported (download externals)
				var a = document.createElement("a");
				a.href = "http://java.sun.com/products/java-media/sound/soundbanks.html";
				a.target = "_blank";
				a.appendChild(document.createTextNode("Download Soundbank"));
				parent.appendChild(a);
			}
		}, 0);
	};

})();
