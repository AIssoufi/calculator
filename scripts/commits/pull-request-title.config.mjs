import config from '../../commitlint.config.mjs';
import { TICKET_RULE_NAME } from './constants.mjs';

/** Level of a commitlint rule that is turned off. */
const DISABLED = 0;

/**
 * Commitlint configuration for the title of a pull request: the convention of the commits,
 * without the `Refs:` trailer, since a title is a header alone.
 *
 * @type {import('@commitlint/types').UserConfig}
 */
const pullRequestTitleConfig = {
  ...config,
  rules: {
    ...config.rules,
    [TICKET_RULE_NAME]: [DISABLED]
  }
};

export default pullRequestTitleConfig;
