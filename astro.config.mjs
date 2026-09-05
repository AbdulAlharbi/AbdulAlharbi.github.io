// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Absolute site URL. Astro uses it to resolve canonical and Open Graph URLs.
  site: 'https://abdulalharbi.github.io',

  build: {
    // Emit `pomodoro.html` rather than `pomodoro/index.html` so the demo URLs
    // that were live before the rebuild keep working unchanged.
    format: 'file',
    // Always link stylesheets; never inline them into the HTML.
    inlineStylesheets: 'never',
  },

  vite: {
    build: {
      // Lightning CSS (the default) collapses `backdrop-filter` and its
      // -webkit- twin into the prefixed form only, which Chrome renders with a
      // measurable one-unit colour shift in the sticky nav. esbuild keeps both
      // declarations and produces a pixel-identical render at the same size.
      cssMinify: 'esbuild',
    },
  },
});
