import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// The rules of WCAG 2.0, 2.1 and 2.2 at levels A and AA, with the best practices of axe. axe 4.14
// has no `wcag22a` tag, and `wcag21a` holds the 2.1 level A rule `label-content-name-mismatch`.
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

// The calculator, and the not found page as `vite preview` serves it (see `not-found.spec.ts`).
const PAGES = [
  { name: 'the calculator', route: '/', readyRole: 'status' },
  { name: 'the not found page', route: '/404.html', readyRole: 'heading' }
] as const;

// A phone and a laptop, as in the other specs.
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1280, height: 800 }
];

for (const viewport of VIEWPORTS) {
  test.describe(`at ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    for (const { name, route, readyRole } of PAGES) {
      test(`${name} has no axe violation`, async ({ page }) => {
        await page.goto(route);
        await expect(page.getByRole(readyRole).first()).toBeVisible();

        const { violations } = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
        // Each rule with its impact and the selectors of the elements that break it.
        const violationSummaries = violations.map(
          ({ id, impact, nodes }) =>
            `${id} (${impact ?? 'unknown impact'}): ${nodes.map(node => node.target.join(' ')).join(', ')}`
        );

        expect(violationSummaries, `the axe violations of ${route}`).toEqual([]);
      });
    }
  });
}
