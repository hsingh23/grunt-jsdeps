/*
 * grunt-jsdeps
 * https://github.com/harsingh/grunt-jsdeps
 *
 * Copyright (c) 2015 Harsh Singh
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    updateJSDeps: {
      // currently we can only read in json
      simple: {
        files: {
          expand: true,
          src: ["test/fixtures/update/simple/**/*.js", "!test/fixtures/update/simple/a.js"],
          filter: function(path) {
            return path.search("b.js") === -1;
          }
        },
        options: {
          dependencyTree: "test/fixtures/update/simple/simple.json",
          dest: "./tmp/update_simple.json",
          format: "<%= createJSDeps.simple.options.format %>",
          pathPrefix: "."
        }
      },
      relativeRoot: {
        files: {
          expand: true,
          src: ["test/fixtures/update/simple/**/*.js"],
        },
        options: {
          dependencyTree: "test/fixtures/update/simple/relativeRoot.json",
          dest: "./tmp/update_relativeRoot.json",
          pathPrefix: "test/fixtures/update/simple",
        }
      }
    },
    createJSDeps: {
      simple: {
        options: {
          pathPrefix: ".",
          sourcePath: "test/fixtures/simple",
          format: "json",
          dest: "./tmp/simple.json"
        }
      },
      relativeRoot: {
        options: {
          pathPrefix: "test/fixtures/",
          sourcePath: "test/fixtures/simple",
          format: "json",
          dest: "./tmp/relativeRoot.json"
        }
      },
      xml: {
        options: {
          pathPrefix: ".",
          sourcePath: "test/fixtures/simple",
          format: "xml",
          dest: "./tmp/simple.xml"
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('jsdeps', ['createJSDeps', 'updateJSDeps']);
  grunt.registerTask('test', ['clean', 'jsdeps', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
