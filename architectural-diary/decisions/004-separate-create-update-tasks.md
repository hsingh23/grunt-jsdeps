# ADR-004: Split into separate create and update tasks

- **Date:** 2015-12-15
- **Commits:** 6a7d65c (PR #2 via merge 1de362b); refined by be0347f
- **Status:** accepted

## Context

A full recursive scan of large source trees on every save was wasteful in
watch-driven builds. Consumers already knew which files changed (a watcher or
an environment variable populated with changed paths) and wanted to refresh
just those entries in an existing dependency tree.

## Decision

Split the plugin into two multi-tasks:

- `createJSDeps` — full recursive scan of `options.sourcePath`, writes a
  fresh tree (JSON or XML).
- `updateJSDeps` — reads an existing JSON tree
  (`options.dependencyTree`), expands only the changed files from
  `options.files` (globs, negations, and an optional `filter` function),
  re-processes them, and writes to `options.dest` (or in place if unset) only
  when the serialized tree changed.

Also renamed the public `root` option to `pathPrefix` and moved the file
globs under `options.files` (be0347f) so the entire configuration surface
lives in `options`.

## Consequences

- Incremental workflows became O(changed files), enabling watcher-driven
  pipelines via the `filter` hook (e.g. reading a changed-file list from an
  environment variable).
- Two code paths to keep consistent; the stale-entry bugs fixed in ADR-007
  were exclusively update-path bugs.
- Update supports JSON trees only (no XML), since reading back XML was never
  implemented.
