import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#18181b"/>
      <stop offset="100%" style="stop-color:#312e81"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="200" fill="url(#bg)"/>
  <g transform="translate(112,112)">
    <circle cx="200" cy="200" r="120" fill="#fb7185"/>
    <circle cx="600" cy="200" r="120" fill="#38bdf8"/>
    <circle cx="200" cy="600" r="120" fill="#34d399"/>
    <circle cx="600" cy="600" r="120" fill="#fbbf24"/>
  </g>
</svg>`;

const thumbSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1910" height="1000" viewBox="0 0 1910 1000">
  <defs>
    <linearGradient id="tbg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#09090b"/>
      <stop offset="100%" style="stop-color:#3730a3"/>
    </linearGradient>
  </defs>
  <rect width="1910" height="1000" rx="48" fill="url(#tbg)"/>
  <text x="955" y="520" text-anchor="middle" font-family="system-ui,sans-serif" font-size="72" font-weight="600" fill="#fafafa">Bejeweled</text>
</svg>`;

await mkdir(publicDir, { recursive: true });

const iconPng = await sharp(Buffer.from(iconSvg)).png({ compressionLevel: 9 }).toBuffer();
const thumbPng = await sharp(Buffer.from(thumbSvg)).png({ compressionLevel: 9 }).toBuffer();

await writeFile(path.join(publicDir, "app-icon.png"), iconPng);
await writeFile(path.join(publicDir, "app-thumbnail.png"), thumbPng);
await writeFile(path.join(publicDir, "app-icon.svg"), iconSvg);
await writeFile(path.join(publicDir, "app-thumbnail.svg"), thumbSvg);

console.log("Wrote public/app-icon.png, app-thumbnail.png, SVGs");
