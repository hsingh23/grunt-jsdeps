# ADR-007: Prune stale entries by deleting before re-insertion

- **Date:** 2016-02-10
- **Commits:** ec9ccf0 (PR #5 via merge 11f6fdc), then f14b287 (PR #6 via merge a763307)
- **Status:** accepted (originally inside tasks/jsdeps.js; now lives in the jsdeps package)

## Context

The update task mutated a persistent map from source path to dependency
list. It inserted entries but never removed old ones, so:

1. A `/// <reference>` deleted from a file stayed in that file's dependency
   list forever (first bug, fixed in ec9ccf0).
2. A file left with zero references kept its entire stale entry, because the
   deletion code sat after the zero-dependencies early return (second bug,
   fixed in f14b287).

## Decision

Reorder `processFile` so that the file's entry is **deleted from
`sourcePathToDependencies` at the top of the function**, before any early
return. Re-processing then re-inserts a fresh entry only if the file still
has references. Since the map is serialized at the end, a missing entry means
the file drops out of the tree entirely.

## Consequences

- Update converges: re-running over the same changed set is idempotent, and
  removed dependencies/files vanish from the output.
- A `removeFile` Gruntfile target, a stale-`e.js` fixture
  (`test/fixtures/update/simple/removeFile.json`), and a nodeunit case
  (comparing against `update_simple.json`) lock in the behavior.
- When ADR-001 moved the logic into the jsdeps package, this ordering rule
  went with it — the fixture here still verifies it end-to-end.
