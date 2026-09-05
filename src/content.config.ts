/**
 * Content schema: the contract between the data layer and the templates.
 *
 * Every file in src/data is loaded through a collection declared here and
 * validated against a Zod schema at build time. Templates import the types
 * that these schemas infer and never reach into YAML directly, so a typo in
 * a data file fails the build instead of shipping, and the components depend
 * on the shape of the data rather than on any particular content.
 */
import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';
import { file, glob } from 'astro/loaders';

/** Inline HTML limited to emphasis. Anything else is a schema error. */
const INLINE_TAGS = ['em', 'strong', 'code'] as const;
const rich = z
  .string()
  .refine(
    (s) =>
      [...s.matchAll(/<\/?([a-z0-9]+)[^>]*>/gi)].every((m) =>
        (INLINE_TAGS as readonly string[]).includes(m[1]!.toLowerCase()),
      ),
    { message: `Only inline <${INLINE_TAGS.join('>, <')}> tags are allowed` },
  );

const url = z.url();
const link = z.object({ label: z.string(), url });
const dateRange = z.object({ start: z.string(), end: z.string() });

/**
 * Display position. Collections come back from the store sorted by id, so
 * the order entries appear in on the page is explicit data, not file order.
 */
const ordered = { order: z.number().int().positive() };

const metric = z.object({
  value: z.string(),
  label: z.string(),
  /** Compact label used where space is tight (the hero strip). */
  shortLabel: z.string().optional(),
  note: z.string().optional(),
});

/** Site-wide identity, copy, and the section registry. One entry. */
const site = defineCollection({
  loader: glob({ pattern: 'site.yaml', base: './src/data' }),
  // image() resolves a path relative to the data file to a build-time asset
  // and fails the build if the file is missing.
  schema: ({ image }) =>
    z.object({
      name: z.object({ given: z.string(), family: z.string(), short: z.string() }),
      meta: z.object({
        title: z.string(),
        description: z.string(),
        ogDescription: z.string(),
        ogImage: z.string(),
        themeColor: z.string(),
      }),
      links: z.object({ email: z.email(), linkedin: url }),
      cta: z.object({ primary: z.string(), secondary: z.string() }),
      hero: z.object({
        status: z.string(),
        lede: rich,
        portrait: z.object({ src: image(), alt: z.string() }),
        metricsCaption: z.string(),
      }),
      about: z.object({
        paragraphs: z.array(rich).min(1),
        interests: z.object({ label: z.string(), items: z.array(z.string()).min(1) }),
      }),
      contact: z.object({ heading: rich, sub: z.string() }),
      footer: z.object({
        credit: z.string(),
        /** Standalone demo pages, linked from the footer. */
        demos: z.array(z.object({ label: z.string(), href: z.string().startsWith('/') })),
      }),
      /**
       * Ordered section registry. Drives the section numbering, the nav, and
       * the anchor ids, so adding a section is a data change, not a layout one.
       */
      sections: z
        .array(
          z.object({
            id: z.string().regex(/^[a-z][a-z0-9-]*$/),
            title: z.string(),
            nav: z.boolean().default(false),
            /** Nav entries the phone-width nav may drop to fit. */
            navMobile: z.boolean().default(true),
          }),
        )
        .min(1),
      person: z.object({
        jobTitle: z.string(),
        nationality: z.string(),
        address: z.object({ locality: z.string(), country: z.string() }),
        knowsAbout: z.array(z.string()),
        knowsLanguage: z.array(z.string()),
      }),
    }),
});

const research = defineCollection({
  loader: file('./src/data/research.yaml'),
  schema: z.object({
    ...ordered,
    title: z.string(),
    context: z.string(),
    period: z.string(),
    description: rich,
    tags: z.array(z.string()).min(1),
    /** Present on the one entry rendered as the featured card. */
    featured: z
      .object({
        label: z.string(),
        link: link,
        metrics: z.array(metric).length(3),
      })
      .optional(),
  }),
});

const projects = defineCollection({
  loader: file('./src/data/projects.yaml'),
  schema: z.object({
    ...ordered,
    title: z.string(),
    context: z.string(),
    period: z.string(),
    links: z.array(link).min(1),
    description: rich,
    tags: z.array(z.string()).min(1),
  }),
});

const experience = defineCollection({
  loader: file('./src/data/experience.yaml'),
  schema: ({ image }) =>
    z.object({
      ...ordered,
      role: z.string(),
      org: z.string(),
      dates: dateRange,
      bullets: z.array(rich).min(1),
      image: z.object({ src: image(), alt: z.string() }).optional(),
    }),
});

const education = defineCollection({
  loader: file('./src/data/education.yaml'),
  schema: z.object({
    ...ordered,
    institution: z.string(),
    location: z.string().optional(),
    degree: z.string(),
    gpa: z.string().optional(),
    dates: dateRange,
    /** Universities are listed as alumniOf in the structured data. */
    kind: z.enum(['university', 'school']),
  }),
});

const certifications = defineCollection({
  loader: file('./src/data/certifications.yaml'),
  schema: z.object({ ...ordered, issuer: z.string(), title: z.string(), date: z.string() }),
});

const skills = defineCollection({
  loader: file('./src/data/skills.yaml'),
  schema: z.object({
    ...ordered,
    category: z.string(),
    items: z.array(z.union([z.string(), z.object({ name: z.string(), level: z.string() })])).min(1),
  }),
});

const honors = defineCollection({
  loader: file('./src/data/honors.yaml'),
  schema: z.object({ ...ordered, name: z.string(), detail: z.string(), date: z.string() }),
});

export const collections = {
  site,
  research,
  projects,
  experience,
  education,
  certifications,
  skills,
  honors,
};
