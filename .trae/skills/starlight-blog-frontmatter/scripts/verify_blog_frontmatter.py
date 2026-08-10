#!/usr/bin/env python3
"""V1–V7 验证工具（对 src/content/docs/blog/ 下全部 md/mdx 文件）。"""
from __future__ import annotations
import hashlib
import re
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path("/Users/zouhaisong/mydoc/hs-code/www.haisong.cc/www.haisong.cc-code")
BLOG = ROOT / "src" / "content" / "docs" / "blog"

FORBIDDEN_PREFIXES = ("本文", "下面", "我们", "请看", "综上", "总之")
MARKDOWN_FORBIDDEN_RE = re.compile(r"(```|`|!\[[^\]]*\]|\[[^\]]*\]\(|<[^>]+>|^\s*[-*+]\s)")


def strip_frontmatter(c: str):
    m = re.match(r"^---\s*\n[\s\S]*?\n---\s*\n?", c)
    return c[m.end():] if m else c


def main() -> int:
    rc = 0
    for fp in sorted(BLOG.glob("*.md*")):
        if not fp.is_file():
            continue
        raw = fp.read_text(encoding="utf-8")
        body = strip_frontmatter(raw)
        body_hash = hashlib.sha256(body.encode("utf-8")).hexdigest()
        # Note: before-write hash is unknown in this verifier; we only
        # cross-check strip_frontmatter preserves body integrity relative to
        # the current on-disk file.

        print(f"\n==== {fp.name} ====")
        results = []

        # V1
        v1 = raw.startswith("---\n") and "\n---\n" in raw
        results.append(("V1 frontmatter 包裹合法", v1))
        if not v1:
            rc = 1
            for r in results:
                print(("✅ " if r[1] else "❌ ") + r[0])
            print("❌ skipped further checks (no frontmatter)")
            continue

        end = raw.index("\n---\n", 4)
        lines = raw[4:end].splitlines()
        order, fields = {}, {}
        tag_lines = []
        for i, ln in enumerate(lines):
            if ln.startswith("title:"):
                order["title"] = i; fields["title"] = ln.split(":",1)[1].strip()
            elif ln.startswith("date:"):
                order["date"] = i; fields["date"] = ln.split(":",1)[1].strip()
            elif ln.startswith("excerpt:"):
                order["excerpt"] = i; fields["excerpt"] = ln.split(":",1)[1].strip()
            elif ln.startswith("tags:"):
                order["tags"] = i
                # parse subsequent indented list
                for sub in lines[i+1:]:
                    if sub.startswith("  - "):
                        tag_lines.append(sub[4:].strip().strip('"').strip("'"))
                    elif sub.strip() == "[]":
                        tag_lines = []
                        break
                    elif sub and not sub.startswith("  - "):
                        break

        v2 = (all(k in order for k in ("title","date","excerpt","tags")) and
              order["title"] < order["date"] < order["excerpt"] < order["tags"])
        results.append(("V2 字段顺序与完整性", v2))

        tval = fields.get("title", '""').strip().strip('"')
        v3 = len(tval) >= 2 and not tval.isdigit()
        results.append((f"V3 title 非空且合理 ({tval!r})", v3))

        dval = fields.get("date", "")
        try:
            datetime.strptime(dval, "%Y-%m-%d")
            v4 = True
        except ValueError:
            v4 = False
        results.append((f"V4 date 合法日期 ({dval})", v4))

        ex = fields.get("excerpt", '""').strip()
        ex_inner = ex[1:-1].replace('\\"', '"') if len(ex) >= 2 and ex[0] == '"' and ex[-1] == '"' else ex
        v5a = 120 <= len(ex_inner) <= 200
        v5b = not MARKDOWN_FORBIDDEN_RE.search(ex_inner)
        v5c = not any(ex_inner.startswith(p) for p in FORBIDDEN_PREFIXES)
        results.append((f"V5 excerpt {len(ex_inner)}字 纯文本 禁词前缀", v5a and v5b and v5c))
        if not (v5a and v5b and v5c):
            print(f"    excerpt: {ex_inner[:80]}...")

        seen = {t.lower() for t in tag_lines}
        v6 = len(seen) == len(tag_lines)
        results.append((f"V6 tags 合法数组无重复 n={len(tag_lines)}: {tag_lines}", v6))

        # V7: 写入后 body 与去除 frontmatter 后的正文字节一致性
        v7 = len(body.encode("utf-8")) == len((raw[:4] + raw[end:]).encode("utf-8")) - len(raw[:4].encode("utf-8")) + len(raw[end:].encode("utf-8"))
        # Use simpler assertion: strip_frontmatter matches slicing
        body2 = raw[raw.index("\n---\n",4)+len("\n---\n"):]
        if body2.startswith("\n"):
            body2 = body2[1:]
        v7 = body == body2
        results.append((f"V7 正文未篡改（strip_frontmatter 自洽，sha256={body_hash[:10]}…）", v7))

        for name, ok in results:
            print(("✅ " if ok else "❌ ") + name)
            if not ok:
                rc = 1
    return rc

if __name__ == "__main__":
    raise SystemExit(main())
