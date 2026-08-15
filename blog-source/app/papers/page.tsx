import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PaperCard } from "@/components/paper-card";
import { getPaperDigest } from "@/lib/papers";

export const metadata = {
  title: "Daily Systems & AI Infrastructure Papers",
  description: "A filtered daily digest of papers on efficient inference and AI systems."
};

export default function PapersPage() {
  const digest = getPaperDigest();
  return (
    <div className="papers-page min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-[960px] px-6 pb-24 pt-10 md:px-8 md:pt-14">
        <header className="papers-hero">
          <div>
            <h1>Systems &amp; AI Infrastructure Papers</h1>
            <p className="papers-intro">A focused daily selection from arXiv, filtered for leading research groups working on efficient inference, model systems, and heterogeneous hardware.</p>
          </div>
          <div className="papers-update">
            <span>Last updated</span>
            <time dateTime={digest.lastUpdated}>{formatDate(digest.lastUpdated)}</time>
          </div>
        </header>

        <div className="papers-sections">
          {digest.categories.map((category) => (
            <details className="papers-section" key={category.id} id={category.id}>
              <summary className="papers-section-heading">
                <span>{category.name}</span>
              </summary>
              {category.papers.length ? (
                <div className="papers-grid">{category.papers.map((paper) => <PaperCard key={paper.id} paper={paper} />)}</div>
              ) : <p className="papers-empty">No matching papers in this snapshot.</p>}
            </details>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}
