#!/usr/bin/env python3
"""Generate frontmatter.excerpt for Astro Starlight blog posts.

Three-phase pipeline:
  1. EXTRACT   — opening / outline / closing snippets from the markdown body.
  2. SUMMARIZE — call OpenAI Chat Completions using system+user prompt templates.
  3. FALLBACK  — if any step fails, produce a rule-based excerpt compatible
                 with src/content.config.ts::extractExcerptFromFile.

Configuration (OpenAI-only, no third-party deps):
  - The script reads a `.env` file (KEY=VALUE lines) in the following order,
    merging later values into later (i.e. earlier wins if a key is set twice):
      1. Project root = nearest ancestor containing `astro.config.*` / `.git`
      2. Skill script directory = `dirname(__FILE__)`
    Values already exported in the shell environment ALWAYS take precedence.
  - Required: OPENAI_API_KEY
  - Optional: OPENAI_BASE_URL (default: https://api.openai.com/v1)
              OPENAI_MODEL   (default: gpt-4o-mini)

Outputs machine-parseable JSON to stdout so the calling skill can drive the
confirmation UI and write the final frontmatter.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional


# ---------------------------------------------------------------------------
# Settings (constants; runtime state lives in ExcerptResult / args)
# ---------------------------------------------------------------------------

EXCERPT_MIN = 120
EXCERPT_MAX = 200
OPENING_PARAGRAPHS = 3
CLOSING_PARAGRAPHS = 2

SCRIPT_DIR = Path(__file__).resolve().parent
PROMPT_DIR = SCRIPT_DIR / "prompts"
SYSTEM_PROMPT_FILE = PROMPT_DIR / "excerpt_system.md"
USER_PROMPT_FILE = PROMPT_DIR / "excerpt_user.md"

MARKDOWN_EXCERPT_DELIMITER = "<!-- excerpt -->"
MDX_EXCERPT_DELIMITER = "{/* excerpt */}"

FORBIDDEN_PREFIXES = ("本文", "下面", "我们", "请看", "综上", "总之")

PROVIDER_NAME = "openai"
OPENAI_BASE_URL_DEFAULT = "https://api.openai.com/v1"
OPENAI_MODEL_DEFAULT = "gpt-4o-mini"


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class ExcerptResult:
    excerpt: str
    mode: str                      # "llm" | "fallback_delimiter" | "fallback_rule"
    provider: Optional[str] = None # provider name used, or None when fallback
    retries: int = 0               # how many LLM retries happened before success/fallback
    opening: str = ""              # extracted opening (for skill Step 4 preview)
    outline: str = ""              # extracted outline
    closing: str = ""              # extracted closing
    char_count: int = 0
    warning: Optional[str] = None


# ---------------------------------------------------------------------------
# .env loading (hand-rolled; no python-dotenv dependency)
# ---------------------------------------------------------------------------

def _parse_env_lines(text: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]
        if re.fullmatch(r"[A-Z_][A-Z0-9_]*", key):
            result[key] = value
    return result


def _find_project_root(cwd: Path) -> Optional[Path]:
    for directory in (cwd, *cwd.parents):
        if any((directory / marker).exists() for marker in (
            "astro.config.mjs",
            "astro.config.ts",
            "astro.config.js",
            ".git",
            "package.json",
        )):
            return directory
    return None


def load_dotenv() -> Path | None:
    """Load `.env` from project root (if found) then script dir.

    Shell-exported variables are never overwritten; `os.environ` is mutated
    so downstream `os.environ.get` reads behave consistently.
    Returns the last `.env` file loaded for transparency, or None.
    """
    cwd = Path.cwd()
    candidates: list[Path] = []
    project_root = _find_project_root(cwd)
    if project_root and project_root != SCRIPT_DIR:
        candidates.append(project_root / ".env")
    candidates.append(SCRIPT_DIR / ".env")

    last_loaded: Optional[Path] = None
    for env_file in candidates:
        if not env_file.is_file():
            continue
        for key, value in _parse_env_lines(env_file.read_text(encoding="utf-8")).items():
            if key not in os.environ:
                os.environ[key] = value
        last_loaded = env_file
    return last_loaded


# ---------------------------------------------------------------------------
# Phase 1: extract snippets from raw markdown
# ---------------------------------------------------------------------------

def strip_frontmatter(content: str) -> str:
    match = re.match(r"^---\s*\n[\s\S]*?\n---\s*\n?", content)
    return content[match.end():] if match else content


def light_clean(text: str) -> str:
    """Remove markdown syntax that should never reach the LLM prompt as-is."""
    text = re.sub(r"```[\s\S]*?```", "", text)
    text = re.sub(r"`[^`]*`", "", text)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"^>\s*\[!([^\]]+)\][^\n]*", "", text, flags=re.M | re.I)
    text = re.sub(r"^>\s?", "", text, flags=re.M)
    text = re.sub(r"^\s*[-*+]\s+", "", text, flags=re.M)
    text = re.sub(r"^\s*\d+\.\s+", "", text, flags=re.M)
    text = re.sub(r"^\s*\|.*\|\s*$", "", text, flags=re.M)
    text = re.sub(r"[*_~]{1,3}([^*_~]+)[*_~]{1,3}", r"\1", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.M)
    return text


_URL_RE = re.compile(r"^[a-z][a-z0-9+.-]*://", re.I)


def _looks_like_reference_list(block: str) -> bool:
    lines = [ln for ln in block.splitlines() if ln.strip()]
    if len(lines) < 2:
        return False
    if not all(re.match(r"^\s*([-*+]|\d+\.)\s+", ln) for ln in lines):
        return False
    return any(_URL_RE.search(ln) for ln in lines)


def split_paragraphs(body: str, *, skip_refs_tail: bool = False) -> list[str]:
    """Split markdown body into semantic paragraphs.

    When `skip_refs_tail=True`, drop the very last block if it looks like a
    references / bibliography list (bulleted lines containing URLs).
    Used by closing-paragraph extraction to avoid bibliography noise.
    """
    blocks = re.split(r"\n{2,}", body.strip())
    paras: list[str] = []
    for b in blocks:
        if re.match(r"^#{1,6}\s+", b.strip()):
            continue
        cleaned = light_clean(b).strip()
        if not cleaned or cleaned.startswith("```"):
            continue
        if len(cleaned.splitlines()) >= 3 and _looks_like_reference_list(cleaned):
            continue
        paras.append(cleaned)
    if skip_refs_tail and paras and _looks_like_reference_list(paras[-1]):
        paras.pop()
    return paras


def extract_outline(body: str) -> str:
    lines = []
    for raw in body.splitlines():
        m = re.match(r"^(#{2,3})\s+(.+?)\s*$", raw)
        if m:
            level, text = m.group(1), m.group(2).strip()
            indent = "  " if level == "###" else ""
            lines.append(f"{indent}- {light_clean(text)}")
    return "\n".join(lines)


def extract_snippets(raw_content: str) -> tuple[str, str, str]:
    """Return (opening, outline, closing)."""
    body = strip_frontmatter(raw_content)
    opening_paras = split_paragraphs(body, skip_refs_tail=False)
    closing_paras = split_paragraphs(body, skip_refs_tail=True)
    opening = "\n\n".join(opening_paras[:OPENING_PARAGRAPHS])
    closing = "\n\n".join(closing_paras[-CLOSING_PARAGRAPHS:]) if len(closing_paras) >= CLOSING_PARAGRAPHS else "\n\n".join(closing_paras)
    outline = extract_outline(body)
    return opening, outline, closing


# ---------------------------------------------------------------------------
# Phase 1b: rule-based fallback excerpt (mirrors content.config.ts)
# ---------------------------------------------------------------------------

def fallback_by_delimiter(body: str) -> Optional[str]:
    md_idx = body.find(MARKDOWN_EXCERPT_DELIMITER)
    mdx_idx = body.find(MDX_EXCERPT_DELIMITER)
    if md_idx == -1 and mdx_idx == -1:
        return None
    idx = md_idx if md_idx != -1 else mdx_idx
    above = light_clean(body[:idx]).strip()
    return above or None


def smart_truncate(plain: str, limit: int = EXCERPT_MAX) -> str:
    if len(plain) <= limit:
        return plain
    cut = limit
    punct_re = re.compile(r"[。！？!?；;.]\s*[^\s。！？!?；;.]*$")
    last_punct = punct_re.search(plain[:cut + 1])
    if last_punct and last_punct.start() > int(limit * 0.5):
        cut = last_punct.start() + 1
    else:
        last_space = plain.rfind(" ", 0, cut + 1)
        if last_space > int(limit * 0.6):
            cut = last_space
    return plain[:cut].rstrip() + "…"


def fallback_rule(raw_content: str) -> str:
    body = strip_frontmatter(raw_content)
    by_delim = fallback_by_delimiter(body)
    if by_delim:
        return by_delim
    body_no_headings = re.sub(r"(^|\n)#{1,6}\s+[^\n]*", "\n", body)
    plain = re.sub(r"\s+", " ", light_clean(body_no_headings)).strip()
    return smart_truncate(plain) if plain else ""


# ---------------------------------------------------------------------------
# Phase 2: OpenAI API dispatch
# ---------------------------------------------------------------------------

def resolve_openai_config() -> Optional[dict]:
    """Return OpenAI config dict, or None if the key is missing."""
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not key:
        return None
    base = (os.environ.get("OPENAI_BASE_URL") or OPENAI_BASE_URL_DEFAULT).rstrip("/")
    model = os.environ.get("OPENAI_MODEL") or OPENAI_MODEL_DEFAULT
    return {"name": PROVIDER_NAME, "key": key, "base_url": base, "model": model}


def _post_json(url: str, headers: dict, payload: dict, timeout: int = 60) -> dict:
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", **headers},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def call_openai(cfg: dict, system: str, user: str) -> str:
    url = f"{cfg['base_url']}/chat/completions"
    headers = {"Authorization": f"Bearer {cfg['key']}"}
    payload = {
        "model": cfg["model"],
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": 0.2,
    }
    data = _post_json(url, headers, payload)
    return data["choices"][0]["message"]["content"].strip()


# ---------------------------------------------------------------------------
# Phase 2b: validation + auto-retry wrapper
# ---------------------------------------------------------------------------

MARKDOWN_FORBIDDEN_RE = re.compile(r"(```|`|!\[[^\]]*\]|\[[^\]]*\]\(|<[^>]+>|^\s*[-*+]\s)")


def validate_excerpt(text: str) -> Optional[str]:
    """Return None when valid, else a human-readable error string."""
    if not text:
        return "empty output"
    stripped = text.strip()
    if len(stripped) < EXCERPT_MIN:
        return f"too short ({len(stripped)} < {EXCERPT_MIN})"
    if len(stripped) > EXCERPT_MAX:
        return f"too long ({len(stripped)} > {EXCERPT_MAX})"
    if MARKDOWN_FORBIDDEN_RE.search(stripped):
        return "contains markdown or HTML markers"
    for prefix in FORBIDDEN_PREFIXES:
        if stripped.startswith(prefix):
            return f"starts with forbidden prefix '{prefix}'"
    return None


def render_user_prompt(title: str, opening: str, outline: str, closing: str) -> str:
    tpl = USER_PROMPT_FILE.read_text(encoding="utf-8")
    return (tpl
            .replace("{{title}}", title)
            .replace("{{opening}}", opening)
            .replace("{{outline}}", outline)
            .replace("{{closing}}", closing))


# ---------------------------------------------------------------------------
# Top-level orchestration
# ---------------------------------------------------------------------------

def infer_title(raw_content: str, fallback: str) -> str:
    for line in raw_content.splitlines():
        m = re.match(r"^#\s+(.+?)\s*$", line)
        if m:
            return m.group(1).strip()
    return fallback


def generate(raw_content: str, source_path: Path, *, disable_llm: bool = False, max_retries: int = 2) -> ExcerptResult:
    opening, outline, closing = extract_snippets(raw_content)
    fallback_title = source_path.stem.replace("-", " ").replace("_", " ")
    title = infer_title(raw_content, fallback_title)

    delimiter_hit = fallback_by_delimiter(strip_frontmatter(raw_content))
    if delimiter_hit and EXCERPT_MIN <= len(delimiter_hit) <= EXCERPT_MAX:
        cleaned = delimiter_hit.strip()
        return ExcerptResult(
            excerpt=cleaned,
            mode="fallback_delimiter",
            provider=None,
            opening=opening,
            outline=outline,
            closing=closing,
            char_count=len(cleaned),
            warning=None if len(cleaned) >= EXCERPT_MIN else "delimiter excerpt below min length",
        )

    load_dotenv()
    provider = None if disable_llm else resolve_openai_config()

    if provider is None:
        rule_text = fallback_rule(raw_content) or ""
        return ExcerptResult(
            excerpt=rule_text,
            mode="fallback_rule",
            provider=None,
            opening=opening,
            outline=outline,
            closing=closing,
            char_count=len(rule_text),
            warning=(
                "LLM skipped: OPENAI_API_KEY is not set. Put it in a `.env` file "
                f"(project root or {SCRIPT_DIR}/) or export it as an env var."
            ),
        )

    system_prompt = SYSTEM_PROMPT_FILE.read_text(encoding="utf-8")
    user_prompt = render_user_prompt(title, opening, outline, closing)

    retries = 0
    last_err: Optional[str] = None
    while retries <= max_retries:
        try:
            text = call_openai(provider, system_prompt, user_prompt)
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, KeyError, ValueError) as exc:
            last_err = f"LLM call failed: {exc.__class__.__name__}: {exc}"
            break
        err = validate_excerpt(text)
        if err is None:
            return ExcerptResult(
                excerpt=text.strip(),
                mode="llm",
                provider=provider["name"],
                retries=retries,
                opening=opening,
                outline=outline,
                closing=closing,
                char_count=len(text.strip()),
            )
        last_err = err
        retries += 1
        user_prompt = (
            f"{user_prompt}\n\n"
            f"[Retry {retries}/{max_retries}] Previous output violated constraint: {err}. "
            "Re-generate strictly within 120-200 chars, pure text, no forbidden prefixes."
        )

    rule_text = fallback_rule(raw_content) or ""
    return ExcerptResult(
        excerpt=rule_text,
        mode="fallback_rule",
        provider=None,
        retries=retries,
        opening=opening,
        outline=outline,
        closing=closing,
        char_count=len(rule_text),
        warning=f"LLM path exhausted: {last_err}. Switched to rule-based fallback.",
    )


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def build_arg_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Generate Starlight blog frontmatter.excerpt via OpenAI or rule fallback.")
    p.add_argument("file", type=Path, help="Path to the markdown/mdx blog source.")
    p.add_argument("--json", action="store_true", help="Emit JSON result (default for skill consumption).")
    p.add_argument("--plain", action="store_true", help="Only print the excerpt string (piping).")
    p.add_argument("--dry-run-snippets", action="store_true",
                   help="Print opening/outline/closing only; no LLM call.")
    p.add_argument("--disable-llm", action="store_true",
                   help="Skip LLM entirely; only run rule fallback.")
    p.add_argument("--max-retries", type=int, default=2,
                   help="Maximum LLM retries on invalid output (default: 2).")
    return p


def main(argv: Optional[list[str]] = None) -> int:
    args = build_arg_parser().parse_args(argv)
    src: Path = args.file
    if not src.is_file():
        print(f"error: file not found: {src}", file=sys.stderr)
        return 2

    raw = src.read_text(encoding="utf-8")

    if args.dry_run_snippets:
        opening, outline, closing = extract_snippets(raw)
        if args.json:
            print(json.dumps({"opening": opening, "outline": outline, "closing": closing}, ensure_ascii=False, indent=2))
        else:
            print("=== OPENING ==="); print(opening)
            print("\n=== OUTLINE ==="); print(outline)
            print("\n=== CLOSING ==="); print(closing)
        return 0

    result = generate(raw, src, disable_llm=args.disable_llm, max_retries=args.max_retries)

    if args.plain:
        print(result.excerpt)
        return 0

    payload = asdict(result)
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
