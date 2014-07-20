# Abcjs::Rails

This gem delivers the abcjs javascript library as part of the Rails asset pipeline. It doesn't add any
functionality, other than making available all of the uncompressed js files.

## Installation

Add this line to your application's Gemfile:

    gem 'abcjs-rails'

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install abcjs-rails

## Usage

To include abcjs in your Rails app, add this line to application.js:

	//= require abcjs-rails

See https://github.com/paulrosen/abcjs for complete
usage of abcjs. There is no additional functionality supplied by this gem.

Here is a cheatsheet for using the functionality:

	new ABCJS.Editor("abc", { canvas_id: "canvas0", midi_id:"midi", warnings_id:"warnings" });
	ABCJS.numberOfTunes(abcString);
	ABCJS.renderAbc(div, abcString, parserParams, printerParams, renderParams);
	ABCJS.renderMidi(div, abcString, parserParams, midiParams, renderParams);


## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
