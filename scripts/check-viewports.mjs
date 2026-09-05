#!/usr/bin/env node
/**
 * Responsive layout gate. For every page at phone, small-phone, tablet and
 * desktop widths it asserts that nothing overflows the viewport (no
 * horizontal scroll) and, at touch widths, that interactive controls meet
 * the 24x24 CSS px minimum of WCAG 2.2 success criterion 2.5.8.
 *
 * Runs against the preview server: `npm run check:viewports`.
 */
import puppeteer from 'puppeteer';

const BASE = 'http://127.0.0.1:4321';
const PAGES = ['/', '/pomodoro.html', '/snake.html'];
const WIDTHS = [320, 375, 768, 1280];
const TOUCH_MAX_WIDTH = 768;
const MIN_TARGET = 24;
const TARGETS = '.nav-links a, .nav-brand, a.btn, .f-demos a, button';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
const failures = [];

for (const path of PAGES) {
  for (const width of WIDTHS) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await page.goto(BASE + path, { waitUntil: 'networkidle0' });
    const result = await page.evaluate(
      (selector, minTarget, checkTargets) => {
        const doc = document.documentElement;
        const overflow = Math.max(doc.scrollWidth, document.body.scrollWidth) - window.innerWidth;
        const small = [];
        if (checkTargets) {
          for (const el of document.querySelectorAll(selector)) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) continue; // hidden
            if (r.width < minTarget || r.height < minTarget) {
              small.push(`${el.tagName.toLowerCase()} "${(el.textContent || '').trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
            }
          }
        }
        return { overflow, small };
      },
      TARGETS,
      MIN_TARGET,
      width <= TOUCH_MAX_WIDTH,
    );
    const label = `${path} @${width}`;
    if (result.overflow > 0) failures.push(`${label}: horizontal overflow of ${result.overflow}px`);
    for (const s of result.small) failures.push(`${label}: target under ${MIN_TARGET}px: ${s}`);
    console.log(`${result.overflow > 0 || result.small.length ? 'FAIL' : 'ok  '} ${label}`);
  }
}

await browser.close();
if (failures.length) {
  console.error(`\n${failures.length} viewport failure(s):\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
console.log(`\nAll ${PAGES.length * WIDTHS.length} page/width combinations pass.`);
