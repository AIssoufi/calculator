import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isBotCommit } from './bots.mjs';

describe('isBotCommit', () => {
  const dependabotBody =
    'Bumps [react](https://github.com/facebook/react) from 18.2.0 to 18.3.1.\n\n---\n' +
    'updated-dependencies:\n- dependency-name: react\n  dependency-type: direct:production\n...\n\n' +
    'Signed-off-by: dependabot[bot] <support@github.com>\n';

  const botMessages = [
    `chore(deps): bump react from 18.2.0 to 18.3.1\n\n${dependabotBody}`,
    `Bump react from 18.2.0 to 18.3.1\n\n${dependabotBody}`,
    'chore(master): release 1.2.0',
    'chore(master): release 1.2.0 (#20)\n\n:robot: I have created a release *beep* *boop*\n',
    'chore(main): release calculator 1.2.0',
    'chore: release v2.0.0'
  ];

  for (const message of botMessages) {
    it(`recognizes ${JSON.stringify(message.split('\n')[0])}`, () => {
      assert.equal(isBotCommit(message), true);
    });
  }

  const humanMessages = [
    'feat: add a key\n\nRefs: CALC-1\n',
    'chore: release notes',
    'chore(master): release the kraken',
    'docs: explain chore(master): release 1.2.0',
    'chore: configure dependabot\n\nSigned-off-by: A <a@example.com>\n',
    '',
    null,
    undefined,
    42
  ];

  for (const message of humanMessages) {
    it(`does not recognize ${JSON.stringify(message)}`, () => {
      assert.equal(isBotCommit(message), false);
    });
  }
});
