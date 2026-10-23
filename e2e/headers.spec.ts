import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

// The headers file of Cloudflare Pages. Pages keeps it private, but `vite preview` serves it with
// the other files of the build, so the tests read the file that a deployment applies.
const HEADERS_FILE_PATH = '/_headers';

// The rule of `_headers` that matches every path, and the security headers it sets.
const EVERY_PATH_PATTERN = '/*';
const CONTENT_SECURITY_POLICY_HEADER = 'content-security-policy';
const PERMISSIONS_POLICY_HEADER = 'permissions-policy';
const STRICT_TRANSPORT_SECURITY_HEADER = 'strict-transport-security';

// The directives that keep the page to the files of the site, with their only source.
const REQUIRED_DIRECTIVES = {
  'default-src': ["'self'"],
  'base-uri': ["'none'"],
  'form-action': ["'none'"],
  'frame-ancestors': ["'none'"]
};

// Sources that would let an injected script or style run.
const UNSAFE_SOURCES = ["'unsafe-inline'", "'unsafe-eval'"];

// The directive that allows the inline style of the 404 page by its hash.
const STYLE_DIRECTIVE = 'style-src';

// HSTS for a year, in seconds.
const STRICT_TRANSPORT_SECURITY = 'max-age=31536000';

// The browser features that the page never uses, turned off for it and for any frame.
const DISABLED_FEATURES = ['camera=()', 'microphone=()', 'geolocation=()'];

// The page that Cloudflare Pages serves for every unknown path. `vite preview` has no such
// fallback, so the tests open the file itself.
const NOT_FOUND_PATH = '/404.html';

// The example of "How it computes" in the README, as the smoke tests type it.
const TYPED_KEYS = '2+3*4=';
const EXPECTED_RESULT = '20';

// Start of the console error that the page logs for each violation of the policy.
const VIOLATION_MESSAGE = 'Content-Security-Policy violation:';

/** Header values of a response, by lower-case name. */
type HeaderValues = Record<string, string>;

interface OpenWithHeadersParams {
  /** The page of the test. */
  page: Page;
  /** Path to open. */
  pathname: string;
  /** Headers added to every response. */
  headers: HeaderValues;
}

// Reads the headers that `_headers` sets on every path. A line that starts with a space or a tab
// holds a header of the path pattern above it, and a line that starts with `#` is a comment. A
// pattern written twice keeps the headers of both rules, as Cloudflare Pages applies both. A
// header written twice keeps its last value here, where Pages joins both values with a comma.
const readEveryPathHeaders = async (request: APIRequestContext) => {
  const response = await request.get(HEADERS_FILE_PATH);

  expect(response.ok(), `${HEADERS_FILE_PATH} is in the build`).toBe(true);

  const headersByPattern = new Map<string, HeaderValues>();
  let patternHeaders: HeaderValues = {};

  for (const line of (await response.text()).split('\n')) {
    const trimmedLine = line.trim();
    const isBlankOrComment = trimmedLine === '' || trimmedLine.startsWith('#');
    const isHeader = /^\s/.test(line);

    if (isBlankOrComment) {
      continue;
    }

    if (!isHeader) {
      patternHeaders = headersByPattern.get(trimmedLine) ?? {};
      headersByPattern.set(trimmedLine, patternHeaders);
      continue;
    }

    const [name, ...valueParts] = trimmedLine.split(':');

    patternHeaders[name.trim().toLowerCase()] = valueParts.join(':').trim();
  }

  return headersByPattern.get(EVERY_PATH_PATTERN) ?? {};
};

// Splits a Content-Security-Policy into its directives, each with its sources.
const parseDirectives = (policy = '') =>
  new Map(
    policy
      .split(';')
      .map(directive => directive.trim())
      .filter(Boolean)
      .map((directive): [string, string[]] => {
        const [name, ...sources] = directive.split(/\s+/);

        return [name, sources];
      })
  );

// Opens a path with the headers added to every response, as Cloudflare Pages sends them, and
// returns the list that collects the console errors of the page. The page logs each violation of
// the policy from the standard `securitypolicyviolation` event, rather than rely on the message
// that Chromium logs for it.
const openWithHeaders = async ({ page, pathname, headers }: OpenWithHeadersParams) => {
  const consoleErrors: string[] = [];

  page.on('console', message => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', error => consoleErrors.push(error.message));
  await page.addInitScript(violationMessage => {
    document.addEventListener('securitypolicyviolation', event =>
      console.error(`${violationMessage} ${event.violatedDirective} blocks ${event.blockedURI}`)
    );
  }, VIOLATION_MESSAGE);
  await page.route('**/*', async route => {
    const response = await route.fetch();

    await route.fulfill({ response, headers: { ...response.headers(), ...headers } });
  });
  await page.goto(pathname);

  return consoleErrors;
};

test('sends the security headers on every path', async ({ request }) => {
  const headers = await readEveryPathHeaders(request);
  const directives = parseDirectives(headers[CONTENT_SECURITY_POLICY_HEADER]);
  const sources = [...directives.values()].flat();
  const disabledFeatures = (headers[PERMISSIONS_POLICY_HEADER] ?? '')
    .split(',')
    .map(feature => feature.trim());

  for (const [name, expectedSources] of Object.entries(REQUIRED_DIRECTIVES)) {
    expect(directives.get(name), `the ${name} of the policy`).toEqual(expectedSources);
  }

  for (const unsafeSource of UNSAFE_SOURCES) {
    expect(sources, 'the sources of the policy').not.toContain(unsafeSource);
  }

  expect(headers[STRICT_TRANSPORT_SECURITY_HEADER], 'the HSTS header').toBe(
    STRICT_TRANSPORT_SECURITY
  );

  for (const feature of DISABLED_FEATURES) {
    expect(disabledFeatures, 'the features of the Permissions-Policy').toContain(feature);
  }
});

// Every edit of a `<style>` block of the 404 page changes its hash: the message of a failure
// gives the new one, to write in the policy of `_headers`.
test('allows the inline style of the 404 page by its hash', async ({ page, request }) => {
  const headers = await readEveryPathHeaders(request);
  const styleSources =
    parseDirectives(headers[CONTENT_SECURITY_POLICY_HEADER]).get(STYLE_DIRECTIVE) ?? [];

  await page.goto(NOT_FOUND_PATH);

  const styleHashes = await page.locator('style').evaluateAll(styles =>
    Promise.all(
      styles.map(async style => {
        const text = new TextEncoder().encode(style.textContent ?? '');
        const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', text));

        return `'sha256-${btoa(String.fromCharCode(...digest))}'`;
      })
    )
  );

  for (const styleHash of styleHashes) {
    expect(styleSources, `the ${STYLE_DIRECTIVE} of the policy`).toContain(styleHash);
  }
});

test('runs the calculator under these headers', async ({ page, request }) => {
  const headers = await readEveryPathHeaders(request);
  const consoleErrors = await openWithHeaders({ page, pathname: '/', headers });
  const calculatorScreen = page.getByRole('status');

  // The keys listen to the keyboard once React has rendered the screen (see #36).
  await expect(calculatorScreen).toBeVisible();
  await page.keyboard.type(TYPED_KEYS);

  await expect(calculatorScreen).toHaveText(EXPECTED_RESULT);
  expect(consoleErrors, 'the console errors').toEqual([]);
});

test('styles the 404 page under these headers', async ({ page, request }) => {
  const headers = await readEveryPathHeaders(request);
  const consoleErrors = await openWithHeaders({ page, pathname: NOT_FOUND_PATH, headers });

  // Only the inline style centers the text of the card.
  await expect(page.locator('main')).toHaveCSS('text-align', 'center');
  expect(consoleErrors, 'the console errors').toEqual([]);
});
