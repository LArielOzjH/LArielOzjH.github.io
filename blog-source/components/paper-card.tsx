import { ArrowUpRight } from "lucide-react";
import type { Paper } from "@/lib/papers";

export function PaperCard({ paper }: { paper: Paper }) {
  return (
    <article className="paper-card" data-category={paper.categoryId}>
      <div className="paper-card-copy">
        <h3 className="paper-card-title">
          <a href={paper.arxivUrl} target="_blank" rel="noreferrer">
            {paper.title}
            <ArrowUpRight aria-hidden="true" strokeWidth={1.8} />
          </a>
        </h3>
        <p className="paper-card-authors">{formatAuthors(paper.authors)}</p>
        {paper.organizations.length ? <p className="paper-card-orgs">{paper.organizations.join(" · ")}</p> : null}
        {paper.venue ? <p className="paper-card-venue">{paper.venue}</p> : null}
        <div className="paper-card-tldr">
          <span>TL;DR</span>
          <p>{paper.tldr}</p>
        </div>
        <div className="paper-card-tags" aria-label="Paper tags">
          {paper.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      </div>
      <div className="paper-card-meta">
        <time dateTime={paper.published}>{paper.published}</time>
      </div>
    </article>
  );
}

function formatAuthors(authors: string[]) {
  const visible = authors.slice(0, 4).join(", ");
  return authors.length > 4 ? `${visible}, …` : visible;
}
