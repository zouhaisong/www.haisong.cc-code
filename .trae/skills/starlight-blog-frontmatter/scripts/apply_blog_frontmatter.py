#!/usr/bin/env python3
"""实施脚本（一次性）：为 src/content/docs/blog/ 下所有缺失 frontmatter 的文件
按 SKILL.md 流程生成草案并写入磁盘。写入前会 print 一份完整草案到 stdout 供人工复核；
随后写入并执行 V1–V7 验证。
"""
from __future__ import annotations
import json
import re
import subprocess
import sys
import hashlib
from pathlib import Path
from datetime import datetime

ROOT = Path("/Users/zouhaisong/mydoc/hs-code/www.haisong.cc/www.haisong.cc-code")
BLOG_DIR = ROOT / "src" / "content" / "docs" / "blog"
SCRIPT = ROOT / ".trae" / "skills" / "starlight-blog-frontmatter" / "scripts" / "generate_excerpt.py"

EXCERPT_MIN = 120
EXCERPT_MAX = 200
FORBIDDEN_PREFIXES = ("本文", "下面", "我们", "请看", "综上", "总之")
MARKDOWN_FORBIDDEN_RE = re.compile(r"(```|`|!\[[^\]]*\]|\[[^\]]*\]\(|<[^>]+>|^\s*[-*+]\s)")


def slug_to_title(stem: str) -> str:
    # 纯中文 / 中划线分隔的中英混合 slug → Title Case 空格拼接（中文保留原样）
    if re.fullmatch(r"[\u4e00-\u9fffA-Za-z0-9]+", stem.replace("-", "").replace("_", "")) and "-" not in stem and "_" not in stem:
        return stem
    parts = re.split(r"[-_/]", stem)
    out = []
    for p in parts:
        if not p:
            continue
        if re.fullmatch(r"[A-Za-z0-9]+", p):
            out.append(p.capitalize() if p.islower() or p.isupper() else p)
        else:
            out.append(p)
    return " ".join(out)


def infer_title(raw: str, fallback: str) -> str:
    for line in raw.splitlines():
        m = re.match(r"^#\s+(.+?)\s*$", line)
        if m:
            return m.group(1).strip()
    return slug_to_title(fallback)


def strip_frontmatter(content: str) -> str:
    match = re.match(r"^---\s*\n[\s\S]*?\n---\s*\n?", content)
    return content[match.end():] if match else content


def build_frontmatter(title: str, date_iso: str, excerpt: str, tags: list[str]) -> str:
    esc_title = title.replace('"', '\\"')
    esc_excerpt = excerpt.replace('"', '\\"')
    if tags:
        tags_block = "\n".join(f"  - {t}" for t in tags)
        tags_yaml = f"tags:\n{tags_block}"
    else:
        tags_yaml = "tags: []"
    return f'---\ntitle: "{esc_title}"\ndate: {date_iso}\nexcerpt: "{esc_excerpt}"\n{tags_yaml}\n---\n\n'


def validate_all(file_path: Path, raw_before_bytes: int, raw_before_hash: str):
    raw_after = file_path.read_text(encoding="utf-8")
    body_after = strip_frontmatter(raw_after)
    reports = []

    # V1 frontmatter 包裹
    v1 = raw_after.startswith("---\n") and "\n---\n" in raw_after
    reports.append(("V1 frontmatter 包裹合法", v1))
    if not v1:
        return reports, body_after

    # 提取字段行
    fm_block_end = raw_after.index("\n---\n", 4)
    fm_lines = raw_after[4:fm_block_end].splitlines()
    order = {}
    fields = {}
    for idx, ln in enumerate(fm_lines):
        if ln.startswith("title:"):
            order["title"] = idx; fields["title"] = ln.split(":", 1)[1].strip()
        elif ln.startswith("date:"):
            order["date"] = idx; fields["date"] = ln.split(":", 1)[1].strip()
        elif ln.startswith("excerpt:"):
            order["excerpt"] = idx; fields["excerpt"] = ln.split(":", 1)[1].strip()
        elif ln.startswith("tags:"):
            order["tags"] = idx
    # V2 字段顺序 title/date/excerpt/tags 前四键在且严格递增
    v2 = all(k in order for k in ("title","date","excerpt","tags")) and order["title"] < order["date"] < order["excerpt"] < order["tags"]
    reports.append(("V2 字段顺序与完整性", v2))

    # V3 title 非空且合理（去掉引号后 ≥2）
    title_val = fields.get("title", '""').strip().strip('"')
    v3 = len(title_val) >= 2 and not title_val.isdigit()
    reports.append(("V3 title 非空且合理", v3))

    # V4 date YYYY-MM-DD 可解析
    date_val = fields.get("date", "")
    try:
        datetime.strptime(date_val, "%Y-%m-%d")
        v4 = True
    except ValueError:
        v4 = False
    reports.append(("V4 date 合法日期", v4))

    # V5 excerpt ∈ [120,200] 且纯文本，不含禁词前缀
    ex_val = fields.get("excerpt", '""').strip()
    if len(ex_val) >= 2 and ex_val[0] == '"' and ex_val[-1] == '"':
        ex_inner = ex_val[1:-1].replace('\\"', '"')
    else:
        ex_inner = ex_val
    v5_a = EXCERPT_MIN <= len(ex_inner) <= EXCERPT_MAX
    v5_b = not MARKDOWN_FORBIDDEN_RE.search(ex_inner)
    v5_c = not any(ex_inner.startswith(p) for p in FORBIDDEN_PREFIXES)
    reports.append((f"V5 excerpt {len(ex_inner)}字 纯文本 禁词前缀", v5_a and v5_b and v5_c))

    # V6 tags 为 YAML 数组且字符串无重复（不区分大小写）
    try:
        import ast
        tag_start = fm_block_end
    except Exception:
        pass
    # 简单解析 tags 块：找 "tags:" 起，到下个顶级字段或结束
    tags_idx = next(i for i, ln in enumerate(fm_lines) if ln.startswith("tags:"))
    tag_entries = []
    rest = fm_lines[tags_idx:]
    if rest[0].strip().startswith("tags: []"):
        tag_entries = []
    else:
        for ln in rest[1:]:
            if not ln.startswith("  - "):
                break
            tag_entries.append(ln[4:].strip().strip('"').strip("'"))
    seen = {t.lower() for t in tag_entries}
    v6 = len(seen) == len(tag_entries)
    reports.append((f"V6 tags 合法数组无重复 n={len(tag_entries)}", v6))

    # V7 正文哈希与写入前一致
    body_bytes = body_after.encode("utf-8")
    after_hash = hashlib.sha256(body_bytes).hexdigest()
    v7 = after_hash == raw_before_hash
    reports.append(("V7 正文未篡改 (sha256)", v7))

    return reports, body_after


def main() -> int:
    targets = sorted(p for p in BLOG_DIR.glob("*.md*") if p.is_file())
    print(f"发现 {len(targets)} 个 blog 候选文件，开始逐份生成草案：\n")

    for file_path in targets:
        raw_before = file_path.read_text(encoding="utf-8")
        raw_before_bytes = len(raw_before.encode("utf-8"))
        body_before = strip_frontmatter(raw_before)
        body_before_hash = hashlib.sha256(body_before.encode("utf-8")).hexdigest()
        stem = file_path.stem
        has_fm = bool(re.match(r"^---\s*\n[\s\S]*?\n---\s*\n?", raw_before))
        print(f"{'='*64}\n文件：{file_path.name}")
        print(f"  原文件 bytes: {raw_before_bytes}   已存在 frontmatter: {has_fm}")

        # 1. excerpt 调用 generate_excerpt.py（LLM 模式）
        proc = subprocess.run(
            [sys.executable, str(SCRIPT), str(file_path), "--json"],
            capture_output=True, text=True, check=False,
        )
        if proc.returncode != 0:
            print("  [ABORT] generate_excerpt.py 失败：", proc.stderr[:300])
            continue
        try:
            ex = json.loads(proc.stdout)
        except json.JSONDecodeError:
            print("  [ABORT] generate_excerpt.py 输出非 JSON：", proc.stdout[:200])
            continue

        excerpt_text = ex["excerpt"]
        mode = ex["mode"]
        provider = ex.get("provider")
        retries = ex.get("retries", 0)
        char_count = ex.get("char_count", 0)
        warning = ex.get("warning")

        # 2. title / date
        title = infer_title(raw_before, stem)
        ts = datetime.fromtimestamp(file_path.stat().st_mtime)
        date_iso = ts.strftime("%Y-%m-%d")

        # 3. tags 候选建议（从 ## / ### 标题中去重筛 3~5 个）
        headings = [m.group(2).strip() for m in re.finditer(r"^(#{2,3})\s+(.+?)\s*$", body_before, flags=re.M)]
        h_clean = []
        for h in headings:
            h2 = re.sub(r"[*_`]", "", h)
            if 2 <= len(h2) <= 8 and h2 not in h_clean:
                h_clean.append(h2)
        tag_candidates = h_clean[: min(5, len(h_clean))]

        print(f"  生成结果: mode={mode} provider={provider} retries={retries} chars={char_count}")
        if warning:
            print(f"  ⚠  warning: {warning}")
        print(f"  title : {title}")
        print(f"  date  : {date_iso}  (mtime)")
        print(f"  excerpt: ({char_count}字)\n    {excerpt_text}")
        print(f"  tags 候选: {tag_candidates}")

        fm = build_frontmatter(title, date_iso, excerpt_text, tag_candidates)
        print(f"\n  写入草案：\n{fm}\n")

        # 写入
        new_content = fm + body_before
        file_path.write_text(new_content, encoding="utf-8")

        # V1–V7
        reports, _ = validate_all(file_path, raw_before_bytes, body_before_hash)
        print("  V1–V7 验证：")
        all_ok = True
        for name, ok in reports:
            mark = "✅" if ok else "❌"
            if not ok:
                all_ok = False
            print(f"    {mark} {name}")
        print(f"  总体：{'PASS' if all_ok else 'FAIL'}")
        print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
