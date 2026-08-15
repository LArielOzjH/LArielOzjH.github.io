import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="flex h-[54px] w-full items-center justify-between pl-6 pr-7 md:pl-8 md:pr-9">
        <Link
          href="/"
          className="text-[17px] font-semibold leading-[25px] tracking-[0.1em] text-[#464641]"
          style={{ fontFamily: "var(--font-chakra-petch)" }}
        >
          LARIELO JOTTING
        </Link>
        <nav
          className="flex items-center gap-7 text-[16px] font-light leading-[24px] text-[var(--fg)]"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          <Link href="/" className="hover:text-[var(--fg-muted)]">
            Launchpad
          </Link>
          <a
            href="https://larielozjh.github.io"
            className="inline-flex items-center gap-1 hover:text-[var(--fg-muted)]"
          >
            Portfolio
            <ArrowUpRight size={17} />
          </a>
        </nav>
      </div>
    </header>
  );
}
