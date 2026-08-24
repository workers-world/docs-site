# Writing docs

1. Frontmatter 至少含 `title`；建议有 `description`（一句，用于搜索与 llms.txt）。
2. 正文不要再重复 frontmatter `title` 的一级 `#`（页面布局已渲染标题）；若保留 `#`，确保与 title 一致。
3. 从 meta 同步的页在文首加权威指针：`> 权威副本：meta 仓 \`cloudflare_work/docs/…\``。
4. 本站内链用站点相对路径（如 `/architecture/edge-gateway/`）；meta 专用文件不要写成相对链接，改为「meta 仓路径」文字说明。
5. 图片放 `src/assets/` 或与内容同目录；优先 WebP/PNG。
6. 改完跑 `npm run check && npm run build`。
