# Architecture paper awards implementation plan

**Goal:** Publish an English JunBlogs article with a searchable, source-backed archive of ASPLOS, MICRO, ISCA and HPCA awards granted in 2016 or later.

**Architecture:** A normal MDX post uses the existing ArticleShell and a small client-side AwardExplorer. A curated static JSON file supplies the component and a public download; a pure filter keeps conference, award year, award category and search behavior consistent.

**Tech stack:** Existing Next.js static export, React, TypeScript, CSS Modules, Vitest and Testing Library. No new dependencies.

## Constraints

- Filter by award_year >= 2016, including 2016. Preserve older paper years for long-term awards.
- Preserve exact award labels and both dates. Exclude candidates from confirmed results.
- All visible article content and controls are English. Titles link to original papers; each result includes an evidence link.
- Use the blog's white background, existing serif text, Geist utility labels and restrained rules. Native selects, visible focus, wrapped paper titles and a single-column mobile layout.
- Keep coverage gaps alongside the archive. Ordinary artifact badges are excluded.
- The user explicitly authorized deployment. The canonical production source is my-portfolio/blog-source; mirror the new article assets into JunBlogs without overwriting its unrelated files.

## Tasks

1. Write regression tests for the inclusive 2016 cutoff, old-paper long-term awards, combined filters, title/evidence destinations and empty-state reset. Run them before implementation.
2. Add public/data/architecture-paper-awards.json with the 224 confirmed records in scope, source URLs and English coverage notes. Implement lib/architecture-awards.ts with typed constants and filterAwards(records, filters).
3. Add components/award-explorer.tsx and award-explorer.module.css. Default to annual paper awards; expose long-term awards, artifacts and all records. Group results by award year, newest first. Use native conference/year/category selects and a labeled title search.
4. Register ArchitectureAwards in components/mdx-components.tsx. Add content/blog/architecture-paper-awards.mdx with scope, category definitions and source-backed coverage notes; let the existing blog index list the new post automatically.
5. Run Vitest, TypeScript, targeted ESLint and the /blog production build. Serve the export locally and verify filtering, external links, English text, desktop layout and a narrow viewport using ego-browser.
6. Mirror only task files into JunBlogs, copy the verified static export to the portfolio's public/blog, review the diff, commit and push. Wait for the existing Pages workflow and verify the public post and index.

## Acceptance

- No confirmed record predates award year 2016; no candidate enters confirmed results.
- 224 total records: 113 annual paper awards, 62 long-term awards and 49 artifact awards.
- Filters combine without conflating paper year and award year.
- A reader can open every displayed paper and its award source.
- Existing posts and the daily paper explorer continue to build and pass their tests.

## Verification record

- Vitest: 36 tests across eight files passed; TypeScript and scoped ESLint passed.
- Both the blog production export with `/blog` as its base path and the portfolio build passed.
- A separate read-only code review found no actionable issues.
- Browser checks confirmed the default 113 annual awards, all 224 records, combined conference/year/category filters, the 2017 ISCA award for a 2002 paper, empty results, reset, title search, paper/evidence links, and the JSON download.
- Desktop and 390px mobile screenshots were inspected. The mobile document width equals the viewport width, and visible article text is English.
- Only the new article, archive data, filter library, component/styles and component registration were mirrored into the JunBlogs copy.
- The first Pages run stopped before compilation because arXiv returned HTTP 429 in the existing daily-paper refresh. Push builds now use the saved paper library; scheduled and manual runs still refresh online and report fetch failures. A behavioral regression test covers offline content builds and mandatory refresh failures.
