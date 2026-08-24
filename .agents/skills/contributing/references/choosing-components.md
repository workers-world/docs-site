# Choosing components（Nimbus）

组件注册于 [`src/mdx-components.ts`](../../../src/mdx-components.ts)，MDX 中可直接使用（无需 import）。

| 场景 | 组件 |
|------|------|
| 编号步骤 / runbook | `<Steps>` + `<Step>` |
| 多方案对照 | `<Tabs>` + `<TabItem label="…">` |
| 提示/警告 | `<Aside type="note\|tip\|caution\|danger">` |
| 入口卡片 | `<CardGrid>` + `<Card title="…" href="…">` |

完整 Nimbus registry（推荐 cnpm）：

```bash
cnpm exec -- nimbus-docs add steps
cnpm exec -- nimbus-docs add tabs
```

会把组件文件拷入 `src/components/`，再更新 `mdx-components.ts` 导出。
