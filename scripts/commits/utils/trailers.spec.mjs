import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { describe, it } from 'node:test';
import { getFooterTrailers, getParagraphs, isTrailerBlock } from './trailers.mjs';

const CO_AUTHOR = 'Co-Authored-By: Claude <noreply@anthropic.com>';
const SCISSORS = '# ------------------------ >8 ------------------------';

/** Lists the trailers git reads in a message, one `key: value` line each. */
const parseWithGit = message =>
  execFileSync('git', ['interpret-trailers', '--parse'], { input: message, encoding: 'utf8' })
    .split('\n')
    .filter(line => line !== '');

const formatTrailers = trailers => trailers.map(({ key, value }) => `${key}: ${value}`);

describe('getParagraphs', () => {
  it('gives the line indices of each paragraph', () => {
    assert.deepEqual(getParagraphs(['feat: add a key', '', 'Why.', 'More.', '', 'Refs: CALC-1']), [[0], [2, 3], [5]]);
  });

  it('merges the blank lines between two paragraphs, blanks with spaces included', () => {
    assert.deepEqual(getParagraphs(['', 'feat: add a key', '', '  ', '\t', 'Refs: CALC-1', '']), [[1], [5]]);
  });

  it('skips the comment lines without splitting the paragraph around them', () => {
    assert.deepEqual(getParagraphs(['feat: add a key', '', 'Refs: CALC-1', '# comment', 'Co-Authored-By: A']), [
      [0],
      [2, 4]
    ]);
  });

  it('stops at the scissors line, trailing blanks included', () => {
    assert.deepEqual(getParagraphs(['feat: add a key', `${SCISSORS}  `, '', 'diff --git a/x b/x']), [[0]]);
  });

  it('gives nothing for lines without text', () => {
    assert.deepEqual(getParagraphs([]), []);
    assert.deepEqual(getParagraphs(['', '# comment', ' ']), []);
  });
});

describe('isTrailerBlock', () => {
  it('accepts a paragraph of trailers only', () => {
    assert.equal(isTrailerBlock(['Refs: CALC-1', CO_AUTHOR]), true);
  });

  it('accepts a trailer followed by its continuation line', () => {
    assert.equal(isTrailerBlock(['Co-Authored-By: A', '  <a@example.com>']), true);
  });

  it('rejects a continuation line without a trailer above it', () => {
    assert.equal(isTrailerBlock(['  indented text', 'Refs: CALC-1']), false);
  });

  it('rejects a key with a space, such as BREAKING CHANGE', () => {
    assert.equal(isTrailerBlock(['BREAKING CHANGE: the key is gone', 'Refs: CALC-1']), false);
    assert.equal(isTrailerBlock(['BREAKING-CHANGE: the key is gone', 'Refs: CALC-1']), true);
  });

  it('accepts up to three other lines per trailer next to a line git writes', () => {
    const signOff = 'Signed-off-by: A <a@example.com>';

    assert.equal(isTrailerBlock(['1', '2', '3', '4', '5', '6', 'Refs: CALC-1', signOff]), true);
    assert.equal(isTrailerBlock(['1', '2', '3', '4', '5', '6', '7', 'Refs: CALC-1', signOff]), false);
  });

  it('rejects a paragraph of text and an empty paragraph', () => {
    assert.equal(isTrailerBlock(['Why it changes.']), false);
    assert.equal(isTrailerBlock([]), false);
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
