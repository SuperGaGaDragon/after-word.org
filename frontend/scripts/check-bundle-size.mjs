import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const JS_BUDGET_BYTES = 300 * 1024;
const assetsDir = join(process.cwd(), 'dist', 'assets');

const files = readdirSync(assetsDir).filter((name) => name.endsWith('.js'));
if (files.length === 0) {
  console.error('No JS bundles found in dist/assets');
  process.exit(1);
}

let largest = { name: '', size: 0 };
for (const name of files) {
  const size = statSync(join(assetsDir, name)).size;
  if (size > largest.size) {
    largest = { name, size };
  }
}

if (largest.size > JS_BUDGET_BYTES) {
  console.error(
    `Bundle budget exceeded: ${largest.name} is ${largest.size} bytes, limit ${JS_BUDGET_BYTES} bytes.`
  );
  process.exit(1);
}

console.log(
  `Bundle budget check passed: largest bundle ${largest.name} is ${largest.size} bytes (limit ${JS_BUDGET_BYTES}).`
);
