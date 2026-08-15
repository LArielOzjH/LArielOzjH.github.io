import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-24">
        <p className="font-mono-research text-xs uppercase tracking-[0.18em] text-[var(--fg-faint)]">
          404
        </p>
        <h1 className="mt-4 text-4xl font-semibold">Post not found</h1>
        <p className="mt-4 text-[var(--fg-muted)]">
          The note may still be a draft, or the URL may have changed.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full border px-4 py-2 text-sm"
          style={{ borderColor: "var(--line)" }}
        >
          Back to notes
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
