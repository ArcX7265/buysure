import fs from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const JSZip = require("C:/Users/ADARSH/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/jszip");
const args = process.argv.slice(2);
const mode = args[0];
const archive = args[1];
const entry = args[2];
const zip = await JSZip.loadAsync(await fs.readFile(archive));

if (mode === "-Z1") {
  process.stdout.write(Object.keys(zip.files).join("\n"));
} else if (mode === "-p" && entry) {
  const file = zip.file(entry);
  if (!file) process.exit(11);
  process.stdout.write(await file.async("nodebuffer"));
} else {
  process.exit(2);
}
