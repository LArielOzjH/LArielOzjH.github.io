# JunBlogs

A static research-blog frontend for Markdown/MDX notes. The intended deployment is under the same personal homepage domain at `/blog`, without creating a separate public blog domain.

## Development

```bash
npm install
npm run dev
```

Local development runs at the Next.js root path. For a `/blog` production build:

```bash
npm run build:blog
```

## Add a post

Create `content/blog/my-post-slug.mdx`:

```mdx
---
title: "Post title"
description: "Short summary for the index and SEO."
date: "2026-07-03"
tags: ["machine-learning"]
featured: false
draft: false
---

## First section

Write Markdown, MDX, math, code blocks, tables, and images here.
```

## Integrate with the portfolio

Because the target URL is the same personal domain at `/blog`, the simplest no-new-repo workflow is:

```bash
npm run build:blog
npm run sync:portfolio
```

## Daily paper digest

The `/papers/` page is generated from `data/papers/papers.json`. Refresh it
locally with `npm run papers:fetch`, then build the Blog with `npm run build:blog`.
The production workflow runs the same fetch from GitHub Actions on a daily UTC
schedule and also supports a manual dispatch. The institution and topic policy
lives in `scripts/papers/institutions.json` and `scripts/papers/categories.json`.

For offline acceptance checks, set `BLOG_PAPERS_FIXTURE` to the included Atom
fixture when using `my-portfolio/scripts/build-blog.sh`.

Then the existing portfolio GitHub Pages deployment will serve the blog at `/blog`.
