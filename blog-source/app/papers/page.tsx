import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PaperExplorer } from "@/components/paper-explorer";
import { getPaperLibrary } from "@/lib/papers";

export const metadata = {
  title: "Neural & Silicon Shelf",
  description: "Archive for AI Infra and Computer Architecture."
};

export default function PapersPage() {
  const library = getPaperLibrary();
  return (
    <div className="papers-page min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-[960px] px-6 pb-24 pt-10 md:px-8 md:pt-14">
        <header className="papers-hero">
          <div>
            <h1>Neural &amp; Silicon Shelf</h1>
            <p className="papers-intro">Archive for AI Infra and Computer Architecture.</p>
          </div>
          <div className="papers-update">
            <span>Last updated</span>
            <time dateTime={library.lastUpdated}>{formatDate(library.lastUpdated)}</time>
          </div>
        </header>

        <PaperExplorer categories={library.categories} papers={library.papers} />
      </main>
      <SiteFooter />
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}
