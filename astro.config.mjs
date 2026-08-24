import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import nimbus, {
	defineConfig as defineNimbusConfig,
} from "@cloudflare/nimbus-docs";

/** One sidebar section per top-level content directory (Nimbus autogen). */
async function autogenSections() {
	const dirs = await readdir("./src/content/docs/", { withFileTypes: true });
	const labelMap = {
		"getting-started": "项目介绍",
		architecture: "架构",
		workers: "Worker总览",
		operations: "CI/CD",
		"develop-specifications": "开发规范",
		"develop-logs": "开发日志",
		language: "Language",
		cloudflare: "Cloudflare",
		references: "引用",
		"ai": "AI",
	};
	return dirs
		.filter((entry) => entry.isDirectory())
		.map((entry) => ({
			label: labelMap[entry.name] ?? entry.name,
			items: [{ autogenerate: { directory: entry.name, collapsed: true } }],
		}));
}

const sidebarItems = await autogenSections();

const nimbusConfig = defineNimbusConfig({
	site: "https://docs.pages.dev",
	title: "workers-world",
	description: "workers-world 组织内部文档",
	locale: "zh-CN",
	github: "https://github.com/workers-world/docs",
	editPattern:
		"https://github.com/workers-world/docs/edit/main/{path}",
	search: { provider: "pagefind" },
	sidebar: {
		items: sidebarItems,
		overviewLabel: "概览",
		indexDisplay: "overview-leaf",
		scope: "section",
		defaultCollapsed: true,
	},
});

const markdown = {
	syntaxHighlight: {
		type: "shiki",
		excludeLangs: ["math", "mermaid"],
	},
};

export default defineConfig({
	site: nimbusConfig.site,
	devToolbar: { enabled: false },
	markdown,
	integrations: [
		react(),
		icon({ include: { ph: ["*"] } }),
		nimbus(nimbusConfig, {
			mdx: { optimize: true },
			validateMdx: false,
		}),
	],
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
			},
		},
	},
});
