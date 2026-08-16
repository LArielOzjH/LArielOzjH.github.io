import { describe, expect, it } from "vitest";
import type { Paper } from "./papers";
import { buildPaperIndex, searchPapers } from "./paper-search";

function paper(overrides: Partial<Paper> & Pick<Paper, "id" | "title">): Paper {
  return {
    authors: ["Ada Researcher"],
    organizations: ["Systems Lab"],
    abstract: "A study of efficient language model execution.",
    tldr: "Efficient inference.",
    category: "Serving Systems",
    categoryId: "serving-systems",
    tags: ["inference", "systems", "language-models", "efficiency", "runtime"],
    published: "2026-01-01",
    arxivUrl: "https://arxiv.org/abs/example",
    pdfUrl: "https://arxiv.org/pdf/example",
    source: "arxiv",
    ...overrides
  };
}

const papers: Paper[] = [
  paper({
    id: "dartree",
    title: "DARTree: Dynamic Trees for Fast Inference",
    abstract: "A tree-structured serving runtime.",
    venue: "MLSys"
  }),
  paper({
    id: "abstract-only",
    title: "Adaptive Runtime Scheduling",
    abstract: "DARTree is compared with a collection of inference schedulers."
  }),
  paper({
    id: "quantized-edge",
    title: "Quantization for Efficient Edge Inference",
    authors: ["Mina Chen"],
    organizations: ["Edge Intelligence Lab"],
    abstract: "Low-bit execution reduces memory pressure on mobile accelerators.",
    category: "Quantization",
    categoryId: "quantization",
    tags: ["quantization", "inference", "edge", "low-bit", "mobile"],
    venue: "NeurIPS"
  }),
  paper({
    id: "speculative",
    title: "Speculative Decoding with Draft Models",
    abstract: "Draft verification accelerates autoregressive generation.",
    category: "Speculative Decoding",
    categoryId: "speculative-decoding",
    tags: ["decoding", "generation", "draft-models", "verification", "inference"]
  }),
  paper({
    id: "compression",
    title: "Structured Pruning for Compact Transformers",
    authors: ["Ravi Patel"],
    organizations: ["Compression Group"],
    abstract: "Pruned transformer layers retain accuracy.",
    category: "Model Compression",
    categoryId: "model-compression",
    tags: ["pruning", "compression", "transformers", "sparsity", "efficiency"],
    venue: "ICLR"
  })
];

describe("paper search", () => {
  it("ranks title matches above abstract-only matches", () => {
    const index = buildPaperIndex(papers);

    expect(searchPapers(index, papers, "DARTree", "all").map(({ id }) => id)).toEqual([
      "dartree",
      "abstract-only"
    ]);
  });

  it("matches word prefixes", () => {
    const index = buildPaperIndex(papers);

    expect(searchPapers(index, papers, "specul", "all").map(({ id }) => id)).toContain("speculative");
  });

  it("allows a small typo without admitting a heavily misspelled query", () => {
    const index = buildPaperIndex(papers);

    expect(searchPapers(index, papers, "quantizaton", "all").map(({ id }) => id)).toContain("quantized-edge");
    expect(searchPapers(index, papers, "qntztn", "all")).toEqual([]);
  });

  it("searches globally when the category is omitted or all", () => {
    const index = buildPaperIndex(papers);
    const globalIds = searchPapers(index, papers, "inference").map(({ id }) => id);

    expect(globalIds).toEqual(searchPapers(index, papers, "inference", "all").map(({ id }) => id));
    expect(globalIds).toContain("dartree");
    expect(globalIds).toContain("quantized-edge");
  });

  it("filters ranked results by an exact topical category", () => {
    const index = buildPaperIndex(papers);
    const results = searchPapers(index, papers, "inference", "serving-systems");

    expect(results.length).toBeGreaterThan(0);
    expect(results.every(({ categoryId }) => categoryId === "serving-systems")).toBe(true);
  });

  it("searches tags, categories, authors, organizations, and venues", () => {
    const index = buildPaperIndex(papers);

    expect(searchPapers(index, papers, "pruning", "all")[0]?.id).toBe("compression");
    expect(searchPapers(index, papers, "Model Compression", "all")[0]?.id).toBe("compression");
    expect(searchPapers(index, papers, "Mina", "all")[0]?.id).toBe("quantized-edge");
    expect(searchPapers(index, papers, "Intelligence", "all")[0]?.id).toBe("quantized-edge");
    expect(searchPapers(index, papers, "MLSys", "all")[0]?.id).toBe("dartree");
  });

  it("returns no results for empty, whitespace-only, or unmatched queries", () => {
    const index = buildPaperIndex(papers);

    expect(searchPapers(index, papers, "", "all")).toEqual([]);
    expect(searchPapers(index, papers, "   ", "all")).toEqual([]);
    expect(searchPapers(index, papers, "nonexistentxyz", "all")).toEqual([]);
  });
});
