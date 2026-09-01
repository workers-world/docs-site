# 将 meta 仓 docs 迁移为 Starlight MDX（加 frontmatter + 权威指针）

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
META_DOCS="$ROOT/../docs"
OUT="$ROOT/src/content/docs"

migrate() {
  local src_rel="$1"
  local dest_subdir="$2"
  local dest_name="$3"
  local title="$4"
  local src="$META_DOCS/$src_rel"
  local dest="$OUT/$dest_subdir/$dest_name"

  if [[ ! -f "$src" ]]; then
    echo "SKIP missing: $src" >&2
    return 1
  fi

  mkdir -p "$(dirname "$dest")"
  {
    echo "---"
    echo "title: $title"
    echo "---"
    echo ""
    echo "> 权威副本：\`cloudflare_work/docs/$src_rel\`"
    echo ""
    # 去掉原文件第一个 # 标题行（Starlight 用 frontmatter title）
    awk 'BEGIN{skip=0} /^# / && skip==0 {skip=1; next} {print}' "$src"
  } > "$dest"
  python3 "$(dirname "$0")/rewrite-migrated-links.py" "$dest"
  echo "OK $dest"
}

migrate "edge-gateway-routes.md" architecture edge-gateway.mdx "Edge Gateway 路由"
migrate "invest-rss-architecture.md" architecture invest-rss.mdx "投资 RSS 架构"
migrate "analysis-engine-architecture.md" architecture analysis-engine.mdx "分析引擎架构"
migrate "pipeline-tracker.md" architecture pipeline-tracker.mdx "Pipeline 跟踪"
migrate "release-fallback.md" operations release-fallback.mdx "应急发布回退"
migrate "quality-ops.md" operations quality-ops.mdx "质量运维"
migrate "git-remote-protocol.md" operations git-remote.mdx "Git Remote 切换"
migrate "mcp-registry-integration.md" architecture mcp-registry.mdx "MCP Registry 对接"
