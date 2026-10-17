// Downloads the product and banner photographs into public/images so the app
// serves every image from its own origin (fast, offline capable, no hotlinking).
// Files that already exist are skipped. Run with:  npm run images
// With --soft the script never fails the build (used by predev / prebuild).
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const soft = process.argv.includes('--soft');
const list = JSON.parse(await readFile(join(root, '../../packages/shared/src/images.json'), 'utf8'));
const exists = (p) => access(p).then(() => true, () => false);

async function download(item) {
  const target = join(root, 'public/images', item.file);
  if (await exists(target)) return 'kept';
  await mkdir(dirname(target), { recursive: true });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(item.url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const type = response.headers.get('content-type') || '';
    if (!type.startsWith('image/')) throw new Error(`Unexpected content type ${type}`);
    await writeFile(target, Buffer.from(await response.arrayBuffer()));
    return 'saved';
  } finally { clearTimeout(timer); }
}

const results = { saved: 0, kept: 0, failed: 0 };
let offlineHits = 0;
for (const item of list) {
  if (offlineHits >= 2) { results.failed += 1; continue; }
  try { results[await download(item)] += 1; offlineHits = 0; }
  catch (error) { results.failed += 1; offlineHits += 1; console.warn(`  could not fetch ${item.file}: ${error.message}`); }
}
console.log(`Images: ${results.saved} downloaded, ${results.kept} already present, ${results.failed} unavailable.`);
if (results.failed && !soft) process.exit(1);
if (results.failed) console.log('The app will load the remaining photos from their original source until they are downloaded.');
