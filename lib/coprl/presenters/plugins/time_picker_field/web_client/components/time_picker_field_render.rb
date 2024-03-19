module Coprl
  module Presenters
    module Plugins
      module TimePickerField
        module WebClientComponents
          def view_dir_time_picker_field(pom)
            File.join(__dir__, '../../../../../../..', 'views', 'components')
          end

          def render_time_picker_field(comp,render:, components:, index:)
            render.call :erb, :time_picker_field, views: view_dir_time_picker_field(comp),
                        locals: {comp: comp,
                        components: components, index: index}
          end

          def render_header_time_picker_field(pom, render:)
            view_dir = File.join(__dir__, '../../../../../../..', 'views', 'components')
            render.call :erb, :time_picker_field_header, views: view_dir_time_picker_field(pom)
          end
        end
      end
    end
  end
end
