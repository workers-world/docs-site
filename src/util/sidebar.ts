import type { SectionTitleResolver } from "@cloudflare/nimbus-docs";

/** Matches `labelMap` in astro.config.mjs — sidebar section display titles. */
const SECTION_LABELS: Record<string, string> = {
	"getting-started": "项目介绍",
	architecture: "架构",
	workers: "Worker总览",
	operations: "CI/CD",
	"develop-specifications": "开发规范",
	"develop-logs": "开发日志",
	language: "Language",
	cloudflare: "Cloudflare",
	references: "引用",
};

export const sectionTitleResolver: SectionTitleResolver = async ({ sectionSlug }) => {
	const label = SECTION_LABELS[sectionSlug];
	return label ? { rail: label } : undefined;
};
