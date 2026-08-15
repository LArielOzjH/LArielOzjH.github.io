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
        if any(_keyword_in_text(needle, affiliation) for needle in needles for affiliation in affiliations):
            matches.append(organization["name"])
    return matches


def infer_institutions(title: str, abstract: str, allowlist: dict) -> list[str]:
    """Use only explicit organization mentions when Atom lacks affiliations."""
    return allowed_institution([f"{title} {abstract}"], allowlist)


def classify_paper(title: str, abstract: str, categories: list[dict]) -> list[dict]:
    haystack = normalize_text(f"{title} {abstract}")
    scored = []
    for category in categories:
        matched = [keyword for keyword in category["keywords"] if _keyword_in_text(keyword, haystack)]
        if matched:
            scored.append({**category, "matched_terms": matched, "score": len(matched)})
    return sorted(scored, key=lambda item: (-item["score"], item["id"]))


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
