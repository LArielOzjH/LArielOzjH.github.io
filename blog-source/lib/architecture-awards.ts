import archive from "@/public/data/architecture-paper-awards.json";

export const CONFERENCES = ["ASPLOS", "MICRO", "ISCA", "HPCA"] as const;
export type Conference = (typeof CONFERENCES)[number];
export type AwardCategory = "conference_paper" | "long_term" | "artifact";
export type AwardRecord = {
  id: string;
  conference: Conference;
  awardYear: number;
  paperYear: number;
  category: AwardCategory;
  award: string;
  title: string;
  paperUrl: string;
  evidenceUrl: string;
  notes?: string[];
};
export type AwardFilters = {
  conference: Conference | "all";
  year: string;
  category: AwardCategory | "all";
  query: string;
};

export const AWARD_RECORDS = (archive.records as AwardRecord[]).filter(
  (record) => record.awardYear >= archive.awardYearFrom
);
export const AWARD_YEARS = [...new Set(AWARD_RECORDS.map((record) => record.awardYear))].sort((a, b) => b - a);

export function filterAwards(records: AwardRecord[], filters: AwardFilters): AwardRecord[] {
  const terms = filters.query.trim().toLocaleLowerCase("en").split(/\s+/).filter(Boolean);
  return records.filter((record) =>
    (filters.conference === "all" || record.conference === filters.conference) &&
    (filters.year === "all" || record.awardYear === Number(filters.year)) &&
    (filters.category === "all" || record.category === filters.category) &&
    terms.every((term) => record.title.toLocaleLowerCase("en").includes(term))
  );
}
