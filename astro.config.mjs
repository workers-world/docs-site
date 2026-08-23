import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://docs.pages.dev',
	integrations: [
		starlight({
			title: 'workers-world',
			defaultLocale: 'root',
			locales: {
				root: {
					label: '简体中文',
					lang: 'zh-CN',
				},
			},
			sidebar: [
				{
					label: '项目介绍',
					autogenerate: { directory: 'getting-started' },
				},
				{
					label: '架构',
					autogenerate: { directory: 'architecture' },
				},
				{
					label: 'Worker总览',
					autogenerate: { directory: 'workers' },
				},
				{
					label: 'CI/CD',
					autogenerate: { directory: 'operations' },
				},
				{
					label: '开发规范',
					autogenerate: { directory: 'develop-specifications' },
				},
				{
					label: '开发日志',
					autogenerate: { directory: 'develop-logs' },
				},
				{
					label: 'Language',
					autogenerate: { directory: 'language' },
				},
				{
					label: 'Cloudflare',
					autogenerate: { directory: 'cloudflare' },
				},
				{
					label: '引用',
					autogenerate: { directory: 'references' },
				},
			],
		}),
	],
});
