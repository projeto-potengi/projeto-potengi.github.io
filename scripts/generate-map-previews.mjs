import { execFile } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { copyFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

const root = process.cwd();
const catalogPath = join(root, "fontes/fase-2/catalogo_mapas_completude_2026-08-26.json");
const outputDir = join(root, "public/media/maps/previews");
const tempDir = join(root, "tmp/map-previews-downloads");
const pdftoppm = "C:/Users/f009265/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe";

const existingPreviewSources = {
  "vulnerabilidade-erosao": "vulnerabilidade-erosao-potengi.jpg",
  "areas-prioritarias": "areas-prioritarias-potengi.jpg",
  "uso-cobertura-terra": "uso-cobertura-terra-potengi.jpg",
  "localizacao-bacia": "localizacao-bacia-potengi.jpg",
  "rede-drenagem": "rede-drenagem-potengi.jpg",
  "modelo-digital-elevacao": "modelo-digital-de-elevacao-potengi.jpg",
  declividade: "declividade-potengi.jpg",
  pedologia: "pedologia-potengi.jpg",
  geomorfologia: "geomorfologia-potengi.jpg",
  aquiferos: "aquiferos-potengi.jpg"
};

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
mkdirSync(outputDir, { recursive: true });
mkdirSync(tempDir, { recursive: true });

const driveIdFromUrl = (url) => {
  if (!url) return undefined;
  const match = url.match(/\/file\/d\/([^/]+)/) ?? url.match(/[?&]id=([^&]+)/);
  return match?.[1];
};

const downloadUrlFor = (url) => {
  const id = driveIdFromUrl(url);
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
};

const detectKind = (buffer) => {
  if (buffer.subarray(0, 4).toString("ascii") === "%PDF") return "pdf";
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image";
  if (buffer[0] === 0x89 && buffer.subarray(1, 4).toString("ascii") === "PNG") return "image";
  return "unknown";
};

const extractConfirmUrl = (html) => {
  const hrefMatch = html.match(/href="(\/uc\?export=download[^"]+)"/);
  if (!hrefMatch) return undefined;

  return `https://drive.google.com${hrefMatch[1].replaceAll("&amp;", "&")}`;
};

const fetchFile = async (url) => {
  const first = await fetch(downloadUrlFor(url), { redirect: "follow" });
  const firstBuffer = Buffer.from(await first.arrayBuffer());
  const firstKind = detectKind(firstBuffer);

  if (firstKind !== "unknown") {
    return { buffer: firstBuffer, kind: firstKind };
  }

  const html = firstBuffer.toString("utf8");
  const confirmUrl = extractConfirmUrl(html);
  if (!confirmUrl) {
    return { buffer: firstBuffer, kind: "unknown" };
  }

  const second = await fetch(confirmUrl, {
    redirect: "follow",
    headers: { cookie: first.headers.get("set-cookie") ?? "" }
  });
  const secondBuffer = Buffer.from(await second.arrayBuffer());
  return { buffer: secondBuffer, kind: detectKind(secondBuffer) };
};

const writeImagePreview = async (inputPath, outputPath) => {
  await sharp(inputPath)
    .rotate()
    .resize({ width: 1400, height: 1000, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(outputPath);
};

const writePdfPreview = async (inputPath, outputPath, id) => {
  const prefix = join(tempDir, `${id}-page`);
  await execFileAsync(pdftoppm, ["-f", "1", "-l", "1", "-singlefile", "-r", "160", "-png", inputPath, prefix]);
  await writeImagePreview(`${prefix}.png`, outputPath);
  await rm(`${prefix}.png`, { force: true });
};

const results = [];

for (const item of catalog.items) {
  const outputPath = join(outputDir, `${item.id}.jpg`);
  const existingSource = existingPreviewSources[item.id];

  if (existingSource) {
    await copyFile(join(root, "public/media/maps", existingSource), outputPath);
    results.push({ id: item.id, status: "existing_jpg", file: basename(outputPath) });
    continue;
  }

  const sourceUrl = item.previewUrl ?? item.sourceUrl ?? item.downloadUrl;
  if (!sourceUrl) {
    results.push({ id: item.id, status: "missing_source" });
    continue;
  }

  try {
    const { buffer, kind } = await fetchFile(sourceUrl);
    if (kind === "unknown") {
      const htmlPath = join(tempDir, `${item.id}.html`);
      writeFileSync(htmlPath, buffer);
      results.push({ id: item.id, status: "unreadable_download", file: basename(htmlPath) });
      continue;
    }

    const rawPath = join(tempDir, `${item.id}.${kind === "pdf" ? "pdf" : "bin"}`);
    await writeFile(rawPath, buffer);

    if (kind === "pdf") {
      await writePdfPreview(rawPath, outputPath, item.id);
      results.push({ id: item.id, status: "pdf_rendered", file: basename(outputPath) });
    } else {
      await writeImagePreview(rawPath, outputPath);
      results.push({ id: item.id, status: "downloaded_image", file: basename(outputPath) });
    }
  } catch (error) {
    results.push({ id: item.id, status: "error", error: error instanceof Error ? error.message : String(error) });
  }
}

writeFileSync(join(tempDir, "preview-results.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify({
  total: results.length,
  existingJpg: results.filter((item) => item.status === "existing_jpg").length,
  downloadedImage: results.filter((item) => item.status === "downloaded_image").length,
  pdfRendered: results.filter((item) => item.status === "pdf_rendered").length,
  missing: results.filter((item) => !["existing_jpg", "downloaded_image", "pdf_rendered"].includes(item.status))
}, null, 2));
