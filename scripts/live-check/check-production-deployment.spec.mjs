import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const CHECK_SCRIPT = fileURLToPath(new URL('./check-production-deployment.sh', import.meta.url));

const REPOSITORY = 'owner/repo';
const BRANCH = 'master';
const CHECK_NAME = 'Cloudflare Pages';
const CHECK_LINE = `${CHECK_NAME} of ${BRANCH}`;
const COMMIT = '4475253abc';
const DETAILS_URL = 'https://dash.cloudflare.com/deployment';
const TOKEN = 'a-token';
const EARLIER = '2026-10-28T15:00:12Z';
const LATER = '2026-10-28T15:06:43Z';

/** Answer of the API for a commit without the check. */
const NO_CHECK_RUNS = '{ "check_runs": [] }';

/** The run that Cloudflare opens first and never completes, as the API gives it. */
const OPENED_RUN = { status: 'in_progress', conclusion: null, started_at: EARLIER };

/** The run of a finished deployment, as the API gives it, with the given conclusion. */
const finishedRun = conclusion => ({
  status: 'completed',
  conclusion,
  started_at: LATER,
  head_sha: COMMIT,
  details_url: DETAILS_URL
});

/**
 * Environment of this process without FORCE_COLOR, and with NO_COLOR, so that no tool colors the
 * text that the tests read.
 */
const PLAIN_ENV = {
  ...Object.fromEntries(Object.entries(process.env).filter(([name]) => name !== 'FORCE_COLOR')),
  NO_COLOR: '1'
};

const execFileAsync = promisify(execFile);
const servers = [];

after(() => {
  servers.forEach(server => {
    server.closeAllConnections();
    server.close();
  });
});

/**
 * Serves one answer of a fake GitHub API on a free local port.
 *
 * @param {{ status?: number, body?: string }} [answer] - The answer to every request.
 * @returns {Promise<{ apiUrl: string, requests: import('node:http').IncomingMessage[] }>} The base
 * URL of the API, and the requests that it received.
 */
const serveApi = async ({ status = 200, body = '' } = {}) => {
  const requests = [];
  const server = createServer((request, response) => {
    requests.push(request);
    response.writeHead(status);
    response.end(body);
  });

  servers.push(server);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  return { apiUrl: `http://127.0.0.1:${server.address().port}`, requests };
};

/** Gives a local URL where nothing listens, by closing a server right after it starts. */
const findClosedUrl = async () => {
  const server = createServer();

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();

  server.close();
  await once(server, 'close');

  return `http://127.0.0.1:${port}`;
};

/**
 * Runs the script asynchronously, so that the fake API of this process can answer it.
 *
 * @param {{ args?: string[], env?: Record<string, string> }} params - Arguments of the script, and
 * environment variables added to a run outside GitHub Actions and without a token.
 */
const runScript = async ({ args = [REPOSITORY, BRANCH], env = {} }) => {
  const options = { env: { ...PLAIN_ENV, GITHUB_ACTIONS: '', GITHUB_TOKEN: '', ...env } };

  try {
    const { stdout, stderr } = await execFileAsync('bash', [CHECK_SCRIPT, ...args], options);

    return { exitCode: 0, stdout, stderr };
  } catch (error) {
    return { exitCode: error.code, stdout: error.stdout, stderr: error.stderr };
  }
};

/** Runs the script against an API that gives the given answer. */
const checkAnswer = async answer => {
  const { apiUrl } = await serveApi(answer);

  return runScript({ env: { GITHUB_API_URL: apiUrl } });
};

/** Runs the script against an API that answers with the given check runs. */
const checkRuns = checkRunList =>
  checkAnswer({ body: JSON.stringify({ check_runs: checkRunList }) });

describe('check-production-deployment.sh', () => {
  describe('on the state of the check', () => {
    it('fails on a check that concluded failure, naming the commit and the deployment', async () => {
      const { exitCode, stdout } = await checkRuns([finishedRun('failure')]);

      assert.equal(exitCode, 1);
      assert.equal(stdout, `FAIL ${CHECK_LINE}: failure on ${COMMIT}, see ${DETAILS_URL}\n`);
    });

    it('passes on a check that concluded success', async () => {
      const { exitCode, stdout } = await checkRuns([finishedRun('success')]);

      assert.equal(exitCode, 0);
      assert.equal(stdout, `ok   ${CHECK_LINE}: success\n`);
    });

    it('passes on a build in progress', async () => {
      const { exitCode, stdout } = await checkRuns([OPENED_RUN]);

      assert.equal(exitCode, 0);
      assert.equal(stdout, `ok   ${CHECK_LINE}: in_progress\n`);
    });

    it('passes on a queued build, which has no start time yet', async () => {
      const { exitCode, stdout } = await checkRuns([
        { status: 'queued', conclusion: null, started_at: null }
      ]);

      assert.equal(exitCode, 0);
      assert.equal(stdout, `ok   ${CHECK_LINE}: queued\n`);
    });

    it('passes on a commit without that check', async () => {
      const { exitCode, stdout } = await checkRuns([]);

      assert.equal(exitCode, 0);
      assert.equal(stdout, `ok   ${CHECK_LINE}: no such check on this commit\n`);
    });

    it('passes on a cancelled build', async () => {
      const { exitCode, stdout } = await checkRuns([finishedRun('cancelled')]);

      assert.equal(exitCode, 0);
      assert.equal(stdout, `ok   ${CHECK_LINE}: cancelled\n`);
    });

    it('reads the last run started, whatever the order of the list', async () => {
      const failed = finishedRun('failure');

      assert.equal((await checkRuns([OPENED_RUN, failed])).exitCode, 1);
      assert.equal((await checkRuns([failed, OPENED_RUN])).exitCode, 1);
    });

    it('passes on a new build after a failure', async () => {
      const failed = { ...finishedRun('failure'), started_at: EARLIER };
      const { exitCode, stdout } = await checkRuns([failed, finishedRun('success')]);

      assert.equal(exitCode, 0);
      assert.equal(stdout, `ok   ${CHECK_LINE}: success\n`);
    });
  });

  describe('on the request', () => {
    it('asks for the latest run of that check on the given commit', async () => {
      const { apiUrl, requests } = await serveApi({ body: NO_CHECK_RUNS });

      await runScript({ args: [REPOSITORY, COMMIT], env: { GITHUB_API_URL: apiUrl } });

      const { pathname, searchParams } = new URL(requests[0].url, apiUrl);

      assert.equal(requests.length, 1);
      assert.equal(pathname, `/repos/${REPOSITORY}/commits/${COMMIT}/check-runs`);
      assert.equal(searchParams.get('check_name'), CHECK_NAME);
      assert.equal(searchParams.get('filter'), 'latest');
    });

    it('accepts an API URL with a trailing slash', async () => {
      const { apiUrl, requests } = await serveApi({ body: NO_CHECK_RUNS });

      await runScript({ env: { GITHUB_API_URL: `${apiUrl}/` } });

      assert.ok(requests[0].url.startsWith(`/repos/${REPOSITORY}/`));
    });

    it('sends the token, and prints it nowhere', async () => {
      const { apiUrl, requests } = await serveApi({ body: NO_CHECK_RUNS });
      const { stdout, stderr } = await runScript({
        env: { GITHUB_API_URL: apiUrl, GITHUB_TOKEN: TOKEN }
      });

      assert.equal(requests[0].headers.authorization, `Bearer ${TOKEN}`);
      assert.doesNotMatch(`${stdout}${stderr}`, new RegExp(TOKEN));
    });

    it('sends no authorization without a token', async () => {
      const { apiUrl, requests } = await serveApi({ body: NO_CHECK_RUNS });

      await runScript({ env: { GITHUB_API_URL: apiUrl } });

      assert.equal(requests[0].headers.authorization, undefined);
    });
  });

  describe('on a bad answer', () => {
    it('fails when GitHub refuses the request', async () => {
      const { exitCode, stdout } = await checkAnswer({ status: 403, body: '{}' });

      assert.equal(exitCode, 1);
      assert.equal(stdout, `FAIL ${CHECK_LINE}: GitHub answered 403\n`);
    });

    it('fails on an unknown commit', async () => {
      const { exitCode, stdout } = await checkAnswer({ status: 422, body: '{}' });

      assert.equal(exitCode, 1);
      assert.equal(stdout, `FAIL ${CHECK_LINE}: GitHub answered 422\n`);
    });

    it('fails when GitHub does not answer', async () => {
      const { exitCode, stdout } = await runScript({
        env: { GITHUB_API_URL: await findClosedUrl() }
      });

      assert.equal(exitCode, 1);
      assert.match(stdout, new RegExp(`^FAIL ${CHECK_LINE}: no answer from GitHub, curl: \\(7\\)`));
    });

    for (const [title, body] of [
      ['an empty body', ''],
      ['a body that is not JSON', '<html>'],
      ['an answer without check runs', '{}'],
      ['check runs that are not a list', '{ "check_runs": {} }'],
      ['check runs that are not objects', '{ "check_runs": [1] }'],
      ['check runs that hold null', '{ "check_runs": [null] }'],
      ['a run without a status', '{ "check_runs": [{}] }']
    ]) {
      it(`fails on ${title}`, async () => {
        const { exitCode, stdout } = await checkAnswer({ body });

        assert.equal(exitCode, 1);
        assert.equal(stdout, `FAIL ${CHECK_LINE}: GitHub gave an unreadable answer\n`);
      });
    }
  });

  describe('in GitHub Actions', () => {
    it('turns the failed check into an error annotation', async () => {
      const { apiUrl } = await serveApi({
        body: JSON.stringify({ check_runs: [finishedRun('failure')] })
      });
      const { stdout } = await runScript({
        env: { GITHUB_API_URL: apiUrl, GITHUB_ACTIONS: 'true' }
      });

      assert.equal(
        stdout,
        `::error::FAIL ${CHECK_LINE}: failure on ${COMMIT}, see ${DETAILS_URL}\n`
      );
    });

    it('prints a passed check as is', async () => {
      const { apiUrl } = await serveApi({ body: NO_CHECK_RUNS });
      const { stdout } = await runScript({
        env: { GITHUB_API_URL: apiUrl, GITHUB_ACTIONS: 'true' }
      });

      assert.ok(stdout.startsWith('ok   '));
    });
  });

  describe('on its usage', () => {
    for (const [title, args] of [
      ['no argument', []],
      ['one argument', [REPOSITORY]],
      ['three arguments', [REPOSITORY, BRANCH, BRANCH]],
      ['an empty repository', ['', BRANCH]],
      ['a repository without an owner', ['repo', BRANCH]],
      ['a repository with a blank', ['owner/my repo', BRANCH]],
      ['a repository with two slashes', ['owner/repo/more', BRANCH]],
      ['an empty ref', [REPOSITORY, '']],
      ['a blank ref', [REPOSITORY, '   ']]
    ]) {
      it(`refuses ${title}`, async () => {
        const { exitCode, stdout, stderr } = await runScript({ args });

        assert.equal(exitCode, 2);
        assert.equal(stdout, '');
        assert.match(stderr, /^Usage: /);
      });
    }
  });
});
