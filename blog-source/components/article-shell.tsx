import Image from "next/image";
import { assetPath } from "@/lib/asset-path";
import type { Post, TocItem } from "@/lib/posts";
import { ActiveToc } from "./active-toc";
import { CopyCode } from "./copy-code";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function ArticleShell({
  post,
  children
}: {
  post: Post;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <header className="mx-auto max-w-[710px] px-6 pb-8 pt-10 text-center md:pt-12">
          <h1 className="font-serif-research -translate-y-3 text-[30px] font-semibold leading-[1.4] tracking-normal text-[var(--fg)]">
            {post.title}
          </h1>
          <div className="mt-4 space-y-1 font-sans text-[15px] font-normal leading-[21px] text-[var(--fg)]">
            <p>Lando Jun, Ariel Yan</p>
            <time className="block text-[var(--fg-muted)]" dateTime={post.date}>
              {formatDate(post.date)}
            </time>
          </div>
        </header>

        {post.cover ? (
          <section className="mx-auto max-w-[720px] px-6 pb-10">
            <div className="relative aspect-[1293/883] w-full overflow-hidden bg-white">
              <Image
                src={assetPath(post.cover)}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 860px"
                className="object-contain"
                priority
              />
            </div>
          </section>
        ) : null}

        <section className="mx-auto grid max-w-[calc(1380px-4ch)] grid-cols-1 gap-[34px] px-6 pb-24 lg:grid-cols-[280px_minmax(0,calc(720px-4ch))_280px] lg:px-8">
          <TableOfContents toc={post.toc} />
          <article>
            <div className="research-prose">{children}</div>
            <CopyCode />
          </article>
          <aside className="pointer-events-none hidden lg:block" aria-hidden="true" />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function TableOfContents({ toc }: { toc: TocItem[] }) {
  if (!toc.length) {
    return <aside className="hidden lg:block" />;
  }

  return (
    <aside className="hidden lg:block">
      <ActiveToc toc={toc} />
    </aside>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00Z`));
}
