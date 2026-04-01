import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, '..', 'data', 'store.json');

export async function readStore() {
  const raw = await readFile(STORE_PATH, 'utf8');
  return JSON.parse(raw);
}

export async function writeStore(store) {
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}
