const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1A1A2E"/>
      <stop offset="100%" style="stop-color:#0F0F1A"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#A855F7"/>
      <stop offset="100%" style="stop-color:#EC4899"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <rect x="120" y="280" width="200" height="40" rx="6" fill="#3F3F46"/>
  <rect x="100" y="230" width="220" height="40" rx="6" fill="#52525B"/>
  <path d="M90 180 Q90 160 110 160 L250 160 Q256 160 256 170 L256 220 Q256 230 246 230 L110 230 Q90 230 90 210 Z" fill="url(#accent)"/>
  <path d="M262 170 Q262 160 272 160 L402 160 Q422 160 422 180 L422 210 Q422 230 402 230 L272 230 Q262 230 262 220 Z" fill="url(#accent)"/>
  <rect x="110" y="175" width="136" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
  <rect x="110" y="185" width="120" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
  <rect x="110" y="195" width="130" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
  <rect x="110" y="205" width="100" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
  <rect x="272" y="175" width="130" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
  <rect x="272" y="185" width="110" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
  <rect x="272" y="195" width="125" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
  <rect x="272" y="205" width="90" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
  <circle cx="380" cy="120" r="8" fill="#EC4899"/>
  <circle cx="400" cy="150" r="5" fill="#A855F7"/>
  <circle cx="350" cy="100" r="4" fill="#06B6D4"/>
  <text x="256" y="380" font-family="Arial" font-size="80" font-weight="bold" fill="white" text-anchor="middle">SE</text>
</svg>
`;

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log('Generating ShelfieEase icons...\n');
  const svgBuffer = Buffer.from(svgIcon);
  for (const size of sizes) {
    await sharp(svgBuffer).resize(size, size).png().toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`Created icon-${size}x${size}.png`);
  }
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(__dirname, '../public/favicon.png'));
  console.log('All icons generated!');
}

generateIcons().catch(console.error);
