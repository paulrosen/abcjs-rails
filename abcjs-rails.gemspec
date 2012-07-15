# -*- encoding: utf-8 -*-
require File.expand_path('../lib/abcjs-rails/version', __FILE__)

Gem::Specification.new do |gem|
  gem.authors       = ["Paul Rosen"]
  gem.email         = ["paul@paulrosen.net"]
  gem.description   = "Delivery of the abcjs javascript library."
  gem.summary       = "This packages the abcjs javascript files in a gem for easy reuse in Rails applications."
  gem.homepage      = "http://paulrosen.net"

  gem.files = Dir["{lib,vendor}/**/*"] + ["LICENSE", "README.md"]
  gem.name          = "abcjs-rails"
  gem.require_paths = ["lib"]
  gem.version       = Abcjs::Rails::VERSION

  gem.add_dependency "railties", "~> 3.1"

end
