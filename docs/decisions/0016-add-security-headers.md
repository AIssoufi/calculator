# 0016. Send the security headers from `public/_headers`

- Date: 2026-10-23
- Status: Accepted

## Context

The site sent no Content-Security-Policy, no HSTS and no frame protection, which the Lighthouse audits `csp-xss`, `clickjacking-mitigation` and `has-hsts` reported (#46). The calculator is static and holds no user data, so this is hardening, not the fix of a known attack.

## Decision

`public/_headers`, which Cloudflare Pages reads from the build, sends these headers on every response, the 404 page included:

- a Content-Security-Policy: `default-src 'self'`, a `style-src` that allows the site and, by its hash, the inline style of `404.html`, `base-uri 'none'`, `form-action 'none'`, `frame-ancestors 'none'` and `require-trusted-types-for 'script'`;
- `Strict-Transport-Security: max-age=31536000`, without `preload`, a decision that belongs to the whole `issoufi.fr` domain;
- a `Permissions-Policy` that turns off the camera, the microphone and the geolocation.

`e2e/headers.spec.ts` reads `_headers` from the build, checks the directives and the hash, and serves the calculator and the 404 page in Chromium, where any console error or `securitypolicyviolation` event fails the test.

## Alternatives considered

- A `<meta>` policy in `index.html`: a `<meta>` policy cannot carry `frame-ancestors`, and it would not cover the other headers.
- `'unsafe-inline'` in `style-src`: it would allow every inline style to keep one. The hash allows exactly that block. React sets `--screen-text-length` through the CSSOM, which `style-src` does not govern, so the app itself needs no exception.
- Cloudflare transform rules: they would keep the headers outside the repository, away from the review and the tests.

## Consequences

- Each edit of the inline style of `404.html` changes its hash, and the test fails and prints the new one.
- `vite preview` does not apply `_headers`, so the test reads the file and sets the headers itself; only the [Live check](0017-add-live-check.md) reads a header in production.
- Trusted Types forbid writing a string into the page as HTML or code, so a future dependency that does so needs a policy.
