import MiniSearch from "minisearch";
import type { Paper, PaperCategoryId } from "./papers";

export type PaperSearchDocument = {
  id: string;
  title: string;
  abstract: string;
  tagsText: string;
  category: string;
  authorsText: string;
  organizationsText: string;
  venue: string;
};

const SEARCH_FIELDS: Array<keyof Omit<PaperSearchDocument, "id">> = [
  "title",
  "abstract",
  "tagsText",
  "category",
  "authorsText",
  "organizationsText",
  "venue"
];

export function buildPaperIndex(papers: Paper[]): MiniSearch<PaperSearchDocument> {
  const index = new MiniSearch<PaperSearchDocument>({
    fields: SEARCH_FIELDS,
    storeFields: ["id"]
  });

  index.addAll(
    papers.map((paper) => ({
      id: paper.id,
      title: paper.title,
      abstract: paper.abstract,
      tagsText: paper.tags.join(" "),
      category: paper.category,
      authorsText: paper.authors.join(" "),
      organizationsText: paper.organizations.join(" "),
      venue: paper.venue ?? ""
    }))
  );

  return index;
}

export function searchPapers(
  index: MiniSearch<PaperSearchDocument>,
  papers: Paper[],
  query: string,
  categoryId: PaperCategoryId | "all" = "all"
): Paper[] {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const papersById = new Map(papers.map((paper) => [paper.id, paper]));

  return index
    .search(normalizedQuery, {
      prefix: true,
      fuzzy: 0.2,
      boost: {
        title: 5,
        abstract: 1,
        tagsText: 2.5,
        category: 2,
        authorsText: 1,
        organizationsText: 1,
        venue: 1.2
      }
    })
    .map(({ id }) => papersById.get(String(id)))
    .filter((paper): paper is Paper => Boolean(paper))
    .filter((paper) => categoryId === "all" || paper.categoryId === categoryId);
}
