"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Search } from "lucide-react";
import { PaperCard } from "@/components/paper-card";
import { buildPaperIndex, searchPapers } from "@/lib/paper-search";
import type { Paper, PaperCategory, PaperCategoryId } from "@/lib/papers";

export type PaperExplorerProps = {
  categories: readonly PaperCategory[];
  papers: Paper[];
};

type ActiveCategory = PaperCategoryId | "all";

export function PaperExplorer({ categories, papers }: PaperExplorerProps) {
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>("quantization");
  const [query, setQuery] = useState("");
  const index = useMemo(() => buildPaperIndex(papers), [papers]);
  const normalizedQuery = query.trim();

  const results = useMemo(() => {
    if (normalizedQuery) return searchPapers(index, papers, normalizedQuery, "all");
    if (activeCategory === "all") return papers;
    return papers.filter((paper) => paper.categoryId === activeCategory);
  }, [activeCategory, index, normalizedQuery, papers]);

  const activeHeading =
    activeCategory === "all"
      ? "All"
      : categories.find((category) => category.id === activeCategory)?.name ?? "All";

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    if (!normalizedQuery && nextQuery.trim()) setActiveCategory("all");
    setQuery(nextQuery);
  }

  function selectCategory(categoryId: ActiveCategory) {
    setActiveCategory(categoryId);
    setQuery("");
  }

  return (
    <section className="papers-explorer" aria-label="Paper library explorer">
      <div className="papers-filter-toolbar">
        <div className="papers-search" role="search" aria-label="Search papers">
          <label htmlFor="paper-search">Search papers</label>
          <div className="papers-search-control">
            <Search aria-hidden="true" size={16} strokeWidth={1.8} />
            <input
              id="paper-search"
              type="search"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search titles, abstracts, authors, organizations, and tags"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="papers-topic">
          <label htmlFor="paper-topic">Topic</label>
          <select
            id="paper-topic"
            value={activeCategory}
            onChange={(event) => selectCategory(event.target.value as ActiveCategory)}
          >
            <option value="all">All</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="papers-results-heading">
        <h2>{normalizedQuery ? "Search results" : activeHeading}</h2>
        <p className="papers-results-count" aria-live="polite">
          {results.length} {results.length === 1 ? "paper" : "papers"}
        </p>
      </div>

      {results.length ? (
        <div className="papers-grid">
          {results.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      ) : (
        <p className="papers-empty">
          {normalizedQuery
            ? "No papers match. Try a shorter query in titles, abstracts, tags, categories, authors, organizations, or venues."
            : papers.length === 0
              ? "No papers are available in the library yet."
              : "No papers are available in this category yet."}
        </p>
      )}
    </section>
  );
}
