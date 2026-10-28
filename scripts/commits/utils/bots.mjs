import { DEPENDABOT_SIGN_OFF_PATTERN, RELEASE_PLEASE_HEADER_PATTERN } from '../constants.mjs';

/**
 * Tells whether a commit comes from a bot whose messages this repository does not control:
 * a release of release-please or a dependency update of Dependabot. Commitlint ignores them.
 *
 * @param {unknown} message - Full commit message.
 * @returns {boolean} `false` for any other message or a non-string.
 */
export const isBotCommit = message => {
  if (typeof message !== 'string') {
    return false;
  }

  const isReleasePleaseCommit = RELEASE_PLEASE_HEADER_PATTERN.test(message);
  const isDependabotCommit = DEPENDABOT_SIGN_OFF_PATTERN.test(message);

  return isReleasePleaseCommit || isDependabotCommit;
};
