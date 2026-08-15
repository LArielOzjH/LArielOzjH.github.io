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
    const paper = digest.categories.flatMap((category) => category.papers)[0];
    expect(paper.title).toContain("Quantization");
    expect(paper.authors).toContain("Ada Researcher");
    expect(paper.organizations).toContain("NVIDIA");
    expect(paper.tldr).toBeTruthy();
    expect(paper.tags).toHaveLength(5);
  });
});
