import lint from '@commitlint/lint';
import load from '@commitlint/load';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = fileURLToPath(new URL('../..', import.meta.url));
const TITLE_CONFIG_FILE = fileURLToPath(new URL('./pull-request-title.config.mjs', import.meta.url));
const CO_AUTHOR = 'Co-Authored-By: Claude <noreply@anthropic.com>';

/**
 * Lints a message with a commitlint configuration of the repository, as the commitlint CLI does.
 *
 * @param {{ message: string, file?: string }} params - Message, and configuration file other
 * than the root `commitlint.config.mjs`.
 */
const lintMessage = async ({ message, file }) => {
  const config = await load({}, { cwd: ROOT_DIR, file });

  return lint(message, config.rules, {
    parserOpts: config.parserPreset?.parserOpts,
    plugins: config.plugins,
    ignores: config.ignores,
    defaultIgnores: config.defaultIgnores
  });
};

const getFailedRules = report => report.errors.map(({ name }) => name);

describe('commitlint.config.mjs', () => {
  const validMessages = [
    'feat: add a percent key\n\nRefs: CALC-17\n',
    `fix(engine): round long results\n\nWhy it changes.\n\nRefs: CALC-17\n${CO_AUTHOR}\n`,
    `docs: explain the convention\n\nRefs: CALC-17\n\n${CO_AUTHOR}\n`
  ];

  for (const message of validMessages) {
    it(`passes ${JSON.stringify(message)}`, async () => {
      const report = await lintMessage({ message });

      assert.deepEqual(report.errors, []);
      assert.equal(report.valid, true);
    });
  }

  it('fails a message without a Conventional Commits header', async () => {
    const report = await lintMessage({ message: 'Add a percent key\n\nRefs: CALC-17\n' });

    assert.equal(report.valid, false);
    assert.deepEqual(getFailedRules(report), ['subject-empty', 'type-empty']);
  });

  it('fails a message without a Refs: trailer', async () => {
    const report = await lintMessage({ message: `feat: add a percent key\n\nWhy it changes.\n\n${CO_AUTHOR}\n` });

    assert.equal(report.valid, false);
    assert.deepEqual(getFailedRules(report), ['footer-ticket-reference']);
  });

  for (const reference of ['#17', 'CALC-017', 'calc-17', 'ISF-17', 'CALC-17 CALC-18']) {
    it(`fails the malformed reference ${JSON.stringify(reference)}`, async () => {
      const report = await lintMessage({ message: `feat: add a percent key\n\nRefs: ${reference}\n` });

      assert.equal(report.valid, false);
      assert.deepEqual(getFailedRules(report), ['footer-ticket-reference']);
    });
  }

  it('fails a Refs: line followed by a paragraph of text', async () => {
    const report = await lintMessage({ message: 'feat: add a percent key\n\nRefs: CALC-17\n\nWhy it changes.\n' });

    assert.deepEqual(getFailedRules(report), ['footer-ticket-reference']);
  });

  const longLine = 'x'.repeat(120);
  const botMessages = [
    'chore(deps): bump react from 18.2.0 to 18.3.1\n\n' +
      `Bumps react from 18.2.0 to 18.3.1. ${longLine}\n\nSigned-off-by: dependabot[bot] <support@github.com>\n`,
    `Bump react from 18.2.0 to 18.3.1\n\n${longLine}\n\nSigned-off-by: dependabot[bot] <support@github.com>\n`,
    `chore(master): release 1.2.0 (#20)\n\n:robot: I have created a release *beep* *boop* ${longLine}\n`
  ];

  for (const message of botMessages) {
    it(`passes the bot commit ${JSON.stringify(message.split('\n')[0])}`, async () => {
      assert.equal((await lintMessage({ message })).valid, true);
    });
  }

  const mergeMessages = [
    'Merge pull request #15 from AIssoufi/CALC-7\n\nfix: compute chained, zero and decimal input with the engine\n',
    "Merge branch 'master' into CALC-17\n",
    "Merge remote-tracking branch 'origin/master' into CALC-17\n"
  ];

  for (const message of mergeMessages) {
    it(`passes the merge commit ${JSON.stringify(message.split('\n')[0])}`, async () => {
      assert.equal((await lintMessage({ message })).valid, true);
    });
  }
});

describe('pull-request-title.config.mjs', () => {
  it('passes a Conventional Commits title without a Refs: trailer', async () => {
    const report = await lintMessage({ message: 'feat: enforce conventional commits', file: TITLE_CONFIG_FILE });

    assert.deepEqual(report.errors, []);
  });

  // GitHub refuses an empty title, and the commitlint CLI an empty input: no case for them here.
  for (const title of ['Enforce conventional commits', 'feat: Enforce conventional commits', 'feat:', 'feat add a key']) {
    it(`fails the title ${JSON.stringify(title)}`, async () => {
      const report = await lintMessage({ message: title, file: TITLE_CONFIG_FILE });

      assert.equal(report.valid, false);
      assert.equal(getFailedRules(report).includes('footer-ticket-reference'), false);
    });
  }
});
