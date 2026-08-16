import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const globalsCss = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

function extractRule(selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = globalsCss.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));

  expect(match, `Expected to find CSS rule for ${selector}`).not.toBeNull();
  return match?.[1] ?? "";
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
  it("keeps the base category rail horizontally scrollable", () => {
    const categoryRail = extractRule(".papers-page .papers-categories");

    expect(categoryRail).toMatch(/overflow-x:\s*auto\s*;/);
  });

  it("keeps the faint paper text at WCAG AA contrast on white", () => {
    const papersPage = extractRule(".papers-page");
    const faintColor = papersPage.match(/--papers-faint:\s*(#[\da-f]{6})\s*;/i)?.[1];

    expect(faintColor, "Expected --papers-faint to be a six-digit hex color").toBeDefined();
    const contrast = 1.05 / (relativeLuminance(faintColor ?? "#ffffff") + 0.05);
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });
});
