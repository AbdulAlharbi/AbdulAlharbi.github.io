# abdulalharbi.github.io

[![ci](https://github.com/AbdulAlharbi/AbdulAlharbi.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/AbdulAlharbi/AbdulAlharbi.github.io/actions/workflows/ci.yml)

Personal site of Abdulrahman Alharbi: research, work, projects, and the
academic record behind them. Live at
[abdulalharbi.github.io](https://abdulalharbi.github.io).

It is a static site. Every page is rendered at build time from structured
data, ships no client-side framework, and deploys to GitHub Pages from a
build that has passed a set of quality gates. Two small standalone demos
([Pomodoro](https://abdulalharbi.github.io/pomodoro.html) and
[Snake](https://abdulalharbi.github.io/snake.html)) ride along as separate
pages.

## Architecture

```
src/data/*.yaml ──▶ src/content.config.ts ──▶ components ──▶ pages ──▶ dist/
   content            Zod schemas             props only     compose    static HTML
                      (the contract)                                    + hashed assets
```

Content lives in YAML, one file per domain. Each file is loaded through an
[Astro content collection](https://docs.astro.build/en/guides/content-collections/)
and validated against a [Zod](https://zod.dev) schema at build time. The
schemas are the contract: components import the types the schemas infer and
never touch YAML directly, so a typo in a data file fails the build instead of
shipping, and changing what the site says never means touching how it looks.

Components come in two tiers:

- **Section containers** (`src/components/sections/`) read one collection each
  and lay its entries out. `index.astro` is nothing but a list of them.
- **Presentational components** (`src/components/`) take props and render one
  visual pattern: a job, a certification card, a numbered entry, a metric
  strip, a button. They know nothing about where the data came from.

The remaining pieces are the layout (document head, fonts, metadata), a
generated schema.org `Person` record, one progressive-enhancement script, and
the stylesheets described below.

## Why it is built this way

**Astro, not a hand-rolled build and not a SPA.** A document-style site needs
templating, a data layer, image optimisation and zero runtime JavaScript. A
custom Node build script would mean reimplementing all four. A client-side
framework would ship a runtime to render text that never changes. Eleventy was
the credible alternative; Astro won because content collections give a
validated, typed data layer out of the box, components take typed props, the
image pipeline is built in, and the result is plain HTML. There is no
hydration and no client framework in the output.

**A data layer with a schema, not just data files.** "Single source of truth"
only holds if the truth is enforced. The thesis metrics appear in the hero and
on the featured card; both read the same three objects from `research.yaml`.
Section numbers, anchors and the nav come from one ordered registry in
`site.yaml`, so a section cannot be numbered by hand (the old page had a
"§ 03.5"). Prose fields are typed as `rich`, a string that may contain
`<em>`, `<strong>` and `<code>` and nothing else; anything more is a schema
error. Image fields use Astro's `image()` validator, so a renamed photo fails
the build. Collections come back from the store sorted by id, so display order
is an explicit, validated `order` field rather than file order.

**One component per visual pattern.** Research items and independent projects
were eight hand-copied blocks sharing one layout under `research-*` class
names. They are one `Entry` component. The hero strip and the thesis card's
figures are one `MetricStrip` with two variants. Adding a fourth project is a
YAML entry.

**Stylesheets are co-located and deliberately global.** Every component
imports its own `.css` file, cut verbatim from the original inline stylesheet,
and `src/styles/` holds only what is shared: fonts, tokens, base, motion.
Astro can scope component styles, but scoping raises selector specificity or
blocks the few cross-component overrides the design uses, and the existing
class vocabulary is already namespaced per component (`.job-*`, `.cert-*`).
Isolation by convention is the smaller change with the same result. The
palette in `tokens.css` is byte-for-byte the original.

**esbuild minifies the CSS, not Lightning CSS.** Astro's default minifier
collapses `backdrop-filter` and its `-webkit-` twin into the prefixed form
only, and Chrome then renders the sticky nav one unit off in the blue channel.
That was caught by the pixel diff during the migration. esbuild keeps both
declarations and produces an identical render at the same size. The reason is
recorded in `astro.config.mjs`.

**Self-hosted fonts.** The Google Fonts stylesheet was a render-blocking
third-party request that held the mobile Lighthouse performance score at 79.
The same families now ship with the site from the `@fontsource` packages,
declared in `styles/fonts.css` under the family names the tokens already use,
latin subset only, with the two above-the-fold faces preloaded. Glyph metrics
were measured identical to what Google served; the score is 95.

**Images go through the build.** The two photos in use are validated
references in the data, rendered with `<Image>` into WebP at the sizes the
layout needs. The capstone photo's candidate widths are multiples of 459 (the
source ratio reduces to 459:248) so every candidate has an integer height and
the box reserved before the lazy load matches the rendered height exactly. The
original page shifted by 176 px on phones when that image arrived; this one
does not.

**Progressive enhancement, in that order.** The page is complete as HTML and
CSS. One deferred module adds the scroll reveal and the active nav link, both
on `IntersectionObserver`. Reduced motion is honoured in CSS and in the
script, and a `(scripting: none)` rule keeps every section visible when
JavaScript is unavailable.

**The demos are isolated on purpose.** Pomodoro and Snake keep their own
palettes and fonts on a minimal layout that does not import the site's styles,
so a token change can never restyle a demo and vice versa. They are typed
modules now, they meet the same gates as the main page, and their URLs are
unchanged.

### SOLID, in spirit

The principles apply where a static site has the shapes they describe, and
are left alone where it does not.

- **Single responsibility:** one component per visual pattern, one data file
  per content domain, one script with one job.
- **Open/closed:** adding a section is a data file plus a registry entry;
  nothing existing changes. Adding a project is a YAML entry.
- **Dependency inversion:** templates depend on the schema, not on the
  content. Swap every YAML file and no component changes.
- **Liskov substitution and interface segregation** describe runtime
  polymorphism. A static page has none, so nothing here pretends to. There are
  no classes, no interfaces for their own sake, no state management, and no
  unit tests for templates: the gates test the output, which is what a
  document site is.

## Directory structure

```
.
├── .github/workflows/ci.yml   # quality gates on every push/PR; deploy from main
├── src/
│   ├── content.config.ts      # Zod schemas: the contract templates depend on
│   ├── data/                  # all content, one YAML file per domain
│   │   ├── site.yaml          #   identity, copy, links, section registry
│   │   ├── research.yaml      #   first entry carries the featured thesis
│   │   ├── projects.yaml, experience.yaml, education.yaml,
│   │   └── certifications.yaml, skills.yaml, honors.yaml
│   ├── lib/content.ts         # typed access: ordered collections, site singleton
│   ├── layouts/
│   │   ├── Base.astro         # head, fonts, metadata (absolute canonical/og URLs)
│   │   └── Demo.astro         # minimal shell for the demos; no site styles
│   ├── components/
│   │   ├── sections/          # containers: one collection each, compose the rest
│   │   ├── *.astro + *.css    # presentational components with co-located styles
│   │   └── PersonJsonLd.astro # schema.org Person derived from the data
│   ├── pages/                 # index.astro composes sections; pomodoro, snake
│   ├── styles/                # fonts, tokens (palette), base, motion; demo styles
│   ├── scripts/               # enhance.ts; demo scripts
│   └── assets/                # source photos, referenced from the data
├── public/                    # copied as-is: favicon.svg, og.jpg
├── scripts/                   # gate helpers: preview server, links, viewports
├── astro.config.mjs           # site URL, file-style output, esbuild CSS minify
├── pa11yci.config.cjs · lighthouserc.json · .htmlvalidate.json · .prettierrc
└── .nvmrc                     # Node 22
```

## Editing content

- **Change a fact:** edit the YAML. Nothing else.
- **Add a project or research item:** add an entry with a unique `id` and the
  next `order`. Prose may use `<em>`, `<strong>`, `<code>`.
- **Add a section:** add a data file and schema, a section component under
  `components/sections/`, and an entry in `sections:` in `site.yaml`. The
  number, anchor and nav link follow from the registry position.
- **Swap a photo:** drop it in `src/assets/` and point the data at it. A wrong
  path fails the build.

`npm run check` validates every data file against the schemas without
building.

## Quality gates

All gates run locally with the same commands CI uses. `npm run verify` runs
the whole set.

| Gate               | Tool                    | What it enforces                                                                                                                                                                                          |
| ------------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `check`            | `astro check`           | Templates type-check; data matches the schemas                                                                                                                                                            |
| `format:check`     | Prettier                | Consistent formatting of source files                                                                                                                                                                     |
| `lint:html`        | html-validate           | The built HTML is valid and follows the recommended rules                                                                                                                                                 |
| `check:links`      | linkinator              | Every internal and external link, image and stylesheet resolves                                                                                                                                           |
| `check:a11y`       | pa11y-ci (axe + HTMLCS) | WCAG 2 AA on every page at phone and desktop viewports, with motion forced to reduce and the email disclosure opened so nothing goes untested; measured contrast failures are errors, needs-review is not |
| `check:viewports`  | Puppeteer               | No horizontal overflow at 320/375/768/1280; 24 px minimum tap targets on touch widths                                                                                                                     |
| `check:lighthouse` | Lighthouse CI           | Performance ≥ 0.90, accessibility ≥ 0.95, best practices and SEO ≥ 0.90, CLS ≤ 0.1; LCP over 2.5 s warns                                                                                                  |

There are no unit tests. A document site is verified by checking what it
produces, and each gate above is a property a visitor would notice if it
broke.

## Local development

The build needs Node 22 (pinned in `.nvmrc` and `package.json`). With
[nvm](https://github.com/nvm-sh/nvm):

```sh
nvm install      # reads .nvmrc the first time
nvm use
npm ci
```

Then:

```sh
npm run dev        # dev server with hot reload
npm run build      # static output in dist/
npm run preview    # serve dist/ locally
npm run verify     # every quality gate, in CI order
```

`npm ci` downloads a Chrome build for Puppeteer once; it is cached in
`~/.cache/puppeteer` and in CI.

## Deployment

Every push to `main` runs the `quality` job in
[`ci.yml`](.github/workflows/ci.yml). If it passes, the `deploy` job publishes
the same `dist/` artifact to GitHub Pages with `actions/deploy-pages`. Pull
requests run the gates without deploying.

The repository's Pages source is **GitHub Actions**, not the branch: nothing
is served that has not passed the gates. Output uses file-style URLs
(`build.format: 'file'`) so `/pomodoro.html` and `/snake.html` kept their
addresses through the migration.

## How the migration was verified

The site was rebuilt from a single 1,899-line `index.html` into the structure
above over a series of small commits. Each step was checked against the
original page with headless Chrome: full-page screenshots at 375, 768 and
1280 px, compared pixel for pixel (threshold 0), plus a diff of the rendered
text. Structural commits were required to produce zero differing pixels;
deliberate changes (computed section numbers, the footer's demo links, touch
targets, contrast, resampled photos) had to account for every differing band.
The commit messages carry the numbers.

---

© Abdulrahman Alharbi. Content is not licensed for reuse; the build setup may
be used freely.
