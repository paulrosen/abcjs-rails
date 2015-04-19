//    abc_relative_element.js: Definition of the RelativeElement class.
//    Copyright (C) 2010,2014 Gregory Dyke (gregdyke at gmail dot com) and Paul Rosen
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

/*globals ABCJS */

if (!window.ABCJS)
	window.ABCJS = {};

if (!window.ABCJS.write)
	window.ABCJS.write = {};

ABCJS.write.RelativeElement = function(c, dx, w, pitch, opt) {
	opt = opt || {};
	this.x = 0;
	this.c = c;      // character or path or string
	this.dx = dx;    // relative x position
	this.w = w;      // minimum width taken up by this element (can include gratuitous space)
	this.pitch = pitch; // relative y position by pitch
	this.scalex = opt.scalex || 1; // should the character/path be scaled?
	this.scaley = opt.scaley || 1; // should the character/path be scaled?
	this.type = opt.type || "symbol"; // cheap types.
	this.pitch2 = opt.pitch2;
	this.linewidth = opt.linewidth;
	this.klass = opt.klass;
	this.top = pitch;
	if (this.pitch2 !== undefined && this.pitch2 > this.top) this.top = this.pitch2;
	this.bottom = pitch;
	if (this.pitch2 !== undefined && this.pitch2 < this.bottom) this.bottom = this.pitch2;
	if (opt.thickness) {
		this.top += opt.thickness/2;
		this.bottom -= opt.thickness/2;
	}
	if (opt.stemHeight) {
		if (opt.stemHeight > 0)
			this.top += opt.stemHeight;
		else
			this.bottom += opt.stemHeight;
	}
	//if (this.type === "symbol") {
	//	var offset = ABCJS.write.glyphs.getYCorr(this.c);
	//	this.top += offset;
	//	this.bottom += offset;
	//}
	this.centerVertically = false;
	// TODO-PER: this should use the current font to determine the height. That requires the font to be passed in here, so refactor to store the font now instead of resolving it at draw time. This will allow the font to be changed mid-line, too.
	var multiplier;
	switch (this.type) {
		case "debug":
			this.chordHeightAbove = 3;
			break;
		case "lyric":
			multiplier = this.c.split("\n").length;
			if (opt.position && opt.position === 'below')
				this.lyricHeightBelow = 3*multiplier;
			else
				this.lyricHeightAbove = 3*multiplier;
			break;
		case "chord":
			multiplier = this.c.split("\n").length;
			if (opt.position && opt.position === 'below')
				this.chordHeightBelow = 4*multiplier;
			else
				this.chordHeightAbove = 4*multiplier;
			break;
		case "text":
			multiplier = this.c.split("\n").length;
			if (this.pitch === undefined) {
				if (opt.position && opt.position === 'below')
					this.chordHeightBelow = 4*multiplier;
				else
					this.chordHeightAbove = 4*multiplier;
			} else
				this.centerVertically = true;
			break;
		case "part": this.partHeightAbove = 6; break;
	}
};

<<<<<<< HEAD
ABCJS.write.RelativeElement.prototype.setX = function (x) {
=======
ABCJS.write.RelativeElement.prototype.draw = function (renderer, x, bartop) {
>>>>>>> origin/master
	this.x = x+this.dx;
};

ABCJS.write.RelativeElement.prototype.draw = function (renderer, bartop) {
	if (this.pitch === undefined)
		window.console.error(this.type + " Relative Element y-coordinate not set.");
	var y = renderer.calcY(this.pitch);
	switch(this.type) {
		case "symbol":
			if (this.c===null) return null;
<<<<<<< HEAD
			var klass = "symbol";
			if (this.klass) klass += " " + this.klass;
			this.graphelem = renderer.printSymbol(this.x, this.pitch, this.c, this.scalex, this.scaley, renderer.addClasses(klass)); break;
		case "debug":
			this.graphelem = renderer.renderText(this.x, renderer.calcY(15), ""+this.c, "debugfont", 'debug-msg', 'start'); break;
		case "barNumber":
			this.graphelem = renderer.renderText(this.x, y, ""+this.c, "measurefont", 'bar-number', "start");
			break;
		case "lyric":
			this.graphelem = renderer.renderText(this.x, y, this.c, "vocalfont", 'abc-lyric', "middle");
			break;
		case "chord":
			this.graphelem = renderer.renderText(this.x, y, this.c, 'gchordfont', "chord", "middle");
			break;
		case "decoration":
			this.graphelem = renderer.renderText(this.x, y, this.c, 'annotationfont', "annotation", "middle", true);
			break;
		case "text":
			this.graphelem = renderer.renderText(this.x, y, this.c, 'annotationfont', "annotation", "start", this.centerVertically);
			break;
		case "part":
			this.graphelem = renderer.renderText(this.x, y, this.c, 'partsfont', "part", "start");
			break;
		case "bar":
			this.graphelem = renderer.printStem(this.x, this.linewidth, y, (bartop)?bartop:renderer.calcY(this.pitch2)); break; // bartop can't be 0
		case "stem":
			this.graphelem = renderer.printStem(this.x, this.linewidth, y, renderer.calcY(this.pitch2)); break;
=======
			this.graphelem = renderer.printSymbol(this.x, this.pitch, this.c, this.scalex, this.scaley, renderer.addClasses('symbol')); break;
		case "debug":
			this.graphelem = renderer.renderText(this.x, this.y, this.c, "debugfont", 'debug-msg', 'start'); break;
		case "barNumber":
			this.graphelem = renderer.renderText(this.x, renderer.calcY(this.pitch), this.c, "measurefont", 'bar-number', "start");
			break;
		case "lyric":
			this.graphelem = renderer.renderText(this.x, renderer.calcY(renderer.layouter.minY-7), this.c, "vocalfont", 'abc-lyric');
			break;
		case "chord":
			this.graphelem = renderer.renderText(this.x, renderer.calcY(this.pitch), this.c, 'gchordfont', "start", "chord");
			break;
		case "text":
			this.graphelem = renderer.renderText(this.x, renderer.calcY(this.pitch), this.c, 'annotationfont', "start", "annotation");
			break;
		case "bar":
			this.graphelem = renderer.printStem(this.x, this.linewidth, renderer.calcY(this.pitch), (bartop)?bartop:renderer.calcY(this.pitch2)); break; // bartop can't be 0
		case "stem":
			this.graphelem = renderer.printStem(this.x, this.linewidth, renderer.calcY(this.pitch), renderer.calcY(this.pitch2)); break;
>>>>>>> origin/master
		case "ledger":
			this.graphelem = renderer.printStaveLine(this.x, this.x+this.w, this.pitch); break;
	}
	if (this.scalex!==1 && this.graphelem) {
<<<<<<< HEAD
		this.graphelem.scale(this.scalex, this.scaley, this.x, y);
=======
		this.graphelem.scale(this.scalex, this.scaley, this.x, renderer.calcY(this.pitch));
	}
	if (this.attributes) {
		this.graphelem.attr(this.attributes);
>>>>>>> origin/master
	}
	return this.graphelem;
};
