# ADR-001: Become a thin wrapper over the jsdeps package

- **Date:** 2016-02-10 → 2016-02-12
- **Commits:** cc4b0ae, 748dd7b (rewrites of former 3a68b3f / 4244a15)
- **Status:** accepted, defining

## Context

Until early 2016 the plugin carried its own copy of the dependency-graph
logic inside `tasks/jsdeps.js`: the reference-tag regex, `matchAll` /
`getReferences`, `processFile`, jslignore handling, JSON/XML serialization,
and `readDependencyTree`. The same logic was needed outside Grunt, and bugs
(like stale entries on file removal) had to be fixed in every copy.

## Decision

Delete the inline implementation and depend on the external
`jsdeps@^1.0.2` npm package:

- full builds call `jsdeps.buildDependencies(options)`
- incremental updates call
  `jsdeps.updateDependencies(options, files, options.dependencyTree)`

The plugin keeps only Grunt concerns: `this.options()` merging with defaults,
`grunt.file.expand` for changed-file globs, reading the previous tree for
change detection, and writing the destination.

## Consequences

- The graph algorithm's source of truth moved out of this repository; fixing
  scanning/serialization bugs here is impossible without an upstream release.
- `tasks/file-system-util.js` became vestigial (kept only as legacy helper).
- The plugin shrank to ~70 lines, so the Grunt integration surface is trivial
  to audit.
- Versioning now couples the plugin to the `jsdeps` package's API (options
  are passed through verbatim).
