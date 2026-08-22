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

迁移脚本输出为 `.mdx`；见下文格式说明。

## `.md` 与 `.mdx`

本站内容文件使用 **`.mdx`**（Markdown + JSX）。与纯 **`.md`** 的对比如下：

| | `.md` | `.mdx` |
| --- | --- | --- |
| 语法 | 标准 Markdown（标题、列表、链接、代码块、表格等） | 兼容 Markdown，并可嵌入 JSX 组件 |
| Starlight | 支持 | 支持（本站默认） |
| 组件 | 不支持 `import` 与自定义 UI | 可 `import` 并使用 Starlight 组件，如 `<Card>`、`<Tabs>` |

示例（仅 `.mdx` 可做）：

```mdx
import { Card } from '@astrojs/starlight/components';

普通段落。

<Card title="提示">组件内容</Card>
```

当前从 meta 仓迁入的文档**仅为普通 Markdown**，用 `.md` 也能构建；统一用 `.mdx` 是为了与 Starlight/Astro 内容集合一致，且日后加组件无需改后缀。

## Cloudflare Pages

| 字段 | 值 |
| --- | --- |
| Framework | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| **Deploy command** | **留空**（不要填 `wrangler deploy`） |
| Production branch | `master` |

> **常见部署错误**：若 Deploy command 为 `npx wrangler deploy`，构建会成功但部署失败（`Missing entry-point to Worker script`）。本站是**静态 Pages**，不是 Worker；Git 集成会在 build 后自动上传 `dist/`，无需 deploy 步骤。

上线前请配置 Cloudflare Access（本 README 不含策略细节）。

## 分支

- `master` — production
- `dev_00_01_00` — 开发轨（按组织 dev 分支规范递增）
