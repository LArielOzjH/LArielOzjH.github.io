import unittest

from scripts.papers.paper_rules import allowed_institution, clean_affiliations, infer_institutions, classify_paper, load_policy, make_tags, make_tldr, parse_html_affiliations


class PaperRulesTests(unittest.TestCase):
    def test_title_match_outranks_abstract_match_for_category_selection(self):
        categories, _ = load_policy()
        matches = classify_paper("DARTree: Speculative Diffusion Decoding with Autoregressive Draft Trees", "We use best-first pruning to select the verification tree.", categories)
        self.assertEqual(matches[0]["id"], "speculative-decoding")

    def test_allowlist_is_case_insensitive_and_returns_canonical_matches(self):
        allowlist = {"organizations": [{"name": "NVIDIA", "aliases": ["nvidia corporation"]}]}
        self.assertEqual(
            allowed_institution(["NVIDIA Corporation", "Unknown Startup"], allowlist),
            ["NVIDIA"],
        )

    def test_unknown_affiliation_is_rejected(self):
        allowlist = {"organizations": [{"name": "MIT", "aliases": ["massachusetts institute of technology"]}]}
        self.assertEqual(allowed_institution(["Some University"], allowlist), [])

    def test_infers_only_explicit_allowlisted_institutions_from_paper_text(self):
        allowlist = {"organizations": [{"name": "NVIDIA", "aliases": ["nvidia"]}]}
        self.assertEqual(infer_institutions("NVIDIA kernel optimization", "We evaluate on NVIDIA GPUs.", allowlist), ["NVIDIA"])
        self.assertEqual(infer_institutions("A fast kernel", "We evaluate on unknown hardware.", allowlist), [])

    def test_classification_returns_highest_scoring_category_and_terms(self):
        categories = [{"id": "quantization", "name": "Quantization", "keywords": ["quantization", "int4"]}]
        result = classify_paper("An INT4 quantization method", "We study quantization for LLMs.", categories)
        self.assertEqual(result[0]["id"], "quantization")
        self.assertIn("quantization", result[0]["matched_terms"])

    def test_model_merging_is_compression_but_unrelated_merging_is_not(self):
        categories = [{"id": "model-compression", "name": "Model Compression", "keywords": ["model merging", "token merging"]}]
        self.assertTrue(classify_paper("Model merging for LLMs", "We merge model parameters.", categories))
        self.assertFalse(classify_paper("Merging traffic routes", "A transportation study.", categories))

    def test_tags_are_exactly_five_and_tldr_is_compact(self):
        category = {"id": "quantization", "name": "Quantization", "tags": ["LLM Inference", "Model Compression"]}
        tags = make_tags(category, ["int4"])
        self.assertEqual(len(tags), 5)
        self.assertEqual(len(set(tags)), 5)
        self.assertNotIn("LLM Inference", tags)
        self.assertIn("INT4", tags)
        tldr = make_tldr("  We propose a fast method. It improves latency.  " + "x" * 500, max_chars=80)
        self.assertLessEqual(len(tldr), 80)
        self.assertTrue(tldr.endswith("…"))


class HtmlAffiliationTests(unittest.TestCase):
    def test_parses_contact_style_affiliation_and_drops_address_and_email_lines(self):
        html = (
            '<div class="ltx_authors"><span class="ltx_creator ltx_role_author">'
            '<span class="ltx_personname">Divya Jyoti Bajpai, Kishan Kumar Upadhyay</span>'
            '<span class="ltx_author_notes"><span class="ltx_author_notes_content">'
            '<span class="ltx_contact ltx_role_affiliation"><span class="ltx_contact_name">Affiliation: </span>'
            '<span class="ltx_text ltx_font_italic">MLiONS, Department of IEOR, IIT Bombay</span>'
            '<br class="ltx_break">Mumbai, Maharashtra-400076, India'
            '<br class="ltx_break">{divyajyoti.bajpai}@iitb.ac.in'
            "</span></span></span></span></div>"
        )
        self.assertEqual(parse_html_affiliations(html), ["MLiONS, Department of IEOR, IIT Bombay"])

    def test_parses_note_style_affiliations_strips_marks_and_dedups(self):
        note = (
            '<span class="ltx_note ltx_role_affiliation"><sup class="ltx_note_mark">†</sup>'
            '<span class="ltx_note_outer"><span class="ltx_note_content"><sup class="ltx_note_mark">†</sup>'
            '<span class="ltx_note_type">affiliation: </span>{name}</span></span></span>'
        )
        html = note.format(name="Zhejiang University") + note.format(name="Zhejiang University") + note.format(name="Shanghai Jiao Tong University")
        self.assertEqual(parse_html_affiliations(html), ["Zhejiang University", "Shanghai Jiao Tong University"])

    def test_falls_back_to_institution_lines_inside_personname(self):
        html = (
            '<div class="ltx_authors"><span class="ltx_personname">Jane Doe'
            '<br class="ltx_break">Fudan University'
            '<br class="ltx_break">jane@fudan.edu.cn</span></div>'
        )
        self.assertEqual(parse_html_affiliations(html), ["Fudan University"])

    def test_returns_empty_for_pages_without_author_markup(self):
        self.assertEqual(parse_html_affiliations("<html><body><p>404 Not Found</p></body></html>"), [])

    def test_clean_affiliations_dedups_case_insensitively_and_caps_at_four(self):
        values = ["NVIDIA Research", "nvidia research", "A Lab", "B Lab", "C Lab", "D Lab"]
        self.assertEqual(clean_affiliations(values), ["NVIDIA Research", "A Lab", "B Lab", "C Lab"])

    def test_clean_affiliations_drops_junk_and_strips_latexml_remnants(self):
        values = [
            "[3pt]",
            "Indicates equal contributionshttps://z-lab.ai/projects/flashdrive",
            "Chao Zhang, , and Jianping Wu",
            "Syracuse University†\\dagger, Brown University‡\\ddagger",
            "Macau University of Science and Technology, Macao SAR, 999078, China",
        ]
        self.assertEqual(
            clean_affiliations(values),
            [
                "Syracuse University, Brown University",
                "Macau University of Science and Technology, Macao SAR, China",
            ],
        )

    def test_department_only_first_line_joins_the_university_line(self):
        html = (
            '<span class="ltx_contact ltx_role_affiliation">Dept. of ECE'
            '<br class="ltx_break">University of Patras'
            '<br class="ltx_break">Patras, Greece</span>'
        )
        self.assertEqual(parse_html_affiliations(html), ["Dept. of ECE, University of Patras"])


if __name__ == "__main__":
    unittest.main()
