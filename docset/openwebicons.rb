#!/usr/bin/env ruby

require 'sass'
require 'fileutils'

# path to resources
ROOT_DIR = File.expand_path("./../", File.dirname(__FILE__))

# path to store assets
ASSETS_DIR = File.join(ROOT_DIR, "docset", "assets")

FileUtils.mkdir_p(ASSETS_DIR)
FileUtils.mkdir_p(File.join(ASSETS_DIR, 'font'))
FileUtils.mkdir_p(File.join(ASSETS_DIR, 'css'))

# Copy Assets to assets/
FileUtils.cp File.join(ROOT_DIR, 'css', 'openwebicons.css'), File.join(ASSETS_DIR, 'css/')
FileUtils.cp File.join(ROOT_DIR, 'font', 'openwebicons.eot'), File.join(ASSETS_DIR, 'font/')
FileUtils.cp File.join(ROOT_DIR, 'font', 'openwebicons.svg'), File.join(ASSETS_DIR, 'font/')
FileUtils.cp File.join(ROOT_DIR, 'font', 'openwebicons.ttf'), File.join(ASSETS_DIR, 'font/')
FileUtils.cp File.join(ROOT_DIR, 'font', 'openwebicons.woff'), File.join(ASSETS_DIR, 'font/')
FileUtils.cp File.join(ROOT_DIR, 'font', 'openwebicons.woff2'), File.join(ASSETS_DIR, 'font/')


# the icon vars
vars = File.read(File.join(ROOT_DIR, 'sass', '_vars.scss'))

# initiate SaSS engine
sass_engine = Sass::Engine.new(vars, :syntax => :scss, :load_paths => [File.join(ROOT_DIR, 'sass')])

# parse icons
icons = sass_engine.to_tree.children.first.expr.children

# Generate Dash Cheatsheet
cheatsheet do
  title "OpenWeb Icons"
  docset_file_name 'openwebicons'
  keyword 'owi'
  resources ASSETS_DIR
  source_url 'http://pfefferle.github.io/openwebicons'

  style <<-EOS
    @import 'assets/css/openwebicons.css';

    [class^="openwebicons-"]:before, [class*=" openwebicons-"]:before {
      font-size: 40px;
    }
  EOS

  category do
    id "Monochrome Icons"

    icons.each do |icon|
      entry do
        name icon.children.first.value.to_s
        command "openwebicons-#{icon.children.first.value.to_s}"
        td_notes "<i class='openwebicons-#{icon.children.first.value.to_s}'></i>"
        td_notes <<-EOS
          ```html
          <i class='openwebicons-#{icon.children.first.value.to_s}'></i>
          ```
        EOS
      end
    end
  end

  category do
    id "Colored Icons"

    icons.each do |icon|
      if not icon.children[2].value.to_s == "\"monochrome\""
        entry do
          name "#{icon.children.first.value.to_s}"
          command "openwebicons-#{icon.children.first.value.to_s}-colored"
          td_notes "<i class='openwebicons-#{icon.children.first.value.to_s}-colored'></i>"
          td_notes <<-EOS
            ```html
            <i class="openwebicons-#{icon.children.first.value.to_s}-colored"></i>
            ```
          EOS
        end
      end
    end
  end

  notes <<-EOS
  * OpenWeb Icons by Matthias Pfefferle - http://notizblog.org/
  EOS
end
