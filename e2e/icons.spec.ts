import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

// The sizes of the icons that Chrome needs to install the app and to draw it on a home screen.
const INSTALL_ICON_SIZES = ['192x192', '512x512'];
const PNG_TYPE = 'image/png';
const ANY_PURPOSE = 'any';
const MASKABLE_PURPOSE = 'maskable';

// The size of the icon that iOS puts on its home screen.
const APPLE_TOUCH_ICON_SIZE = '180x180';

// The path that the installed app opens on: Cloudflare Pages redirects `/index.html` to it, so a
// start on `/index.html` would open on a redirect.
const START_PATH = '/';
// The path that browsers know the app by. Without an `id`, they took the former `start_url`, so
// keeping it lets the existing installs take the new one instead of being another app.
const APP_ID_PATH = '/index.html';
const HTTP_OK = 200;

const MANIFEST_LINK_SELECTOR = 'link[rel="manifest"]';
const APPLE_TOUCH_ICON_LINK_SELECTOR = 'link[rel="apple-touch-icon"]';

/** An entry of the `icons` list of the web app manifest. */
interface ManifestIcon {
  /** Path of the image, relative to the manifest. */
  src: string;
  /** Space-separated sizes of the image, such as `192x192`. */
  sizes: string;
  /** Media type of the image. */
  type?: string;
  /** Space-separated purposes of the image; `any` when absent. */
  purpose?: string;
}

/** The members of the web app manifest that the tests read. */
interface Manifest {
  /** The icons that the browser installs the app with. */
  icons: ManifestIcon[];
  /** The page that the installed app opens on, relative to the manifest. */
  start_url?: string;
  /** The identity of the installed app, relative to the origin of the start URL. */
  id?: string;
}

/** A fetched manifest with its own absolute URL. */
interface FetchedManifest {
  /** The content of the manifest. */
  manifest: Manifest;
  /** Absolute URL of the manifest, which its relative URLs resolve against. */
  manifestUrl: string;
}

/** A manifest icon with the absolute URL of its image. */
interface ManifestIconWithUrl extends ManifestIcon {
  /** Absolute URL of the image, resolved against the manifest. */
  url: string;
}

interface ReadLinkedUrlParams {
  /** The page of the test. */
  page: Page;
  /** Selector of the `link` element to read. */
  selector: string;
}

interface ReadManifestParams {
  /** The page of the test. */
  page: Page;
  /** The request context of the test, which fetches the manifest. */
  request: APIRequestContext;
}

interface ReadImageSizeParams {
  /** The page of the test, which decodes the image. */
  page: Page;
  /** Absolute URL of the image. */
  url: string;
}

/** Whether Chrome may show an icon as it is, which a purpose without `any` forbids. */
const hasAnyPurpose = (icon: ManifestIcon) =>
  (icon.purpose ?? ANY_PURPOSE).split(' ').includes(ANY_PURPOSE);

// Opens the app and returns the absolute URL of a link of its page, resolved as the browser does.
// A missing link fails at once, rather than after the timeout of the test.
const readLinkedUrl = async ({ page, selector }: ReadLinkedUrlParams) => {
  await page.goto('/');

  const link = page.locator(selector);

  await expect(link, `the ${selector} of the page`).toHaveCount(1);

  return link.evaluate(element => (element as HTMLLinkElement).href);
};

// Fetches the manifest that the page links and returns it with its URL.
const readManifest = async ({ page, request }: ReadManifestParams): Promise<FetchedManifest> => {
  const manifestUrl = await readLinkedUrl({ page, selector: MANIFEST_LINK_SELECTOR });
  const response = await request.get(manifestUrl);

  expect(response.ok(), `${manifestUrl} is served`).toBe(true);

  return { manifest: (await response.json()) as Manifest, manifestUrl };
};

// Fetches the manifest that the page links and returns its icons.
const readManifestIcons = async (params: ReadManifestParams): Promise<ManifestIconWithUrl[]> => {
  const { manifest, manifestUrl } = await readManifest(params);

  return manifest.icons.map(icon => ({ ...icon, url: new URL(icon.src, manifestUrl).href }));
};

// Decodes the image in the page and returns its size as the manifest writes it.
const readImageSize = ({ page, url }: ReadImageSizeParams) =>
  page.evaluate(async imageUrl => {
    const image = new Image();

    image.src = imageUrl;
    await image.decode();

    return `${image.naturalWidth}x${image.naturalHeight}`;
  }, url);

test('lists a PNG icon of each install size and a maskable one', async ({ page, request }) => {
  const icons = await readManifestIcons({ page, request });
  const pngIcons = icons.filter(icon => icon.type === PNG_TYPE);

  for (const size of INSTALL_ICON_SIZES) {
    expect(pngIcons.map(icon => icon.sizes), 'the sizes of the PNG icons').toContain(size);
  }

  expect(pngIcons.some(hasAnyPurpose), 'a PNG icon that Chrome installs with').toBe(true);
  expect(pngIcons.map(icon => icon.purpose), 'the purposes of the PNG icons').toContain(
    MASKABLE_PURPOSE
  );
});

// Chrome DevTools warns about every declared size that differs from the decoded one, and decodes
// an ICO file at its largest size only, so each icon declares that single size.
test('serves each icon of the manifest at the size it declares', async ({ page, request }) => {
  const icons = await readManifestIcons({ page, request });

  expect(icons.length, 'the number of icons').toBeGreaterThan(0);

  for (const icon of icons) {
    const size = await readImageSize({ page, url: icon.url });

    expect(icon.sizes, `the sizes declared for ${icon.src}`).toBe(size);
  }
});

// The members resolve as browsers resolve them, so an absent or empty one resolves to the manifest
// itself or to the root of the site, which fails the comparisons below.
test('starts the installed app on the root of the site, without a redirect', async ({
  page,
  request
}) => {
  const { manifest, manifestUrl } = await readManifest({ page, request });
  const startUrl = new URL(manifest.start_url ?? '', manifestUrl).href;
  const appIdUrl = new URL(manifest.id ?? '', new URL(startUrl).origin).href;

  expect(startUrl, 'the start_url of the manifest').toBe(new URL(START_PATH, manifestUrl).href);
  expect(appIdUrl, 'the id of the manifest').toBe(new URL(APP_ID_PATH, manifestUrl).href);

  const response = await request.get(startUrl, { maxRedirects: 0 });

  expect(response.status(), `the status of ${startUrl}`).toBe(HTTP_OK);
});

test('links an Apple touch icon of the size iOS uses', async ({ page }) => {
  const url = await readLinkedUrl({ page, selector: APPLE_TOUCH_ICON_LINK_SELECTOR });

  expect(await readImageSize({ page, url })).toBe(APPLE_TOUCH_ICON_SIZE);
});
