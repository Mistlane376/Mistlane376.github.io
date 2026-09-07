import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { transform } from 'esbuild';

export async function optimizeAssets(directory) {
  const walk = async (folder) => {
    const files = [];
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) files.push(...await walk(file));
      else files.push(file);
    }
    return files;
  };
  const files = await walk(directory);
  const manifest = {};
  let before = 0;
  let after = 0;
  await mkdir(path.join(directory, 'optimized'), { recursive: true });
  for (const file of files.filter((file) => /\.(png|jpe?g)$/i.test(file))) {
    const buffer = await readFile(file);
    const metadata = await sharp(buffer).metadata();
    const url = '/' + path.relative(directory, file).split(path.sep).join('/');
    const image = { width: metadata.width, height: metadata.height, src: url };
    if (buffer.length > 16000 && !metadata.pages) {
      const result = await sharp(buffer).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
      if (result.data.length < buffer.length) {
        const hash = createHash('sha256').update(result.data).digest('hex').slice(0, 16);
        image.src = `/optimized/${hash}.webp`;
        image.width = result.info.width;
        image.height = result.info.height;
        await writeFile(path.join(directory, image.src), result.data);
        before += buffer.length;
        after += result.data.length;
      }
    }
    manifest[url] = image;
  }
  // Update generated CSS, JS and JSON too: home/album cards create images at runtime.
  const replacements = Object.entries(manifest).filter(([url, image]) => url !== image.src);
  for (const file of files.filter((file) => /\.(css|js|json)$/.test(file))) {
    let text = await readFile(file, 'utf8');
    for (const [url, image] of replacements) text = text.replaceAll(url, image.src);
    if (file.endsWith('.css')) {
      text = text.replace(/font-display\s*:\s*block/g, 'font-display:swap');
      text = (await transform(text, { loader: 'css', minify: true })).code;
    } else if (file.endsWith('.js')) {
      text = (await transform(text, { loader: 'js', minifyWhitespace: true, minifySyntax: true })).code;
    }
    await writeFile(file, text);
  }
  await writeFile(path.join(directory, 'data/image-manifest.json'), JSON.stringify(manifest));
  console.log(`Optimized image assets: ${(before / 1048576).toFixed(2)} MiB -> ${(after / 1048576).toFixed(2)} MiB`);
}
