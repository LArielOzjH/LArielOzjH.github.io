# Research Blog Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans implement plan task-by-task. Steps use checkbox (`- [ ]`) syntax tracking.

**Goal:** Build a static Next.js blog at `/blog` for research-style Markdown/MDX posts with Chinese/English mixed typography and dark mode.

**Architecture:** The site is a standalone static Next.js app that can be deployed under the same personal-domain path as the portfolio. Markdown/MDX files live in `content/blog`, are indexed by `lib/posts.ts`, and render through shared article components with generated table of contents, math, code, tags, and reading metadata.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, MDX, gray-matter, remark/rehype plugins, Vitest, GitHub Pages static export.

## Global Constraints

- Deploy target is the same personal homepage domain at `/blog`.
- Posts will be Chinese/English mixed.
- Dark mode is required.
- Use a Thinking Machines-inspired typography system, but do not vendor unknown-license commercial font files.
- Include one placeholder blog post.

---

### Task 1: Project scaffold and test harness

**Files:**
- Create: `package.json`
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `postcss.config.mjs`
- Create: `next-env.d.ts`
- Create: `app/layout.tsx`
- Create: `app/globals.css`

**Interfaces:**
- Produces: Next.js app shell, npm scripts `dev`, `build`, `lint`, `test`.

- [ ] Write package/config files for Next.js, Tailwind, TypeScript, and Vitest.
- [ ] Run `npm install`.
- [ ] Run `npm test` and expect no tests found until Task 2 adds tests.

### Task 2: Content indexing

**Files:**
- Create: `lib/posts.ts`
- Create: `lib/posts.test.ts`
- Create: `content/blog/research-blog-placeholder.mdx`

**Interfaces:**
- Produces: `getAllPosts(): PostSummary[]`, `getPostBySlug(slug): Post`, `getPostSlugs(): string[]`, `extractToc(source): TocItem[]`.

- [ ] Write failing Vitest tests for frontmatter parsing, reading time, slug sorting, and TOC extraction.
- [ ] Run `npm test -- lib/posts.test.ts` and confirm failure from missing implementation.
- [ ] Implement content parsing and TOC extraction.
- [ ] Run `npm test -- lib/posts.test.ts` and confirm pass.

### Task 3: Blog routes and article rendering

**Files:**
- Create: `app/page.tsx`
- Create: `app/posts/[slug]/page.tsx`
- Create: `app/not-found.tsx`
- Create: `components/site-header.tsx`
- Create: `components/post-card.tsx`
- Create: `components/article-shell.tsx`
- Create: `components/mdx-components.tsx`
- Create: `components/theme-script.tsx`

**Interfaces:**
- Consumes: `lib/posts.ts` APIs.
- Produces: blog index and static article pages.

- [ ] Implement homepage index with featured/latest posts and tag metadata.
- [ ] Implement static params and MDX article rendering.
- [ ] Implement theme bootstrap and accessible dark-mode toggle.
- [ ] Run `npm run build` and fix route/rendering errors.

### Task 4: Research-style visual system

**Files:**
- Modify: `app/globals.css`
- Modify: `components/article-shell.tsx`
- Modify: `components/mdx-components.tsx`

**Interfaces:**
- Produces: responsive article layout with sticky TOC, reading progress, figure captions, code blocks, tables, math, footnotes, and mixed Chinese/English rhythm.

- [ ] Add CSS tokens for light/dark palettes, typography stacks, article measure, and selection/focus states.
- [ ] Style MDX elements for formulas, code, figures, tables, blockquotes, and headings.
- [ ] Verify mobile layout collapses TOC and prevents horizontal overflow.

### Task 5: Static deployment and integration notes

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `README.md`
- Modify: `next.config.mjs`

**Interfaces:**
- Produces: deployable static export under `/blog` path.

- [ ] Configure `basePath: "/blog"` and `assetPrefix: "/blog"` when building for GitHub Pages subpath.
- [ ] Document local development, adding posts, and portfolio link integration.
- [ ] Run `npm run lint`, `npm test`, and `npm run build`.
