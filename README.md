# workers-world/docs

workers-world 组织内部文档站（**Astro 7 + `@cloudflare/nimbus-docs`**），通过 Cloudflare Builds / Pages 部署。

- **GitHub 仓库**：`workers-world/docs`（本目录为本地工作副本，位于 `cloudflare_work/docs-site/`）
- **权威正文**：本仓 `src/content/docs/**`（跨 Worker 叙事只在这里改）。meta 仓 `cloudflare_work/docs/` 已冻结，勿双写。

## 本地开发

推荐用 **cnpm**（国内镜像）：

```bash
cnpm install          # 或 npm ci
npm run doc-map       # 生成 public/DOC_MAP.json（Agent GPS）
npm run dev           # http://localhost:4321
npm run build
npm run check
npm run format
```

Node ≥ 22.12（见 `.nvmrc`）。

## Agent GPS / 检索

| 制品 | 说明 |
| --- | --- |
| `public/DOC_MAP.json` / build 后 `dist/DOC_MAP.json` | 章节 `id` / `covers` / `claims` 正排+倒排 |
| `/llms.txt` | 页面清单 |
| Pagefind | 站内全文搜索 |
| R2 corpus + CF AI Search | `npm run sync:corpus`（需 R2 凭证）；实例数据源选 R2，**勿** website crawl（WAF） |

精选架构/运维页须写 frontmatter：`id`、`covers`、`claims`（见 `scripts/build-doc-map.mjs`）。

## 框架说明

- 文档框架：**Nimbus**（`@cloudflare/nimbus-docs`），用 **cnpm** 安装
- 组件：`cnpm exec -- nimbus-docs add <slug>`（已装 aside/card/steps/tabs/sidebar/search 等）
- 记录文件：[`nimbus.json`](nimbus.json)
- MDX 映射：[`src/components.ts`](src/components.ts) / [`src/mdx-components.ts`](src/mdx-components.ts)
- Agent 贡献技能：`.agents/skills/contributing/`

```bash
cnpm install
cnpm exec -- nimbus-docs list
cnpm exec -- nimbus-docs add tabs --yes
cnpm exec -- nimbus-docs check
```

## Cloudflare 部署

纯静态输出（`dist/`）+ [`wrangler.toml`](wrangler.toml) assets。**不要**加 `@astrojs/cloudflare` 适配器。生产 deploy 由维护者执行（Agent 不代跑 `wrangler deploy`）。

| 字段 | 值 |
| --- | --- |
| Build command | `npm ci && npm run build`（须产出 `dist/`；`dist` 在 gitignore） |
| Build output directory | `dist` |
| Deploy command | `npm run deploy:cf`（**单行**；勿用 `\` 换行）或留空（Pages Git） |
| Production branch | `master` |

CI 在 build 后可选跑 `npm run sync:corpus`（Secrets：`R2_ACCOUNT_ID`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_DOC_CORPUS_BUCKET`）。

## 分支

- `master` — production
- `dev_00_02_00` — 开发轨（按组织 `dev_XX_YY_ZZ` 规范递增）
