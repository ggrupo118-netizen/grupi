const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1));
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'binary');
  const body = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crcBuf]);
}

function createPng(width, height, pixelFn) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowStride = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowStride);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Draw professional industrial icon:
// Deep slate / industrial indigo background, rounded square or solid,
// Gear teeth ring + spindle chuck center + maintenance wrench accent + golden amber ring
function lathePixel(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const scale = w / 100; // coordinate space 0..100
  const nx = (x - cx) / scale;
  const ny = (y - cy) / scale;
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background
  let bgR = 15, bgG = 23, bgB = 42, bgA = 255; // #0f172a slate-900

  if (!isMaskable) {
    // Rounded squircle badge for standard icons
    const cornerR = 22;
    const absX = Math.abs(nx);
    const absY = Math.abs(ny);
    const maxCoord = 46;
    if (absX > maxCoord || absY > maxCoord) {
      return [0, 0, 0, 0];
    }
    if (absX > maxCoord - cornerR && absY > maxCoord - cornerR) {
      const dx = absX - (maxCoord - cornerR);
      const dy = absY - (maxCoord - cornerR);
      if (dx * dx + dy * dy > cornerR * cornerR) {
        return [0, 0, 0, 0];
      }
    }
  }

  // Slight top-to-bottom subtle gradient
  const grad = (ny + 50) / 100;
  bgR = Math.round(15 + grad * 12);
  bgG = Math.round(23 + grad * 15);
  bgB = Math.round(42 + grad * 20);

  // Gear ring in center
  const angle = Math.atan2(ny, nx);
  const teeth = 8;
  const toothMod = Math.sin(angle * teeth);

  // Outer gear radius (32 to 38)
  const gearOuter = 34 + toothMod * 4;
  const gearInner = 24;

  // Chuck 3-jaw circle / spindle
  const spindleR = 16;
  const spindleInner = 7;

  // Check if inside gear teeth
  if (dist <= gearOuter && dist >= gearInner) {
    // Industrial gear in Amber 400 (#fbbf24) / Slate 200
    return [245, 158, 11, 255]; // #f59e0b
  }

  // Spindle outer ring
  if (dist < gearInner && dist >= spindleR) {
    // Dark steel groove
    return [30, 41, 59, 255]; // slate-800
  }

  // Spindle chuck body
  if (dist < spindleR && dist >= spindleInner) {
    // Silver steel chuck
    // 3 jaws at 0, 120, 240 degrees
    const jawAngle1 = Math.abs(Math.sin((angle + 0) * 1.5));
    if (jawAngle1 < 0.25) {
      return [203, 213, 225, 255]; // Slate-300 jaw
    }
    return [241, 245, 249, 255]; // Slate-100 chuck face
  }

  // Center borehole
  if (dist < spindleInner) {
    return [15, 23, 42, 255]; // Dark lathe center
  }

  // Diagnostic accent dot / LED status
  const ledDist = Math.sqrt((nx - 28) * (nx - 28) + (ny - (-28)) * (ny - (-28)));
  if (ledDist <= 4) {
    return [34, 197, 94, 255]; // emerald green operational LED
  }

  return [bgR, bgG, bgB, bgA];
}

const pubDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(pubDir)) {
  fs.mkdirSync(pubDir, { recursive: true });
}

// Generate 192x192
console.log('Generating pwa-192x192.png...');
fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPng(192, 192, (x, y, w, h) => lathePixel(x, y, w, h, false)));

// Generate 512x512
console.log('Generating pwa-512x512.png...');
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPng(512, 512, (x, y, w, h) => lathePixel(x, y, w, h, false)));

// Generate 512x512 maskable (full bleed background for circular/teardrop masking)
console.log('Generating pwa-maskable-512x512.png...');
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createPng(512, 512, (x, y, w, h) => lathePixel(x, y, w, h, true)));

// Generate apple-touch-icon.png (180x180)
console.log('Generating apple-touch-icon.png...');
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPng(180, 180, (x, y, w, h) => lathePixel(x, y, w, h, false)));

// Generate favicon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <rect width="100" height="100" rx="22" fill="#0f172a" />
  <circle cx="50" cy="50" r="32" stroke="#f59e0b" stroke-width="6" stroke-dasharray="8 4" fill="none" />
  <circle cx="50" cy="50" r="18" fill="#e2e8f0" stroke="#334155" stroke-width="3" />
  <circle cx="50" cy="50" r="7" fill="#0f172a" />
  <!-- Lathe 3 jaws -->
  <line x1="50" y1="32" x2="50" y2="43" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
  <line x1="34" y1="59" x2="44" y2="54" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
  <line x1="66" y1="59" x2="56" y2="54" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
  <!-- Green status beacon -->
  <circle cx="78" cy="22" r="4.5" fill="#22c55e" />
</svg>`;
fs.writeFileSync(path.join(pubDir, 'icon.svg'), svgContent);
fs.writeFileSync(path.join(pubDir, 'favicon.svg'), svgContent);

console.log('All PWA icons generated successfully in /public!');
