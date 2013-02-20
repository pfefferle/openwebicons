module.exports = function(grunt) {

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
          'css/openwebicons-bootstrap.css': 'sass/openwebicons-bootstrap.scss'
        }
      },
      compressed: {
        options: {
          style: 'compressed'
        },
        files: {
          'css/openwebicons.min.css': 'sass/openwebicons.scss',
          'css/openwebicons-bootstrap.min.css': 'sass/openwebicons-bootstrap.scss'
        }
      },
      compact: {
        options: {
          style: 'compact'
        },
        files: {
          'css/weloveiconfonts.css': 'sass/weloveiconfonts.scss'
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-sass');

  // Default task(s).
  grunt.registerTask('default', ['sass']);

};