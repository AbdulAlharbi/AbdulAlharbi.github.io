// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Absolute site URL. Astro uses it to resolve canonical and Open Graph URLs.
  site: 'https://abdulalharbi.github.io',

  // Emit `pomodoro.html` rather than `pomodoro/index.html` so the demo URLs
  // that were live before the rebuild keep working unchanged.
  build: {
    format: 'file',
  },
});
