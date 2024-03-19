require_relative 'time_picker_field_component'

module Coprl
  module Presenters
    module Plugins
      module TimePickerField
        module DSLComponents
          def time_picker_field(**attributes, &block)
            self << TimePickerField::TimePickerFieldComponent.new(parent: self, **attributes, &block)
          end
        end
      end
    end
  end
end
