import type { MDXComponents } from "mdx/types";
import { assetPath } from "@/lib/asset-path";
import { AwardExplorer } from "./award-explorer";

export const mdxComponents: MDXComponents = {
  ArchitectureAwards: AwardExplorer,
  MarginNote: ({ children }) => <aside className="margin-note">{children}</aside>,
  table: (props) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
  img: ({ src, ...props }) => (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="mx-auto max-w-full rounded-md border"
        style={{ borderColor: "var(--line)" }}
        {...props}
        src={typeof src === "string" ? assetPath(src) : src}
        alt={props.alt ?? ""}
      />
      {props.alt ? <figcaption>{props.alt}</figcaption> : null}
    </figure>
  )
};
