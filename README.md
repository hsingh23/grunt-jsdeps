# grunt-jsdeps

> Build a dependency tree from js files with microsoft type depenencies

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-jsdeps --save
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-jsdeps');
```

## The "jsdeps" task

### Overview
In your project's Gruntfile, add a section named `jsdeps` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  jsdeps: {
    your_target: {
      // Target-specific file lists and/or options go here.
      options: {
        root: ".", // from where the directory starts
        sourcePath: "test/fixtures/simple", // dir where your js files are stored - they will be recursively scanned
        format: "json", // can also be xml
        dest: "./tmp/simple.json" // name of destination file or path to it
      }
    },
  },
});
```

### Options

#### options.separator
Type: `String`
Default value: `',  '`

A string value that is used to do something with whatever.

#### options.punctuation
Type: `String`
Default value: `'.'`

A string value that is used to do something else with whatever else.

### Usage Example

#### Simple case
In this example the following options are used

```js
grunt.initConfig({
  jsdeps: {
    simple: {
      options: {
        root: ".",
        sourcePath: "test/fixtures/simple",
        format: "json",
        dest: "./tmp/simple.json"
      }
    }
  }
});
```

where the following files have these references
```shell
test/fixtures/simple/a.js
1:/// <reference path="b.js" />
2:/// <reference path="folder/c.js" />

test/fixtures/simple/folder/c.js
1:/// <reference path="d.js" />
```

and the destination file looks like this:
```json
{
  "/test/fixtures/simple/a.js": [
    "/test/fixtures/simple/b.js",
    "/test/fixtures/simple/folder/c.js"
  ],
  "/test/fixtures/simple/folder/c.js": [
    "/test/fixtures/simple/folder/d.js"
  ]
}
```

#### Relative Root example
In this example the following options are used

```js
grunt.initConfig({
  jsdeps: {
    simple: {
      options: {
        root: "test/fixtures",
        sourcePath: "test/fixtures/simple",
        format: "json",
        dest: "./tmp/simple.json"
      }
    }
  }
});
```

where the following files have these references
```shell
test/fixtures/simple/a.js
1:/// <reference path="b.js" />
2:/// <reference path="folder/c.js" />

test/fixtures/simple/folder/c.js
1:/// <reference path="d.js" />
```

and the destination file looks like this:
```json
{
  "/simple/a.js": [
    "/simple/b.js",
    "/simple/folder/c.js"
  ],
  "/simple/folder/c.js": [
    "/simple/folder/d.js"
  ]
}

```

#### XML case
In this example the following options are used

```js
grunt.initConfig({
  jsdeps: {
    simple: {
      options: {
        root: ".",
        sourcePath: "test/fixtures/simple",
        format: "xml",
        dest: "./tmp/simple.xml"
      }
    }
  }
});
```

where the following files have these references
```shell
test/fixtures/simple/a.js
1:/// <reference path="b.js" />
2:/// <reference path="folder/c.js" />

test/fixtures/simple/folder/c.js
1:/// <reference path="d.js" />
```

and the destination file looks like this:
```json
{
  "/test/fixtures/simple/a.js": [
    "/test/fixtures/simple/b.js",
    "/test/fixtures/simple/folder/c.js"
  ],
  "/test/fixtures/simple/folder/c.js": [
    "/test/fixtures/simple/folder/d.js"
  ]
}
```
