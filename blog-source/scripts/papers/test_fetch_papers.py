import json
import unittest
from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory

from scripts.papers.fetch_papers import build_snapshot, parse_atom, write_snapshot


FIXTURE = Path(__file__).parent / "fixtures" / "arxiv-sample.xml"


class FetchPaperTests(unittest.TestCase):
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

    def test_write_snapshot_replaces_atomically(self):
        with TemporaryDirectory() as directory:
            target = Path(directory) / "papers.json"
            write_snapshot({"papers": [{"id": "x"}]}, target)
            self.assertEqual(json.loads(target.read_text())["papers"][0]["id"], "x")


if __name__ == "__main__":
    unittest.main()
