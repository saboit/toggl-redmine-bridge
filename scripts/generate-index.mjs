/**
 * Post-processes orval-generated react-query hooks:
 * - Adds // @ts-nocheck to all generated .ts files (spec type issues)
 * - Generates barrel index.ts files for each API hooks directory
 */
import { readdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join, basename } from "path";

const TS_NOCHECK = "// @ts-nocheck\n";

const SKIP_FILES = new Set(["mutator.ts", "index.ts"]);

function fixRelativeImportExtensions(dir) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir, { recursive: true })) {
    if (!f.endsWith(".ts")) continue;
    if (SKIP_FILES.has(basename(f))) continue;
    const file = join(dir, f);
    const content = readFileSync(file, "utf-8");
    // Rewrite extension-less relative imports to .js (required for Node.js ESM)
    const fixed = content.replace(
      /from '(\.[^']*?)(?<!\.js)'/g,
      "from '$1.js'"
    );
    if (fixed !== content) writeFileSync(file, fixed, "utf-8");
  }
}

function addTsNocheck(dir) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir, { recursive: true })) {
    if (!f.endsWith(".ts")) continue;
    if (SKIP_FILES.has(basename(f))) continue;
    const file = join(dir, f);
    const content = readFileSync(file, "utf-8");
    if (!content.startsWith(TS_NOCHECK)) {
      writeFileSync(file, TS_NOCHECK + content, "utf-8");
    }
  }
}

function generateBarrel(dir) {
  if (!existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
  }

  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".ts") && !SKIP_FILES.has(f))
    .sort();

  const exports = files
    .map((f) => `export * from "./${basename(f, ".ts")}.js";`)
    .join("\n");

  writeFileSync(join(dir, "index.ts"), TS_NOCHECK + exports + "\n", "utf-8");
  console.log(`✓ Generated ${dir}/index.ts (${files.length} modules)`);
}

addTsNocheck("./src/api-redmine-hooks");
addTsNocheck("./src/api-toggl-hooks");
fixRelativeImportExtensions("./src/api-redmine-hooks");
fixRelativeImportExtensions("./src/api-toggl-hooks");
generateBarrel("./src/api-redmine-hooks");
generateBarrel("./src/api-toggl-hooks");
