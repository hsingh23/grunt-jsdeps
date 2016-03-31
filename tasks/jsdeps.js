/*
 * grunt-jsdeps
 * https://github.com/harsingh/grunt-jsdeps
 *
 * Copyright (c) 2015 Harsh Singh
 * Licensed under the MIT license.
 */

'use strict';
var jsdeps = require("jsdeps");

module.exports = function(grunt) {
    var update = function(that) {
        try {
            var options = that.options({
                pathPrefix: "."
            });
            var files = grunt.file.expand(options.files, options.files.src);
            var beforeSourcePathToDependencies = grunt.file.read(options.dependencyTree);
            var sourcePathToDependencies = jsdeps.updateDependencies(options, files, options.dependencyTree);
            var dest = options.dest || options.dependencyTree; // If destination is not set, rewrite the dependency file
            
            if ( beforeSourcePathToDependencies !== JSON.stringify(sourcePathToDependencies)) {
                grunt.log.writeln("Updating " + dest);
                grunt.file.write(dest, sourcePathToDependencies);
            }
        } catch(e) {
            grunt.fatal(e);
        }
    };

    var create = function(that) {
        // Merge task-specific and/or target-specific options with these defaults.
        try {
            var options = that.options({
                pathPrefix: ".",
                sourcePath: ".",
                format: "json",
                dest: "./dependency-tree.json"
            });
            grunt.file.write(options.dest, jsdeps.buildDependencies(options));
        } catch(e) {
            grunt.fatal(e);
        }
    };

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('createJSDeps', 'Build a dependency tree from js files with microsoft type depenencies', function() {
        create(this);
    });

    grunt.registerMultiTask('asyncCreateJSDeps', 'Build a dependency tree from js files with microsoft type depenencies', function() {
        var done = this.async();
        create(this);
        done();
    });

    grunt.registerMultiTask('updateJSDeps', 'Build a dependency tree from js files with microsoft type depenencies. Currently only supports reading in json', function() {
        update(this);
    });

    grunt.registerMultiTask('asyncUpdateJSDeps', 'Build a dependency tree from js files with microsoft type depenencies. Currently only supports reading in json', function() {
        var done = this.async();
        update(this);
        done();
    });
};