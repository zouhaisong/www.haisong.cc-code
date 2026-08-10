import json
from pathlib import Path

a = json.load(open("/tmp/a.json"))
b = json.load(open("/tmp/b.json"))
fp = Path("/Users/zouhaisong/mydoc/hs-code/www.haisong.cc/www.haisong.cc-code/src/content/docs/blog/ai-agent-loop-engineering.md")
bytes_after = fp.stat().st_size

print("BYTES_AFTER:", bytes_after)
print("DRY outline lines:", a["outline"].count(chr(10)) + 1)
print("DRY closing has URL bullet:", any("://" in ln for ln in a["closing"].splitlines()))
print("DRY closing lines:", len(a["closing"].splitlines()))
print("FALLBACK mode:", b["mode"], "char_count:", b["char_count"], "==200?", b["char_count"] == 200)
print("FALLBACK last 16 chars:", repr(b["excerpt"][-16:]))
print("FALLBACK provider:", b["provider"])
print("FALLBACK warning set?", bool(b["warning"]))
print("WARNING snippet:", b["warning"][:80] if b["warning"] else None)
