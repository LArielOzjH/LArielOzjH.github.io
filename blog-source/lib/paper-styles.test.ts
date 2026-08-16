import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PAPER_CATEGORIES } from "./papers";

const globalsCss = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

function extractRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = globalsCss.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));

  expect(match, `Expected to find CSS rule for ${selector}`).not.toBeNull();
  return match?.[1] ?? "";
}

function extractRules(selector: string): string[] {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...globalsCss.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, "g"))].map((match) => match[1]);
}

function declarationsFor(selector: string): string {
  return [...globalsCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((match) => match[1].split(",").some((candidate) => candidate.trim() === selector))
    .map((match) => match[2])
    .join("\n");
}

function relativeLuminance(hex: string): number {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    );

  expect(channels).toHaveLength(3);
  const [red = 0, green = 0, blue = 0] = channels ?? [];
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(first: string, second: string): number {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((left, right) => right - left);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("paper page CSS contracts", () => {
  it("replaces the category rail with a compact responsive filter toolbar", () => {
    const toolbar = extractRule(".papers-page .papers-filter-toolbar");
    const papersPage = extractRule(".papers-page");
    const select = extractRule(".papers-page .papers-topic select");
    const controlLine = papersPage.match(/--papers-control-line:\s*(#[\da-f]{6})\s*;/i)?.[1];

    expect(toolbar).toMatch(/display:\s*grid\s*;/);
    expect(toolbar).toMatch(/grid-template-columns:\s*minmax\(0, 1fr\) minmax\(16rem, 18rem\)\s*;/);
    expect(globalsCss).not.toContain(".papers-page .papers-categories");
    expect(extractRules(".papers-page .papers-filter-toolbar").some((rule) => /grid-template-columns:\s*minmax\(0, 1fr\)\s*;/.test(rule))).toBe(true);
    expect(controlLine, "Expected a page-scoped Topic control border color").toBeDefined();
    expect(contrastRatio(controlLine ?? "#ffffff", "#ffffff")).toBeGreaterThanOrEqual(3);
    expect(select).toMatch(/border:\s*1px solid var\(--papers-control-line\)\s*;/);
    expect(select).toMatch(/background-color:\s*#ffffff\s*;/);
  });

  it("keeps the search field free of a focus outline box", () => {
    const focusRule = extractRule(".papers-page .papers-search input:focus-visible");

    expect(focusRule).toMatch(/outline:\s*0\s*;/);
    expect(extractRule(".papers-page .papers-search-control:focus-within")).toMatch(/border-bottom-color:/);
  });

  it("uses a dedicated hint tone for the search placeholder", () => {
    expect(extractRule(".papers-page")).toMatch(/--papers-hint:\s*#[\da-f]{6}\s*;/i);
    expect(extractRule(".papers-page .papers-search input::placeholder")).toMatch(/color:\s*var\(--papers-hint\)\s*;/);
  });

  it("uses light, responsive ICLR-inspired paper cards without lift effects", () => {
    const grid = extractRule(".papers-page .papers-grid");
    const card = extractRule(".papers-page .paper-card");
    const papersPage = extractRule(".papers-page");

    expect(grid).toMatch(/display:\s*grid\s*;/);
    expect(grid).toMatch(/grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)\s*;/);
    expect(extractRules(".papers-page .papers-grid").some((rule) => /grid-template-columns:\s*minmax\(0, 1fr\)\s*;/.test(rule))).toBe(true);
    expect(papersPage).toMatch(/--papers-card:\s*#ffffff\s*;/);
    expect(papersPage).toMatch(/--papers-card-line:\s*#[\da-f]{6}\s*;/i);
    expect(papersPage).toMatch(/--papers-card-signal:\s*#[\da-f]{6}\s*;/i);
    expect(card).toMatch(/background:\s*var\(--papers-card\)\s*;/);
    expect(card).toMatch(/border:\s*1px solid var\(--papers-card-line\)\s*;/);
    expect(card).toMatch(/border-top:\s*2px solid var\(--papers-card-signal\)\s*;/);
    expect(card).not.toMatch(/box-shadow\s*:/);
    expect(card).not.toMatch(/transform\s*:/);
  });

  it("keeps every card the same height via fixed content slots and anchors the meta colophon", () => {
    const grids = extractRules(".papers-page .papers-grid");
    const card = extractRule(".papers-page .paper-card");
    const meta = extractRule(".papers-page .paper-card-meta");
    const untrustedTextSelectors = [
      ".papers-page .paper-card-title",
      ".papers-page .paper-card-authors",
      ".papers-page .paper-card-orgs",
      ".papers-page .paper-card-venue",
      ".papers-page .paper-card-tldr p"
    ];

    // Desktop rows share one global height; the single-column layout releases it.
    expect(grids.some((rule) => /grid-auto-rows:\s*1fr\s*;/.test(rule))).toBe(true);
    expect(grids.some((rule) => /grid-auto-rows:\s*auto\s*;/.test(rule))).toBe(true);
    expect(card).toMatch(/height:\s*100%\s*;/);
    expect(card).toMatch(/box-sizing:\s*border-box\s*;/);
    expect(meta).toMatch(/margin-top:\s*auto\s*;/);
    expect(meta).toMatch(/border-top:\s*1px solid var\(--papers-card-line\)\s*;/);
    expect(extractRule(".papers-page .paper-card-meta time")).toMatch(/margin-left:\s*auto\s*;/);
    expect(extractRule(".papers-page .paper-card-venue")).toMatch(/font-family:\s*var\(--font-mono\)\s*;/);

    // Fixed slots: two title lines, two author lines, two organization lines, six TL;DR lines.
    expect(extractRule(".papers-page .paper-card-title")).toMatch(/min-height:\s*calc\(2 \* 1\.32em\)\s*;/);
    for (const [selector, lines, lineHeight] of [
      [".papers-page .paper-card-authors", 2, "1.45"],
      [".papers-page .paper-card-orgs", 2, "1.45"],
      [".papers-page .paper-card-tldr p", 6, "1.55"]
    ] as const) {
      const rule = declarationsFor(selector);
      expect(rule, `Expected ${selector} to clamp to ${lines} lines`).toMatch(
        new RegExp(`-webkit-line-clamp:\\s*${lines}\\s*;`)
      );
      expect(rule).toMatch(new RegExp(`min-height:\\s*calc\\(${lines} \\* ${lineHeight.replace(".", "\\.")}em\\)\\s*;`));
      expect(rule).toMatch(/overflow:\s*hidden\s*;/);
    }

    for (const selector of untrustedTextSelectors) {
      expect(declarationsFor(selector), `Expected ${selector} to wrap long untrusted text`).toMatch(
        /overflow-wrap:\s*anywhere\s*;/
      );
    }
  });

  it("assigns every curated track a scoped muted hue for the card top rule", () => {
    const trackIds = PAPER_CATEGORIES.map((category) => category.id);

    for (const trackId of trackIds) {
      const rule = extractRule(`.papers-page [data-category="${trackId}"]`);
      expect(rule, `Expected a hue override for track ${trackId}`).toMatch(
        /--papers-card-signal:\s*#[\da-f]{6}\s*;/i
      );
    }
  });

  it("routes the card jump through the title link instead of a footer link row", () => {
    const titleLink = extractRule(".papers-page .paper-card-title a");

    expect(titleLink).toMatch(/color:\s*inherit\s*;/);
    expect(titleLink).toMatch(/text-decoration:\s*none\s*;/);
    expect(globalsCss).not.toContain(".paper-card-links");
    expect(globalsCss).not.toContain(".paper-card-tags");
  });

  it("replaces the native select chrome with a scoped chevron", () => {
    const select = extractRule(".papers-page .papers-topic select");

    expect(select).toMatch(/appearance:\s*none\s*;/);
    expect(select).toMatch(/background-image:\s*url\("data:image\/svg\+xml,/);
  });

  it("does not keep a page-specific reduced-motion block after removing paper-card motion", () => {
    expect(globalsCss).not.toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*\.papers-page/);
  });

  it("keeps the faint paper text at WCAG AA contrast on white", () => {
    const papersPage = extractRule(".papers-page");
    const faintColor = papersPage.match(/--papers-faint:\s*(#[\da-f]{6})\s*;/i)?.[1];

    expect(faintColor, "Expected --papers-faint to be a six-digit hex color").toBeDefined();
    const contrast = 1.05 / (relativeLuminance(faintColor ?? "#ffffff") + 0.05);
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });
});
