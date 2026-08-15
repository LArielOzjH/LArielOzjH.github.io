import { ArrowUpRight, FileText } from "lucide-react";
import type { Paper } from "@/lib/papers";

export function PaperCard({ paper }: { paper: Paper }) {
  return (
    <article className="paper-card">
      <div className="paper-card-topline">
        <span>{paper.source}</span>
        <time dateTime={paper.published}>{paper.published}</time>
      </div>
      <h3 className="paper-card-title">{paper.title}</h3>
      <p className="paper-card-authors">{paper.authors.join(", ")}</p>
      <p className="paper-card-orgs">{paper.organizations.join(" · ")}</p>
      <div className="paper-card-tldr">
        <span>TL;DR</span>
        <p>{paper.tldr}</p>
      </div>
      <div className="paper-card-footer">
        <div className="paper-card-tags" aria-label="Paper tags">
          {paper.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <div className="paper-card-links">
          <a href={paper.arxivUrl} target="_blank" rel="noreferrer" aria-label={`Open ${paper.title} on arXiv`}>
            arXiv <ArrowUpRight size={15} />
          </a>
          <a href={paper.pdfUrl} target="_blank" rel="noreferrer" aria-label={`Open PDF for ${paper.title}`}>
            PDF <FileText size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}
