import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { after, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const CHECK_SCRIPT = fileURLToPath(new URL('./check-live-site.sh', import.meta.url));

const SCRIPT_ASSET = 'assets/index-Ab_c-1.js';
const STYLESHEET_ASSET = 'assets/index-De2.css';

/** Home page as Vite builds it, with relative paths to its hashed assets. */
const HOME_PAGE = `<!doctype html>
<html lang="fr">
  <head>
    <title>Calculatrice</title>
    <script type="module" crossorigin src="./${SCRIPT_ASSET}"></script>
    <link rel="stylesheet" crossorigin href="./${STYLESHEET_ASSET}">
  </head>
  <body></body>
</html>`;

/** Answer of every path that the fake site does not list, as public/404.html gives it. */
const NOT_FOUND = { status: 404, body: '<!doctype html><title>Page introuvable</title>' };

/** Answers of a healthy deployment, by path; the status defaults to 200. */
const HEALTHY_SITE = {
  '/': { headers: { 'content-security-policy': "default-src 'self'" }, body: HOME_PAGE },
  [`/${SCRIPT_ASSET}`]: { body: 'export {};' },
  [`/${STYLESHEET_ASSET}`]: { body: 'body {}' },
  '/manifest.json': {
    headers: { 'content-type': 'application/json' },
    body: '{ "name": "Calculatrice" }'
  }
};

/** Checks that the script makes on a page with one script and one stylesheet, as HEALTHY_SITE. */
const HEALTHY_SITE_CHECK_COUNT = 8;

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
 * Serves a fake deployment on a free local port.
 *
 * @param {Record<string, { status?: number, headers?: Record<string, string>, body?: string }>} site
 * - Answer of each path.
 * @returns {Promise<string>} The base URL of the site.
 */
const serveSite = async site => {
  const server = createServer((request, response) => {
    const { status = 200, headers = {}, body = '' } = site[request.url] ?? NOT_FOUND;

    response.writeHead(status, headers);
    response.end(body);
  });

  servers.push(server);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  return `http://127.0.0.1:${server.address().port}`;
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
 * Runs the script asynchronously, so that the fake site of this process can answer it.
 *
 * @param {{ args: string[], env?: Record<string, string> }} params - Arguments of the script, and
 * environment variables added to a run outside GitHub Actions.
 */
const runScript = async ({ args, env = {} }) => {
  const options = { env: { ...PLAIN_ENV, GITHUB_ACTIONS: '', ...env } };

  try {
    const { stdout, stderr } = await execFileAsync('bash', [CHECK_SCRIPT, ...args], options);

    return { exitCode: 0, stdout, stderr };
  } catch (error) {
    return { exitCode: error.code, stdout: error.stdout, stderr: error.stderr };
  }
};

/** Serves the given fake deployment and checks it. */
const checkSite = async site => runScript({ args: [await serveSite(site)] });

/** Lines of the output that report a failed check. */
const failedChecks = stdout => stdout.split('\n').filter(line => line.startsWith('FAIL '));

describe('check-live-site.sh', () => {
  it('passes every check of a healthy deployment', async () => {
    const baseUrl = await serveSite(HEALTHY_SITE);
    const { exitCode, stdout } = await runScript({ args: [baseUrl] });

    assert.equal(exitCode, 0);
    assert.equal(
      stdout,
      [
        `Checking ${baseUrl}`,
        'ok   home page answers 200',
        'ok   home page holds <title>Calculatrice</title>',
        'ok   home page sends a Content-Security-Policy header',
        `ok   script ${SCRIPT_ASSET} answers 200`,
        `ok   stylesheet ${STYLESHEET_ASSET} answers 200`,
        'ok   manifest.json answers 200',
        'ok   manifest.json is a JSON object',
        'ok   /does-not-exist answers 404',
        `All ${HEALTHY_SITE_CHECK_COUNT} checks passed on ${baseUrl}`,
        ''
      ].join('\n')
    );
  });

  it('drops the trailing slash of the URL', async () => {
    const baseUrl = await serveSite(HEALTHY_SITE);
    const { exitCode, stdout } = await runScript({ args: [`${baseUrl}/`] });

    assert.equal(exitCode, 0);
    assert.match(
      stdout,
      new RegExp(`^All ${HEALTHY_SITE_CHECK_COUNT} checks passed on ${baseUrl}$`, 'm')
    );
  });

  it('keeps an http scheme written in capitals', async () => {
    const baseUrl = (await serveSite(HEALTHY_SITE)).replace('http://', 'HTTP://');
    const { exitCode, stdout } = await runScript({ args: [baseUrl] });

    assert.equal(exitCode, 0);
    assert.match(stdout, new RegExp(`^Checking ${baseUrl}$`, 'm'));
  });

  it('keeps an https scheme written in capitals', async () => {
    const baseUrl = (await serveSite(HEALTHY_SITE)).replace('http://', 'Https://');
    const { exitCode, stdout } = await runScript({ args: [baseUrl] });

    // The fake site speaks plain HTTP, so every request over HTTPS fails.
    assert.equal(exitCode, 1);
    assert.match(stdout, new RegExp(`^Checking ${baseUrl}$`, 'm'));
  });

  it('adds https:// to a host given without a scheme', async () => {
    const host = (await serveSite(HEALTHY_SITE)).replace('http://', '');
    const { exitCode, stdout } = await runScript({ args: [host] });

    // The fake site speaks plain HTTP, so every request over HTTPS fails.
    assert.equal(exitCode, 1);
    assert.match(stdout, new RegExp(`^Checking https://${host}$`, 'm'));
  });

  it('checks every distinct script and stylesheet that the page references', async () => {
    const page = HOME_PAGE.replace(
      '</head>',
      '<link rel="modulepreload" href="./assets/index-Xy9.js"><link href="./assets/index-De2.css"></head>'
    );
    const site = {
      ...HEALTHY_SITE,
      '/': { ...HEALTHY_SITE['/'], body: page },
      '/assets/index-Xy9.js': { body: '' }
    };
    const { exitCode, stdout } = await checkSite(site);

    assert.equal(exitCode, 0);
    assert.match(stdout, /^ok {3}script assets\/index-Xy9\.js answers 200$/m);
    assert.equal(stdout.match(/^ok {3}stylesheet /gm).length, 1);
    // One check more than a healthy site, for the second script.
    assert.match(stdout, new RegExp(`^All ${HEALTHY_SITE_CHECK_COUNT + 1} checks passed`, 'm'));
  });

  const FAILURES = [
    {
      title: 'a home page that is not found',
      site: { ...HEALTHY_SITE, '/': { ...HEALTHY_SITE['/'], status: 404 } },
      expected: ['FAIL home page answers 200: got 404']
    },
    {
      title: 'a home page that redirects, since redirects are not followed',
      site: { ...HEALTHY_SITE, '/': { ...HEALTHY_SITE['/'], status: 301 } },
      expected: ['FAIL home page answers 200: got 301']
    },
    {
      title: 'a home page with another title',
      site: {
        ...HEALTHY_SITE,
        '/': { ...HEALTHY_SITE['/'], body: HOME_PAGE.replace('Calculatrice', 'Calculator') }
      },
      expected: [
        'FAIL home page holds <title>Calculatrice</title>: the page holds <title>Calculator</title>'
      ]
    },
    {
      title: 'a home page without a title',
      site: {
        ...HEALTHY_SITE,
        '/': { ...HEALTHY_SITE['/'], body: HOME_PAGE.replace('<title>Calculatrice</title>', '') }
      },
      expected: [
        'FAIL home page holds <title>Calculatrice</title>: the body starts with <!doctype html> ' +
          '<html lang="fr"> <head> <script t'
      ]
    },
    {
      title: 'a home page without a body',
      site: { ...HEALTHY_SITE, '/': { ...HEALTHY_SITE['/'], body: '' } },
      expected: [
        'FAIL home page holds <title>Calculatrice</title>: the body is empty',
        'FAIL home page references a script: no assets/index-*.js in the page',
        'FAIL home page references a stylesheet: no assets/index-*.css in the page'
      ]
    },
    {
      title: 'a home page without a Content-Security-Policy header',
      site: { ...HEALTHY_SITE, '/': { body: HOME_PAGE } },
      expected: [
        'FAIL home page sends a Content-Security-Policy header: no such header, or an empty one'
      ]
    },
    {
      title: 'an empty Content-Security-Policy header',
      site: {
        ...HEALTHY_SITE,
        '/': { headers: { 'content-security-policy': '' }, body: HOME_PAGE }
      },
      expected: [
        'FAIL home page sends a Content-Security-Policy header: no such header, or an empty one'
      ]
    },
    {
      title: 'a missing script',
      site: { ...HEALTHY_SITE, [`/${SCRIPT_ASSET}`]: NOT_FOUND },
      expected: [`FAIL script ${SCRIPT_ASSET} answers 200: got 404`]
    },
    {
      title: 'a missing stylesheet',
      site: { ...HEALTHY_SITE, [`/${STYLESHEET_ASSET}`]: NOT_FOUND },
      expected: [`FAIL stylesheet ${STYLESHEET_ASSET} answers 200: got 404`]
    },
    {
      title: 'a page that references no hashed script',
      site: {
        ...HEALTHY_SITE,
        '/': { ...HEALTHY_SITE['/'], body: HOME_PAGE.replace(SCRIPT_ASSET, 'assets/main.js') }
      },
      expected: ['FAIL home page references a script: no assets/index-*.js in the page']
    },
    {
      title: 'a missing manifest',
      site: { ...HEALTHY_SITE, '/manifest.json': NOT_FOUND },
      expected: [
        'FAIL manifest.json answers 200: got 404',
        'FAIL manifest.json is a JSON object: the body starts with ' +
          '<!doctype html><title>Page introuvable</title>'
      ]
    },
    {
      title: 'a manifest answered with the home page, as a single-page fallback does',
      site: { ...HEALTHY_SITE, '/manifest.json': { body: HOME_PAGE } },
      expected: [
        'FAIL manifest.json is a JSON object: the body starts with <!doctype html> ' +
          '<html lang="fr"> <head> <title>Calcula'
      ]
    },
    {
      title: 'an empty manifest',
      site: { ...HEALTHY_SITE, '/manifest.json': { body: '' } },
      expected: ['FAIL manifest.json is a JSON object: the body is empty']
    },
    {
      title: 'a manifest that is JSON but not an object',
      site: { ...HEALTHY_SITE, '/manifest.json': { body: '["Calculatrice"]' } },
      expected: ['FAIL manifest.json is a JSON object: the body starts with ["Calculatrice"]']
    },
    {
      title: 'a manifest cut in the middle',
      site: { ...HEALTHY_SITE, '/manifest.json': { body: '{ "name": "Calcu' } },
      expected: ['FAIL manifest.json is a JSON object: the body starts with { "name": "Calcu']
    },
    {
      title: 'an unknown path answered with the home page and a 200',
      site: { ...HEALTHY_SITE, '/does-not-exist': HEALTHY_SITE['/'] },
      expected: ['FAIL /does-not-exist answers 404: got 200']
    }
  ];

  FAILURES.forEach(({ title, site, expected }) => {
    it(`fails on ${title}, naming the check`, async () => {
      const { exitCode, stdout } = await checkSite(site);

      assert.equal(exitCode, 1);
      assert.deepEqual(failedChecks(stdout), expected);
      assert.match(stdout, new RegExp(`^${expected.length} of \\d+ checks failed on `, 'm'));
    });
  });

  it('fails every request check of a host that does not answer, with the error of curl', async () => {
    const baseUrl = await findClosedUrl();
    const { exitCode, stdout } = await runScript({ args: [baseUrl] });
    const failures = failedChecks(stdout);

    assert.equal(exitCode, 1);
    assert.equal(failures.length, HEALTHY_SITE_CHECK_COUNT);
    // Error 7 of curl: it could not connect.
    assert.match(failures[0], /^FAIL home page answers 200: no answer, curl: \(7\) /);
    assert.match(
      stdout,
      new RegExp(
        `^${HEALTHY_SITE_CHECK_COUNT} of ${HEALTHY_SITE_CHECK_COUNT} checks failed on ${baseUrl}$`,
        'm'
      )
    );
  });

  it('turns each failed check into an error annotation in GitHub Actions', async () => {
    const baseUrl = await serveSite({ ...HEALTHY_SITE, '/manifest.json': NOT_FOUND });
    const { exitCode, stdout } = await runScript({
      args: [baseUrl],
      env: { GITHUB_ACTIONS: 'true' }
    });

    assert.equal(exitCode, 1);
    assert.match(stdout, /^::error::FAIL manifest\.json answers 200: got 404$/m);
    assert.match(stdout, /^ok {3}home page answers 200$/m);
  });

  [
    { title: 'without an argument', args: [] },
    { title: 'with an empty argument', args: [''] },
    { title: 'with a blank argument', args: [' \t '] },
    { title: 'with a scheme other than http or https', args: ['ftp://calculator.issoufi.fr'] },
    { title: 'with two arguments', args: ['https://calculator.issoufi.fr', 'extra'] }
  ].forEach(({ title, args }) => {
    it(`prints the usage and exits 2 ${title}`, async () => {
      const { exitCode, stdout, stderr } = await runScript({ args });

      assert.equal(exitCode, 2);
      assert.equal(stdout, '');
      assert.match(stderr, /^Usage: .*check-live-site\.sh <URL or host>$/m);
    });
  });
});
