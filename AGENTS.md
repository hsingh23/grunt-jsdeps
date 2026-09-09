# AGENTS.md — agent guide to grunt-jsdeps

Orientation for coding agents (and humans) working in this repository.
This is an **archived, legacy Grunt plugin** (ES5, CommonJS, 2015-era
toolchain). Expect old-style code; do not modernize opportunistically.

## Commands

All commands run from the repo root. Requires a legacy Node toolchain
(the 0.10–8.x era) for `grunt` to boot; on modern Node the dev pipeline
will likely fail at install/run time (see Gotchas).

```shell
npm install          # install dev deps (grunt 1.x, contrib plugins)
npm test             # => grunt test
grunt                # => jshint + test (default task)
grunt jshint         # lint Gruntfile.js, tasks/*.js, test/*_test.js (.jshintrc)
grunt test           # clean tmp/ -> createJSDeps + updateJSDeps -> nodeunit
grunt jsdeps         # just run the plugin's own create+update targets
```

There is no build step beyond the tasks themselves; the plugin ships
plain `.js` files.

## Architecture map

```
Gruntfile.js          dev/test harness: jshint, clean, nodeunit +
                      createJSDeps/updateJSDeps targets over test/fixtures
tasks/jsdeps.js       THE PLUGIN. ~70 lines. Registers 4 multi-tasks:
                        createJSDeps / asyncCreateJSDeps  -> create(this)
                        updateJSDeps / asyncUpdateJSDeps  -> update(this)
tasks/file-system-util.js  legacy fs helpers (recurseDirSync, copySync, ...)
                        inherited from the original CLI; largely unused now
test/jsdeps_test.js   nodeunit: compares tmp/* outputs to test/expected/*
test/fixtures/        input trees containing /// <reference path="..."/> tags
test/expected/        golden outputs (JSON + XML)
```

Data flow:

- **create** (`createJSDeps`): `this.options()` merges defaults
  (`pathPrefix:"."`, `sourcePath:"."`, `format:"json"`,
  `dest:"./dependency-tree.json"`) -> `jsdeps.buildDependencies(options)`
  from the external `jsdeps@^1.0.2` package -> `grunt.file.write(dest, ...)`.
  The whole body is wrapped in try/catch -> `grunt.fatal(e)`.
- **update** (`updateJSDeps`): reads the previous tree
  (`grunt.file.read(options.dependencyTree)`), expands changed files from
  `options.files` via `grunt.file.expand`, calls
  `jsdeps.updateDependencies(options, files, options.dependencyTree)`, and
  writes to `options.dest || options.dependencyTree` **only if the serialized
  tree changed**. Also try/catch -> `grunt.fatal(e)`.
- The **async** variants are thin wrappers that call `this.async()`/`done()`
  around the same `create`/`update` helpers.

The dependency-graph algorithm itself (reference-tag regex, path resolution,
serialization, stale-entry pruning) lives **outside this repo**, in the
`jsdeps` npm package. This repo is deliberately a thin Grunt facade.

## Conventions

- ES5 only (`'use strict'`, `var`, function expressions). `.jshintrc` governs style.
- 4-space indentation in `Gruntfile.js` and `tasks/*.js`.
- Task names are camelCase: `createJSDeps`, `updateJSDeps`, plus `async`
  variants. Do not rename them — they are the public API.
- All task inputs live under `options` (including `options.files` for the
  update task), never as raw target data.
- Commits follow Conventional Commits (`feat:`, `fix:`, `refactor:`,
  `test:`, `build:`, `chore:` with optional `(scope)`); subject imperative,
  <=72 chars, body explains why.
- Tests are golden-file comparisons: fixtures in, `tmp/` out, diff against
  `test/expected/`. To change behavior, update the expected files in the same
  change and say so in the commit body.

## Gotchas

- **`grunt.file.expand(options.files, options.files.src)`** is called with
  `options.files` as the first (options) argument — that is how the `filter`
  fn and `expand` flags get applied. Changing this call breaks filtering.
- **update writes only on change**: the before/after string comparison means
  formatting-only diffs suppress writes; don't "fix" this by removing the
  comparison.
- **`dest` falls back to `dependencyTree`**: if `options.dest` is unset, the
  update task rewrites the input tree in place (fixtures rely on this not
  happening in tests — they always set `dest`).
- **XML is create-only**: `updateJSDeps` reads/writes JSON trees only.
- **Version bumps ride along**: historically version bumps in `package.json`
  ship inside feature commits; keep the CHANGELOG in sync when touching the
  version.
- **Modern Node breakage**: `grunt-contrib-nodeunit@0.3.x` and `fs.existsSync`
  era APIs are the failure points on current Node; use an old Node via
  `nvm` if you actually need to run tests.
- **History was rewritten 2026-09-08** (messages-only). SHAs older than that
  date referenced anywhere external are stale; local branch
  `backup/pre-docs-20260908` preserves the pre-rewrite history (identical trees).

## How to verify changes

1. `grunt jshint` — lint passes.
2. `grunt test` — clean + run plugin tasks over fixtures + nodeunit
   golden comparisons. All six assertions must pass.
3. Inspect `tmp/*.json` / `tmp/*.xml` by hand for the change you made;
   regenerate `test/expected/*` deliberately if the output contract changed.

## Pointers

- `README.md` — user-facing docs (options, examples, quickstart).
- `CHANGELOG.md` — every commit, newest first, with the rewrite note.
- `architectural-diary/` — design narrative and ADR-style decisions
  (thin-wrapper architecture, graph ownership, output format).
- `prompt.md` — one-shot recreation prompt for this exact codebase.
- Upstream core logic: `jsdeps` npm package (`dependencies: ^1.0.2`).
