# ADR-005: Provide async task variants via this.async()

- **Date:** 2015-12-18
- **Commits:** 0b0d777 (PR #4 via merge 87b0af7)
- **Status:** accepted

## Context

Grunt tasks signal completion either synchronously (returning) or by
grabbing `this.async()` and calling `done()`. Pipelines that mixed the
jsdeps tasks with genuinely async tasks (watchers, shell steps) wanted the
explicit async form. The internal logic itself remained synchronous.

## Decision

Extract the task bodies into `create(this)` / `update(this)` helpers, then
register four multi-tasks: `createJSDeps`, `updateJSDeps` (sync) and
`asyncCreateJSDeps`, `asyncUpdateJSDeps` — the async pair being thin wrappers
that call `var done = this.async(); create(this); done();`.

## Consequences

- Four public task names for two behaviors — a wider API surface to document
  (the README notes the async variants), but zero duplicated logic.
- Because completion is signaled synchronously inside the wrapper, the async
  variants are async in name/protocol only; there is no I/O parallelism.
- The helper extraction also set up the single-body-per-operation structure
  that ADR-006's try/catch wrapping would later cover in one place.
