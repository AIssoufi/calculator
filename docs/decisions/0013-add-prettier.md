# 0013. Format the code and the docs with Prettier

- Date: 2026-10-28
- Status: Accepted

## Context

ESLint checks the correctness of the code ([0008](0008-move-to-vite.md)), but none of its rules checks the layout, and the project had no formatter. Stray formatting passed the CI and was only caught by a review, by chance: `src/app/Calculator/Calculator.tsx` had `import { Author }  from` and `<KeyPad  />`, with two spaces each, found by the review of #44. `src/app/Calculator/Author/Author.tsx` mixed its indentation and its JSX quotes, held a whitespace-only line and a stray `;` after the component, and had no final newline. The indentation itself was mixed: 60 files were indented with two spaces, 19 with four.

## Decision

The pull request of #55 added Prettier 3.9 and checks the formatting in the CI:

- [`prettier.config.mjs`](../../prettier.config.mjs) sets the options that change the fewest lines, counted on every JavaScript, TypeScript, CSS, HTML, JSON and YAML file: with two-space indents, single quotes, semicolons, lines of 100 characters, no trailing commas and no parentheses around a single arrow function parameter, Prettier changes 999 lines. Four-space indents would change 3,094, double quotes 2,227, no semicolons 2,465, trailing commas 1,107 and parentheses 1,067. Lines of 80 characters would change 1,845; lines of 120 would change 714, but the comments are wrapped at 100, so the code would grow wider than its comments. JSX keeps the double quotes that 66 of its 67 quoted attributes used;
- Prettier is pinned to an exact version, since a patch release may change its output, and is the only formatter: `pnpm format` formats every file, `pnpm format:check` fails on a file that is not formatted. [`.prettierignore`](../../.prettierignore) skips `pnpm-lock.yaml`, which pnpm writes, and the HTML report of Playwright; Prettier also skips what `.gitignore` lists, such as `build/`;
- `eslint-config-prettier`, last in [`eslint.config.js`](../../eslint.config.js), turns off the ESLint rules that could disagree with Prettier. Of the rules the project enables, only `no-unexpected-multiline` was one;
- one commit formats the whole repository and changes nothing else, and [`.git-blame-ignore-revs`](../../.git-blame-ignore-revs) lists it, so that `git blame` on GitHub skips it;
- the CI job "Install, lint, test and build" runs `pnpm format:check` right after the lint.

## Alternatives considered

- ESLint Stylistic (`@stylistic/eslint-plugin`): its layout rules would check the TypeScript and JavaScript files only, not the CSS, the HTML, the JSON, the YAML or the Markdown, and each rule is one more setting to keep in step with the others.
- Biome: it formats and lints in one tool, but moving the lint off ESLint is a decision of its own, and as a formatter only it does not format the Markdown and the YAML of the repository.
- An `.editorconfig` file alone: editors would apply the indentation and the final newline, but nothing would check them in the CI, and it says nothing of quotes, spaces or line width.

## Consequences

- The CI now fails on a file that Prettier would format, and the pull request of #55 shows it on a file broken on purpose.
- The formatting commit changed 71 files, with 1,198 lines added and 929 removed, and nothing else: the lint, the types, the 636 unit tests, the 17 smoke tests and the build stayed green. Prettier also realigned the tables of the Markdown files.
- The project has two more development dependencies, `prettier` and `eslint-config-prettier`. The clean install takes 0.5 s before and after (medians of 3 runs, measured with the method of the [introduction of `docs/evolution.md`](../evolution.md#evolution)), and `pnpm audit` reports no advisory before or after. `pnpm format:check` takes 0.6 s on the whole repository (median of 3 runs). The CI duration is in the pull request of #55.
- The build and its size are unchanged: neither package is imported by the app.
- Nothing formats a file before a commit: the editor formats it, or `pnpm format`, and the CI catches what both missed.
