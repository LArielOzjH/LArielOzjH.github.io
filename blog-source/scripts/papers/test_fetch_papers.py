import json
import sys
import unittest
from datetime import date, datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from scripts.papers.fetch_papers import build_arxiv_url, build_snapshot, infer_venue, main, merge_snapshots, parse_atom, write_snapshot


FIXTURE = Path(__file__).parent / "fixtures" / "arxiv-sample.xml"


class FetchPaperTests(unittest.TestCase):
    def test_arxiv_url_uses_utc_calendar_day_as_date_range(self):
        url = build_arxiv_url(date(2026, 8, 15))
        self.assertIn("submittedDate:%5B202608150000+TO+202608152359%5D", url)
        self.assertIn("max_results=100", url)

    def test_arxiv_url_supports_pagination_offsets(self):
        self.assertIn("start=100", build_arxiv_url(date(2026, 8, 13), start=100))

    def test_infer_venue_from_arxiv_comment_or_journal_reference(self):
        self.assertEqual(infer_venue("Accepted at DAC 2026", ""), "DAC 2026")
        self.assertEqual(infer_venue("", "Proceedings of ISCA 2025"), "ISCA 2025")

    def test_parse_atom_normalizes_versions_and_extracts_affiliations(self):
        entries = parse_atom(FIXTURE.read_text())
        self.assertEqual(len(entries), 2)
        self.assertEqual(entries[0]["id"], "2608.12345")
        self.assertEqual(entries[0]["authors"][0]["affiliation"], "NVIDIA Research")

    def test_build_snapshot_deduplicates_versions_and_filters_allowlist(self):
        entries = parse_atom(FIXTURE.read_text())
        snapshot = build_snapshot(entries, datetime(2026, 8, 15, tzinfo=timezone.utc))
        self.assertEqual(len(snapshot["papers"]), 1)
        self.assertEqual(snapshot["papers"][0]["id"], "2608.12345")
        self.assertEqual(len(snapshot["papers"][0]["tags"]), 5)

    def test_build_snapshot_keeps_topic_match_without_affiliation(self):
        entry = {
            "id": "2608.99999", "title": "Speculative Decoding for Fast LLM Serving",
            "abstract": "We verify draft tokens in parallel to reduce latency.",
            "authors": [{"name": "Independent Researcher", "affiliation": ""}],
            "published": "2026-08-15T00:00:00Z", "updated": "2026-08-15T00:00:00Z",
            "arxivUrl": "https://arxiv.org/abs/2608.99999", "pdfUrl": "https://arxiv.org/pdf/2608.99999",
        }
        snapshot = build_snapshot([entry], datetime(2026, 8, 15, tzinfo=timezone.utc))
        self.assertEqual(len(snapshot["papers"]), 1)
        self.assertEqual(snapshot["papers"][0]["organizations"], [])

    def test_merge_snapshots_appends_new_ids_and_normalizes_versions(self):
        previous = {"lastUpdated": "old", "papers": [{"id": "2608.00001v1", "title": "A", "published": "2026-08-14", "updated": "2026-08-14"}]}
        incoming = {"lastUpdated": "new", "papers": [{"id": "2608.00002v2", "title": "B", "published": "2026-08-15", "updated": "2026-08-15"}]}

        merged = merge_snapshots(previous, incoming)

        self.assertEqual([paper["id"] for paper in merged["papers"]], ["2608.00002", "2608.00001"])
        self.assertEqual(merged["lastUpdated"], "new")

    def test_merge_snapshots_replaces_existing_id_only_for_same_or_newer_update(self):
        previous = {"papers": [{"id": "2608.00001v1", "title": "Stored", "published": "2026-08-15", "updated": "2026-08-15"}]}
        older = {"papers": [{"id": "2608.00001v2", "title": "Older", "published": "2026-08-15", "updated": "2026-08-14"}]}
        same_age = {"papers": [{"id": "2608.00001v3", "title": "Replacement", "published": "2026-08-15", "updated": "2026-08-15"}]}

        self.assertEqual(merge_snapshots(previous, older)["papers"][0]["title"], "Stored")
        replacement = merge_snapshots(previous, same_age)["papers"][0]
        self.assertEqual((replacement["id"], replacement["title"]), ("2608.00001", "Replacement"))

    def test_merge_snapshots_preserves_previous_snapshot_when_incoming_is_empty(self):
        previous = {"lastUpdated": "old", "source": "arxiv", "papers": [{"id": "2608.00001"}]}

        self.assertEqual(merge_snapshots(previous, {"lastUpdated": "new", "papers": []}), previous)

    def test_merge_snapshots_sorts_by_published_title_and_id_descending(self):
        incoming = {"papers": [
            {"id": "1", "title": "Alpha", "published": "2026-08-15", "updated": "2026-08-15"},
            {"id": "3", "title": "Beta", "published": "2026-08-15", "updated": "2026-08-15"},
            {"id": "2", "title": "Beta", "published": "2026-08-15", "updated": "2026-08-15"},
            {"id": "4", "title": "Zulu", "published": "2026-08-14", "updated": "2026-08-14"},
        ]}

        merged = merge_snapshots({"papers": []}, incoming)

        self.assertEqual([paper["id"] for paper in merged["papers"]], ["3", "2", "1", "4"])

    def test_main_merges_existing_output_with_new_snapshot(self):
        with TemporaryDirectory() as directory:
            target = Path(directory) / "papers.json"
            target.write_text(json.dumps({"lastUpdated": "old", "source": "arxiv", "papers": [
                {"id": "2608.00001", "title": "Stored", "published": "2026-08-14", "updated": "2026-08-14"}
            ]}))
            argv = ["fetch_papers.py", "--fixture", str(FIXTURE), "--output", str(target)]

            with patch.object(sys, "argv", argv):
                self.assertEqual(main(), 0)

            self.assertEqual({paper["id"] for paper in json.loads(target.read_text())["papers"]}, {"2608.00001", "2608.12345"})

    def test_write_snapshot_replaces_atomically(self):
        with TemporaryDirectory() as directory:
            target = Path(directory) / "papers.json"
            write_snapshot({"papers": [{"id": "x"}]}, target)
            self.assertEqual(json.loads(target.read_text())["papers"][0]["id"], "x")


if __name__ == "__main__":
    unittest.main()
