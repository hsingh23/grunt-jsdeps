# grunt-jsdeps

> Build a dependency tree from js files with microsoft type dependencies

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
        pathPrefix: ".", // from where the directory starts
        sourcePath: "test/fixtures/simple", // dir where your js files are stored - they will be recursively scanned
        format: "json", // can also be xml
        dest: "./tmp/simple.json" // name of destination file or path to it
      }
    },
  },
});
```

### Options

#### options.pathPrefix
Type: `String`
Default value: `.`

A string path of what to exclude when writing the path. For example: with pathPrefix = '/test/fixtures/simple/', the path "/test/fixtures/simple/b.js" will be written as "/b.js"


#### options.sourcePath
Type: `String`
Default value: `.`

A string path of the root directory to scan to find js files


#### options.format
Type: `String`
Default value: `json`

Can be either json or xml. The xml option is not currently supported by the update multitask.


#### options.dest
Type: `String`
Default value: `./dependency-tree.json`

The place the output file is written.

### Update Task comments

The update task doesn't take a sourcePath, rather it takes a list of files that have changed. The `files.src` is a list of globs of what to include and exclude (to negate a path, prefix it with `!`) In addition you can speific a filter function. This can, for example, watch the files that changed and edit an enviornment variable. Then the filter function can read the env variable when the task is kicked off and only add the files that changed.  


```js
files: {
  expand: true,
  // src: ["test/fixtures/update/simple/**/*.js"]
  src: ["test/fixtures/update/simple/**/*.js", "!test/fixtures/update/simple/a.js"],
  filter: function(path) {
    return path.search("b.js") === -1;
  }
},
```


### Usage Example

#### Simple case
In this example the following options are used

```js
grunt.initConfig({
  jsdeps: {
    simple: {
      options: {
        pathPrefix: ".",
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
[
  {
    "source": "/test/fixtures/simple/a.js",
    "dependencies": [
      "/test/fixtures/simple/b.js",
      "/test/fixtures/simple/folder/c.js"
    ]
  },
  {
    "source": "/test/fixtures/simple/folder/c.js",
    "dependencies": [
      "/test/fixtures/simple/folder/d.js"
    ]
  }
]
```

#### Relative path example
In this example the pathPrefix is set to remove the prefix "test/fixtures" from the generated file 

```js
grunt.initConfig({
  jsdeps: {
    simple: {
      options: {
        pathPrefix: "test/fixtures",
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
[
  {
    "source": "/simple/a.js",
    "dependencies": [
      "/simple/b.js",
      "/simple/folder/c.js"
    ]
  },
  {
    "source": "/simple/folder/c.js",
    "dependencies": [
      "/simple/folder/d.js"
    ]
  }
]

```

#### XML case
In this example the following options are used

```js
grunt.initConfig({
  jsdeps: {
    xml: {
      options: {
        pathPrefix: ".",
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
