/* jshint strict: true */
/* global module: true */
module.exports = function (grunt) {

  'use strict';
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      expanded: {
        options: {
          style: 'expanded'
        },
        files: {
          'css/openwebicons.css': 'sass/openwebicons.scss',
          'css/openwebicons-bootstrap.css': 'sass/openwebicons-bootstrap.scss',
          'css/openwebicons-cdn.css': 'sass/openwebicons-cdn.scss',
          'styleguide/css/openwebicons-styleguide.css': 'sass/openwebicons-styleguide.scss'
        }
      },
      compressed: {
        options: {
          style: 'compressed'
        },
        files: {
          'css/openwebicons.min.css': 'sass/openwebicons.scss',
          'css/openwebicons-bootstrap.min.css': 'sass/openwebicons-bootstrap.scss',
          'css/openwebicons-cdn.min.css': 'sass/openwebicons-cdn.scss',
          'css/weloveiconfonts.css': 'sass/weloveiconfonts.scss'
        }
      }
    },
    // generate a TTF file from the SVG file
    svg2ttf: {
      svg2ttf: {
        src: 'source/*.svg',
        dest: 'source/'
      }
    },

    kss: {
      options: {
        'css': ['css/openwebicons-styleguide.css']
      },
      dist: {
        files: {
          'styleguide': ['styleguide/css']
        }
      }
    },

    update_json: {
      // update bower.json with data from package.json
      bower: {
        src: 'package.json', // where to read from
        dest: 'bower.json', // where to write to
        // the fields to update, as a String Grouping
        fields: {
          'name': null,
          'version': null,
          'description': null
        }
      },
      // update component.json with data from package.json
      // component.json fields are a named a bit differently from
      // package.json, so let's tell update_json how to map names
      component: {
        src: 'package.json',
        // reuse the task-level `src`
        dest: 'component.json', // where to write to
        fields: {
          'name': null,
          'author': null,
          'description': null,
          'version': null,
          'keywords': null,
          'main': null,
          'development': 'devDependencies',
          'license': null
        }
      },
      // `composer` has the same data as `package`, but has some tricky
      // semantics
      composer: {
        src: 'package.json',
        // again, reuse the task-level `src`
        dest: 'composer.json',
        // the fields in an Array Grouping with some embedded Object Groupings
        fields: {
          'description': null,
          'keywords': null,
          'license': null
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-update-json');
  grunt.loadNpmTasks('grunt-svg2ttf');
  grunt.loadNpmTasks('grunt-kss');

  // generate ttf file using the svg file.
  grunt.registerTask('font', ['svg2ttf']);

  // generate styleguide
  grunt.registerTask('styleguide', ['sass', 'kss']);

  // Default task(s).
  grunt.registerTask('default', ['sass', 'update_json']);

};
