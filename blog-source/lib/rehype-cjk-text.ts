type HastNode = {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: {
    className?: string[] | string;
    [key: string]: unknown;
  };
  children?: HastNode[];
};

const CJK_TEXT_PATTERN = /([\p{Script=Han}，。！？、；：（）《》“”‘’]+)/gu;
const SKIP_TAGS = new Set(["code", "pre", "script", "style", "textarea", "kbd", "samp"]);

export function rehypeCjkText() {
  return function transform(tree: HastNode) {
    visit(tree, false);
  };
}

function visit(node: HastNode, skip: boolean) {
  const shouldSkip = skip || shouldSkipNode(node);

  if (!node.children?.length) {
    return;
  }

  node.children = node.children.flatMap((child) => {
    if (child.type === "text" && !shouldSkip && child.value) {
      return splitCjkText(child.value);
    }

    visit(child, shouldSkip);
    return child;
  });
}

function splitCjkText(value: string): HastNode[] {
  const parts: HastNode[] = [];
  let cursor = 0;

  for (const match of value.matchAll(CJK_TEXT_PATTERN)) {
    const text = match[0];
    const index = match.index ?? 0;

    if (index > cursor) {
      parts.push({ type: "text", value: value.slice(cursor, index) });
    }

    parts.push({
      type: "element",
      tagName: "span",
      properties: { className: ["cjk-text"] },
      children: [{ type: "text", value: text }]
    });

    cursor = index + text.length;
  }

  if (cursor < value.length) {
    parts.push({ type: "text", value: value.slice(cursor) });
  }

  return parts.length ? parts : [{ type: "text", value }];
}

function shouldSkipNode(node: HastNode) {
  if (node.tagName && SKIP_TAGS.has(node.tagName)) {
    return true;
  }

  const className = node.properties?.className;
  const classes = Array.isArray(className) ? className : className ? [className] : [];

  return classes.some((name) => name.includes("katex") || name.includes("cjk-text"));
}
