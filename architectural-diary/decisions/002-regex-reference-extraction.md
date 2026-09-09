# ADR-002: Extract reference tags with a regex over whole-file reads

- **Date:** 2015-12-02
- **Commits:** d3a1847 (port), 8ebd9f2 (original CLI prototype)
- **Status:** accepted, superseded upstream by ADR-001 (logic moved to jsdeps)

## Context

The original CLI prototype read files line-by-line with `n-readlines` and
matched `/// <reference path="..." />` directives per line. That approach had
a file-reading bug (the driving motivation of commit "fixes file reading
bug") and dragged a dependency plus manual file handles into the task.

## Decision

When porting into the Grunt task, read each file once with
`grunt.file.read` and run a single global regex over the entire contents,
collecting all matches (`matchAll` helper). Missing referenced files only
warn (they do not fail the build); directories listed in a `jslignore.txt`
are skipped during recursion.

## Consequences

- One read per file, no line-reader dependency, simpler loop; the reading bug
  disappeared.
- Tags split across lines would not match — acceptable, since the
  single-line comment convention was universal in the target projects.
- Warn-don't-fail on missing references keeps builds resilient to
  work-in-progress trees, at the cost of silently partial graphs.
- When ADR-001 extracted the logic into the `jsdeps` package, this algorithm
  went with it; this repo's history is the only record of the line-reader
  interlude.
