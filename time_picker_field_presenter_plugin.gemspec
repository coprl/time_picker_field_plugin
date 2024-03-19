lib = File.expand_path("../lib", __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'time_picker_field_presenter_plugin/version'

Gem::Specification.new do |spec|
  spec.name          = 'time_picker_field_presenter_plugin'
  spec.version       = TimePickerFieldPresenterPlugin::VERSION
  spec.authors       = ["Nick Miller"]
  spec.email         = ["nick@evvnt.com"]

  spec.summary       = %q{A COPRL presenter plugin that renders a simple time picker form field}
  spec.homepage      = 'https://github.com/coprl/time_picker_field_presenter_plugin'
  spec.license       = 'MIT'

  spec.files         = `git ls-files -z`.split("\x0").reject do |f|
    f.match(%r{^(test|spec|features)/})
  end
  spec.require_paths = ['lib']

  spec.add_development_dependency 'bundler', "~> 2.0"
  spec.add_development_dependency "rake", ">= 12.3.3"
end
