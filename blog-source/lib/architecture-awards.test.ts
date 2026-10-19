import { describe, expect, it } from "vitest";
import { AWARD_RECORDS, filterAwards } from "./architecture-awards";

describe("architecture awards archive", () => {
  it("includes 2016 awards and retains older papers recognized after 2016", () => {
    expect(AWARD_RECORDS).toHaveLength(224);
    expect(AWARD_RECORDS.every((record) => record.awardYear >= 2016)).toBe(true);
    expect(AWARD_RECORDS.some((record) => record.awardYear === 2016)).toBe(true);
    expect(AWARD_RECORDS.find((record) => record.title === "Drowsy Caches: Simple Techniques for Reducing Leakage Power")).toMatchObject({
      awardYear: 2017, paperYear: 2002, category: "long_term"
    });
    expect(AWARD_RECORDS.every((record) => /^https?:\/\//.test(record.paperUrl) && /^https?:\/\//.test(record.evidenceUrl))).toBe(true);
    expect(AWARD_RECORDS.some((record) => /candidate|nominee/i.test(record.award))).toBe(false);
  });

  it("combines conference, award year, award category and case-insensitive title search", () => {
    const result = filterAwards(AWARD_RECORDS, { conference: "ISCA", year: "2025", category: "conference_paper", query: " xor CACHE " });
    expect(result.map((record) => record.title)).toEqual(["The XOR Cache: A Catalyst for Compression"]);
    expect(filterAwards(AWARD_RECORDS, { conference: "HPCA", year: "2026", category: "conference_paper", query: "" })).toEqual([]);
    expect(filterAwards(AWARD_RECORDS, { conference: "all", year: "all", category: "artifact", query: "" })).toHaveLength(49);
  });
});
