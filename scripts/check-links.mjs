#!/usr/bin/env node
/**
 * Link gate. Crawls the built site in dist/ (served by linkinator itself)
 * and follows every internal and external link, image and stylesheet.
 *
 * LinkedIn answers automated requests with 999 and is skipped; the address
 * is validated by the content schema instead. The site's own absolute URLs
 * are skipped too, see below. `npm run check:links`.
 */
import { LinkChecker } from 'linkinator';

const checker = new LinkChecker();
const broken = [];
checker.on('link', (link) => {
  if (link.state === 'BROKEN') broken.push(`${link.status ?? 'ERR'} ${link.url} (on ${link.parent})`);
});

const result = await checker.check({
  path: 'dist',
  recurse: true,
  timeout: 20000,
  // Absolute self-references (canonical, og:image) name the deployed site, which
  // the build under test is about to replace; internal paths are checked via dist.
  linksToSkip: ['https://www.linkedin.com/', '^https://abdulalharbi.github.io/'],
});

const total = result.links.length;
const skipped = result.links.filter((l) => l.state === 'SKIPPED').length;
console.log(`${total} links scanned, ${skipped} skipped, ${broken.length} broken`);
if (broken.length) {
  console.error(`  ${broken.join('\n  ')}`);
  process.exit(1);
}
