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
					label: '入门',
					autogenerate: { directory: 'getting-started' },
				},
				{
					label: '架构',
					autogenerate: { directory: 'architecture' },
				},
				{
					label: '运维',
					autogenerate: { directory: 'operations' },
				},
				{
					label: 'Worker',
					autogenerate: { directory: 'workers' },
				},
			],
		}),
	],
});
