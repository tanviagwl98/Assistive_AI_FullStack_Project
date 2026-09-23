import { mkdir, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "design/stitch");
const listPath = path.join(outDir, "list-screens-raw.json");

function slug(title, id) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return base || id;
}

async function download(url, filePath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  await pipeline(response.body, createWriteStream(filePath));
  return (await import("node:fs/promises")).stat(filePath).then((s) => s.size);
}

const raw = JSON.parse(await (await import("node:fs/promises")).readFile(listPath, "utf8"));
const screens = raw.result.structuredContent.screens;

await mkdir(path.join(outDir, "html"), { recursive: true });
await mkdir(path.join(outDir, "screenshots"), { recursive: true });
await mkdir(path.join(outDir, "assets"), { recursive: true });

const manifest = [];

for (const screen of screens) {
  const id = screen.name.split("/").pop();
  const name = slug(screen.title, id);
  const entry = {
    id,
    title: screen.title,
    name: screen.name,
    width: screen.width,
    height: screen.height,
    deviceType: screen.deviceType ?? null,
  };

  const html = screen.htmlCode?.downloadUrl;
  const mime = screen.htmlCode?.mimeType;
  if (html) {
    const ext = mime === "image/svg+xml" ? "svg" : "html";
    const rel = `${ext === "svg" ? "assets" : "html"}/${name}.${ext}`;
    const filePath = path.join(outDir, rel);
    try {
      entry[`${ext}File`] = rel;
      entry[`${ext}Bytes`] = await download(html, filePath);
    } catch (error) {
      entry[`${ext}Error`] = String(error);
    }
  }

  const screenshot = screen.screenshot?.downloadUrl;
  if (screenshot) {
    const rel = `screenshots/${name}.png`;
    const filePath = path.join(outDir, rel);
    try {
      entry.screenshotFile = rel;
      entry.screenshotBytes = await download(screenshot, filePath);
    } catch (error) {
      entry.screenshotError = String(error);
    }
  }

  manifest.push(entry);
  console.log(`Extracted: ${screen.title}`);
}

await writeFile(
  path.join(outDir, "manifest.json"),
  JSON.stringify(
    {
      projectId: "projects/7051439649980667637",
      projectTitle: "My Marriage Landing Page",
      extractedAt: new Date().toISOString(),
      screens: manifest,
    },
    null,
    2,
  ),
);

console.log(`Done — ${manifest.length} screens in ${outDir}`);
