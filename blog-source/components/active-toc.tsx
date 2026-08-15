"use client";

import { useEffect, useMemo, useState } from "react";
import type { TocItem } from "@/lib/posts";

type TocGroup = TocItem & {
  children: TocItem[];
};

export function ActiveToc({ toc }: { toc: TocItem[] }) {
  const groups = useMemo(() => groupToc(toc), [toc]);
  const [activeId, setActiveId] = useState(groups[0]?.id ?? "");
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-18% 0px -68% 0px",
        threshold: [0, 0.1, 1]
      }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [toc]);

  if (!groups.length) return null;

  return (
    <nav
      className="sticky top-[86px] max-w-[231px] font-sans text-[13px] leading-[1.4] text-[var(--fg-muted)]"
      style={{
        fontFamily:
          '"Geist", var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        marginLeft: "calc(1.75rem + 4ch)"
      }}
      aria-label="Table of contents"
    >
      <ol className="space-y-3.5">
        {groups.map((item) => {
          const hasChildren = item.children.length > 0;
          const isOpen = openIds.has(item.id);
          const activeChild = item.children.find((child) => child.id === activeId);
          const isActiveParent = activeId === item.id || Boolean(activeChild);
          const showParentBullet = isActiveParent && (!isOpen || !activeChild);

          return (
            <li
              key={item.id}
              className={[
                "group/tocitem relative transition-colors hover:text-[var(--fg)]",
                isActiveParent ? "text-[var(--fg)]" : "text-[var(--fg-muted)]"
              ].join(" ")}
            >
              <div className="grid grid-cols-[12px_1fr] items-start gap-1">
                <span className="relative h-[1.4em] w-3">
                  {showParentBullet ? (
                    <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--fg-muted)] transition-opacity group-hover/tocitem:opacity-0" />
                  ) : null}
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => toggleOpen(item.id, setOpenIds)}
                    className="absolute inset-0 z-10 inline-flex items-center justify-center text-[var(--fg-muted)] opacity-0 transition-opacity group-hover/tocitem:opacity-100 focus-visible:opacity-100"
                      aria-label={isOpen ? "Collapse section" : "Expand section"}
                      aria-expanded={isOpen}
                    >
                      <span
                        className={[
                          "text-[17px] leading-none transition-transform",
                          isOpen ? "rotate-90" : ""
                        ].join(" ")}
                      >
                        ›
                      </span>
                    </button>
                  ) : null}
                </span>
                <a
                  href={`#${item.id}`}
                  className="toc-link decoration-[var(--fg-faint)] underline-offset-4 hover:underline"
                >
                  {item.title}
                </a>
              </div>

              {hasChildren && isOpen ? (
                <ol className="ml-4 mt-2.5 space-y-2 leading-snug text-[var(--fg-muted)]">
                  {item.children.map((child) => {
                    const isActiveChild = activeId === child.id;

                    return (
                      <li
                        key={child.id}
                        className={[
                          "grid grid-cols-[12px_1fr] gap-1 transition-colors hover:text-[var(--fg)]",
                          isActiveChild ? "text-[var(--fg)]" : undefined
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <span className="relative h-[1.4em] w-3">
                          {isActiveChild ? (
                            <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--fg-muted)]" />
                          ) : null}
                        </span>
                        <a
                          href={`#${child.id}`}
                          className="toc-link decoration-[var(--fg-faint)] underline-offset-4 hover:underline"
                        >
                          {child.title}
                        </a>
                      </li>
                    );
                  })}
                </ol>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function groupToc(toc: TocItem[]): TocGroup[] {
  const groups: TocGroup[] = [];

  for (const item of toc) {
    if (item.depth === 2) {
      groups.push({ ...item, children: [] });
    } else {
      groups.at(-1)?.children.push(item);
    }
  }

  return groups;
}

function toggleOpen(
  id: string,
  setOpenIds: React.Dispatch<React.SetStateAction<Set<string>>>
) {
  setOpenIds((current) => {
    const next = new Set(current);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    return next;
  });
}
