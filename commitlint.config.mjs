import { TICKET_KEY, TICKET_RULE_NAME } from './scripts/commits/constants.mjs';
import { footerTicketReference } from './scripts/commits/rules.mjs';
import { isBotCommit } from './scripts/commits/utils/bots.mjs';

/** Level of a commitlint rule that fails the check. */
const ERROR = 2;

/**
 * Commit message convention: a Conventional Commits header, and a `Refs: CALC-<n>` git trailer
 * that names the ticket. Merge commits, reverts and the commits of release-please and Dependabot
 * are ignored. See the "Commit messages" section of the README.
 *
 * @type {import('@commitlint/types').UserConfig}
 */
const config = {
    extends: ['@commitlint/config-conventional'],
    plugins: [{ rules: { [TICKET_RULE_NAME]: footerTicketReference } }],
    rules: {
        [TICKET_RULE_NAME]: [ERROR, 'always', TICKET_KEY]
    },
    ignores: [isBotCommit],
    helpUrl: 'https://github.com/AIssoufi/calculator#commit-messages'
};

export default config;
