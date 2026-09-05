/**
 * Progressive enhancement for the main page. The page is complete without
 * this file: the scroll-reveal transition and the active nav link both use
 * IntersectionObserver and step aside for reduced motion, and the email
 * disclosure is a native <details> that opens, closes and takes focus on its
 * own. Everything here is an addition to behaviour the page already has.
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

/**
 * Extras for the email disclosure that <details> does not provide: Escape and
 * click-outside dismissal, only one panel open at a time, and a copy button
 * that appears only once we know there is a clipboard to write to. Without
 * this the button still opens, still shows the address, and the address is
 * still selectable — the copy shortcut is the only thing that goes missing.
 */
function enhanceEmailReveal(): void {
  const panels = Array.from(document.querySelectorAll<HTMLDetailsElement>('details.email-reveal'));
  if (panels.length === 0) return;

  const canCopy = window.isSecureContext && typeof navigator.clipboard?.writeText === 'function';

  const close = (details: HTMLDetailsElement, refocus = false): void => {
    if (!details.open) return;
    details.open = false;
    if (refocus) details.querySelector('summary')?.focus();
  };

  for (const details of panels) {
    const status = details.querySelector<HTMLParagraphElement>('.email-reveal-status');
    const copy = details.querySelector<HTMLButtonElement>('.email-reveal-copy');
    let reset: number | undefined;

    // Closing resets the panel to its opening state, and opening one closes
    // the other, so the page never shows two addresses at once.
    details.addEventListener('toggle', () => {
      if (details.open) {
        panels.forEach((other) => other !== details && close(other));
      } else if (status) {
        window.clearTimeout(reset);
        status.textContent = '';
      }
    });

    if (copy && canCopy) {
      copy.hidden = false;
      copy.addEventListener('click', async () => {
        const message = await navigator.clipboard
          .writeText(copy.dataset.email ?? '')
          .then(() => details.dataset.copied ?? '')
          .catch(() => details.dataset.copyFailed ?? '');
        if (!status) return;
        // role="status" on an element that was empty announces the message
        // the moment it lands, without moving focus off the button.
        status.textContent = message;
        window.clearTimeout(reset);
        reset = window.setTimeout(() => (status.textContent = ''), 5000);
      });
    }
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    // Escape returns focus to the button that opened the panel, so keyboard
    // users are not dropped back at the top of the document.
    for (const details of panels) close(details, details.contains(document.activeElement));
  });

  document.addEventListener('pointerdown', (event) => {
    for (const details of panels) {
      if (!details.contains(event.target as Node)) close(details);
    }
  });
}

revealOnScroll();
highlightActiveSection();
enhanceEmailReveal();
