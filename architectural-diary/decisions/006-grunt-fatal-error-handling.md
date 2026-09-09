# ADR-006: Fail through grunt.fatal, never with uncaught exceptions

- **Date:** 2016-03-31
- **Commits:** dc8134b (PR #8 via merge d7d928d)
- **Status:** accepted; shipped as 1.0.0

## Context

After ADR-001, library failures (unreadable dependency tree, malformed input)
escaped the task functions as uncaught exceptions: raw stack traces, unclear
task status, and inconsistent exit codes across Grunt versions.

## Decision

Wrap the entire body of both `create` and `update` in try/catch and call
`grunt.fatal(e)` on any exception. Also delete the now-unused `path` and
`./file-system-util` requires left over from the inline implementation.

## Consequences

- Any jsdeps error terminates the Grunt run with a proper fatal error and
  non-zero exit — deterministic CI behavior.
- The catch is coarse (no retry, no partial-result reporting); the tree file
  is either fully written or untouched, since writes happen once at the end.
- Marked the 1.0.0 release: the plugin's contract (task names, options,
  failure mode) was considered stable.
