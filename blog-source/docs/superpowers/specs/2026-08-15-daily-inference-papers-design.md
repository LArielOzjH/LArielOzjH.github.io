# Daily Systems & AI Infrastructure Papers

## Goal

Add a static, English-only daily paper digest to the existing JunBlogs site at
`/blog/papers/`, with a pinned entry on the existing blog index. The feature
must preserve the blog and portfolio's current typography, palette, spacing, and
overall visual language.

## Scope

The first version covers eight fixed research categories:

1. Quantization
2. Pruning & Sparsity
3. Operator & DSL & Compiler
4. Distributed Inference
5. Serving Systems
6. Speculative Decoding
7. Long Context & Efficient Attention
8. Edge, On-device & Hardware

Each paper card exposes the title, authors, organizations, a concise TL;DR,
exactly five tags, publication date, and an icon link to the paper landing page
and PDF when available. The page groups cards by category and shows the digest
date and the source policy.

## Architecture

The paper pipeline is a deterministic Python command in JunBlogs. It fetches
recent records from the arXiv Atom API, parses author affiliations when the
feed exposes them, applies topic keyword scoring, and then applies an explicit
institution allowlist. The allowlist is versioned in the repository so the
selection policy is inspectable and editable. Non-allowlisted affiliations are
excluded even when the topic score is high.

The command writes a normalized JSON snapshot under `data/papers/` and a
generated Markdown/MDX-friendly snapshot used by the Next.js page. It is
idempotent: paper IDs are stable keys, reruns merge without duplicates, and a
network failure leaves the last successful snapshot intact while returning a
non-zero status only when no usable snapshot exists.

TL;DR generation is local and deterministic for the first version. It extracts
the abstract's first meaningful sentences, normalizes whitespace, and limits
the result to a readable card length. No API key or external LLM service is
required. A later version can replace this function without changing the page
data contract.

The actual GitHub Pages workflow lives in `my-portfolio`, because that is the
repository currently containing the deployment workflow. The workflow supports
both `schedule` and `workflow_dispatch`, runs the JunBlogs fetch/build step,
copies the resulting static Blog output into `public/blog`, and then builds the
portfolio. The schedule is best-effort UTC cron; laptop availability is not a
dependency.

## Data contract

```ts
type Paper = {
  id: string;
  title: string;
  authors: string[];
  organizations: string[];
  abstract: string;
  tldr: string;
  category: Category;
  tags: [string, string, string, string, string];
  published: string;
  updated?: string;
  arxivUrl: string;
  pdfUrl: string;
  source: "arxiv";
};
```

Tags are generated from the category and matched topic signals, then padded
from a stable vocabulary so every card always has five tags. Category and
allowlist matching are case-insensitive and operate on normalized text.

## UI integration

The existing index gets one featured/pinned row before the normal post list.
It links to `/papers/` and uses existing blog classes and CSS variables. The
papers page uses the same `SiteHeader`, `SiteFooter`, max-width, serif title
font, sans metadata font, border colors, hover treatment, and responsive rules.
No existing global font declarations or portfolio styles are changed.

## Failure handling

- arXiv HTTP errors and malformed individual entries are logged and skipped.
- A successful previous snapshot remains available when a scheduled fetch fails.
- Empty results never replace a non-empty snapshot.
- The static page renders an explicit “last updated” date from the snapshot.
- Paper links open the canonical arXiv page; PDF links are separate and
  accessible.

## Verification

Tests cover category matching, institution allowlisting, five-tag invariants,
TL;DR normalization, deduplication, and Atom parsing. The acceptance checks
run the fetcher against a local fixture, build the Blog with `/blog` base path,
sync it into the portfolio, build the portfolio, and verify that the generated
`public/blog/papers/index.html` contains all eight category headings and the
required card fields.
