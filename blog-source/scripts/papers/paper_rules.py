import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).parent

VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
INSTITUTION_HINT = re.compile(r"(?i)\b(universit|institut|laborator|college|academ|school of|center|centre|corporation|research|technolog|polytech)")
JUNK_HINT = re.compile(r"(?i)https?://|www\.|equal contribution|corresponding author|these authors|work (?:was )?done|,\s*,")
DEPT_PREFIX = re.compile(r"(?i)^(dept\.?|department|school|faculty|college|division) of\b")
CORE_INSTITUTION = re.compile(r"(?i)(universit|institute|academy|corporation|company|inc\.)")


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.casefold().replace("’", "'")).strip()


def allowed_institution(affiliations: list[str], allowlist: dict) -> list[str]:
    matches = []
    for organization in allowlist.get("organizations", []):
        needles = [organization["name"], *organization.get("aliases", [])]
        if any(_keyword_in_text(needle, affiliation) for needle in needles for affiliation in affiliations):
            matches.append(organization["name"])
    return matches


def infer_institutions(title: str, abstract: str, allowlist: dict) -> list[str]:
    """Use only explicit organization mentions when Atom lacks affiliations."""
    return allowed_institution([f"{title} {abstract}"], allowlist)


class _ArxivAuthorsParser(HTMLParser):
    """Collect affiliation and author-name text blocks from arXiv LaTeXML HTML."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.affiliations: list[str] = []
        self.personnames: list[str] = []
        self._open: list[str] = []
        self._captures: list[list] = []

    def handle_starttag(self, tag, attrs):
        if tag in VOID_TAGS:
            if tag == "br":
                for capture in self._captures:
                    capture[2].append("\n")
            return
        self._open.append(tag)
        classes = dict(attrs).get("class") or ""
        if "ltx_role_affiliation" in classes:
            self._captures.append([len(self._open), "affiliation", []])
        elif "ltx_personname" in classes:
            self._captures.append([len(self._open), "personname", []])

    def handle_endtag(self, tag):
        if tag in VOID_TAGS:
            return
        while self._open:
            opened = self._open.pop()
            depth = len(self._open) + 1
            for capture in list(self._captures):
                if capture[0] == depth:
                    self._captures.remove(capture)
                    text = "".join(capture[2])
                    (self.affiliations if capture[1] == "affiliation" else self.personnames).append(text)
            if opened == tag:
                break

    def handle_data(self, data):
        for capture in self._captures:
            capture[2].append(data)


def parse_html_affiliations(html: str) -> list[str]:
    """Extract institution names from an arXiv-generated LaTeXML HTML page.

    Prefers explicit ltx_role_affiliation blocks; falls back to institution-like
    lines inside ltx_personname when a paper inlines affiliations after names.
    """
    parser = _ArxivAuthorsParser()
    try:
        parser.feed(html)
        parser.close()
    except Exception:
        return []

    organizations = [org for org in (_first_affiliation_line(block) for block in parser.affiliations) if org]
    if not organizations:
        for block in parser.personnames:
            for line in block.split("\n")[1:]:
                line = _tidy_affiliation_line(line)
                if line and "@" not in line and INSTITUTION_HINT.search(line):
                    organizations.append(line)
    return clean_affiliations(organizations)


def clean_affiliations(values: list[str]) -> list[str]:
    seen, result = set(), []
    for value in values:
        if _is_junk_affiliation_line(value):
            continue
        tidy = _tidy_affiliation_line(value)
        key = tidy.casefold()
        if key not in seen:
            seen.add(key)
            result.append(tidy)
        if len(result) == 4:
            break
    return result


def _first_affiliation_line(block: str) -> str:
    lines = [_tidy_affiliation_line(line) for line in block.split("\n") if not _is_junk_affiliation_line(line)]
    if not lines:
        return ""
    first = lines[0]
    # A department-only first line usually names its university on the next line.
    if len(lines) > 1 and DEPT_PREFIX.search(first) and not CORE_INSTITUTION.search(first):
        return f"{first}, {lines[1]}"[:120]
    return first


def _is_junk_affiliation_line(line: str) -> bool:
    if "@" in line or JUNK_HINT.search(line):
        return True
    tidy = _tidy_affiliation_line(line)
    return not tidy or not re.search(r"[A-Z一-鿿]", tidy)


def _tidy_affiliation_line(line: str) -> str:
    line = re.sub(r"\\[a-zA-Z]+", " ", line)
    line = re.sub(r"[†‡§¶∗*]", " ", line)
    line = " ".join(line.split())
    line = re.sub(r"(?i)^[\s\d,;.+&^~-]*affiliations?\s*:?", "", line)
    line = re.sub(r"^[\s\d,;.+&^~-]+", "", line)
    segments = [segment for segment in (part.strip() for part in line.split(",")) if segment and not segment.isdigit()]
    return ", ".join(segments).strip(" ,;")[:120]


def classify_paper(title: str, abstract: str, categories: list[dict]) -> list[dict]:
    title_text = normalize_text(title)
    abstract_text = normalize_text(abstract)
    scored = []
    for category in categories:
        title_matches = [keyword for keyword in category["keywords"] if _keyword_in_text(keyword, title_text)]
        abstract_matches = [keyword for keyword in category["keywords"] if _keyword_in_text(keyword, abstract_text) and keyword not in title_matches]
        matched = [*title_matches, *abstract_matches]
        if matched:
            scored.append({**category, "matched_terms": matched, "score": len(matched), "title_score": len(title_matches), "abstract_score": len(abstract_matches)})
    return sorted(scored, key=lambda item: (-bool(item["title_score"]), -item["title_score"], -item["abstract_score"], item["id"]))


def make_tags(category: dict, matched_terms: list[str]) -> list[str]:
    candidates = [*matched_terms, *category.get("keywords", []), category["name"]]
    fallback = ["inference", "latency", "throughput", "memory", "hardware"]
    result = []
    for tag in [*candidates, *fallback]:
        label = format_keyword(tag)
        if label not in result:
            result.append(label)
        if len(result) == 5:
            return result
    return result[:5]


def format_keyword(keyword: str) -> str:
    labels = {
        "int4": "INT4", "int8": "INT8", "fp4": "FP4", "fp8": "FP8", "nvfp4": "NVFP4",
        "ptq": "PTQ", "qat": "QAT", "mxfp": "MXFP", "cuda": "CUDA", "dsl": "DSL",
        "mlir": "MLIR", "tvm": "TVM", "xla": "XLA", "gemm": "GEMM", "gemv": "GEMV",
        "gpu": "GPU", "npu": "NPU", "fpga": "FPGA", "asic": "ASIC", "pim": "PIM",
        "cim": "CIM", "cam": "CAM", "moe": "MoE", "mtp": "MTP", "kv": "KV",
    }
    normalized = normalize_text(keyword)
    if normalized in labels:
        return labels[normalized]
    return " ".join(part.upper() if part in {"kv", "llm", "slo", "ttft", "tpot"} else part.capitalize() for part in normalized.split())


def _keyword_in_text(keyword: str, text: str) -> bool:
    normalized_keyword = normalize_text(keyword)
    normalized_text = normalize_text(text)
    pattern = rf"(?<![a-z0-9]){re.escape(normalized_keyword)}(?![a-z0-9])"
    return re.search(pattern, normalized_text) is not None


def make_tldr(abstract: str, max_chars: int = 280) -> str:
    clean = normalize_text(abstract)
    if len(clean) <= max_chars:
        return clean
    boundary = clean.rfind(" ", 0, max_chars - 1)
    return clean[: boundary if boundary > 40 else max_chars - 1].rstrip(" ,;:") + "…"


def load_policy() -> tuple[list[dict], dict]:
    return (
        json.loads((ROOT / "categories.json").read_text()),
        json.loads((ROOT / "institutions.json").read_text()),
    )
