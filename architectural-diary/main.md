# Architectural Diary — grunt-jsdeps

A narrative history of how this plugin reached its current shape, reconstructed
from the git history (2015-12-02 → 2016-04-07, 22 commits). Commit hashes
reference the post-2026-09-08 messages-only rewritten history.

## The problem

Legacy Visual Studio–era JavaScript projects declared file dependencies with
`/// <reference path="..." />` comment tags instead of modules. Build systems
needed the resulting dependency graph as a data file to emit `<script>` tags
in topologically safe order. This plugin's job: scan a tree, resolve the tags,
serialize the graph.

## Phase 1 — CLI prototype inside a Grunt scaffold (8ebd9f2, d3a1847)

The project started as a `grunt-init` scaffold plus a standalone CLI
prototype (`cli.js`: nomnom argument parsing, n-readlines line-by-line
reading, jslignore.txt skip lists, JSON/XML output). Within a day the CLI was
deleted and the logic ported into the Grunt multi-task itself — the author's
commit message called it "all grunt way." The port switched from a
line-reader to a global regex over `grunt.file.read` output, fixing the file
reading bug that motivated the rewrite (ADR-002).

## Phase 2 — Testable contract (6a0acff)

Real nodeunit tests replaced the scaffold placeholders: fixture trees under
`test/fixtures/`, golden outputs under `test/expected/`, `tmp/` as the
scratch destination. This fixed the format-selection bug (`options.xml` vs
`options.format === "xml"`) and froze the output contract the tests diff
against — the verification model still used today.

## Phase 3 — Output format and task split (1305469, 6a7d65c, c043627)

JSON output changed from a path-keyed object map to an array of
`{source, dependencies}` records for easier downstream parsing (ADR-003).
The single task split into `create_jsdeps` (full scan) plus `update_jsdeps`
(incremental re-processing of changed files) (ADR-004), the public `root`
option became `pathPrefix`, and task names moved to camelCase
(`createJSDeps`/`updateJSDeps`).

## Phase 4 — Usability and async (be0347f, 0b0d777)

All update-task inputs (globs, filters) moved under `options.files` so the
whole configuration surface lived in `options`; the code was reformatted to a
consistent 4-space style. Async variants (`asyncCreateJSDeps`,
`asyncUpdateJSDeps`) were added as `this.async()` wrappers so the tasks could
join watch pipelines (ADR-005).

## Phase 5 — Correctness of incremental updates (ec9ccf0, f14b287)

Two staged fixes made the update task actually converge: entries are deleted
before re-insertion (so removed dependencies disappear), and the delete was
moved above the zero-dependencies early return (so files left with no
references drop out entirely). A `removeFile` regression fixture locks this
in.

## Phase 6 — The thin wrapper (cc4b0ae, 748dd7b) — the defining decision

~120 lines of inline scanning code (regex, `processFile`, serialization,
recursion) were deleted and replaced by calls into the external
`jsdeps@^1.0.2` package (`buildDependencies`, `updateDependencies`). The
graph algorithm now lives outside this repo; the plugin is a ~70-line Grunt
facade (ADR-001). Version jumped to 1.0.0 with the final error-handling fix
(dc8134b: try/catch → `grunt.fatal`, ADR-006), then 1.0.1 widened the Grunt
peer dependency for grunt 1.x (fab4dcb).

## Steady state

Since 2016-04-07 the repo is frozen: 22 commits, one released artifact
(`grunt-jsdeps@1.0.1`), tests that pass only on legacy Node. It is archived;
the diary exists so the reasoning survives the era that produced it.

## Decision index

- [001 — Thin wrapper over the jsdeps package](decisions/001-thin-wrapper-over-jsdeps.md)
- [002 — Regex reference extraction over whole-file reads](decisions/002-regex-reference-extraction.md)
- [003 — JSON output as array of {source, dependencies}](decisions/003-json-array-output-format.md)
- [004 — Separate create and update tasks](decisions/004-separate-create-update-tasks.md)
- [005 — Async task variants via this.async()](decisions/005-async-task-variants.md)
- [006 — Fail via grunt.fatal, never uncaught](decisions/006-grunt-fatal-error-handling.md)
- [007 — Prune stale entries before re-insertion](decisions/007-stale-entry-pruning.md)
