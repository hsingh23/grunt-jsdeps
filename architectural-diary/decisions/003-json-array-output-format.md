# ADR-003: Emit JSON as an array of {source, dependencies} records

- **Date:** 2015-12-04
- **Commits:** 1305469 (PR #1 via merge 54b63e3)
- **Status:** accepted, breaking

## Context

The first JSON serializer wrote a single object keyed by source path with
dependency arrays as values. Downstream consumers (MSBuild-style script-list
generators) had to enumerate keys and re-wrap them, and the path-keyed shape
was awkward in tools expecting records.

## Decision

Serialize JSON as an array of records:

```json
[
  { "source": "/path/a.js", "dependencies": ["/path/b.js"] }
]
```

Update the expected fixtures and README examples in the same change; rename
the XML usage example target from `simple` to `xml` for clarity.

## Consequences

- Breaking change for anything already consuming the path-keyed map; version
  stayed 0.1.x so the risk was contained to early adopters.
- XML output retained a path-keyed shape — the two formats diverged, a
  documented quirk.
- The golden tests made the new contract explicit immediately.
