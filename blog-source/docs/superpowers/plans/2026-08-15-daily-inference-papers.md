# Daily Systems & AI Infrastructure Papers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deterministic daily arXiv digest in JunBlogs and publish it through the existing my-portfolio GitHub Pages deployment.

**Architecture:** JunBlogs owns the paper domain model, fetcher, allowlist, generated snapshot, and `/papers/` page. The portfolio repository owns the GitHub Actions schedule, copies the blog build into `public/blog`, and deploys the combined static site. The UI reuses existing blog components and CSS variables; no existing font or portfolio visual system changes.

**Tech Stack:** Next.js 16 static export, TypeScript, React, existing Tailwind/CSS, Python 3 standard library for the arXiv Atom fetcher, Vitest for TypeScript tests, GitHub Actions.

## Global Constraints

- English-only paper content in the first version.
- Exactly eight fixed categories and exactly five tags per paper.
- Only allowlisted leading companies, infrastructure/chip companies, universities, and labs are eligible.
- arXiv is the first source; no API key or external LLM is required.
- Laptop availability is not required; schedule plus manual workflow dispatch are required.
- Preserve existing Blog and portfolio typography, colors, spacing, and behavior.
- `JunBlogs` is not a Git repository; deployment changes and commits belong to `my-portfolio`.

---

### Task 1: Define and test the paper domain rules

**Files:**
- Create: `scripts/papers/paper_rules.py`
- Create: `scripts/papers/institutions.json`
- Create: `scripts/papers/categories.json`
- Create: `scripts/papers/test_paper_rules.py`

**Interfaces:**
- `normalize_text(value: str) -> str`
- `allowed_institution(affiliations: list[str], allowlist: dict) -> list[str]`
- `classify_paper(title: str, abstract: str, categories: list[dict]) -> list[dict]`
- `make_tags(category: dict, matched_terms: list[str]) -> list[str]`
- `make_tldr(abstract: str, max_chars: int = 280) -> str`

- [ ] **Step 1: Write failing tests** for case-insensitive affiliation allowlisting, rejection of unknown institutions, category scoring, exactly five tags, and deterministic TL;DR truncation.
- [ ] **Step 2: Run `python3 -m unittest scripts/papers/test_paper_rules.py`** and confirm the missing module/functions fail.
- [ ] **Step 3: Implement the minimal normalized rule functions and versioned JSON policy.** The initial allowlist must include Microsoft, Google, Google DeepMind, Meta, Amazon/AWS, Apple, NVIDIA, AMD, Intel, Qualcomm, Cerebras, Groq, SambaNova, Cerebras, Together AI, Databricks, Anyscale, Modal, Hugging Face, OpenAI, Anthropic, Alibaba/DAMO, Baidu, ByteDance, Tencent, Huawei, Shanghai AI Lab, MIT, Stanford, Berkeley, CMU, Princeton, Harvard, Cornell, University of Washington, University of Toronto, University of Oxford, Cambridge, ETH Zurich, EPFL, Tsinghua, Peking University, Shanghai Jiao Tong University, Zhejiang University, USTC, Chinese Academy of Sciences, and their common lab names.
- [ ] **Step 4: Run the same test and confirm it passes.**

### Task 2: Implement the arXiv Atom fetcher and snapshot writer

**Files:**
- Create: `scripts/papers/fetch_papers.py`
- Create: `scripts/papers/test_fetch_papers.py`
- Create: `scripts/papers/fixtures/arxiv-sample.xml`
- Create: `data/papers/.gitkeep`
- Modify: `package.json` (add `papers:fetch` script)

**Interfaces:**
- `parse_atom(xml_text: str) -> list[dict]`
- `fetch_arxiv(url: str, opener=...) -> str`
- `build_snapshot(entries: list[dict], now: datetime) -> dict`
- `write_snapshot(snapshot: dict, output_path: Path) -> None`

- [ ] **Step 1: Write failing fixture-backed tests** for Atom parsing, malformed-entry skipping, stable arXiv IDs, deduplication, and preserving the previous non-empty snapshot on empty/network failure.
- [ ] **Step 2: Run `python3 -m unittest scripts/papers/test_fetch_papers.py`** and verify the expected missing-function failures.
- [ ] **Step 3: Implement standard-library HTTP fetching with a descriptive User-Agent, XML parsing, topic/allowlist filtering, normalized paper objects, and atomic JSON replacement.** Query recent relevant arXiv categories/terms and cap each category to a readable daily count.
- [ ] **Step 4: Run the focused tests, then run `python3 scripts/papers/fetch_papers.py --fixture scripts/papers/fixtures/arxiv-sample.xml`** to generate a deterministic local snapshot.

### Task 3: Add the static papers page and card UI

**Files:**
- Create: `lib/papers.ts`
- Create: `app/papers/page.tsx`
- Create: `components/paper-card.tsx`
- Create: `lib/papers.test.ts`
- Modify: `app/page.tsx`
- Modify: `app/globals.css` (only scoped paper/pinned-entry classes)

**Interfaces:**
- `getPaperDigest() -> PaperDigest`
- `PaperCard({ paper }: { paper: Paper }) -> JSX.Element`

- [ ] **Step 1: Write failing tests** for loading the generated JSON, exactly eight category groups, and card data preserving authors, organizations, TL;DR, and five tags.
- [ ] **Step 2: Run `npm test -- lib/papers.test.ts`** and confirm failure because the loader/page do not exist.
- [ ] **Step 3: Implement the typed loader, page, and card.** Use the existing `SiteHeader`, `SiteFooter`, width, CSS variables, serif/sans font variables, border treatment, and `ArrowUpRight` icon. Render the canonical paper link and PDF link without changing global typography.
- [ ] **Step 4: Add a single pinned home-index row linking to `/papers/` before regular posts, with a scoped class and responsive behavior matching the existing index.
- [ ] **Step 5: Run focused tests and inspect the generated page source for all eight headings and required card fields.

### Task 4: Wire the portfolio deployment workflow

**Files:**
- Modify: `/Users/hanzhuojun/WorkSpace/my-portfolio/.github/workflows/deploy.yml`
- Modify: `/Users/hanzhuojun/WorkSpace/my-portfolio/package.json` only if a build helper is needed
- Create: `/Users/hanzhuojun/WorkSpace/my-portfolio/scripts/build-blog.sh` only if the workflow needs a checked-in wrapper

**Interfaces:**
- Workflow triggers: `push`, `schedule`, `workflow_dispatch`
- Build sequence: fetch snapshot → `npm run build:blog` → `npm run sync:portfolio` → portfolio build → Pages upload/deploy.

- [ ] **Step 1: Write a shell-level fixture check** that fails if `data/papers/papers.json` is absent or the Blog build output does not contain `/papers/index.html`.
- [ ] **Step 2: Run the check before workflow changes and confirm the expected failure.**
- [ ] **Step 3: Update the workflow to checkout both repositories' required content in one workspace, run the deterministic fetch, build Blog, sync `out` into `public/blog`, then build/deploy the portfolio.** Use `workflow_dispatch` inputs for an optional `days_back`/fixture mode only if the existing action supports it; scheduled production runs must use the real arXiv endpoint.
- [ ] **Step 4: Run the check after a local production build and verify the static artifact exists.

### Task 5: End-to-end verification and handoff

**Files:**
- Modify: `README.md`
- Create: `docs/daily-papers.md`

- [ ] **Step 1: Run Python unit tests with `python3 -m unittest discover -s scripts/papers`.
- [ ] **Step 2: Run Blog tests with `npm test` and lint with `npm run lint`.
- [ ] **Step 3: Run `npm run build:blog` and `npm run sync:portfolio`.
- [ ] **Step 4: Run the portfolio build and inspect `public/blog/papers/index.html` plus the eight category headings.
- [ ] **Step 5: Document local refresh, GitHub Actions schedule, allowlist maintenance, and the exact acceptance URL.
- [ ] **Step 6: In `my-portfolio`, inspect the diff and commit only the intended deployment-integrated changes; do not commit unrelated existing work.
