import json
import unittest
from datetime import date, datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory

from scripts.papers.fetch_papers import build_arxiv_url, build_snapshot, infer_venue, parse_atom, write_snapshot


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

    def test_write_snapshot_replaces_atomically(self):
        with TemporaryDirectory() as directory:
            target = Path(directory) / "papers.json"
            write_snapshot({"papers": [{"id": "x"}]}, target)
            self.assertEqual(json.loads(target.read_text())["papers"][0]["id"], "x")


if __name__ == "__main__":
    unittest.main()
