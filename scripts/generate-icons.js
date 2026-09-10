const fs = require('fs');
const path = require('path');
const { generateImageAsync } = require('@expo/image-utils');

async function main() {
  const src = path.join(__dirname, '..', 'assets', 'images', 'icon.png');
  const publicDir = path.join(__dirname, '..', 'public');
  const inputBuffer = fs.readFileSync(src);

  console.log('Source icon size:', inputBuffer.length);

  const targets = [
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-precomposed.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon.png', size: 512 },
    { name: 'favicon.png', size: 64 },
  ];

  for (const t of targets) {
    const res = await generateImageAsync(
      { projectRoot: path.join(__dirname, '..') },
      {
        src,
        width: t.size,
        height: t.size,
        resizeMode: 'contain',
        backgroundColor: '#101415',
      }
    );
    const dest = path.join(publicDir, t.name);
    fs.writeFileSync(dest, res.source);
    console.log(`Generated ${t.name} (${t.size}x${t.size}, ${res.source.length} bytes)`);
  }
  console.log('All icons generated successfully!');
}

main().catch(console.error);
