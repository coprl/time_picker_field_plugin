module Coprl
  module Presenters
    module Plugins
      module TimePickerField
        class TimePickerFieldComponent < DSL::Components::TextField
          attr_reader :interval

          def initialize(**attributes, &block)
            @interval = attributes[:interval] || 900

            super(type: :time_picker_field, **attributes, &block)
            pattern "\\d\\d?:\\d\\d\\s*([aApP][mM])?"

            expand!
          end
        end
      end
    end
  end
end
