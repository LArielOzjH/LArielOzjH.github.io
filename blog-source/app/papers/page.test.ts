import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

describe("PapersPage source", () => {
  it("uses the approved Neural & Silicon hero copy and matching metadata", () => {
    expect(pageSource).toContain('title: "Neural & Silicon Shelf"');
    expect(pageSource).toContain('description: "Archive for AI Infra and Computer Architecture."');
    expect(pageSource).toContain("<h1>Neural &amp; Silicon Shelf</h1>");
    expect(pageSource).toContain("Archive for AI Infra and Computer Architecture.");
  });
});
