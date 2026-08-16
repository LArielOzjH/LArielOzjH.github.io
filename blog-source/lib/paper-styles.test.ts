import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

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

describe("paper page CSS contracts", () => {
  it("replaces the category rail with a compact responsive filter toolbar", () => {
    const toolbar = extractRule(".papers-page .papers-filter-toolbar");

    expect(toolbar).toMatch(/display:\s*grid\s*;/);
    expect(toolbar).toMatch(/grid-template-columns:\s*minmax\(0, 1fr\) minmax\(10rem, 13rem\)\s*;/);
    expect(globalsCss).not.toContain(".papers-page .papers-categories");
    expect(extractRules(".papers-page .papers-filter-toolbar").some((rule) => /grid-template-columns:\s*minmax\(0, 1fr\)\s*;/.test(rule))).toBe(true);
  });

  it("uses responsive ICLR-inspired paper cards without fixed heights or lift effects", () => {
    const grid = extractRule(".papers-page .papers-grid");
    const card = extractRule(".papers-page .paper-card");

    expect(grid).toMatch(/display:\s*grid\s*;/);
    expect(grid).toMatch(/grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)\s*;/);
    expect(extractRules(".papers-page .papers-grid").some((rule) => /grid-template-columns:\s*minmax\(0, 1fr\)\s*;/.test(rule))).toBe(true);
    expect(card).toMatch(/background:\s*var\(--papers-wash\)\s*;/);
    expect(card).toMatch(/border:\s*1px solid var\(--papers-line\)\s*;/);
    expect(card).toMatch(/border-top:\s*3px solid var\(--papers-signal\)\s*;/);
    expect(card).not.toMatch(/(?:min-)?height\s*:/);
    expect(card).not.toMatch(/box-shadow\s*:/);
    expect(card).not.toMatch(/transform\s*:/);
  });

  it("keeps the faint paper text at WCAG AA contrast on white", () => {
    const papersPage = extractRule(".papers-page");
    const faintColor = papersPage.match(/--papers-faint:\s*(#[\da-f]{6})\s*;/i)?.[1];

    expect(faintColor, "Expected --papers-faint to be a six-digit hex color").toBeDefined();
    const contrast = 1.05 / (relativeLuminance(faintColor ?? "#ffffff") + 0.05);
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });
});
