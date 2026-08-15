import argparse
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

try:
    from scripts.papers.paper_rules import allowed_institution, classify_paper, load_policy, make_tags, make_tldr
except ModuleNotFoundError:
    from paper_rules import allowed_institution, classify_paper, load_policy, make_tags, make_tldr

DEFAULT_URL = (
    "https://export.arxiv.org/api/query?search_query="
    "cat:cs.LG+OR+cat:cs.AI+OR+cat:cs.DC+OR+cat:cs.AR+OR+cat:cs.PF"
    "&start=0&max_results=100&sortBy=submittedDate&sortOrder=descending"
)
ROOT = Path(__file__).parents[2]


def _text(element: ET.Element, name: str) -> str:
    child = next((item for item in element if item.tag.rsplit("}", 1)[-1] == name), None)
    return " ".join((child.text or "").split()) if child is not None else ""


def _children(element: ET.Element, name: str) -> list[ET.Element]:
    return [child for child in element if child.tag.rsplit("}", 1)[-1] == name]


def _strip_version(value: str) -> str:
    match = re.search(r"arxiv\.org/(?:abs|pdf)/([^?/#]+)", value)
    identifier = match.group(1) if match else value.rsplit("/", 1)[-1]
    return re.sub(r"v\d+$", "", identifier.replace(".pdf", ""))


def parse_atom(xml_text: str) -> list[dict]:
    root = ET.fromstring(xml_text)
    entries = []
    for entry in _children(root, "entry"):
        identifier = _strip_version(_text(entry, "id"))
        if not identifier or not _text(entry, "title") or not _text(entry, "summary"):
            continue
        authors = []
        for author in _children(entry, "author"):
            affiliations = [" ".join((item.text or "").split()) for item in author if item.tag.rsplit("}", 1)[-1] == "affiliation"]
            authors.append({"name": _text(author, "name"), "affiliation": "; ".join(filter(None, affiliations))})
        links = {link.attrib.get("title", link.attrib.get("rel", "")): link.attrib.get("href", "") for link in _children(entry, "link")}
        entries.append({
            "id": identifier,
            "title": _text(entry, "title"),
            "abstract": _text(entry, "summary"),
            "authors": authors,
            "published": _text(entry, "published"),
            "updated": _text(entry, "updated"),
            "arxivUrl": links.get("alternate", f"https://arxiv.org/abs/{identifier}"),
            "pdfUrl": links.get("pdf", f"https://arxiv.org/pdf/{identifier}"),
        })
    return entries


def fetch_arxiv(url: str = DEFAULT_URL, opener=urllib.request.urlopen) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "LarieloDailyPapers/1.0 (research digest)"})
    with opener(request, timeout=30) as response:
        return response.read().decode("utf-8")


def build_snapshot(entries: list[dict], now: datetime) -> dict:
    categories, allowlist = load_policy()
    newest = {}
    for entry in entries:
        current = newest.get(entry["id"])
        if current is None or entry.get("updated", "") > current.get("updated", ""):
            newest[entry["id"]] = entry

    papers = []
    for entry in newest.values():
        affiliations = [author["affiliation"] for author in entry["authors"] if author.get("affiliation")]
        organizations = allowed_institution(affiliations, allowlist)
        classification = classify_paper(entry["title"], entry["abstract"], categories)
        if not organizations or not classification:
            continue
        category = classification[0]
        papers.append({
            "id": entry["id"],
            "title": entry["title"],
            "authors": [author["name"] for author in entry["authors"] if author.get("name")],
            "organizations": organizations,
            "abstract": entry["abstract"],
            "tldr": make_tldr(entry["abstract"]),
            "category": category["name"],
            "categoryId": category["id"],
            "tags": make_tags(category, category["matched_terms"]),
            "published": entry["published"][:10],
            "updated": entry.get("updated", "")[:10],
            "arxivUrl": entry["arxivUrl"],
            "pdfUrl": entry["pdfUrl"],
            "source": "arxiv",
        })
    papers.sort(key=lambda paper: (paper["category"], paper["published"], paper["title"]), reverse=True)
    return {"lastUpdated": now.astimezone(timezone.utc).isoformat(), "source": "arxiv", "papers": papers}


def write_snapshot(snapshot: dict, output_path: Path) -> None:
    if not snapshot.get("papers") and output_path.exists():
        previous = json.loads(output_path.read_text())
        if previous.get("papers"):
            return
    output_path.parent.mkdir(parents=True, exist_ok=True)
    temporary = output_path.with_suffix(output_path.suffix + ".tmp")
    temporary.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n")
    temporary.replace(output_path)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fixture", type=Path)
    parser.add_argument("--output", type=Path, default=ROOT / "data/papers/papers.json")
    args = parser.parse_args()
    try:
        xml_text = args.fixture.read_text() if args.fixture else fetch_arxiv()
        snapshot = build_snapshot(parse_atom(xml_text), datetime.now(timezone.utc))
        write_snapshot(snapshot, args.output)
    except Exception as error:
        print(f"paper fetch failed: {error}")
        return 1
    print(f"paper snapshot ready: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
