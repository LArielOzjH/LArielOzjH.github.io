import paperSnapshot from "@/data/papers/papers.json";

export const PAPER_CATEGORIES = [
  { id: "quantization", name: "Quantization" },
  { id: "model-compression", name: "Model Compression" },
  { id: "operators-kernels-compilers", name: "Operators, Kernels & Compilers" },
  { id: "serving-systems", name: "Serving Systems" },
  { id: "speculative-decoding", name: "Speculative Decoding" },
  { id: "long-context-efficient-attention", name: "Long Context & Efficient Attention" },
  { id: "edge-on-device-hardware", name: "Edge, On-device & Hardware" }
] as const;

export type Paper = {
  id: string;
  title: string;
  authors: string[];
  organizations: string[];
  abstract: string;
  tldr: string;
  category: string;
  categoryId: string;
  tags: string[];
  published: string;
  updated?: string;
  venue?: string;
  doi?: string;
  arxivUrl: string;
  pdfUrl: string;
  source: "arxiv";
};

export type PaperDigest = {
  lastUpdated: string;
  source: "arxiv";
  categories: Array<(typeof PAPER_CATEGORIES)[number] & { papers: Paper[] }>;
};

type Snapshot = { lastUpdated?: string; source?: "arxiv"; papers?: Paper[] };

export function getPaperDigest(): PaperDigest {
  const snapshot = paperSnapshot as Snapshot;
  const papers = snapshot.papers ?? [];
  return {
    lastUpdated: snapshot.lastUpdated ?? "",
    source: "arxiv",
    categories: PAPER_CATEGORIES.map((category) => ({
      ...category,
      papers: papers.filter((paper) => paper.categoryId === category.id)
    }))
  };
}
