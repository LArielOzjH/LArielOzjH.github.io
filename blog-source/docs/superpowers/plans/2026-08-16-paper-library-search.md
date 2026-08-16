# Paper Library Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cumulative, searchable paper library with seven navigation choices (`All` plus six topics), MiniSearch full-text search, and a refined Research Index interface.

**Architecture:** The Python fetcher merges each UTC day's papers into the committed JSON library by versionless arXiv ID, while the scheduled workflow persists that merged file for the next run. A client-side `PaperExplorer` owns category and query state; a pure `paper-search` module builds and queries MiniSearch so ranking and filtering remain independently testable.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, MiniSearch 7.x, Vitest, Python `unittest`, GitHub Actions.

## Global Constraints

- Keep all visual changes scoped to `.papers-page`; do not change the global blog header, footer, typography, or unrelated pages.
- Use `All` plus the six current categories; do not restore `Operators, Kernels & Compilers`.
- Default category is `Quantization`.
- Search the accumulated historical library, not only the current UTC day.
- Do not filter papers by affiliation; omit an empty institution line.
- Keep title-first paper classification and UTC day pagination.
- Use MiniSearch from `lucaong/minisearch`; title must be the strongest search field.
- Preserve author truncation, italic institutions, tags, dates, arXiv links, and PDF links.
- Follow TDD for all behavior changes.

---

### Task 1: Cumulative Paper Library

**Files:**
- Modify: `blog-source/scripts/papers/fetch_papers.py`
- Modify: `blog-source/scripts/papers/test_fetch_papers.py`

**Interfaces:**
- Produces: `merge_snapshots(previous: dict, incoming: dict) -> dict`
- Consumes: existing `build_snapshot`, `write_snapshot`, and versionless paper IDs.

- [ ] **Step 1: Add failing merge tests**

Add tests proving that a newly fetched paper is appended, an existing ID is replaced by the record with the newer `updated` date, deterministic ordering is preserved, and an empty incoming snapshot returns the previous snapshot unchanged.

```python
def test_merge_snapshots_accumulates_and_replaces_by_arxiv_id(self):
    previous = {"lastUpdated": "old", "source": "arxiv", "papers": [paper("a", "2026-08-12")]}
    incoming = {"lastUpdated": "new", "source": "arxiv", "papers": [paper("a", "2026-08-13"), paper("b", "2026-08-13")]}
    merged = merge_snapshots(previous, incoming)
    self.assertEqual([item["id"] for item in merged["papers"]], ["a", "b"])
    self.assertEqual(next(item for item in merged["papers"] if item["id"] == "a")["updated"], "2026-08-13")

def test_merge_snapshots_preserves_library_on_empty_day(self):
    previous = {"lastUpdated": "old", "source": "arxiv", "papers": [paper("a", "2026-08-12")]}
    self.assertEqual(merge_snapshots(previous, {"lastUpdated": "new", "source": "arxiv", "papers": []}), previous)
```

- [ ] **Step 2: Run the focused tests and observe RED**

Run: `rtk python -m unittest scripts.papers.test_fetch_papers.FetchPaperTests.test_merge_snapshots_accumulates_and_replaces_by_arxiv_id scripts.papers.test_fetch_papers.FetchPaperTests.test_merge_snapshots_preserves_library_on_empty_day`

Expected: import or attribute failure because `merge_snapshots` does not exist.

- [ ] **Step 3: Implement deterministic merge and wire it into `main`**

Implement `merge_snapshots` with ID-based replacement only when the incoming `updated` value is greater than or equal to the stored value. In `main`, load the existing output when present, merge it with `build_snapshot(...)`, and pass the merged snapshot to `write_snapshot`.

```python
def merge_snapshots(previous: dict, incoming: dict) -> dict:
    if not incoming.get("papers"):
        return previous
    papers = {paper["id"]: paper for paper in previous.get("papers", [])}
    for paper in incoming["papers"]:
        stored = papers.get(paper["id"])
        if stored is None or paper.get("updated", "") >= stored.get("updated", ""):
            papers[paper["id"]] = paper
    merged = sorted(papers.values(), key=lambda paper: (paper.get("published", ""), paper["title"], paper["id"]), reverse=True)
    return {**incoming, "papers": merged}
```

- [ ] **Step 4: Run paper fetch tests and observe GREEN**

Run: `rtk python -m unittest discover -s scripts/papers -p 'test_*.py'`

Expected: all Python tests pass.

- [ ] **Step 5: Commit Task 1**

```bash
rtk git add blog-source/scripts/papers/fetch_papers.py blog-source/scripts/papers/test_fetch_papers.py
rtk git commit -m "feat: accumulate daily paper snapshots"
```

---

### Task 2: MiniSearch Index and Query Helpers

**Files:**
- Create: `blog-source/lib/paper-search.ts`
- Create: `blog-source/lib/paper-search.test.ts`
- Modify: `blog-source/package.json`
- Modify: `blog-source/package-lock.json`

**Interfaces:**
- Produces: `buildPaperIndex(papers: Paper[]): MiniSearch<PaperSearchDocument>`
- Produces: `searchPapers(index: MiniSearch<PaperSearchDocument>, papers: Paper[], query: string, categoryId?: PaperCategoryId | "all"): Paper[]`
- Consumes: `Paper` and category IDs from `lib/papers.ts`.

- [ ] **Step 1: Install MiniSearch**

Run: `rtk npm install minisearch`

Expected: `minisearch` appears in dependencies and the lockfile is updated.

- [ ] **Step 2: Add failing ranking and filtering tests**

Create fixtures where one paper has the query in its title and another only in its abstract. Assert title ranking, prefix matching, restrained fuzzy matching, global search, and category filtering.

```ts
it("ranks title matches above abstract-only matches", () => {
  const index = buildPaperIndex(papers);
  expect(searchPapers(index, papers, "DARTree", "all")[0].id).toBe("dartree");
});

it("filters ranked results by category", () => {
  const index = buildPaperIndex(papers);
  expect(searchPapers(index, papers, "inference", "serving-systems").every((paper) => paper.categoryId === "serving-systems")).toBe(true);
});
```

- [ ] **Step 3: Run the focused test and observe RED**

Run: `rtk npx vitest run lib/paper-search.test.ts`

Expected: module-not-found failure for `./paper-search`.

- [ ] **Step 4: Implement MiniSearch helpers**

Index `title`, `abstract`, `tagsText`, `category`, `authorsText`, `organizationsText`, and `venue`. Store `id`; memoization belongs in the client component, not this pure module. Search with `prefix: true`, `fuzzy: 0.2`, and boosts `title: 5`, `tagsText: 2.5`, `category: 2`, `venue: 1.2`, and `1` for remaining fields. Map result IDs back to paper objects and apply the category filter.

- [ ] **Step 5: Run search and existing tests and observe GREEN**

Run: `rtk npx vitest run lib/paper-search.test.ts lib/papers.test.ts`

Expected: all selected tests pass.

- [ ] **Step 6: Commit Task 2**

```bash
rtk git add blog-source/package.json blog-source/package-lock.json blog-source/lib/paper-search.ts blog-source/lib/paper-search.test.ts
rtk git commit -m "feat: add MiniSearch paper index"
```

---

### Task 3: Category Selector and Search Explorer

**Files:**
- Create: `blog-source/components/paper-explorer.tsx`
- Create: `blog-source/components/paper-explorer.test.tsx`
- Modify: `blog-source/app/papers/page.tsx`
- Modify: `blog-source/lib/papers.ts`
- Modify: `blog-source/package.json`
- Modify: `blog-source/package-lock.json`

**Interfaces:**
- Produces: `PaperExplorer({ categories, papers }: PaperExplorerProps)` client component.
- Consumes: `buildPaperIndex`, `searchPapers`, `PaperCard`, `PAPER_CATEGORIES`, and the flat paper library.

- [ ] **Step 1: Install component-test dependencies**

Run: `rtk npm install -D @testing-library/react @testing-library/user-event jsdom`

Expected: development dependencies and lockfile update.

- [ ] **Step 2: Add failing interaction tests**

Use a jsdom Vitest file. Assert seven category buttons, `Quantization` selected by default, only Quantization papers initially visible, selecting Serving replaces the list, typing `DARTree` searches the complete library and activates `All`, and clearing search restores the selected view.

```tsx
it("shows one selected category and searches the whole library", async () => {
  render(<PaperExplorer categories={PAPER_CATEGORIES} papers={papers} />);
  expect(screen.getByRole("button", { name: "Quantization" })).toHaveAttribute("aria-pressed", "true");
  await userEvent.type(screen.getByRole("searchbox"), "DARTree");
  expect(screen.getByText(/DARTree/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
});
```

- [ ] **Step 3: Run the focused test and observe RED**

Run: `rtk npx vitest run components/paper-explorer.test.tsx`

Expected: module-not-found failure for `./paper-explorer`.

- [ ] **Step 4: Implement the explorer and integrate the server page**

Create a `"use client"` component with query and active-category state. Memoize the MiniSearch index. Typing the first non-empty query switches the category to `all`; selecting a topical category clears the query and replaces the list. Render an accessible search label, clear button, seven-button category rail, result heading, visible paper count, and paper rows. Update `getPaperDigest` or add `getPaperLibrary` so the server page can pass a flat typed collection without duplicating JSON parsing.

- [ ] **Step 5: Run component and library tests and observe GREEN**

Run: `rtk npx vitest run components/paper-explorer.test.tsx lib/paper-search.test.ts lib/papers.test.ts`

Expected: all selected tests pass.

- [ ] **Step 6: Commit Task 3**

```bash
rtk git add blog-source/components/paper-explorer.tsx blog-source/components/paper-explorer.test.tsx blog-source/app/papers/page.tsx blog-source/lib/papers.ts blog-source/package.json blog-source/package-lock.json
rtk git commit -m "feat: add paper category explorer"
```

---

### Task 4: Research Index Visual System

**Files:**
- Modify: `blog-source/components/paper-card.tsx`
- Modify: `blog-source/app/globals.css`
- Modify: `blog-source/app/papers/page.tsx`

**Interfaces:**
- Consumes: class names emitted by `PaperExplorer` and `PaperCard`.
- Produces: responsive, `.papers-page`-scoped Research Index presentation.

- [ ] **Step 1: Add a rendered-structure regression assertion**

Extend the explorer test to assert the search region, category navigation label, result count, article semantics, and arXiv/PDF links. Run it before markup changes and confirm the new assertions fail.

- [ ] **Step 2: Implement the compact hero and index rows**

Use this page-local token set:

```css
.papers-page {
  --papers-ink: #242621;
  --papers-muted: #676a64;
  --papers-faint: #92958e;
  --papers-line: #d8dad4;
  --papers-signal: #4d6970;
  --papers-wash: #f5f7f5;
}
```

Use the existing blog serif for titles/prose, Geist Sans for controls, and mono only for dates/counts. The hero remains compact. The search control uses a bottom rule rather than a box. The category rail uses a single active underline. Paper rows use one column, fine separators, no shadows, no card borders, and a narrow desktop metadata column. The distinctive element is the notebook-index category rail; no additional decorative device is introduced.

- [ ] **Step 3: Implement responsive and accessibility styles**

At `720px` and below, make the rail horizontally scrollable, remove the side metadata column, ensure 44px control hit areas, preserve visible `:focus-visible`, and respect `prefers-reduced-motion`. Prevent horizontal page overflow.

- [ ] **Step 4: Run focused tests, lint, and static build**

Run:

```bash
rtk npm test
rtk npm run lint
rtk npm run build:blog
```

Expected: tests and lint pass; Next.js static export produces `/papers` successfully.

- [ ] **Step 5: Commit Task 4**

```bash
rtk git add blog-source/components/paper-card.tsx blog-source/app/globals.css blog-source/app/papers/page.tsx blog-source/components/paper-explorer.test.tsx
rtk git commit -m "style: refine searchable paper index"
```

---

### Task 5: Persist Scheduled Library Updates

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Modify: `blog-source/docs/daily-papers.md`

**Interfaces:**
- Consumes: merged `blog-source/data/papers/papers.json` produced by the fetcher during `scripts/build-blog.sh`.
- Produces: a committed cumulative library after scheduled and manually dispatched refreshes.

- [ ] **Step 1: Add a workflow regression check**

Add a lightweight test or script assertion that parses `.github/workflows/deploy.yml` and verifies `contents: write`, the scheduled/manual event guard, the exact snapshot path, and a `[skip ci]` commit message. Run it before changing the workflow and confirm failure.

- [ ] **Step 2: Add the guarded persistence step**

Grant `contents: write`. After `Refresh and build Blog`, add a step guarded by `github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'` that configures the GitHub Actions bot, stages only `blog-source/data/papers/papers.json`, commits only when staged changes exist, uses `chore: refresh paper library [skip ci]`, and pushes to the current branch.

- [ ] **Step 3: Document cumulative behavior**

Update the paper workflow documentation to state that UTC daily results are paginated, merged by arXiv ID, searched client-side with MiniSearch, and persisted only for scheduled/manual runs.

- [ ] **Step 4: Run workflow assertion and complete suite**

Run Python tests, Vitest, lint, and the static build. Expected: all pass and the workflow assertion reports the required persistence contract.

- [ ] **Step 5: Commit Task 5**

```bash
rtk git add .github/workflows/deploy.yml blog-source/docs/daily-papers.md
rtk git commit -m "ci: persist cumulative paper library"
```

---

### Task 6: Final Verification and Deployment

**Files:**
- Generated: `public/blog/**`

- [ ] **Step 1: Run full verification**

Run all Python tests, all Vitest tests, lint, `npm run build:blog`, and the root portfolio build. Confirm no test, TypeScript, lint, or build errors.

- [ ] **Step 2: Inspect desktop and mobile renderings**

Serve the static export locally. Verify the seven-option rail, default Quantization view, global DARTree search, category replacement behavior, empty states, author truncation, and responsive layout at desktop and mobile widths.

- [ ] **Step 3: Synchronize generated blog output safely**

Copy `blog-source/out/.` into the explicitly verified absolute target `/Users/hanzhuojun/WorkSpace/my-portfolio/public/blog/`. Do not invoke the repository's ambiguous relative `sync:portfolio` script.

- [ ] **Step 4: Commit, push, and verify GitHub Pages**

Commit generated output, push the feature commits to `main`, wait for GitHub Actions build and deploy success, and verify the live page contains the search input, seven controls, and a searchable DARTree result.
