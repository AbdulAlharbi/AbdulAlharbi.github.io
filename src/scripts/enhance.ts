/**
 * Progressive enhancement for the main page. The page is complete without
 * this file; it only adds the scroll-reveal transition and the active state
 * on the nav link for the section in view. Both use IntersectionObserver,
 * so there is no scroll handler, and both step aside for reduced motion.
 */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Fade sections in as they enter the viewport; show everything if motion is reduced. */
function revealOnScroll(): void {
  const targets = document.querySelectorAll<HTMLElement>('.reveal');
  if (reduceMotion) {
    targets.forEach((el) => el.classList.add('show'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
  );
  targets.forEach((el) => observer.observe(el));
}

/** Mark the nav link whose section currently occupies the middle of the viewport. */
function highlightActiveSection(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav-links a[href^="#"]'));
  const sections = links
    .map((a) => document.querySelector<HTMLElement>(a.getAttribute('href')!))
    .filter((el): el is HTMLElement => el !== null);
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = `#${entry.target.id}`;
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === id));
      }
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  );
  sections.forEach((s) => observer.observe(s));
}

revealOnScroll();
highlightActiveSection();
