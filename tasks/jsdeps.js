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
      var m;
      if (regex.global) {
          while (m = regex.exec(str)) {
              res.push(m[1]);
          }
      } else {
          if (m = regex.exec(str)) {
              res.push(m[1]);
          }
      }
      return res;
  };
  var getReferences = function(absolutePath) {
    var file = grunt.file.read(absolutePath);
    return matchAll(file, REF_REGEX);
  };

  var getPrefixRelativePath = function (prefix, absolutePath) {
    return "/" + path.relative(prefix, absolutePath).replace(/\\/g, "/");
  };

  var processFile = function (absolutePath, options, depTree) {

    var parentDirectory = path.dirname(absolutePath);

    var refs = getReferences(absolutePath)
    .map(function (x) { return path.resolve(parentDirectory, x); });

    if (refs.length === 0) {
      return;
    }

    refs.forEach(function (x) {
      if (!grunt.file.isFile(x)) {
        grunt.warn("'" + x + "'' cannot be not found\n(referenced from '" + absolutePath + "'')");
      }
    });

    depTree[getPrefixRelativePath(options.pathPrefix, absolutePath)] = refs
      .map(function (x) { return getPrefixRelativePath(options.pathPrefix, x); });
  };

  var isDirectoryIgnored = function (absolutePath) {
    return grunt.file.isFile(absolutePath, "jslignore.txt");
  };

  var createXMLStringFromTree = function(depTree) {
    var xml = "<?xml version=\"1.0\"?>\n" +
    "<dependencies xmlns=\"http://schemas.vistaprint.com/VP.Cap.Dev.JavaScriptDependencies.Dependency.xsd\">\n";

    for (var f in depTree) {
      xml += "  <file path=\"" + f + "\">\n";
      /*jshint -W083 */
      xml += depTree[f].map(function (x) { return "    <dependency>" + x + "</dependency>"; }).join("\n") + "\n";
      xml += "  </file>\n";
    }
    xml += "</dependencies>\n";

    return xml;
  };

  var createJSONStringFromTree = function(depTree) {
    // Takes a depTree: {"a.js":["b.js","c.js"], "b.js":["d.js"]} 
    // returns formatedDepTree as json string: '[{source:"a.js", dependencies:["b.js","c.js"]},{source:"b.js", dependencies:["d.js"]}]'
    var formatedDepTree = [];
    for (var dep in depTree) {
      if( depTree.hasOwnProperty(dep) ) {
        formatedDepTree.push({source: dep, dependencies: depTree[dep]});
      }
    }
    return JSON.stringify(formatedDepTree, null, 2) + "\n";
  };
  var readDependencyTree = function(formatedDepTree) {
    // this method reads json constructed by createJSONStringFromTree and returns a depTree
    var depTree = {};
    formatedDepTree.forEach(function(dep){
      depTree[dep.source] = dep.dependencies;
    });
    return depTree;
  };

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('createJSDeps', 'Build a dependency tree from js files with microsoft type depenencies', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      pathPrefix: ".",
      sourcePath: ".",
      format: "json",
      dest: "./dependency-tree.json"
    });
    grunt.verbose.subhead(options);
    var depTree = {};

    try {
      fsutil.recurseDirSync(
        options.sourcePath,
        function (x) {
          processFile(x, options, depTree);
        },
        function (x) { return !isDirectoryIgnored(x); }
        );
    } catch (ex) {
      grunt.fatal(ex.message + "\n");
      return -1;
    }
    grunt.file.write(options.dest, options.format==="xml" ? createXMLStringFromTree(depTree) : createJSONStringFromTree(depTree));
  });

  grunt.registerMultiTask('updateJSDeps', 'Build a dependency tree from js files with microsoft type depenencies. Currently only supports reading in json', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options();
    var files = grunt.file.expand(this.data.files,this.data.files.src);
    var depTree = readDependencyTree(grunt.file.readJSON(options.dependencyTree));
    var dest = options.dest || options.dependencyTree;
    files.forEach(function(file){processFile(file, options, depTree);});
    grunt.file.write(dest, createJSONStringFromTree(depTree));
  });
};
