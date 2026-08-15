import unittest

from scripts.papers.paper_rules import allowed_institution, classify_paper, make_tags, make_tldr


class PaperRulesTests(unittest.TestCase):
    def test_allowlist_is_case_insensitive_and_returns_canonical_matches(self):
        allowlist = {"organizations": [{"name": "NVIDIA", "aliases": ["nvidia corporation"]}]}
        self.assertEqual(
            allowed_institution(["NVIDIA Corporation", "Unknown Startup"], allowlist),
            ["NVIDIA"],
        )

    def test_unknown_affiliation_is_rejected(self):
        allowlist = {"organizations": [{"name": "MIT", "aliases": ["massachusetts institute of technology"]}]}
        self.assertEqual(allowed_institution(["Some University"], allowlist), [])

    def test_classification_returns_highest_scoring_category_and_terms(self):
        categories = [{"id": "quantization", "name": "Quantization", "keywords": ["quantization", "int4"]}]
        result = classify_paper("An INT4 quantization method", "We study quantization for LLMs.", categories)
        self.assertEqual(result[0]["id"], "quantization")
        self.assertIn("quantization", result[0]["matched_terms"])

    def test_tags_are_exactly_five_and_tldr_is_compact(self):
        category = {"id": "quantization", "name": "Quantization", "tags": ["LLM Inference", "Model Compression"]}
        tags = make_tags(category, ["int4"])
        self.assertEqual(len(tags), 5)
        self.assertEqual(len(set(tags)), 5)
        tldr = make_tldr("  We propose a fast method. It improves latency.  " + "x" * 500, max_chars=80)
        self.assertLessEqual(len(tldr), 80)
        self.assertTrue(tldr.endswith("…"))


if __name__ == "__main__":
    unittest.main()
