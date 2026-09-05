// pa11y-ci: axe-core and HTML CodeSniffer against WCAG 2 AA, on every page,
// at phone and desktop viewports. Run through `npm run check:a11y`, which
// serves the built site first.
//
// The page reveals sections on scroll (opacity 0 until they intersect), and
// axe skips invisible text, so the checker would otherwise never test most
// of the page's colour contrast. Emulating prefers-reduced-motion makes the
// stylesheet show everything up front, exactly as it does for users with
// that preference.
const base = 'http://127.0.0.1:4321';

const revealEverything = async (page) => {
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
};

const phone = { width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
const desktop = { width: 1280, height: 900 };

module.exports = {
  defaults: {
    standard: 'WCAG2AA',
    runners: ['axe', 'htmlcs'],
    timeout: 60000,
    wait: 500,
    beforeScript: revealEverything,
    // axe marks contrast it cannot compute (gradient backgrounds, symbol-only
    // text such as arrows and separators) as "needs review". Those are not
    // failures; measured violations still are. Inspect them with
    // `npx pa11y <url> --runner axe --include-warnings`.
    levelCapWhenNeedsReview: 'warning',
    chromeLaunchConfig: { args: ['--no-sandbox'] },
  },
  urls: [
    { url: `${base}/`, viewport: phone },
    { url: `${base}/`, viewport: desktop },
    { url: `${base}/pomodoro.html`, viewport: phone },
    { url: `${base}/snake.html`, viewport: phone },
  ],
};
