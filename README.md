# grunt-jsdeps

> **Status: archived / legacy.** This is a Grunt-era (2015–2016) plugin, kept
> for historical reference and for builds that still run Grunt 0.4–1.x on
> legacy Node toolchains. It is not actively developed. For new projects,
> prefer modern bundlers/dependency analyzers (e.g. eslint-plugin-import,
> madge, or your bundler's dependency graph). See [CHANGELOG.md](CHANGELOG.md)
> for the full release history and the
> [architectural diary](architectural-diary/main.md) for design context.

## What and why

`grunt-jsdeps` is a [Grunt](http://gruntjs.com/) plugin that builds a
**dependency tree from JavaScript files** that declare their dependencies with
Microsoft-style reference tags:

```js
/// <reference path="b.js" />
```

This reference-tag convention comes from legacy Visual Studio / MSBuild-era
JavaScript projects, where scripts were loaded via generated `<script>` lists
rather than modules. The plugin scans a source tree, resolves every
`/// <reference path="..." />` directive, and writes the resulting graph to a
JSON (or XML) file that build scripts could consume to emit scripts in
dependency order.

The plugin is a **thin wrapper** around the core [`jsdeps`](https://www.npmjs.com/package/jsdeps)
npm package: Grunt handles option merging, file expansion, and task
lifecycle, while `jsdeps.buildDependencies` / `jsdeps.updateDependencies` do
the actual graph work.

## Features

- **Full-build task** (`createJSDeps`) — recursively scans `sourcePath`,
  resolves reference tags, writes the whole tree as JSON or XML.
- **Incremental update task** (`updateJSDeps`) — reads an existing JSON tree
  and re-processes only the files matched by change-driven globs/filters;
  entries for files whose references were removed are pruned.
- **Async variants** (`asyncCreateJSDeps`, `asyncUpdateJSDeps`) — the same
  tasks wrapped for Grunt's async task protocol (`this.async()`), suitable
  for watch-style pipelines.
- **Configurable path prefixing** (`pathPrefix`) to strip a leading path
  segment from all emitted paths.
- **Failure behavior** — exceptions thrown by the `jsdeps` library are caught
  and routed to `grunt.fatal`, failing the build cleanly.

## Stack

- **Runtime:** Node.js (`>= 0.8.0` per `package.json` engines; realistically
  the legacy 0.10–8.x era), Grunt `>=0.4.5` as a peer dependency
  (grunt `~1.0.1` for development).
- **Core logic:** [`jsdeps`](https://www.npmjs.com/package/jsdeps) `^1.0.2`
  (dependency scanning and tree serialization).
- **Tooling:** `grunt-contrib-jshint` (lint), `grunt-contrib-clean`,
  `grunt-contrib-nodeunit` + `grunt-run-task` (tests), jshint via `.jshintrc`.
- **Language:** plain ES5 JavaScript, CommonJS modules.

## Quickstart

Install (Grunt `~0.4.5` through `1.x`):

```shell
npm install grunt-jsdeps --save
```

Enable in your Gruntfile:

```js
grunt.loadNpmTasks('grunt-jsdeps');
```

Configure a full build:

```js
grunt.initConfig({
  createJSDeps: {
    simple: {
      options: {
        pathPrefix: ".",                // prefix stripped from emitted paths
        sourcePath: "test/fixtures/simple", // root dir scanned recursively
        format: "json",                 // "json" or "xml"
        dest: "./tmp/simple.json"       // output file
      }
    }
  }
});
```

Given these references:

```shell
test/fixtures/simple/a.js
1:/// <reference path="b.js" />
2:/// <reference path="folder/c.js" />

test/fixtures/simple/folder/c.js
1:/// <reference path="d.js" />
```

the output file looks like:

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

### Options (`createJSDeps` / `asyncCreateJSDeps`)

#### options.pathPrefix
Type: `String` — Default: `.`

Path prefix excluded when writing paths. With `pathPrefix:
'/test/fixtures/simple/'`, the path `/test/fixtures/simple/b.js` is written
as `/b.js`. (Set it to e.g. `"test/fixtures"` to emit root-relative paths —
see the `relativeRoot` target in `Gruntfile.js`.)

#### options.sourcePath
Type: `String` — Default: `.`

Root directory scanned recursively for `.js` files.

#### options.format
Type: `String` — Default: `json`

Either `json` (array of `{source, dependencies}` records) or `xml`. The XML
option is not supported by the update multitask.

#### options.dest
Type: `String` — Default: `./dependency-tree.json`

Destination file for the generated tree.

### Update task (`updateJSDeps` / `asyncUpdateJSDeps`)

The update task takes no `sourcePath`; instead it takes the list of files
that changed, via `options.files` (standard Grunt file expansion):

```js
grunt.initConfig({
  updateJSDeps: {
    simple: {
      options: {
        files: {
          expand: true,
          // globs; prefix with ! to negate
          src: ["test/fixtures/update/simple/**/*.js", "!test/fixtures/update/simple/a.js"],
          filter: function(path) {
            return path.search("b.js") === -1; // custom filter fn
          }
        },
        dependencyTree: "test/fixtures/update/simple/simple.json", // existing tree to update
        dest: "./tmp/update_simple.json",
        pathPrefix: "."
      }
    }
  }
});
```

The `filter` function enables change-driven workflows — for example, a
watcher records changed files into an environment variable and the filter
selects only those when the task runs. If `dest` is not set, the dependency
tree file itself is rewritten in place; the task skips writing when nothing
changed.

## Repository structure

```
Gruntfile.js            – dev tasks: jshint, clean, nodeunit; createJSDeps/updateJSDeps test targets
tasks/jsdeps.js         – the plugin: registers createJSDeps, updateJSDeps and their async variants
tasks/file-system-util.js – recursive dir walking / path separators (legacy helper from the CLI era)
test/jsdeps_test.js     – nodeunit suite comparing generated trees against expected outputs
test/fixtures/          – simple, broken, and update fixture trees with reference tags
test/expected/          – golden JSON/XML outputs
package.json            – plugin manifest; peer dep grunt >=0.4.5, runtime dep jsdeps ^1.0.2
```

## Environment variables

None. The plugin reads no environment variables; the `options.files.filter`
hook is the supported way to feed external state (such as a changed-file list
maintained in an env var by a watcher) into the update task.

## License

MIT — see [LICENSE-MIT](LICENSE-MIT). Original author: Harsh Singh.
