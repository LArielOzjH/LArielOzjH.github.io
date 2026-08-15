import { assetPath } from "./asset-path";

type HastNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

export function rehypeAssetPath() {
  return (tree: HastNode) => {
    visit(tree);
  };
}

function visit(node: HastNode) {
  if (node.type === "element" && node.properties) {
    if (node.tagName === "img" && typeof node.properties.src === "string") {
      node.properties.src = assetPath(node.properties.src);
    }

    if (node.tagName === "source" && typeof node.properties.srcSet === "string") {
      node.properties.srcSet = rewriteSrcSet(node.properties.srcSet);
    }
  }

  for (const child of node.children ?? []) {
    visit(child);
  }
}

function rewriteSrcSet(srcSet: string) {
  return srcSet
    .split(",")
    .map((entry) => {
      const parts = entry.trim().split(/\s+/);
      if (!parts[0]) {
        return entry;
      }

      return [assetPath(parts[0]), ...parts.slice(1)].join(" ");
    })
    .join(", ");
}
