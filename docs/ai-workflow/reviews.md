# Reviews

A pull request is merged only when all of these pass:

| Check                                   | Who                              | What it proves                                                                                                                                                        |
| --------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [CI](../../.github/workflows/ci.yml)    | GitHub Actions                   | A clean install from the lockfile, lint, the formatting check, the type check, every test and the build pass; every commit and the title follow the commit convention |
| Cloudflare Pages preview                | Cloudflare                       | The app builds and runs on the host, at its own URL                                                                                                                   |
| Conventions review                      | Conventions reviewer sub-agent   | The change follows the coding conventions (documentation, tests of edge cases, named constants, English code) and keeps the README true                               |
| Visual test, for a change that can show | Visual tester sub-agent          | The pages look right at phone, tablet, laptop and desktop widths, the change works in the browser, and the console shows no error                                     |
| Final read                              | Master, and the owner when asked | The pull request does what the issue asked, and nothing else                                                                                                          |

The worker fixes each confirmed finding of a reviewer, then asks that reviewer to check the fixes only. The pull request body records both verdicts, and what was not tested.

## Examples

- [#18](https://github.com/AIssoufi/calculator/pull/18) changes the layout, so it shows before and after screenshots at three widths and the measurements behind them. Its visual test found a 4 px overlap that `master` also had, which was fixed in the same pull request.
- [#23](https://github.com/AIssoufi/calculator/pull/23) changes no pixel, so the visual tester compared screenshots of both builds and found them byte-identical.
- [#21](https://github.com/AIssoufi/calculator/pull/21) records a suggestion of the conventions reviewer that was kept on purpose, with the reason.
