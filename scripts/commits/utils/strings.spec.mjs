import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isNonEmptyString } from './strings.mjs';

describe('isNonEmptyString', () => {
  for (const value of ['a', ' ']) {
    it(`accepts ${JSON.stringify(value)}`, () => {
      assert.equal(isNonEmptyString(value), true);
    });
  }

  for (const value of ['', null, undefined, 0, NaN, ['a'], {}]) {
    it(`rejects ${JSON.stringify(value)}`, () => {
      assert.equal(isNonEmptyString(value), false);
    });
  }
});
