---
name: contributing
description: Use when writing or editing pages in 95_workers-world/docs (docs-site) — frontmatter, Nimbus components, content types, or PR review.
---

# Contributing to workers-world docs

单点入口：按任务读下方 reference，勿臆造约定。

## Ground rules

- **本站为私有对内文档。** 仍勿写入生产密钥、Token、内网凭据明文。
- **权威副本在 meta 仓 `cloudflare_work/docs/`。** 大改先在 meta 完成，再同步本站（见 `scripts/migrate-docs.sh`）。
- **框架是 `@cloudflare/nimbus-docs`（非 Starlight）。** 组件用仓库内 `src/components/ui/*`；完整 registry 可用 `cnpm dlx @cloudflare/nimbus-docs add <slug>`。
- **不要自动 commit/push**，改完后询问用户。

## Task index

| 任务 | 阅读 |
|------|------|
| 写/改文档页 | `references/writing-docs.md` |
| 选内容类型 | `references/content-types.md` |
| 选组件 | `references/choosing-components.md` |
| PR 自检 | `references/reviewing-docs.md` |

## Validate

```bash
cnpm install   # 或 npm ci
npm run check
npm run build
npm run format
```
