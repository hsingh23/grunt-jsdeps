# One-shot recreation prompt — grunt-jsdeps

Give this prompt to a coding agent to recreate this repository from scratch.
The result should be functionally equivalent to `grunt-jsdeps@1.0.1`.

---

## Goal

Build **grunt-jsdeps**, a Grunt plugin (npm package `grunt-jsdeps`) that
generates a JavaScript dependency-tree file from source files declaring
Microsoft-style reference tags:

```js
/// <reference path="b.js" />
```

It must offer a **full-build** task (recursive scan of a source directory)
and an **incremental update** task (re-process only changed files against an
existing JSON tree), each in sync and async Grunt variants. The final plugin
is deliberately a **thin wrapper** around a core `jsdeps` package that owns
the graph algorithm; recreate both the wrapper and a minimal core library
with the API described below.

## Stack

- Node.js (ES5, CommonJS, `'use strict'`), Grunt `>=0.4.5` peer dependency
  (dev against `~1.0.1`).
- Runtime dependency: `jsdeps` (`^1.0.2`) — the core library you also build.
- Dev tooling: `grunt-contrib-jshint` (config via `.jshintrc`),
  `grunt-contrib-clean`, `grunt-contrib-nodeunit`, `grunt-run-task`.
- Tests: nodeunit, golden-file comparison.
- License: MIT (`LICENSE-MIT`), 4-space indentation, jshint-clean ES5.

## Data model

Dependency tree, JSON form (array of records, **not** a path-keyed map):

```json
[
  { "source": "/test/fixtures/simple/a.js",
    "dependencies": ["/test/fixtures/simple/b.js",
                     "/test/fixtures/simple/folder/c.js"] }
]
```

- Paths are absolute-style with `/` separators (Windows `\` converted),
  each prefixed with the part of the path **after** `pathPrefix`.
- XML form: element/attribute serialization of the same graph (path-keyed
  shape acceptable); used by create only.
- In-memory form: a map from source path to dependency path array
  (`sourcePathToDependencies`).

## Public API (names are contractual)

Grunt multi-tasks registered by `tasks/jsdeps.js`:

- `createJSDeps` — full build. Options (with defaults): `pathPrefix: "."`,
  `sourcePath: "."`, `format: "json"` (or `"xml"`),
  `dest: "./dependency-tree.json"`.
- `asyncCreateJSDeps` — same, wrapped in `this.async()`/`done()`.
- `updateJSDeps` — incremental. Options: `files` (Grunt file expansion
  object: `expand`, `src` globs with `!` negation, optional `filter`
  function), `dependencyTree` (existing JSON tree path), `dest` (defaults to
  rewriting `dependencyTree` in place), `pathPrefix`. JSON trees only.
- `asyncUpdateJSDeps` — async wrapper of the above.

Core library `jsdeps` (the `jsdeps` npm package's consumed surface):

- `buildDependencies(options)` → serialized tree (string) built from a full
  recursive scan of `options.sourcePath`.
- `updateDependencies(options, files, dependencyTreePath)` → serialized tree
  after re-processing `files` against the tree read from
  `dependencyTreePath`.

Dev aliases in `Gruntfile.js`: `jsdeps` = `createJSDeps` + `updateJSDeps`;
`test` = `clean` + `jsdeps` + `nodeunit`; `default` = `jshint` + `test`.

## Design decisions (all of them)

1. **Thin wrapper:** all graph logic (regex extraction, path resolution,
   serialization, recursion, jslignore handling) lives in the `jsdeps`
   package; the Grunt plugin only merges options, expands file globs,
   reads the old tree for comparison, and writes output. Keep the plugin
   under ~100 lines.
2. **Regex extraction over whole-file reads:** read each file once
   (`grunt.file.read`-style) and run one global regex for
   `/// <reference path="..." />`; no line readers. Missing referenced
   files warn but do not fail. `jslignore.txt` in a directory skips it
   during recursion.
3. **JSON as array of `{source, dependencies}`** records for easy
   downstream parsing (breaking change from the original path-keyed map);
   XML output supported for create only.
4. **Create/update split:** full scan vs changed-file-set re-processing;
   update globs/filters live under `options.files` so the whole config
   surface is `options`. `pathPrefix` is the path-stripping option (the
   original `root` name was renamed).
5. **Async variants:** helper functions `create(this)`/`update(this)` shared
   by four registered tasks; async wrappers only add `this.async()`.
6. **Error handling:** both helpers wrap their whole body in try/catch →
   `grunt.fatal(e)`; no exception may escape a task.
7. **Stale-entry pruning:** when re-processing a file, delete its map entry
   first, then re-insert only if it still has references — this makes update
   idempotent and drops removed dependencies/files from the tree.
8. **Write-on-change only:** update compares the previous serialized tree to
   the new one and skips writing when identical; `dest` defaults to the
   input `dependencyTree` path.

## Phased build order

1. **Scaffold:** `grunt-init gruntplugin` equivalent — `package.json`
   (name/description/keywords `gruntplugin`, MIT license, engines
   `node >= 0.8.0`, peer `grunt >=0.4.5`), `Gruntfile.js` (jshint/clean/
   nodeunit wiring), `.jshintrc`, `.gitignore`, `LICENSE-MIT`, stub README.
2. **Core task:** implement the multi-task with regex reference extraction,
   recursive scan honoring `jslignore.txt`, warn-on-missing, JSON/XML
   serializers, `pathPrefix` handling.
3. **Tests + fixtures:** fixture trees (`simple`, `broken`, `update/simple`)
   with reference tags; golden outputs in `test/expected/` (JSON and XML);
   nodeunit suite comparing `tmp/*` against expected files; fix any bugs the
   tests surface (notably: select format via `options.format === "xml"`,
   not a stray `options.xml`).
4. **Output format:** switch JSON to the array-of-records shape; update
   fixtures/README together.
5. **Update task:** add incremental update with `options.files`,
   `dependencyTree`, `dest`-fallback, write-on-change; add update fixtures
   and tests.
6. **Naming/usability:** camelCase task names; all inputs under `options`;
   4-space reformat; extract `create`/`update` helpers; add the two async
   variants.
7. **Prune correctness:** delete-before-insert ordering incl. the
   zero-reference early return; `removeFile` fixture proving a stale
   dependency disappears.
8. **Extract library:** move the graph logic into the `jsdeps` package;
   plugin calls `buildDependencies`/`updateDependencies`; remove dead code
   (`path`/fs-util requires).
9. **Harden + ship:** try/catch → `grunt.fatal` everywhere; widen peer
   dependency to `grunt >=0.4.5` with dev dep `~1.0.1`; final version
   `1.0.1`; README with options, examples, and async-variant notes.

## Repository layout to produce

```
package.json
Gruntfile.js
.jshintrc
.gitignore
LICENSE-MIT
README.md
tasks/jsdeps.js
tasks/file-system-util.js     # recursive walk / separator helpers (legacy)
test/jsdeps_test.js
test/fixtures/simple/…        # a.js -> b.js, folder/c.js; c.js -> d.js
test/fixtures/broken/…        # missing-reference case
test/fixtures/update/simple/… # includes removeFile.json with stale e.js
test/expected/{simple,relativeRoot,update_simple,update_relativeRoot}.json
test/expected/simple.xml
```

## Acceptance criteria

1. `npm install` + `grunt jshint` passes with zero lint errors.
2. `grunt test` passes: 6 nodeunit assertions —
   `createJSDeps.{simple,relativeRoot,xml}` and
   `updateJSDeps.{simple,relativeRoot,removeFile}` — each comparing `tmp/`
   output byte-for-byte against `test/expected/`.
3. `createJSDeps` on the simple fixture emits exactly the array-of-records
   JSON shown in the data model, with `pathPrefix` correctly stripping
   prefixes (`.` keeps full paths; `test/fixtures` yields `/simple/a.js`).
4. `format: "xml"` writes XML; the update task reads/writes JSON only.
5. `updateJSDeps` with the `removeFile` fixture drops the stale `e.js`
   dependency from the output tree (matches `update_simple.json`), proving
   delete-before-insert pruning.
6. Update writes nothing when the tree is unchanged; writes to
   `options.dependencyTree` in place when `dest` is unset.
7. Injecting an error into the core library makes the task fail via
   `grunt.fatal` (non-zero exit, no uncaught exception).
8. Plugin body stays thin: no graph algorithm code inside `tasks/`
   beyond option plumbing and the library calls listed under Public API.
