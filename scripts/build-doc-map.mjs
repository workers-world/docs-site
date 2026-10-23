#!/usr/bin/env node
/**
 * Scan src/content/docs MDX files → public/DOC_MAP.json (+ dist/ if present).
 * Frontmatter keys: id, covers[], claims[], diagram.
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'src/content/docs');

/**
 * @param {string} text
 * @returns {{ fm: Record<string, unknown>; body: string }}
 */
function parseFrontmatter(text) {
	if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) {
		return { fm: {}, body: text };
	}
	const end = text.indexOf('\n---', 4);
	if (end < 0) {
		return { fm: {}, body: text };
	}
	const raw = text.slice(4, end).trim();
	const body = text.slice(end + 4).replace(/^\r?\n/, '');
	/** @type {Record<string, unknown>} */
	const fm = {};
	let key = '';
	/** @type {unknown[]} */
	let list = [];
	/** @type {Record<string, unknown> | null} */
	let obj = null;
	let mode = 'root'; // root | covers | claims | cover-item | claim-item
	for (const line of raw.split(/\r?\n/)) {
		if (/^\s*#/.test(line) || line.trim() === '') {
			continue;
		}
		const coversStart = line.match(/^covers:\s*$/);
		const claimsStart = line.match(/^claims:\s*$/);
		const listItem = line.match(/^\s*-\s+(.*)$/);
		const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
		const nestedKv = line.match(/^\s{2,}([A-Za-z0-9_]+):\s*(.*)$/);

		if (coversStart) {
			mode = 'covers';
			list = [];
			fm.covers = list;
			continue;
		}
		if (claimsStart) {
			mode = 'claims';
			list = [];
			fm.claims = list;
			continue;
		}
		if (
			(mode === 'covers' ||
				mode === 'claims' ||
				mode === 'cover-item' ||
				mode === 'claim-item') &&
			listItem
		) {
			const rest = listItem[1].trim();
			const parent =
				mode === 'claims' || mode === 'claim-item' ? 'claims' : 'covers';
			if (rest.includes(':') && !rest.startsWith('[')) {
				obj = {};
				const m = rest.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
				if (m) {
					obj[m[1]] = parseScalar(m[2]);
				}
				list.push(obj);
				mode = parent === 'covers' ? 'cover-item' : 'claim-item';
			} else if (rest.startsWith('[')) {
				list.push(parseScalar(rest));
				obj = null;
				mode = parent;
			} else {
				list.push(parseScalar(rest));
				obj = null;
				mode = parent;
			}
			continue;
		}
		if ((mode === 'cover-item' || mode === 'claim-item') && nestedKv) {
			if (obj) {
				obj[nestedKv[1]] = parseScalar(nestedKv[2]);
			}
			continue;
		}
		if (kv && !line.startsWith(' ') && !line.startsWith('\t')) {
			mode = 'root';
			obj = null;
			key = kv[1];
			const val = kv[2].trim();
			if (val === '') {
				continue;
			}
			fm[key] = parseScalar(val);
		}
	}
	return { fm, body };
}

/**
 * @param {string} raw
 */
function parseScalar(raw) {
	const v = raw.trim();
	if (v === 'true') return true;
	if (v === 'false') return false;
	if (v.startsWith('[') && v.endsWith(']')) {
		const inner = v.slice(1, -1).trim();
		if (!inner) return [];
		return inner.split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
	}
	return v.replace(/^["']|["']$/g, '');
}

/**
 * @param {string} dir
 * @param {string[]} out
 */
function walkMdx(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		const st = statSync(p);
		if (st.isDirectory()) {
			walkMdx(p, out);
		} else if (name.endsWith('.mdx') || name.endsWith('.md')) {
			out.push(p);
		}
	}
	return out;
}

function chapterIdFromPath(rel) {
	return rel
		.replace(/\\/g, '/')
		.replace(/\.mdx?$/, '')
		.replace(/\/index$/, '')
		.replace(/\//g, '.');
}

function build() {
	const files = walkMdx(DOCS);
	/** @type {Record<string, unknown>[]} */
	const chapters = [];
	/** @type {Record<string, string[]>} */
	const byPath = {};
	/** @type {Record<string, string[]>} */
	const byRepo = {};

	for (const abs of files) {
		const rel = relative(DOCS, abs).replace(/\\/g, '/');
		const text = readFileSync(abs, 'utf8');
		const { fm } = parseFrontmatter(text);
		const id = typeof fm.id === 'string' && fm.id ? fm.id : chapterIdFromPath(rel);
		const title = typeof fm.title === 'string' ? fm.title : id;
		const covers = Array.isArray(fm.covers) ? fm.covers : [];
		const claims = Array.isArray(fm.claims) ? fm.claims : [];
		const sitePath = `/${rel.replace(/\.mdx?$/, '').replace(/\/index$/, '')}/`.replace(
			/\/+/g,
			'/',
		);
		const chapter = {
			id,
			title,
			path: rel,
			sitePath: sitePath === '//' ? '/' : sitePath,
			description: typeof fm.description === 'string' ? fm.description : undefined,
			diagram: fm.diagram ?? undefined,
			covers,
			claims,
		};
		chapters.push(chapter);

		for (const c of covers) {
			if (!c || typeof c !== 'object') continue;
			const repo = String(/** @type {Record<string, unknown>} */ (c).repo ?? '');
			const paths = /** @type {Record<string, unknown>} */ (c).paths;
			if (repo) {
				byRepo[repo] = byRepo[repo] ?? [];
				if (!byRepo[repo].includes(id)) byRepo[repo].push(id);
			}
			const pathList = Array.isArray(paths) ? paths : [];
			for (const p of pathList) {
				const key = repo ? `${repo}:${p}` : String(p);
				byPath[key] = byPath[key] ?? [];
				if (!byPath[key].includes(id)) byPath[key].push(id);
			}
		}
	}

	chapters.sort((a, b) => String(a.id).localeCompare(String(b.id)));

	const map = {
		version: 1,
		generatedAt: new Date().toISOString(),
		chapterCount: chapters.length,
		chapters,
		index: { byPath, byRepo },
	};

	const json = `${JSON.stringify(map, null, 2)}\n`;
	const publicDir = join(ROOT, 'public');
	mkdirSync(publicDir, { recursive: true });
	writeFileSync(join(publicDir, 'DOC_MAP.json'), json);
	if (existsSync(join(ROOT, 'dist'))) {
		writeFileSync(join(ROOT, 'dist', 'DOC_MAP.json'), json);
	}
	console.log(`DOC_MAP.json: ${chapters.length} chapters → public/DOC_MAP.json`);
}

build();
