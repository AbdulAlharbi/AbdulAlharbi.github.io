// pa11y-ci: axe-core and HTML CodeSniffer against WCAG 2 AA, on every page,
// at phone and desktop viewports. Run through `npm run check:a11y`, which
// serves the built site first.
//
// Two things have to be arranged before the checkers run, or most of the page
// is never actually tested:
//
//   1. Sections are transparent until they scroll into view, and axe skips
//      invisible text, so colour contrast would go unchecked below the fold.
//      Chrome's --force-prefers-reduced-motion makes the stylesheet show
//      everything up front, exactly as it does for users with that preference.
//   2. The email address lives in a closed <details>, and axe cannot see
//      inside one. The home page runs open it first, so the panel, the copy
//      button and the status line are all in front of the checkers.
//
// Note for future edits: this pa11y takes `actions`, not `beforeScript`.
const base = 'http://127.0.0.1:4321';

const phone = { width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
const desktop = { width: 1280, height: 900 };

// Opening one panel closes the other by design, so one open panel is the most
// the page will show. Both are rendered from the same component.
const openEmailPanel = [
  'click element #hero-email > summary',
  'wait for element #hero-email .email-reveal-address to be visible',
];

module.exports = {
  defaults: {
    standard: 'WCAG2AA',
    runners: ['axe', 'htmlcs'],
    timeout: 60000,
    wait: 500,
    // axe marks contrast it cannot compute (gradient backgrounds, symbol-only
    // text such as arrows and separators) as "needs review". Those are not
    // failures; measured violations still are. Inspect them with
    // `npx pa11y <url> --runner axe --include-warnings`.
    levelCapWhenNeedsReview: 'warning',
    chromeLaunchConfig: { args: ['--no-sandbox', '--force-prefers-reduced-motion'] },
  },
  urls: [
    { url: `${base}/`, viewport: phone, actions: openEmailPanel },
    { url: `${base}/`, viewport: desktop, actions: openEmailPanel },
    { url: `${base}/pomodoro.html`, viewport: phone },
    { url: `${base}/snake.html`, viewport: phone },
  ],
};
