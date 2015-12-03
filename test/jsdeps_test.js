'use strict';

var grunt = require('grunt');
var runTask = require('grunt-run-task');
/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.jsdeps = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  simple: function(test) {
    test.expect(1);
    var actual = grunt.file.read('tmp/simple.json');
    var expected = grunt.file.read('test/expected/simple.json');
    test.equal(actual, expected, 'should describe what the default behavior is.');
    test.done();
  },
  relativeRoot: function(test) {
    test.expect(1);
    var actual = grunt.file.read('tmp/relativeRoot.json');
    var expected = grunt.file.read('test/expected/relativeRoot.json');
    test.equal(actual, expected, 'should describe what the default behavior is.');
    test.done();
  },
  xml: function(test) {
    test.expect(1);
    var actual = grunt.file.read('tmp/simple.xml');
    var expected = grunt.file.read('test/expected/simple.xml');
    test.equal(actual, expected, 'should describe what the default behavior is.');
    test.done();
  }
  // broken: function(test){
  //   var task = runTask.task("jsdeps", {
  //     broken: {
  //       options: {
  //         root: ".",
  //         sourcePath: "test/fixtures/broken",
  //         format: "json",
  //         dest: "./tmp/broken.json"
  //       }
  //     }
  //   });
  //   task.run("broken", function done(err) {
  //     console.log("DONE", err);
  //   });
  //   test.done();
  // }
};
