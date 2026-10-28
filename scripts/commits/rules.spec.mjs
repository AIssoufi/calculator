import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { footerTicketReference } from './rules.mjs';

const CO_AUTHOR = 'Co-Authored-By: Claude <noreply@anthropic.com>';

const commit = raw => ({ raw });

describe('footerTicketReference', () => {
  const validMessages = [
    'feat: add a key\n\nRefs: CALC-17\n',
    `feat: add a key\n\nWhy it changes.\n\nRefs: CALC-17\n${CO_AUTHOR}\n`,
    `feat: add a key\n\nWhy it changes.\n\nRefs: CALC-17\n\n${CO_AUTHOR}\n`,
    'feat: add a key\n\nRefs: CALC-17\nRefs: CALC-18\n'
  ];

  for (const message of validMessages) {
    it(`passes ${JSON.stringify(message)}`, () => {
      assert.deepEqual(footerTicketReference(commit(message), 'always', 'CALC'), [true, '']);
    });
  }

  const messagesWithoutReference = [
    'feat: add a key\n',
    `feat: add a key\n\nWhy it changes.\n\n${CO_AUTHOR}\n`,
    'feat: add a key\nRefs: CALC-17\n',
    'feat: add a key\n\nRefs: CALC-17\n\nWhy it changes.\n',
    'feat!: drop a key\n\nBREAKING CHANGE: the key is gone\nRefs: CALC-17\n'
  ];

  for (const message of messagesWithoutReference) {
    it(`fails without a Refs: trailer in ${JSON.stringify(message)}`, () => {
      const [isValid, errorMessage] = footerTicketReference(commit(message), 'always', 'CALC');

      assert.equal(isValid, false);
      assert.match(errorMessage, /git trailer "Refs: CALC-<n>"/);
    });
  }

  for (const reference of [
    '#17',
    'CALC-017',
    'calc-17',
    'ISF-17',
    'CALC-17 CALC-18',
    'CALC-17, CALC-18',
    ''
  ]) {
    it(`fails with the malformed reference ${JSON.stringify(reference)}`, () => {
      const [isValid, errorMessage] = footerTicketReference(
        commit(`feat: add a key\n\nRefs: ${reference}\n`),
        'always',
        'CALC'
      );

      assert.equal(isValid, false);
      assert.match(
        errorMessage,
        new RegExp(`^"Refs: ${reference}" does not name a ticket of this repository`)
      );
    });
  }

  it('fails when one of several Refs: trailers is malformed', () => {
    const [isValid, errorMessage] = footerTicketReference(
      commit('feat: add a key\n\nRefs: CALC-17\nRefs: #18\n'),
      'always',
      'CALC'
    );

    assert.equal(isValid, false);
    assert.match(errorMessage, /"Refs: #18"/);
  });

  it('checks the tickets of the key it is given', () => {
    assert.deepEqual(
      footerTicketReference(commit('feat: add a key\n\nRefs: ISF-3\n'), 'always', 'ISF'),
      [true, '']
    );
    assert.equal(
      footerTicketReference(commit('feat: add a key\n\nRefs: CALC-3\n'), 'always', 'ISF')[0],
      false
    );
  });

  for (const ticketKey of [undefined, null, '', 42]) {
    it(`falls back to the CALC key for the key ${JSON.stringify(ticketKey)}`, () => {
      assert.deepEqual(
        footerTicketReference(commit('feat: add a key\n\nRefs: CALC-3\n'), 'always', ticketKey),
        [true, '']
      );
    });
  }

  it('defaults to always without a when value', () => {
    assert.equal(footerTicketReference(commit('feat: add a key\n'))[0], false);
  });

  it('requires no ticket at all with never', () => {
    assert.deepEqual(footerTicketReference(commit('feat: add a key\n'), 'never', 'CALC'), [
      true,
      'the footer must not name a ticket with a "Refs:" trailer'
    ]);
    assert.equal(
      footerTicketReference(commit('feat: add a key\n\nRefs: CALC-3\n'), 'never', 'CALC')[0],
      false
    );
  });

  for (const parsed of [undefined, null, {}, { raw: null }, { raw: 42 }]) {
    it(`fails without crashing for the parsed commit ${JSON.stringify(parsed)}`, () => {
      assert.equal(footerTicketReference(parsed, 'always', 'CALC')[0], false);
    });
  }
});
