import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { describe, it } from 'node:test';
import {
  addTicketReference,
  getFooterTrailers,
  getTicketReferences,
  isBotCommit,
  isNonEmptyString,
  isTicketReference,
  prepareCommitMessage
} from './utils.mjs';

const CO_AUTHOR = 'Co-Authored-By: Claude <noreply@anthropic.com>';
const SCISSORS = '# ------------------------ >8 ------------------------';

/** Lists the trailers git reads in a message, one `key: value` line each. */
const parseWithGit = message =>
  execFileSync('git', ['interpret-trailers', '--parse'], { input: message, encoding: 'utf8' })
    .split('\n')
    .filter(line => line !== '');

const formatTrailers = trailers => trailers.map(({ key, value }) => `${key}: ${value}`);

describe('isNonEmptyString', () => {
  it('accepts a string with a character', () => {
    assert.equal(isNonEmptyString('a'), true);
  });

  for (const value of ['', null, undefined, 0, ['a'], {}]) {
    it(`rejects ${JSON.stringify(value)}`, () => {
      assert.equal(isNonEmptyString(value), false);
    });
  }
});

describe('isTicketReference', () => {
  for (const value of ['CALC-1', 'CALC-17', 'CALC-1234']) {
    it(`accepts ${value}`, () => {
      assert.equal(isTicketReference({ value }), true);
    });
  }

  const invalidValues = [
    'calc-17',
    'Calc-17',
    'CALC-017',
    'CALC-0',
    'CALC-',
    'CALC',
    'CALC-17 CALC-18',
    'CALC-17,',
    'CALC-1a',
    ' CALC-17',
    'CALC-17 ',
    '#17',
    'ISF-17',
    'CALC-17-fix',
    'master',
    '',
    null,
    undefined,
    17
  ];

  for (const value of invalidValues) {
    it(`rejects ${JSON.stringify(value)}`, () => {
      assert.equal(isTicketReference({ value }), false);
    });
  }

  it('reads the tickets of another key', () => {
    assert.equal(isTicketReference({ value: 'ISF-3', ticketKey: 'ISF' }), true);
    assert.equal(isTicketReference({ value: 'CALC-3', ticketKey: 'ISF' }), false);
  });

  it('rejects everything with an empty or missing key', () => {
    assert.equal(isTicketReference({ value: '-3', ticketKey: '' }), false);
    assert.equal(isTicketReference({ value: 'CALC-3', ticketKey: null }), false);
  });

  it('rejects a call without parameters', () => {
    assert.equal(isTicketReference(), false);
  });
});

describe('getFooterTrailers', () => {
  it('reads the trailer block of the last paragraph', () => {
    const message = `feat: add a key\n\nWhy it changes.\n\nRefs: CALC-1\n${CO_AUTHOR}\n`;

    assert.deepEqual(getFooterTrailers(message), [
      { key: 'Refs', value: 'CALC-1' },
      { key: 'Co-Authored-By', value: 'Claude <noreply@anthropic.com>' }
    ]);
  });

  it('also reads a Refs: line followed by a blank line above the last block', () => {
    const message = `feat: add a key\n\nWhy it changes.\n\nRefs: CALC-1\n\n${CO_AUTHOR}\n`;

    assert.deepEqual(formatTrailers(getFooterTrailers(message)), ['Refs: CALC-1', CO_AUTHOR]);
  });

  it('stops at the first paragraph of text above the footer', () => {
    const message = `feat: add a key\n\nRefs: CALC-1\n\nWhy it changes.\n\n${CO_AUTHOR}\n`;

    assert.deepEqual(formatTrailers(getFooterTrailers(message)), [CO_AUTHOR]);
  });

  it('reads nothing when a paragraph of text comes last', () => {
    assert.deepEqual(getFooterTrailers('feat: add a key\n\nRefs: CALC-1\n\nWhy it changes.\n'), []);
  });

  it('never reads the header paragraph', () => {
    assert.deepEqual(getFooterTrailers('feat: add a key\nRefs: CALC-1\n'), []);
    assert.deepEqual(getFooterTrailers('Refs: CALC-1\n'), []);
  });

  it('skips the comment lines of the message file', () => {
    const message = 'feat: add a key\n\nRefs: CALC-1\n# On branch CALC-1\nCo-Authored-By: A <a@example.com>\n#\n';

    assert.deepEqual(formatTrailers(getFooterTrailers(message)), ['Refs: CALC-1', 'Co-Authored-By: A <a@example.com>']);
  });

  it('ignores the diff below the scissors line of git commit --verbose', () => {
    const message = `feat: add a key\n${SCISSORS}\n# Do not modify the line above.\ndiff --git a/x b/x\n\nRefs: CALC-9\n`;

    assert.deepEqual(getFooterTrailers(message), []);
  });

  it('reads a message with Windows line breaks', () => {
    assert.deepEqual(formatTrailers(getFooterTrailers('feat: add a key\r\n\r\nRefs: CALC-1\r\n')), ['Refs: CALC-1']);
  });

  it('reads nothing from a message without trailers', () => {
    assert.deepEqual(getFooterTrailers('feat: add a key\n\nWhy it changes.\n'), []);
    assert.deepEqual(getFooterTrailers(''), []);
  });

  for (const message of [null, undefined, 42, {}]) {
    it(`reads nothing from ${JSON.stringify(message)}`, () => {
      assert.deepEqual(getFooterTrailers(message), []);
    });
  }

  const gitMessages = [
    `feat: add a key\n\nWhy it changes.\n\nRefs: CALC-1\n${CO_AUTHOR}\n`,
    'feat: add a key\n\nRefs:CALC-1\nCo-Authored-By: A <a@example.com>\n  wrapped name\n',
    'feat: add a key\n\nRefs : CALC-1\n',
    'feat: add a key\n\nrefs: CALC-1\n',
    'feat!: drop a key\n\nBREAKING CHANGE: the key is gone\nRefs: CALC-1\n',
    'feat!: drop a key\n\nBREAKING-CHANGE: the key is gone\nRefs: CALC-1\n',
    'feat: add a key\n\nsee https://example.com/a: b\nRefs: CALC-1\n',
    'feat: add a key\n\n  indented text\nRefs: CALC-1\n',
    'feat: add a key\n\nRefs: CALC-1\n(cherry picked from commit 0123456)\n',
    'feat: add a key\n\nOne\nTwo\nThree\nRefs: CALC-1\nSigned-off-by: A <a@example.com>\n',
    'feat: add a key\n\n1\n2\n3\n4\n5\n6\n7\nRefs: CALC-1\nSigned-off-by: A <a@example.com>\n',
    'feat: add a key\n\nRefs: CALC-1\n# comment\n',
    'feat: add a key\nRefs: CALC-1\n',
    'Refs: CALC-1\n'
  ];

  for (const message of gitMessages) {
    it(`reads the same trailers as git interpret-trailers in ${JSON.stringify(message)}`, () => {
      assert.deepEqual(formatTrailers(getFooterTrailers(message)), parseWithGit(message));
    });
  }
});

describe('getTicketReferences', () => {
  it('lists the values of the Refs: trailers, valid or not', () => {
    const message = `feat: add a key\n\nRefs: CALC-1\nRefs: #2\n${CO_AUTHOR}\n`;

    assert.deepEqual(getTicketReferences(message), ['CALC-1', '#2']);
  });

  it('reads the key whatever its case, as git does', () => {
    assert.deepEqual(getTicketReferences('feat: add a key\n\nrefs: CALC-1\nREFS: CALC-2\n'), ['CALC-1', 'CALC-2']);
  });

  it('keeps an empty value', () => {
    assert.deepEqual(getTicketReferences('feat: add a key\n\nRefs:\n'), ['']);
  });

  it('ignores other trailers and keys that only start with Refs', () => {
    assert.deepEqual(getTicketReferences(`feat: add a key\n\nReferences: CALC-1\n${CO_AUTHOR}\n`), []);
  });

  it('gives nothing for a message that is not text', () => {
    assert.deepEqual(getTicketReferences(undefined), []);
  });
});

describe('addTicketReference', () => {
  const reference = 'CALC-9';

  it('adds a paragraph to a header alone', () => {
    assert.equal(addTicketReference({ message: 'feat: add a key\n', reference }), 'feat: add a key\n\nRefs: CALC-9\n');
    assert.equal(addTicketReference({ message: 'feat: add a key', reference }), 'feat: add a key\n\nRefs: CALC-9');
  });

  it('adds a paragraph below a body without trailers', () => {
    assert.equal(
      addTicketReference({ message: 'feat: add a key\n\nWhy it changes.\n', reference }),
      'feat: add a key\n\nWhy it changes.\n\nRefs: CALC-9\n'
    );
  });

  it('adds the trailer first in the trailer block, next to Co-Authored-By', () => {
    const message = `feat: add a key\n\nWhy it changes.\n\n${CO_AUTHOR}\n`;
    const expected = `feat: add a key\n\nWhy it changes.\n\nRefs: CALC-9\n${CO_AUTHOR}\n`;

    assert.equal(addTicketReference({ message, reference }), expected);
    assert.deepEqual(parseWithGit(expected), ['Refs: CALC-9', CO_AUTHOR]);
  });

  it('adds the trailer to a trailer block right below the header', () => {
    assert.equal(
      addTicketReference({ message: `feat: add a key\n\n${CO_AUTHOR}\n`, reference }),
      `feat: add a key\n\nRefs: CALC-9\n${CO_AUTHOR}\n`
    );
  });

  const messagesWithReference = [
    'feat: add a key\n\nRefs: CALC-1\n',
    `feat: add a key\n\nRefs: CALC-1\n${CO_AUTHOR}\n`,
    `feat: add a key\n\nRefs: CALC-1\n\n${CO_AUTHOR}\n`,
    'feat: add a key\n\nRefs: #1\n',
    'feat: add a key\n\nrefs: CALC-1\n'
  ];

  for (const message of messagesWithReference) {
    it(`adds nothing when the footer already has a Refs: trailer in ${JSON.stringify(message)}`, () => {
      assert.equal(addTicketReference({ message, reference }), message);
    });
  }

  it('adds the trailer when a Refs: line sits in the body, above a paragraph of text', () => {
    assert.equal(
      addTicketReference({ message: 'feat: add a key\n\nRefs: CALC-1\n\nWhy it changes.\n', reference }),
      'feat: add a key\n\nRefs: CALC-1\n\nWhy it changes.\n\nRefs: CALC-9\n'
    );
  });

  it('keeps the comment lines of the message file below the message', () => {
    const comments = '# Please enter the commit message for your changes.\n# On branch CALC-9\n';

    assert.equal(
      addTicketReference({ message: `feat: add a key\n\n${comments}`, reference }),
      `feat: add a key\n\nRefs: CALC-9\n\n${comments}`
    );
  });

  it('adds the trailer below an empty header line in an empty message', () => {
    const template = '\n# Please enter the commit message for your changes.\n';

    assert.equal(addTicketReference({ message: template, reference }), `\n\nRefs: CALC-9\n${template}`);
    assert.equal(addTicketReference({ message: '', reference }), '\n\nRefs: CALC-9\n');
  });

  it('adds the trailer above the scissors line of git commit --verbose', () => {
    const diff = `${SCISSORS}\n# Do not modify the line above.\ndiff --git a/x b/x\n`;

    assert.equal(
      addTicketReference({ message: `feat: add a key\n${diff}`, reference }),
      `feat: add a key\n\nRefs: CALC-9\n${diff}`
    );
  });

  it('writes Unix line breaks in a message with Windows ones', () => {
    assert.equal(addTicketReference({ message: 'feat: add a key\r\n', reference }), 'feat: add a key\n\nRefs: CALC-9\n');
  });

  for (const invalidReference of ['', undefined, null, 9]) {
    it(`leaves the message as it is for the reference ${JSON.stringify(invalidReference)}`, () => {
      assert.equal(addTicketReference({ message: 'feat: add a key\n', reference: invalidReference }), 'feat: add a key\n');
    });
  }

  it('gives back a message that is not text', () => {
    assert.equal(addTicketReference({ message: null, reference }), null);
  });

  it('gives an empty message for a call without parameters', () => {
    assert.equal(addTicketReference(), '');
  });
});

describe('prepareCommitMessage', () => {
  const message = 'feat: add a key\n';

  for (const source of [undefined, 'message', 'template', 'commit', 'squash']) {
    it(`adds the ticket of the branch for the source ${JSON.stringify(source)}`, () => {
      assert.equal(prepareCommitMessage({ message, branch: 'CALC-9', source }), 'feat: add a key\n\nRefs: CALC-9\n');
    });
  }

  it('leaves the message of a merge commit as it is', () => {
    assert.equal(prepareCommitMessage({ message, branch: 'CALC-9', source: 'merge' }), message);
  });

  for (const branch of ['master', 'develop', 'calc-9', 'CALC-9-fix', 'feature/CALC-9', '', undefined]) {
    it(`leaves the message as it is on the branch ${JSON.stringify(branch)}`, () => {
      assert.equal(prepareCommitMessage({ message, branch }), message);
    });
  }

  it('adds nothing when the message already names a ticket', () => {
    const referencedMessage = 'feat: add a key\n\nRefs: CALC-1\n';

    assert.equal(prepareCommitMessage({ message: referencedMessage, branch: 'CALC-9' }), referencedMessage);
  });

  it('gives an empty message for a call without parameters', () => {
    assert.equal(prepareCommitMessage(), '');
  });
});

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
