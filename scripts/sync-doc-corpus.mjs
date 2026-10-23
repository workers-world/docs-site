#!/usr/bin/env node
/**
 * Upload MDX + DOC_MAP.json + llms.txt hint into R2 for CF AI Search (R2 data source).
 *
 * Env:
 *   R2_ACCOUNT_ID / CF_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_DOC_CORPUS_BUCKET (default: workers-world-doc-corpus)
 *   R2_DOC_CORPUS_PREFIX (default: docs-site/)
 *
 * Dry-run when credentials missing (CI may skip).
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'src/content/docs');
const PUBLIC_MAP = join(ROOT, 'public', 'DOC_MAP.json');
const DIST_MAP = join(ROOT, 'dist', 'DOC_MAP.json');

const accountId = (process.env.R2_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || '').trim();
const accessKey = (process.env.R2_ACCESS_KEY_ID || '').trim();
const secretKey = (process.env.R2_SECRET_ACCESS_KEY || '').trim();
const bucket = (process.env.R2_DOC_CORPUS_BUCKET || 'workers-world-doc-corpus').trim();
const prefix = (process.env.R2_DOC_CORPUS_PREFIX || 'docs-site/').replace(/^\/*/, '').replace(/\/?$/, '/');

function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		const st = statSync(p);
		if (st.isDirectory()) walk(p, out);
		else if (/\.(mdx?|json|txt)$/i.test(name)) out.push(p);
	}
	return out;
}

function collectFiles() {
	/** @type {{ key: string; path: string; contentType: string }[]} */
	const files = [];
	for (const abs of walk(DOCS)) {
		const rel = relative(DOCS, abs).replace(/\\/g, '/');
		files.push({
			key: `${prefix}content/${rel}`,
			path: abs,
			contentType: abs.endsWith('.mdx') ? 'text/mdx; charset=utf-8' : 'text/markdown; charset=utf-8',
		});
	}
	const mapPath = existsSync(DIST_MAP) ? DIST_MAP : PUBLIC_MAP;
	if (existsSync(mapPath)) {
		files.push({
			key: `${prefix}DOC_MAP.json`,
			path: mapPath,
			contentType: 'application/json; charset=utf-8',
		});
	}
	const llms = join(ROOT, 'dist', 'llms.txt');
	if (existsSync(llms)) {
		files.push({
			key: `${prefix}llms.txt`,
			path: llms,
			contentType: 'text/plain; charset=utf-8',
		});
	}
	return files;
}

async function putObject(key, body, contentType) {
	const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
	const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
	const dateStamp = amzDate.slice(0, 8);
	const payloadHash = createHash('sha256').update(body).digest('hex');
	const canonicalHeaders = `content-type:${contentType}\nhost:${accountId}.r2.cloudflarestorage.com\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
	const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
	const canonicalRequest = [
		'PUT',
		`/${bucket}/${key}`,
		'',
		canonicalHeaders,
		signedHeaders,
		payloadHash,
	].join('\n');
	const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
	const stringToSign = [
		'AWS4-HMAC-SHA256',
		amzDate,
		credentialScope,
		createHash('sha256').update(canonicalRequest).digest('hex'),
	].join('\n');
	const { createHmac } = await import('node:crypto');
	const h = (k, d) => createHmac('sha256', k).update(d).digest();
	const kDate = h(`AWS4${secretKey}`, dateStamp);
	const kRegion = h(kDate, 'auto');
	const kService = h(kRegion, 's3');
	const kSigning = h(kService, 'aws4_request');
	const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');
	const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
	const res = await fetch(endpoint, {
		method: 'PUT',
		headers: {
			'Content-Type': contentType,
			'x-amz-content-sha256': payloadHash,
			'x-amz-date': amzDate,
			Authorization: authorization,
		},
		body,
	});
	if (!res.ok) {
		const t = await res.text();
		throw new Error(`R2 PUT ${key} → ${res.status}: ${t.slice(0, 200)}`);
	}
}

async function main() {
	const files = collectFiles();
	console.log(`corpus files: ${files.length} (prefix=${prefix} bucket=${bucket})`);
	if (!accountId || !accessKey || !secretKey) {
		console.log('SKIP upload: missing R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY (dry-run list only)');
		for (const f of files.slice(0, 10)) {
			console.log(`  would put ${f.key}`);
		}
		if (files.length > 10) console.log(`  … +${files.length - 10} more`);
		process.exit(0);
	}
	for (const f of files) {
		const body = readFileSync(f.path);
		await putObject(f.key, body, f.contentType);
		console.log(`OK ${f.key}`);
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
