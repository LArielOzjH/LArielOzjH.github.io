import json
import re
from pathlib import Path

ROOT = Path(__file__).parent


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.casefold().replace("’", "'")).strip()


def allowed_institution(affiliations: list[str], allowlist: dict) -> list[str]:
    matches = []
    for organization in allowlist.get("organizations", []):
        needles = [organization["name"], *organization.get("aliases", [])]
        if any(normalize_text(needle) in normalize_text(affiliation) for needle in needles for affiliation in affiliations):
            matches.append(organization["name"])
    return matches


def classify_paper(title: str, abstract: str, categories: list[dict]) -> list[dict]:
    haystack = normalize_text(f"{title} {abstract}")
    scored = []
    for category in categories:
        matched = [keyword for keyword in category["keywords"] if normalize_text(keyword) in haystack]
        if matched:
            scored.append({**category, "matched_terms": matched, "score": len(matched)})
    return sorted(scored, key=lambda item: (-item["score"], item["id"]))


def make_tags(category: dict, matched_terms: list[str]) -> list[str]:
    candidates = [*category.get("tags", []), *[term.title() for term in matched_terms], category["name"]]
    fallback = ["Research Paper", "Systems", "Efficiency", "Inference", "AI Infrastructure"]
    result = []
    for tag in [*candidates, *fallback]:
        if tag not in result:
            result.append(tag)
        if len(result) == 5:
            return result
    return result[:5]


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
