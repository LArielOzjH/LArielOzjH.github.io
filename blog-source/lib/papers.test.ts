import { describe, expect, it } from "vitest";
import { PAPER_CATEGORIES, getPaperDigest } from "./papers";

describe("paper digest", () => {
  it("loads a digest with all eight fixed categories", () => {
    const digest = getPaperDigest();
    expect(PAPER_CATEGORIES).toHaveLength(8);
    expect(digest.categories).toHaveLength(8);
    expect(digest.categories.map((category) => category.name)).toEqual(PAPER_CATEGORIES.map((category) => category.name));
  });

  it("preserves card fields and the five-tag invariant", () => {
    const digest = getPaperDigest();
    const papers = digest.categories.flatMap((category) => category.papers);
    expect(papers.length).toBeGreaterThan(0);
    expect(papers.every((paper) => paper.title && paper.authors.length && paper.organizations.length && paper.tldr && paper.tags.length === 5)).toBe(true);
  });
});
