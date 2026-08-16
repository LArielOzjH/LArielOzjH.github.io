import argparse
import json
import re
import time as time_module
import urllib.request
import xml.etree.ElementTree as ET
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path

try:
    from scripts.papers.paper_rules import classify_paper, clean_affiliations, infer_institutions, load_policy, make_tags, make_tldr, parse_html_affiliations
except ModuleNotFoundError:
    from paper_rules import classify_paper, clean_affiliations, infer_institutions, load_policy, make_tags, make_tldr, parse_html_affiliations

ROOT = Path(__file__).parents[2]
ARXIV_QUERY = (
    "(cat:cs.LG+OR+cat:cs.AI+OR+cat:cs.DC+OR+cat:cs.AR+OR+cat:cs.PF+OR+"
    "all:%22Design+Automation+Conference%22+OR+all:%22ASP-DAC%22+OR+all:%22ICCAD%22+OR+"
    "all:%22ISCA%22+OR+all:%22HPCA%22)"
)


def build_arxiv_url(day: date | None = None, start: int = 0, max_results: int = 100) -> str:
    """Build a daily query for one UTC calendar day."""
    utc_day = day or datetime.now(timezone.utc).date()
    utc_start = datetime.combine(utc_day, time.min, tzinfo=timezone.utc)
    utc_end = utc_start + timedelta(days=1) - timedelta(minutes=1)
    range_start = utc_start.strftime("%Y%m%d%H%M")
    range_end = utc_end.strftime("%Y%m%d%H%M")
    return (
        f"https://export.arxiv.org/api/query?search_query={ARXIV_QUERY}+AND+"
        f"submittedDate:%5B{range_start}+TO+{range_end}%5D"
        f"&start={start}&max_results={max_results}&sortBy=submittedDate&sortOrder=descending"
    )


DEFAULT_URL = build_arxiv_url()


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
        link_nodes = _children(entry, "link")
        links = {link.attrib.get("title", link.attrib.get("rel", "")): link.attrib.get("href", "") for link in link_nodes}
        doi = links.get("doi", "") or next((link.attrib.get("href", "") for link in link_nodes if "doi.org/" in link.attrib.get("href", "")), "")
        comment = _text(entry, "comment")
        journal_ref = _text(entry, "journal_ref")
        entries.append({
            "id": identifier,
            "title": _text(entry, "title"),
            "abstract": _text(entry, "summary"),
            "authors": authors,
            "published": _text(entry, "published"),
            "updated": _text(entry, "updated"),
            "comment": comment,
            "journalRef": journal_ref,
            "venue": infer_venue(comment, journal_ref),
            "doi": doi,
            "arxivUrl": links.get("alternate", f"https://arxiv.org/abs/{identifier}"),
            "pdfUrl": links.get("pdf", f"https://arxiv.org/pdf/{identifier}"),
        })
    return entries


def infer_venue(comment: str, journal_ref: str) -> str:
    text = " ".join(value for value in (comment, journal_ref) if value)
    match = re.search(r"(?i)\b(DAC|ASP-DAC|DATE|ICCAD|ISCA|HPCA|ISSCC|ICLR|ICML|ACL|EMNLP|NeurIPS|CVPR|ECCV|MICRO|MLSys)\b[^,;]*", text)
    return match.group(0).strip() if match else ""


def fetch_arxiv(url: str | None = None, opener=urllib.request.urlopen) -> str:
    url = url or build_arxiv_url()
    request = urllib.request.Request(url, headers={"User-Agent": "LarieloDailyPapers/1.0 (research digest)"})
    with opener(request, timeout=30) as response:
        return response.read().decode("utf-8")


def fetch_html_affiliations(paper_id: str, opener=urllib.request.urlopen) -> list[str]:
    """Read affiliations from arXiv's generated HTML page; papers without one yield []."""
    time_module.sleep(0.3)
    request = urllib.request.Request(
        f"https://arxiv.org/html/{paper_id}",
        headers={"User-Agent": "LarieloDailyPapers/1.0 (research digest)"},
    )
    try:
        with opener(request, timeout=30) as response:
            return parse_html_affiliations(response.read().decode("utf-8", "replace"))
    except Exception:
        return []


def fetch_all_arxiv(day: date | None = None, page_size: int = 100, opener=urllib.request.urlopen) -> list[dict]:
    """Fetch every result for a day by following arXiv API pages until exhausted."""
    entries = []
    start = 0
    while True:
        page = parse_atom(fetch_arxiv(build_arxiv_url(day, start=start, max_results=page_size), opener))
        entries.extend(page)
        if len(page) < page_size:
            return entries
        start += page_size


def build_snapshot(entries: list[dict], now: datetime, affiliation_fetcher=None) -> dict:
    categories, allowlist = load_policy()
    newest = {}
    for entry in entries:
        current = newest.get(entry["id"])
        if current is None or entry.get("updated", "") > current.get("updated", ""):
            newest[entry["id"]] = entry

    papers = []
    for entry in newest.values():
        classification = classify_paper(entry["title"], entry["abstract"], categories)
        if not classification:
            continue
        category = classification[0]
        organizations = clean_affiliations([author["affiliation"] for author in entry["authors"] if author.get("affiliation")])
        if not organizations and affiliation_fetcher:
            organizations = affiliation_fetcher(entry["id"])
        if not organizations:
            organizations = infer_institutions(entry["title"], entry["abstract"], allowlist)
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
            "venue": entry.get("venue", ""),
            "doi": entry.get("doi", ""),
            "arxivUrl": entry["arxivUrl"],
            "pdfUrl": entry["pdfUrl"],
            "source": "arxiv",
        })
    papers.sort(key=lambda paper: (paper["category"], paper["published"], paper["title"]), reverse=True)
    return {"lastUpdated": now.astimezone(timezone.utc).isoformat(), "source": "arxiv", "papers": papers}


def merge_snapshots(previous: dict, incoming: dict) -> dict:
    incoming_papers = incoming.get("papers", [])
    if not incoming_papers:
        return previous

    papers_by_id = {}
    for paper in previous.get("papers", []):
        normalized = {**paper, "id": _strip_version(paper["id"])}
        papers_by_id[normalized["id"]] = normalized

    for paper in incoming_papers:
        normalized = {**paper, "id": _strip_version(paper["id"])}
        stored = papers_by_id.get(normalized["id"])
        if stored is None or normalized.get("updated", "") >= stored.get("updated", ""):
            papers_by_id[normalized["id"]] = normalized

    papers = list(papers_by_id.values())
    papers.sort(key=lambda paper: (paper.get("published", ""), paper.get("title", ""), paper["id"]), reverse=True)
    return {**previous, **incoming, "papers": papers}


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
        entries = parse_atom(args.fixture.read_text()) if args.fixture else fetch_all_arxiv()
        affiliation_fetcher = None if args.fixture else fetch_html_affiliations
        snapshot = build_snapshot(entries, datetime.now(timezone.utc), affiliation_fetcher)
        if args.output.exists():
            previous = json.loads(args.output.read_text())
            snapshot = merge_snapshots(previous, snapshot)
        write_snapshot(snapshot, args.output)
    except Exception as error:
        print(f"paper fetch failed: {error}")
        return 1
    print(f"paper snapshot ready: {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
