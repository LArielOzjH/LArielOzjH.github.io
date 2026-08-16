# Paper Library Search and Category Explorer

## Goal

Turn the papers page into a focused research index where one category is visible at a time and readers can search the accumulated paper library with MiniSearch. The page must retain the typography and global visual language of LArielo Jotting; all new styling stays scoped to `.papers-page`.

## Scope

- Replace the six folding sections with a seven-option selector: `All` plus the six current research categories.
- Default to `Quantization`, the first topical category.
- Add client-side full-text search using [`lucaong/minisearch`](https://github.com/lucaong/minisearch).
- Change paper persistence from a replace-only daily snapshot to an accumulated, arXiv-ID-deduplicated library.
- Reshape the paper list into a quiet, single-column Research Index layout.
- Preserve author truncation, italic institutions when available, tags, dates, arXiv links, and PDF links.
- Do not restore the removed Compiler category and do not reintroduce affiliation filtering.

## Information Architecture

The page has four vertical zones:

1. A compact hero with the page title, a short accurate description, and the UTC update date.
2. A search field spanning the reading column.
3. A horizontally scrollable category rail containing `All` and the six categories.
4. A single result list showing either the selected category or ranked search results.

```text
Systems & AI Infrastructure Papers                    Updated · Aug 15
Search the paper library _______________________________________  ×

All  Quantization  Model Compression  Serving  Speculative ...
     ────────────

Quantization
Paper title                                            2026-08-13
Authors · institution                                      arXiv
TL;DR text...
tags · tags · tags
────────────────────────────────────────────────────────────────
```

The category rail is a navigation index, not a row of rounded chips. The active category uses a restrained underline and stronger text. On small screens the rail scrolls horizontally without wrapping.

## Interaction Design

### Category selection

- `Quantization` is selected on initial load.
- Selecting a category replaces the visible list rather than opening another section.
- Selecting `All` shows every paper ordered by publication date and title.
- Buttons expose `aria-pressed`; keyboard and visible focus states are supported.

### Search

- An empty query shows the active category.
- A non-empty query switches the heading to `Search results` and ranks matches with MiniSearch.
- Typing the first non-empty query switches the active category to `All`, so search covers the complete accumulated library by default.
- Selecting a topical category clears the query and replaces the list with that category; clearing the field after a search keeps `All` selected.
- No-result copy states that no title, abstract, author, institution, venue, category, or tag matched and suggests shortening the query.
- Search runs entirely in the browser and does not require a service or network request after page load.

## Search Index

MiniSearch indexes these normalized fields:

- `title`
- `abstract`
- `tags`
- `category`
- `authors`
- `organizations`
- `venue`

The index stores only the paper ID; result IDs map back to the typed paper objects already delivered with the static page. Default ranking uses title as the strongest signal, then tags and category, then abstract, authors, institutions, and venue. Prefix matching is enabled and fuzzy matching is restrained to approximately `0.2` so technical acronyms and model names are not over-expanded.

Suggested field boosts:

| Field | Boost |
| --- | ---: |
| title | 5.0 |
| tags | 2.5 |
| category | 2.0 |
| abstract | 1.0 |
| authors | 1.0 |
| organizations | 1.0 |
| venue | 1.2 |

The MiniSearch instance is memoized and rebuilt only when the paper collection changes.

## Data Persistence

The fetcher continues querying one UTC calendar day and paginating until arXiv returns a short page. Before writing `data/papers/papers.json`, it merges incoming papers with the existing library by versionless arXiv ID:

- unseen ID: append;
- existing ID: replace with the newly fetched record when its `updated` value is newer or equal;
- no incoming papers: preserve the existing library;
- output: sort deterministically by publication date, title, and ID.

The file remains the authoritative static library. This avoids adding a database while making prior days searchable. A future archive split can be considered only if browser indexing becomes measurably slow; it is outside this change.

## Components and Boundaries

- `app/papers/page.tsx`: server component that loads the digest and renders the static shell.
- `components/paper-explorer.tsx`: client component owning the active category, query, MiniSearch index, filtering, result heading, and result list.
- `components/paper-card.tsx`: presentational research-index row; no search state.
- `lib/paper-search.ts`: pure MiniSearch construction and query helpers, independently testable.
- `lib/papers.ts`: typed library loading and category definitions.
- `scripts/papers/fetch_papers.py`: UTC retrieval, pagination, classification, and cumulative merge.

## Visual System

The design inherits the blog's white background, serif reading face, sans-serif utility face, and existing ink colors. No global token or unrelated selector changes are allowed.

- Hero: compact and editorial, with a smaller title and subdued date aligned to the baseline.
- Search: a single bottom-rule field, not a boxed control; icon and clear affordance remain quiet.
- Category rail: typographic tabs with one active rule.
- Papers: one column, generous vertical rhythm, fine separators, no card boxes or shadows.
- Metadata: utility sans-serif; paper prose and titles use the blog serif.
- Signature element: the category rail behaves like a research notebook index, carrying the page's navigation and visual identity without decorative chrome.

## Responsive Behavior

- Desktop: title/content use the current centered 960px container; paper rows reserve a narrow right metadata column.
- Tablet: metadata remains inline but can wrap below long titles.
- Mobile: the category rail scrolls, paper metadata moves below the title, footer links stay finger-sized, and no horizontal page overflow is introduced.

## Error and Empty States

- Missing or empty paper data renders a short neutral library-empty message.
- Empty categories render `No papers in this category yet.`
- Search with zero matches renders the search-specific guidance described above.
- Papers without organizations omit the institution line without leaving empty vertical space.
- MiniSearch construction is deterministic from local data; no runtime network failure state is needed.

## Verification

- Python tests cover UTC pagination, cumulative merge, arXiv-ID replacement, empty-day preservation, and no affiliation filtering.
- Vitest covers six category definitions plus `All`, default selection/filtering helpers, MiniSearch title ranking, category-filtered search, prefix/fuzzy matching, and no-result behavior.
- Component or rendered-output checks confirm only one selected category is displayed and searches return papers outside the initial category when `All` is active.
- Lint, TypeScript, production static export, desktop inspection, and mobile inspection must pass.
- Final deployment verification checks the live page for category controls, a search input, DARTree searchability, and the absence of the removed Compiler category.

## Out of Scope

- Server-side search service or database.
- Citation counts, author reputation scoring, or external metadata enrichment.
- Restoring Compiler-related discovery.
- Changing the global blog header, footer, typography, or other pages.
