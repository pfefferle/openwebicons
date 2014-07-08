module.exports = function (grunt) {

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
					'css/openwebicons-cdn.css': 'sass/openwebicons-cdn.scss'
				}
			},
			compressed: {
				options: {
					style: 'compressed'
				},
				files: {
					'css/openwebicons.min.css': 'sass/openwebicons.scss',
					'css/openwebicons-bootstrap.min.css': 'sass/openwebicons-bootstrap.scss',
					'css/openwebicons-cdn.min.css': 'sass/openwebicons-cdn.scss'
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
		},

		svg2ttf: {
			svg2ttf: {
				src: 'source/*.svg',
				dest: 'source/'
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
				fields: { // the fields to update
					// notice how this time we're passing a hash instead
					// of an array; this allows us to map the field names.
					// We still specify all the names we want, and additionally
					// we also specify the target name in the detination file.
					// to            from
					// -----------   -------------------
					'name': null, // null means 'leave as is'
					'description': 'description', // but feel free to type the field name twice
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
					'license': null,
					'version': null
				}
			}
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-update-json');
	grunt.loadNpmTasks('grunt-svg2ttf');

	// Default task(s).
	grunt.registerTask('default', ['sass', 'update_json', 'svg2ttf']);

};