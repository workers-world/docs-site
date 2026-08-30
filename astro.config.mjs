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
		"0_getting-started": "开始入门",
		"1_architecture": "架构",
		"2_develop-specifications": "开发规范",
		"3_ai": "AI",
		"95_workers": "Workers",
		"96_operations": "CI/CD",
		"97_cloudflare": "Cloudflare相关",
		"98_references": "引用",
		"99_develop-logs": "开发日志",
		"992_language": "开发语言",
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
	title: "95_workers-world",
	description: "95_workers-world 组织文档",
	locale: "zh-CN",
	github: "https://github.com/workers-world/docs-site",
	editPattern:
		"https://github.com/workers-world/docs-site/edit/main/{path}",
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
