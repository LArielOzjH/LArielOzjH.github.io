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
        <p className="paper-card-orgs">{paper.organizations.join(" · ")}</p>
        <div className="paper-card-tldr">
          <span>TL;DR</span>
          <p>{paper.tldr}</p>
        </div>
      </div>
      <div className="paper-card-meta">
        {paper.venue ? <span className="paper-card-venue">{paper.venue}</span> : null}
        <time dateTime={paper.published}>{formatPublished(paper.published)}</time>
      </div>
    </article>
  );
}

function formatAuthors(authors: string[]) {
  const visible = authors.slice(0, 4).join(", ");
  return authors.length > 4 ? `${visible}, …` : visible;
}

function formatPublished(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00Z`));
}
