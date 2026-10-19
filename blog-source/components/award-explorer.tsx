"use client";

import { useId, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { assetPath } from "@/lib/asset-path";
import { AWARD_RECORDS, AWARD_YEARS, CONFERENCES, filterAwards, type AwardFilters } from "@/lib/architecture-awards";
import styles from "./award-explorer.module.css";

const DEFAULT_FILTERS: AwardFilters = { conference: "all", year: "all", category: "conference_paper", query: "" };

export function AwardExplorer() {
  const [filters, setFilters] = useState<AwardFilters>(DEFAULT_FILTERS);
  const id = useId();
  const records = filterAwards(AWARD_RECORDS, filters);
  const years = [...new Set(records.map((record) => record.awardYear))].sort((a, b) => b - a);
  const filtered = filters.conference !== "all" || filters.year !== "all" || filters.category !== "conference_paper" || Boolean(filters.query);

  return (
    <section className={styles.explorer} aria-label="Architecture paper awards archive">
      <div className={styles.toolbar}>
        <div className={styles.search} role="search" aria-label="Find an award-winning paper">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search paper titles"
            placeholder="Search paper titles…"
            value={filters.query}
            onChange={(event) => setFilters({ ...filters, query: event.target.value })}
          />
        </div>
        <div className={styles.selects}>
          <label htmlFor={`${id}-conference`}>
            Conference
            <select id={`${id}-conference`} value={filters.conference} onChange={(event) => setFilters({ ...filters, conference: event.target.value as AwardFilters["conference"] })}>
              <option value="all">All conferences</option>
              {CONFERENCES.map((conference) => <option key={conference} value={conference}>{conference}</option>)}
            </select>
          </label>
          <label htmlFor={`${id}-year`}>
            Award year
            <select id={`${id}-year`} value={filters.year} onChange={(event) => setFilters({ ...filters, year: event.target.value })}>
              <option value="all">2016–2026</option>
              {AWARD_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
          <label htmlFor={`${id}-category`}>
            Award category
            <select id={`${id}-category`} value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value as AwardFilters["category"] })}>
              <option value="conference_paper">Paper awards</option>
              <option value="long_term">Long-term impact</option>
              <option value="artifact">Artifact awards</option>
              <option value="all">All awards</option>
            </select>
          </label>
        </div>
      </div>

      <div className={styles.resultsBar}>
        <p role="status" aria-live="polite">{records.length} award {records.length === 1 ? "record" : "records"}</p>
        <button type="button" disabled={!filtered} onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</button>
      </div>

      {records.length === 0 ? (
        <div className={styles.empty}>
          <p>No matching awards</p>
          <p>Try a broader title search or reset the filters. A missing result does not establish that no award was given.</p>
        </div>
      ) : years.map((year) => (
        <section key={year} className={styles.yearGroup} aria-label={`Awards granted in ${year}`}>
          <div className={styles.yearHeading}>
            <span>{year}</span>
            <span>Award year</span>
          </div>
          <ul className={styles.list}>
            {records.filter((record) => record.awardYear === year).map((record) => (
              <li key={record.id} className={styles.row}>
                <div className={styles.recordMeta}>
                  <span className={styles.conference}>{record.conference}</span>
                  <span>{record.award}</span>
                </div>
                <a className={styles.paperTitle} href={record.paperUrl} target="_blank" rel="noreferrer">
                  {record.title}<ArrowUpRight size={13} aria-hidden="true" />
                </a>
                <div className={styles.recordFooter}>
                  <span>Paper · {record.conference} {record.paperYear}</span>
                  <a href={record.evidenceUrl} target="_blank" rel="noreferrer" aria-label={`Award evidence for ${record.title}`}>Award evidence <ArrowUpRight size={11} aria-hidden="true" /></a>
                </div>
                {record.notes?.length ? (
                  <details className={styles.note}>
                    <summary>Source note</summary>
                    {record.notes.map((note, index) => <p key={index}>{note}</p>)}
                  </details>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className={styles.download}>
        Snapshot: October 19, 2026 · <a href={assetPath("/data/architecture-paper-awards.json")} download>Download the full dataset</a>
      </p>
    </section>
  );
}
