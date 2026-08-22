# workers-world/docs

workers-world 组织内部文档站（Astro + Starlight），通过 Cloudflare Pages 构建部署。

- **GitHub 仓库**：`workers-world/docs`（本目录为本地工作副本，位于 `cloudflare_work/docs-site/`）
- **权威开发文档**：`cloudflare_work/docs/`（meta 仓，本站为精选副本）

## 本地开发

```bash
npm ci
npm run dev      # http://localhost:4321
npm run build
```

## 同步 meta 文档

从 meta 仓 `docs/` 重新生成精选页面：

```bash
./scripts/migrate-docs.sh
```

## Cloudflare Pages

| 字段 | 值 |
| --- | --- |
| Framework | Astro |
| Build command | `npm run build` |
| Output | `dist` |
| Production branch | `master` |

上线前请配置 Cloudflare Access（本 README 不含策略细节）。

## 分支

- `master` — production
- `dev_00_01_00` — 开发轨（按组织 dev 分支规范递增）
