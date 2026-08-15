import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { assetPath } from "@/lib/asset-path";
import { getAllPosts } from "@/lib/posts";

const authors = "Lando Jun, Ariel Yan";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-[760px] px-6 pb-24 pt-9 md:px-8 md:pt-10">
        <header className="home-hero">
          <div>
          <h1
            className="text-[27px] font-normal leading-[1.15] tracking-normal text-[var(--fg)]"
            style={{ fontFamily: "var(--font-geom)" }}
          >
            Larielo Jottings
          </h1>
          <p
            className="mt-[1.75rem] max-w-[520px] text-[14px] leading-[1.45] text-[var(--fg-muted)]"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            Research notes and paper readings on AI hardware and AI infrastructure.
          </p>
          </div>
          <Image
            className="home-hero-mark"
            src={assetPath("/phalcon.svg")}
            alt=""
            width={86}
            height={86}
            aria-hidden="true"
            priority
          />
        </header>

        <section className="pinned-papers-entry" aria-label="Daily papers">
          <Link href="/papers/">
            <span className="pinned-papers-mark">↗</span>
            <span>
              <strong>Daily Systems &amp; AI Infrastructure Papers</strong>
              <small>Eight focused tracks · curated from arXiv</small>
            </span>
          </Link>
        </section>

        <section className="post-index">
          <ol>
            {posts.map((post, index) => (
              <li key={post.slug} style={{ "--post-index": index } as CSSProperties}>
                <Link className="post-index-link" href={`/posts/${post.slug}`}>
                  <time className="post-index-date" dateTime={post.date}>
                    {formatIndexDate(post.date)}
                  </time>
                  <div className="post-index-info">
                    <h2>{post.title}</h2>
                    <p className="post-index-tldr">
                      <span>TL;DR</span>
                      {post.description}
                    </p>
                    <p className="post-index-author">{authors}</p>
                    <time className="post-index-mobile-date" dateTime={post.date}>
                      {formatIndexDate(post.date)}
                    </time>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function formatIndexDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00Z`));
}
