# Changelog

All notable changes to this project are documented here, newest first.

> **History rewrite note (2026-09-08):** The git history was rewritten with a
> messages-only `git filter-branch` (`--msg-filter`) to bring all commit
> messages up to Conventional Commits standard. **No file contents, trees,
> authors, dates, or merge topology were changed** — only 21 of the 22 commit
> messages were improved; one (PR #1 merge) was already compliant and was kept
> verbatim. As a result, every commit SHA on `master` changed on 2026-09-08.
> The pre-rewrite history is preserved locally in branch
> `backup/pre-docs-20260908` and the tips are tree-identical.

## 1.0.1 — 2016-04-07

- **0583d3f** `build: support grunt 1.0+ in dependency declarations`
  (merge of PR #9 from `vistaprint/feature/fix-dependencies`)
  - Bumped grunt devDependency `~0.4.5 → ~1.0.1` and widened the peerDependency
    to `>=0.4.5` so the plugin installs alongside grunt 1.x.
  - Released as 1.0.1: fixed homepage/repository/bugs URLs to point at
    `hsingh23/grunt-jsdeps` and replaced the legacy `licenses` array with a
    single `"license": "MIT"` field.
- **fab4dcb** `build: support grunt 1.0+ and fix package metadata` (Laban Eilers)
  - The actual package.json change behind the merge above: dependency ranges,
    corrected description, fixed GitHub links, modern license field, version 1.0.1.

## 1.0.0 — 2016-03-31

- **d7d928d** `fix: catch jsdeps exceptions and fail the grunt task`
  (merge of PR #8 from `hsingh23/feature/harsingh_fix_error_handling`)
  - Merged the error-handling fix below; version bumped 0.1.9 → 1.0.0.
- **dc8134b** `fix: catch jsdeps exceptions and fail the task via grunt.fatal`
  - Wrapped the `create`/`update` task bodies in `tasks/jsdeps.js` with
    try/catch calling `grunt.fatal(e)`, so jsdeps library errors abort the task
    cleanly instead of surfacing as uncaught exceptions.
  - Removed the unused `path` and `./file-system-util` requires.

## 0.1.9 — 2016-02-12

- **748dd7b** `refactor: delegate dependency scanning to the jsdeps package`
  (merge of PR #7 from `hsingh23/feature/fix-remove-file`)
  - Merged the thin-wrapper refactor below; version 0.1.7 → 0.1.9.
- **cc4b0ae** `refactor: delegate dependency scanning to the jsdeps package`
  - Deleted ~120 lines of inline dependency-scanning code (reference-tag regex,
    `processFile`, XML/JSON serialization, directory recursion) from
    `tasks/jsdeps.js` in favor of the new external `jsdeps@^1.0.2` dependency
    (`jsdeps.buildDependencies` / `jsdeps.updateDependencies`).
  - Picked up the library-side fix for removing stale files from the tree.

## 0.1.7 — 2016-02-10

- **a763307** `fix: remove stale tree entries for files with no references`
  (merge of PR #6 from `hsingh23/feature/fix-remove-file`)
  - Merged the stale-entry fix below; version 0.1.6 → 0.1.7.
- **f14b287** `fix: remove stale tree entries for files with no references`
  - Moved the entry deletion to the top of `processFile`, before the
    zero-dependencies early return, so files whose references were all removed
    no longer linger in the dependency tree.
  - Renamed `refs` to `dependencies` and tidied the warn loop.

## 0.1.6 — 2016-02-10

- **11f6fdc** `chore: merge PR #5 fixing removed-file handling in updateJSDeps`
  (merge of PR #5 from `hsingh23/feature/fix-remove-file`)
  - Merged the removed-dependency fix below plus its regression test.
- **ec9ccf0** `fix(update): drop dependencies removed from source files on update`
  - `processFile` now deletes a source's existing entry before re-inserting its
    refreshed dependency list, pruning `///` references that were removed.
  - Added a `removeFile` Gruntfile target, fixture, and nodeunit regression
    test; descriptive variable renames throughout `tasks/jsdeps.js`.

## 0.1.5 — 2015-12-18

- **87b0af7** `chore: merge PR #4 adding async variants of jsdeps tasks`
  (merge of PR #4 from `hsingh23/thin-wrapper`)
  - Merged the async task variants below plus README updates.
- **0b0d777** `feat(tasks): add asyncCreateJSDeps and asyncUpdateJSDeps variants`
  - Extracted `create()`/`update()` helpers and registered
    `asyncCreateJSDeps`/`asyncUpdateJSDeps` multi-tasks as thin
    `this.async()` wrappers for watch-style workflows.
  - `updateJSDeps` now only rewrites the destination file when the tree
    actually changed. No tests added at this point (noted in the commit).

## 0.1.4 — 2015-12-18

- **2f46926** `chore: merge PR #3 with usability and formatting improvements`
  (merge of PR #3 from `hsingh23/thin-wrapper`)
  - Merged the options-based configuration rework below.
- **be0347f** `refactor(update): accept file globs via options.files and reformat`
  - `updateJSDeps` now reads its file glob (`expand`/`src`/`filter`) from
    `options.files` instead of raw target data, with `pathPrefix` defaulted via
    `this.options()`.
  - Reindented `Gruntfile.js` and `tasks/jsdeps.js` to consistent 4-space
    style; dropped the unused `format` option from the update config.

## 0.1.3 — 2015-12-16

- **c043627** `refactor(tasks): rename create_jsdeps/update_jsdeps to camelCase`
  - Breaking rename of the registered tasks to `createJSDeps`/`updateJSDeps`,
    with Gruntfile targets, template references, the `jsdeps` alias task, and
    nodeunit export names updated to match.

## 0.1.2 — 2015-12-15

- **1de362b** `chore: merge PR #2 adding update task and documentation`
  (merge of PR #2 from `hsingh23/thin-wrapper`)
  - Merged the incremental update task below plus fixtures, tests, and docs.
- **6a7d65c** `feat: add update_jsdeps task for incremental dependency-tree updates`
  - Split the plugin into `create_jsdeps` (full scan) and a new `update_jsdeps`
    that reads an existing JSON tree and reprocesses only files matched by
    `files.src` globs/filters.
  - Renamed the public `root` option to `pathPrefix` (breaking), renamed the
    format helpers (`createXMLStringFromTree`, `createJSONStringFromTree`),
    added `readDependencyTree`, and dropped the unused `n-readlines` dependency.
  - Added update-task fixtures, expected outputs, nodeunit tests, and rewrote
    the README for both tasks.

## 0.1.1 — 2015-12-04

- **54b63e3** `Merge pull request #1 from hsingh23/thin-wrapper` *(message kept
  verbatim — already compliant)*
  - Merged the JSON output-format change below into master.
- **1305469** `feat: output JSON dependency tree as array of {source, dependencies}`
  - Changed `formatJson` to serialize the tree as an array of
    `{source, dependencies}` records instead of a path-keyed object map
    (breaking for existing consumers), which is easier to parse.
  - Updated expected fixtures, refreshed README output examples, fixed the
    "depenencies" typo, and renamed the XML example target to `xml`.

## 0.1.0 — 2015-12-03

- **6a0acff** `test: add nodeunit suite with fixtures for simple, relativeRoot, and xml`
  - Replaced the grunt-init placeholder tests with real nodeunit cases backed
    by `simple`/`broken` fixture trees and expected JSON/XML outputs; added
    `grunt-run-task` as a dev dependency and rewrote the README with real usage
    examples.
  - Fixed the format-selection bug (`options.xml` was checked instead of
    `options.format === "xml"`, so XML output was never produced), swapped
    `fs.existsSync` for `grunt.file.isFile`, and gated option logging behind
    `grunt.verbose`.

## 0.0.x — 2015-12-02

- **d3a1847** `feat: implement jsdeps multitask with regex reference extraction`
  - Replaced the grunt-init scaffold in `tasks/jsdeps.js` with the real task:
    recursive `sourcePath` scan (honoring `jslignore.txt`), extraction of
    `/// <reference path="..."/>` directives via a global regex over
    `grunt.file.read` output (fixing the broken line-by-line reading),
    warn-on-missing references, and JSON/XML serialization to `options.dest`.
  - Deleted the superseded `cli.js`, moved `file-system-util.js` under
    `tasks/`, and updated Gruntfile targets and fixtures.
- **8ebd9f2** `feat: scaffold grunt-jsdeps plugin with CLI dependency-tree prototype`
  - Initial commit: grunt-init plugin scaffold (package.json, Gruntfile.js with
    placeholder targets, jshint/clean/nodeunit wiring, README, LICENSE-MIT)
    plus the imported CLI prototype (`cli.js` with nomnom arg parsing and
    n-readlines reference extraction) and `file-system-util.js` recursive
    directory walker.
