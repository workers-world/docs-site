# Content types（简化）

| 类型 | 用途 | 骨架 |
|------|------|------|
| overview | 分区/概念总览 | 一句话目的 → 范围 → 链到 how-to / reference |
| how-to | 操作步骤 | 前置条件 → Steps → 验证 |
| reference | 查阅表/约定 | 表格或列表为主，少叙事 |

不必使用 Cloudflare 的 `pcx_content_type` 全枚举；需要时可在 frontmatter 加自由字段 `content_type: overview|how-to|reference`（schema 已 `strictFrontmatter: false`）。
