#!/usr/bin/env python3
"""Rewrite meta-repo relative links in migrated docs-site MDX for offline link check."""

from __future__ import annotations

import re
import sys
from pathlib import Path

# meta docs/*.md basename -> docs-site URL path (trailing slash)
SITE_PATH_BY_META_DOC: dict[str, str] = {
    "edge-gateway-routes.md": "/1_architecture/edge-gateway/",
    "invest-rss-architecture.md": "/1_architecture/invest-rss/",
    "analysis-engine-architecture.md": "/1_architecture/analysis-engine/",
    "pipeline-tracker.md": "/1_architecture/pipeline-tracker/",
    "release-fallback.md": "/96_operations/release-fallback/",
    "quality-ops.md": "/96_operations/quality-ops/",
    "git-remote-protocol.md": "/96_operations/git-remote/",
    "mcp-registry-integration.md": "/1_architecture/mcp-registry/",
    "invest-rss-architecture": "/1_architecture/invest-rss/",
    "analysis-engine-architecture": "/1_architecture/analysis-engine/",
}

LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


def resolve_meta_path(target: str) -> str | None:
    """Map a relative link target from meta docs/ to cloudflare_work/..."""
    if target.startswith(("http://", "https://", "mailto:", "#", "/")):
        return None

    basename = Path(target).name
    if basename in SITE_PATH_BY_META_DOC:
        return None  # handled as site path, not code path

    if target.startswith("../"):
        return f"cloudflare_work/{target[3:]}"

    # ./foo or foo/bar -> cloudflare_work/docs/foo
    if target.startswith("./"):
        return f"cloudflare_work/docs/{target[2:]}"

    if "/" not in target and not target.startswith("."):
        # requirement/foo.md at docs root
        return f"cloudflare_work/docs/{target}"

    if not target.startswith("."):
        return f"cloudflare_work/docs/{target}"

    return None


def site_path_for_target(target: str) -> str | None:
    basename = Path(target).name
    stem = Path(target).stem
    if basename in SITE_PATH_BY_META_DOC:
        return SITE_PATH_BY_META_DOC[basename]
    if stem in SITE_PATH_BY_META_DOC:
        return SITE_PATH_BY_META_DOC[stem]
    return None


def rewrite_link(match: re.Match[str]) -> str:
    label, target = match.group(1), match.group(2).strip()
    if "%" in target:
        # leave URL-encoded paths to manual review
        pass

    site = site_path_for_target(target)
    if site:
        return f"[{label}]({site})"

    meta = resolve_meta_path(target)
    if meta:
        return f"`{meta}`"

    return match.group(0)


def rewrite_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    updated = LINK_RE.sub(rewrite_link, text)
    if updated != text:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("usage: rewrite-migrated-links.py <file.mdx> ...", file=sys.stderr)
        return 2

    changed = 0
    for arg in argv[1:]:
        path = Path(arg)
        if not path.is_file():
            print(f"SKIP missing: {path}", file=sys.stderr)
            continue
        if rewrite_file(path):
            changed += 1
            print(f"OK {path}")
        else:
            print(f"UNCHANGED {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
