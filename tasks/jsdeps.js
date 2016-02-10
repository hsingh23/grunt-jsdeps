/*
 * grunt-jsdeps
 * https://github.com/harsingh/grunt-jsdeps
 *
 * Copyright (c) 2015 Harsh Singh
 * Licensed under the MIT license.
 */

'use strict';
var path = require("path");

var fsutil = require("./file-system-util");

module.exports = function(grunt) {
    var REF_REGEX = /\/\/\/\s*<reference\s+path\s*=\s*["'](.*?)["']/gim;
    var matchAll = function(str, regex) {
        var res = [];
        var currentMatch;
        if (regex.global) {
            while (currentMatch = regex.exec(str)) {
                res.push(currentMatch[1]);
            }
        } else {
            if (currentMatch = regex.exec(str)) {
                res.push(currentMatch[1]);
            }
        }
        return res;
    };
    var getReferences = function(absolutePath) {
        var file = grunt.file.read(absolutePath);
        return matchAll(file, REF_REGEX);
    };

    var getPrefixRelativePath = function(prefix, absolutePath) {
        return "/" + path.relative(prefix, absolutePath).replace(/\\/g, "/");
    };

    var processFile = function(absolutePath, options, sourcePathToDependencies) {
        var parentDirectory = path.dirname(absolutePath);

        var refs = getReferences(absolutePath)
            .map(function(x) {
                return path.resolve(parentDirectory, x);
            });

        if (refs.length === 0) {
            return;
        }

        refs.forEach(function(x) {
            if (!grunt.file.isFile(x)) {
                grunt.warn("'" + x + "'' cannot be not found\n(referenced from '" + absolutePath + "'')");
            }
        });

        var sourcePath = getPrefixRelativePath(options.pathPrefix, absolutePath);
        delete sourcePathToDependencies[sourcePath];
        sourcePathToDependencies[sourcePath] = refs.map(function(referencePath) {
                return getPrefixRelativePath(options.pathPrefix, referencePath);
            });
    };

    var isDirectoryIgnored = function(absolutePath) {
        return grunt.file.isFile(absolutePath, "jslignore.txt");
    };

    var createXMLStringFromTree = function(sourcePathToDependencies) {
        var xml = "<?xml version=\"1.0\"?>\n" +
            "<dependencies xmlns=\"http://schemas.vistaprint.com/VP.Cap.Dev.JavaScriptDependencies.Dependency.xsd\">\n";

        for (var sourcePath in sourcePathToDependencies) {
            xml += "  <file path=\"" + sourcePath + "\">\n";
            /*jshint -W083 */
            xml += sourcePathToDependencies[sourcePath].map(function(dependencyPath) {
                    return "    <dependency>" + dependencyPath + "</dependency>";
                }).join("\n") + "\n";
            xml += "  </file>\n";
        }
        xml += "</dependencies>\n";

        return xml;
    };

    var createJSONStringFromTree = function(sourcePathToDependencies) {
        // Takes a sourcePathToDependencies: {"a.js":["b.js","c.js"], "b.js":["d.js"]} 
        // returns formatedSourcePathToDependencies as json string: '[{source:"a.js", dependencies:["b.js","c.js"]},{source:"b.js", dependencies:["d.js"]}]'
        var formatedSourcePathToDependencies = [];
        var spaces = 2;
        for (var sourcePath in sourcePathToDependencies) {
            if (sourcePathToDependencies.hasOwnProperty(sourcePath)) {
                formatedSourcePathToDependencies.push({
                    source: sourcePath,
                    dependencies: sourcePathToDependencies[sourcePath]
                });
            }
        }
        return JSON.stringify(formatedSourcePathToDependencies, null, spaces) + "\n";
    };

    var readDependencyTree = function(formatedSourcePathToDependencies) {
        // Reads json constructed by createJSONStringFromTree and returns a sourcePathToDependencies
        var sourcePathToDependencies = {};
        formatedSourcePathToDependencies.forEach(function(dependencyData) {
            sourcePathToDependencies[dependencyData.source] = dependencyData.dependencies;
        });
        return sourcePathToDependencies;
    };

    var update = function(that) {
        var options = that.options({
            pathPrefix: "."
        });
        var files = grunt.file.expand(options.files, options.files.src);
        var sourcePathToDependencies = readDependencyTree(grunt.file.readJSON(options.dependencyTree));
        var beforeSourcePathToDependencies = JSON.stringify(sourcePathToDependencies);
        var dest = options.dest || options.dependencyTree; // If destination is not set, rewrite the dependency file
        files.forEach(function(file) {
            processFile(file, options, sourcePathToDependencies);
        });
        if ( beforeSourcePathToDependencies !== JSON.stringify(sourcePathToDependencies)) {
            grunt.log.writeln("Updating " + dest);
            grunt.file.write(dest, createJSONStringFromTree(sourcePathToDependencies));
        }
    };

    var create = function(that) {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = that.options({
            pathPrefix: ".",
            sourcePath: ".",
            format: "json",
            dest: "./dependency-tree.json"
        });
        grunt.verbose.subhead(options);
        var sourcePathToDependencies = {};

        try {
            fsutil.recurseDirSync(
                options.sourcePath,
                function(sourcePath) {
                    processFile(sourcePath, options, sourcePathToDependencies);
                },
                function(sourcePath) {
                    return !isDirectoryIgnored(sourcePath);
                }
            );
        } catch (ex) {
            grunt.fatal(ex.message + "\n");
            return -1;
        }
        grunt.file.write(options.dest, options.format === "xml" ? createXMLStringFromTree(sourcePathToDependencies) : createJSONStringFromTree(sourcePathToDependencies));
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