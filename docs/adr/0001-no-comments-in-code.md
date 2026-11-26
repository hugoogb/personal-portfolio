# 0001: No comments in code

### Code carries no comments

Where: `eslint-rules/no-comments.js`, `eslint.config.js` rule `local/no-comments`

Every comment in JS and TS files is a lint error, so `pnpm lint`, lint-staged and the pre-push `pnpm run check` reject it. A comment that restates the code or has gone stale is deleted. A non-obvious decision (a platform quirk, an ordering, an invariant, a rejected alternative) goes into the matching ADR in `docs/adr/` as a `###` section with a `Where:` line, and a shortcut that needed a comment to look acceptable is filed as a GitHub issue instead.

### Tool directives are allowed

Where: `eslint-rules/no-comments.js` `DIRECTIVES`

Comments that a tool reads are not comments, and the rule lets them through: `eslint-disable`/`eslint-enable` (and their `-line` and `-next-line` forms), `global`, `@ts-expect-error` and the other `@ts-` pragmas, `/// <reference`, `prettier-ignore`, `#__PURE__`, `@vitest-environment` and `@vite-ignore`, plus shebangs. Add a new marker to `DIRECTIVES` when a tool needs one.

### No suppressions baseline

Where: `eslint.config.js`

The ban started with an ESLint bulk-suppressions baseline of 447 comments, which the same change burned down to zero, so the baseline file was removed. Never reintroduce one with `--suppress-rule`: a new comment is fixed, not suppressed.

### Only ESLint's files are covered

Where: `eslint.config.js`

The ban covers the JS and TS files ESLint lints. CSS, HTML, Markdown, YAML and the Python in `scripts/` are not covered; audit them by hand.
