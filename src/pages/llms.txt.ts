import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
	const docs = await getCollection('docs');
	const base = site?.href?.replace(/\/$/, '') ?? '';
	const lines = [
		'# 95_workers-world docs',
		'',
		'> 组织内部文档站。权威开发副本：cloudflare_work/docs/',
		'',
		'## Pages',
		'',
	];
	for (const entry of docs
		.filter((e) => !e.data.draft && e.data.searchable !== false)
		.sort((a, b) => a.id.localeCompare(b.id))) {
		const path = entry.id === 'index' ? '/' : `/${entry.id}/`;
		const title = entry.data.title;
		const desc = entry.data.description ? ` — ${entry.data.description}` : '';
		lines.push(`- [${title}](${base}${path})${desc}`);
		lines.push(`  - markdown: ${base}${path === '/' ? '/index' : path.slice(0, -1)}.md`);
	}
	return new Response(lines.join('\n') + '\n', {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
