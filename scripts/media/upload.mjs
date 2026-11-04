// Upload a gallery's processed media to Vercel Blob and write urls.json.
// usage: BLOB_READ_WRITE_TOKEN=... node upload.mjs october-30-2026 [photos|videos]
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const slug = process.argv[2];
const only = process.argv[3];
const root = path.join(path.dirname(new URL(import.meta.url).pathname), slug);
const urlsPath = path.join(root, 'urls.json');
const urls = fs.existsSync(urlsPath) ? JSON.parse(fs.readFileSync(urlsPath, 'utf8')) : {};

const files = [];
for (const sub of fs.readdirSync(root).filter((d) => /^(photos|videos)/.test(d) && fs.statSync(path.join(root, d)).isDirectory())) {
  if (only && only !== sub) continue;
  for (const f of fs.readdirSync(path.join(root, sub)).sort()) {
    if (/\.(jpg|mp4)$/.test(f)) files.push(`${sub}/${f}`);
  }
}
const todo = files.filter((f) => !urls[f]);
console.log(`${files.length} files, ${todo.length} to upload`);

let done = 0;
async function worker() {
  while (todo.length) {
    const rel = todo.shift();
    const body = fs.readFileSync(path.join(root, rel));
    for (let attempt = 1; ; attempt++) {
      try {
        const res = await put(`gallery/${slug}/${rel}`, body, {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 31536000,
          contentType: rel.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg',
        });
        urls[rel] = res.url;
        break;
      } catch (e) {
        if (attempt >= 4) throw e;
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
    if (++done % 50 === 0) {
      fs.writeFileSync(urlsPath, JSON.stringify(urls, null, 1));
      console.log(`${done} uploaded`);
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
fs.writeFileSync(urlsPath, JSON.stringify(urls, null, 1));
console.log('DONE', Object.keys(urls).length);
