/*
 * grunt-jsdeps
 * https://github.com/harsingh/grunt-jsdeps
 *
 * Copyright (c) 2015 Harsh Singh
 * Licensed under the MIT license.
 */

 'use strict';
 var path = require("path");
 var fs = require("fs");

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
  }
  var getReferences = function(absolutePath) {
    var file = grunt.file.read(absolutePath);
    return matchAll(file, REF_REGEX);
  };

  var getRootRelativePath = function (root, absolutePath) {
    return "/" + path.relative(root, absolutePath).replace(/\\/g, "/");
  };

  var processFile = function (absolutePath, options, depTree) {

    var parentDirectory = path.dirname(absolutePath);

    var refs = getReferences(absolutePath)
    .map(function (x) { return path.resolve(parentDirectory, x); });

    if (refs.length === 0) {
      return;
    }

    refs.forEach(function (x) {
      if (!fs.existsSync(x)) {
        grunt.warn("'" + x + "'' cannot be not found\n(referenced from '" + absolutePath + "'')");
      }
    });

    depTree[getRootRelativePath(options.root, absolutePath)] = refs
    .map(function (x) { return getRootRelativePath(options.root, x); });
  };

  var isDirectoryIgnored = function (absolutePath) {
    return fs.existsSync(path.join(absolutePath, "jslignore.txt"));
  };

  var formatXml = function(depTree) {
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

  var formatJson = function(depTree) {
    return JSON.stringify(depTree, null, 2) + "\n";
  };


  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('jsdeps', 'Build a dependency tree from js files with microsoft type depenencies', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      root: ".",
      sourcePath: ".",
      format: "json",
      dest: "./dependency-tree.json"
    });
  console.log(options);
  var files = [];
  var depTree = {};

  try {
    fsutil.recurseDirSync(
      options.sourcePath,
      function (x) {
        files.push(x);
        processFile(x, options, depTree);
      },
      function (x) { return !isDirectoryIgnored(x); }
      );
  } catch (ex) {
    grunt.fatal(ex.message + "\n");
    return -1;
  }
  grunt.file.write(options.dest, options.xml ? formatXml(depTree) : formatJson(depTree));
});
};
