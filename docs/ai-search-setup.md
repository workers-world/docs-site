# CF AI Search（文档语料）

docs-site build 产出 MDX + `DOC_MAP.json`，经 `npm run sync:corpus` 写入 R2。**AI Search 数据源选 R2**，不要用 website crawl（WAF 会拦）。

## 1. R2 bucket

建议桶名：`workers-world-doc-corpus`（或 Secrets `R2_DOC_CORPUS_BUCKET`）。

前缀：`docs-site/`（content/、DOC_MAP.json、llms.txt）。

## 2. CI Secrets（docs 仓）

| Secret | 说明 |
|--------|------|
| `R2_ACCOUNT_ID` | CF Account id |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 API token |
| `R2_DOC_CORPUS_BUCKET` | 可选，默认 `workers-world-doc-corpus` |

无凭证时 `sync:corpus` dry-run 退出 0。

## 3. AI Search 实例

Dashboard → AI Search → Create：

- Data source: **R2** → 上桶 / 前缀
- Hybrid search: on
- Public endpoint + MCP：**必须**挂自定义域 + **Access**（私有文档禁止裸公网 MCP）

记下：

- `DOC_SEARCH_BASE` — REST 搜索基址（如 `https://docs-search.example.search.ai.cloudflare.com`）
- `DOC_SEARCH_MCP_URL` — `https://…/mcp`（写入本机 `.cursor/mcp.json` 环境变量占位）

## 4. Agent 使用

```bash
ww docs map --json
ww docs ask "edge gateway" --json
ww docs search "SVC_SCH1" --json
```

有 `DOC_SEARCH_BASE` 时 search 会附带远端结果。
