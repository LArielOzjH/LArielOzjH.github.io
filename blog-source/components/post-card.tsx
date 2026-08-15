import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PostSummary } from "@/lib/posts";

export function PostCard({ post, priority = false }: { post: PostSummary; priority?: boolean }) {
  return (
    <article className="group border-b py-6 transition-colors" style={{ borderColor: "var(--line)" }}>
      <Link href={`/posts/${post.slug}`} className="block">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-[var(--fg-faint)]">
              <time dateTime={post.date}>{post.date}</time>
              <span>{post.readingTime.text}</span>
              {priority ? <span className="text-[var(--accent)]">Featured</span> : null}
            </div>
          <h2 className="mt-3 text-[24px] font-semibold leading-[1.35] tracking-normal text-[var(--fg)] md:text-[26px]">
              {post.title}
            </h2>
          <p className="mt-3 max-w-[660px] text-[15px] leading-[1.55] text-[var(--fg-muted)]">
              {post.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border px-3 py-1 text-xs text-[var(--fg-muted)]"
                  style={{ borderColor: "var(--line)", background: "var(--surface)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[var(--fg-muted)] transition group-hover:-translate-y-0.5 group-hover:text-[var(--fg)]"
            style={{ borderColor: "var(--line)" }}
          >
            <ArrowUpRight size={18} />
          </span>
        </div>
      </Link>
    </article>
  );
}
