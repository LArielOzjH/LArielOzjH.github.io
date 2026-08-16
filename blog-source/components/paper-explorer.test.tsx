// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { PAPER_CATEGORIES, type Paper } from "@/lib/papers";
import { PaperExplorer } from "./paper-explorer";

afterEach(cleanup);

function paper(overrides: Partial<Paper> & Pick<Paper, "id" | "title">): Paper {
  return {
    authors: ["Ada Researcher"],
    organizations: ["Systems Lab"],
    abstract: "A study of efficient language model execution.",
    tldr: "Efficient inference.",
    category: "Quantization",
    categoryId: "quantization",
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
    id: "quantization",
    title: "Accurate Low-Bit Quantization"
  }),
  paper({
    id: "serving",
    title: "Elastic Serving for Language Models",
    category: "Serving Systems",
    categoryId: "serving-systems"
  }),
  paper({
    id: "dartree",
    title: "DARTree: Speculative Diffusion Decoding",
    category: "Speculative Decoding",
    categoryId: "speculative-decoding",
    arxivUrl: "https://arxiv.org/abs/2601.00001",
    pdfUrl: "https://arxiv.org/pdf/2601.00001"
  })
];

describe("PaperExplorer", () => {
  it("renders the searchable research index structure", () => {
    render(<PaperExplorer categories={PAPER_CATEGORIES} papers={papers} />);

    const search = screen.getByRole("search", { name: "Search papers" });
    expect(within(search).getByRole("searchbox", { name: "Search papers" })).toBeTruthy();

    const categories = screen.getByRole("navigation", { name: "Paper categories" });
    expect(within(categories).getByRole("button", { name: "Quantization" })).toBeTruthy();
    expect(screen.getByText("1 paper", { selector: ".papers-results-count" })).toBeTruthy();

    const article = screen.getByRole("article");
    expect(within(article).getByRole("link", { name: /on arXiv/ })).toBeTruthy();
    expect(within(article).getByRole("link", { name: /Open PDF/ })).toBeTruthy();
  });

  it("starts in Quantization with one accessible seven-button category control", () => {
    render(<PaperExplorer categories={PAPER_CATEGORIES} papers={papers} />);

    const navigation = screen.getByRole("navigation", { name: "Paper categories" });
    expect(within(navigation).getAllByRole("button")).toHaveLength(7);
    expect(screen.getByRole("button", { name: "Quantization" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "All" }).getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByRole("heading", { level: 2, name: "Quantization" })).toBeTruthy();
    expect(screen.getByText("Accurate Low-Bit Quantization")).toBeTruthy();
    expect(screen.queryByText("Elastic Serving for Language Models")).toBeNull();
    expect(screen.getAllByText("1 paper")).toHaveLength(1);
  });

  it("selecting a category replaces the list and clears an active query", async () => {
    const user = userEvent.setup();
    render(<PaperExplorer categories={PAPER_CATEGORIES} papers={papers} />);

    const searchbox = screen.getByRole("searchbox", { name: "Search papers" });
    await user.type(searchbox, "DARTree");
    await user.click(screen.getByRole("button", { name: "Serving Systems" }));

    expect((searchbox as HTMLInputElement).value).toBe("");
    expect(screen.getByRole("button", { name: "Serving Systems" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("heading", { level: 2, name: "Serving Systems" })).toBeTruthy();
    expect(screen.getByText("Elastic Serving for Language Models")).toBeTruthy();
    expect(screen.queryByText(/DARTree/)).toBeNull();
  });

  it("switches to All on the first non-empty query and finds DARTree outside Quantization", async () => {
    const user = userEvent.setup();
    render(<PaperExplorer categories={PAPER_CATEGORIES} papers={papers} />);

    const searchbox = screen.getByRole("searchbox", { name: "Search papers" });
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
    await user.type(searchbox, "   ");
    expect(screen.getByRole("button", { name: "Quantization" }).getAttribute("aria-pressed")).toBe("true");
    await user.type(searchbox, "DARTree");

    expect(screen.getByRole("button", { name: "All" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("heading", { level: 2, name: "Search results" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Clear search" })).toBeTruthy();

    const title = screen.getByRole("heading", { name: "DARTree: Speculative Diffusion Decoding" });
    const article = title.closest("article");
    expect(article).not.toBeNull();
    expect(within(article as HTMLElement).getByRole("link", { name: /Open DARTree.* on arXiv/ }).getAttribute("href")).toBe(
      "https://arxiv.org/abs/2601.00001"
    );
    expect(within(article as HTMLElement).getByRole("link", { name: /Open PDF for DARTree/ })).toBeTruthy();
  });

  it("clearing a search keeps All selected and shows the complete library", async () => {
    const user = userEvent.setup();
    render(<PaperExplorer categories={PAPER_CATEGORIES} papers={papers} />);

    await user.type(screen.getByRole("searchbox", { name: "Search papers" }), "DARTree");
    await user.click(screen.getByRole("button", { name: "Clear search" }));

    expect(screen.getByRole("button", { name: "All" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("heading", { level: 2, name: "All" })).toBeTruthy();
    expect(screen.getByText("Accurate Low-Bit Quantization")).toBeTruthy();
    expect(screen.getByText("Elastic Serving for Language Models")).toBeTruthy();
    expect(screen.getByText(/DARTree/)).toBeTruthy();
    expect(screen.getAllByText("3 papers")).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });

  it("distinguishes an empty category from a search with no matches", async () => {
    const user = userEvent.setup();
    render(<PaperExplorer categories={PAPER_CATEGORIES} papers={papers} />);

    await user.click(screen.getByRole("button", { name: "Model Compression" }));
    expect(screen.getByText("No papers are available in this category yet.")).toBeTruthy();
    expect(screen.queryByText("No papers match your search.")).toBeNull();

    await user.type(screen.getByRole("searchbox", { name: "Search papers" }), "no-such-paper-xyz");
    expect(screen.getByRole("heading", { level: 2, name: "Search results" })).toBeTruthy();
    expect(
      screen.getByText(
        "No papers match. Try a shorter query in titles, abstracts, tags, categories, authors, organizations, or venues."
      )
    ).toBeTruthy();
    expect(screen.queryByText("No papers are available in this category yet.")).toBeNull();
    expect(screen.getAllByText("0 papers")).toHaveLength(1);
  });

  it("shows a neutral message when the entire paper library is empty", () => {
    render(<PaperExplorer categories={PAPER_CATEGORIES} papers={[]} />);

    expect(screen.getByText("No papers are available in the library yet.")).toBeTruthy();
    expect(screen.queryByText("No papers are available in this category yet.")).toBeNull();
    expect(screen.queryByText(/No papers match/)).toBeNull();
  });
});
