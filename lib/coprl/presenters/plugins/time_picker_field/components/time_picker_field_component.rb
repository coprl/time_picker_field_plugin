module Coprl
  module Presenters
    module Plugins
      module TimePickerField
        class TimePickerFieldComponent < DSL::Components::TextField
          attr_reader :interval

          def initialize(**attributes, &block)
            @interval = attributes[:interval] || 900

            super(type: :time_picker_field, **attributes, &block)

            # rudimentary pattern - doesn't catch everything.
            pattern %r{([0-1]?[0-9]:[0-5][0-9]\s*[aApP][mM]?)|([0-2][0-9]:[0-5][0-9])}.source

            expand!
          end
        end
      end
    end
  end
end
