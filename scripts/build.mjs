import { mkdir, copyFile, rm, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const files = ["index.html", "styles.css", "app.js", "README.md"];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of files) {
  await copyFile(join(root, file), join(dist, file));
}

const assetsDir = join(root, "assets");
try {
  const assetStats = await stat(assetsDir);
  if (assetStats.isDirectory()) {
    const distAssets = join(dist, "assets");
    await mkdir(distAssets, { recursive: true });
    for (const file of await readdir(assetsDir)) {
      await copyFile(join(assetsDir, file), join(distAssets, file));
    }
  }
} catch {
  // No assets directory is fine for this static build.
}

console.log("Built static site to dist/");
