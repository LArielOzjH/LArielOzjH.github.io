import { describe, expect, it } from "vitest";
import { extractToc, getAllPosts, getPostBySlug, getPostSlugs } from "./posts";

describe("blog content index", () => {
  it("lists published posts newest first with frontmatter metadata", () => {
    const posts = getAllPosts();

    expect(posts.length).toBeGreaterThanOrEqual(1);
    expect(posts.find((post) => post.slug === "research-blog-placeholder")).toMatchObject({
      slug: "research-blog-placeholder",
      title: "A Small Note on Scaling Laws Hardware",
      description:
        "A long-form placeholder research note for testing typography, sidenotes, code, figures, tables, math, and Chinese/English mixed reading rhythm.",
      date: "2026-07-03",
      tags: ["systems", "machine-learning", "notes"],
      cover: "/lighthouse-pink-clouds.jpg",
      featured: true
    });
    expect(posts[0].readingTime.text).toMatch(/\d+ min read/);
  });

  it("loads post by slug with source content and table of contents", () => {
    const post = getPostBySlug("research-blog-placeholder");

    expect(post.slug).toBe("research-blog-placeholder");
    expect(post.content).toContain("## A tiny scaling-law sketch");
    expect(post.toc.map((item) => item.id)).toEqual([
      "why-another-blog",
      "reading-structure",
      "mixed-language-typography",
      "a-tiny-scaling-law-sketch",
      "interpreting-the-terms",
      "what-should-be-written-down",
      "experiment-log-format",
      "small-tables",
      "numbered-protocol",
      "failure-notes",
      "a-local-debugging-pattern",
      "figure-placement",
      "third-level-heading",
      "citation-and-source-discipline",
      "source-checklist",
      "closing-thoughts"
    ]);
  });

  it("returns static slugs for published posts", () => {
    expect(getPostSlugs()).toContain("research-blog-placeholder");
  });

  it("extracts level-two and level-three headings with stable ids", () => {
    expect(
      extractToc("## Main Result\n\n### Proof Sketch\n\n# Ignored\n\n## 中文 Heading")
    ).toEqual([
      { depth: 2, id: "main-result", title: "Main Result" },
      { depth: 3, id: "proof-sketch", title: "Proof Sketch" },
      { depth: 2, id: "中文-heading", title: "中文 Heading" }
    ]);
  });
});
