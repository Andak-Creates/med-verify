const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Helper to draw a thick line segment onto a PNG with anti-aliasing
function drawLine(png, x0, y0, x1, y1, radius, color) {
  const minX = Math.max(0, Math.floor(Math.min(x0, x1) - radius - 2));
  const maxX = Math.min(png.width - 1, Math.ceil(Math.max(x0, x1) + radius + 2));
  const minY = Math.max(0, Math.floor(Math.min(y0, y1) - radius - 2));
  const maxY = Math.min(png.height - 1, Math.ceil(Math.max(y0, y1) + radius + 2));

  const dx = x1 - x0;
  const dy = y1 - y0;
  const lenSq = dx * dx + dy * dy;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      let t = 0;
      if (lenSq > 0) {
        t = ((x - x0) * dx + (y - y0) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
      }
      const projX = x0 + t * dx;
      const projY = y0 + t * dy;
      const dist = Math.hypot(x - projX, y - projY);

      if (dist <= radius + 1) {
        let alpha = 1;
        if (dist > radius) {
          alpha = 1 - (dist - radius);
        }
        
        const idx = (png.width * y + x) << 2;
        const currentA = png.data[idx + 3] / 255;
        const newA = Math.max(currentA, alpha);

        // Blend color over current background
        png.data[idx] = Math.round(color[0] * alpha + png.data[idx] * (1 - alpha));
        png.data[idx + 1] = Math.round(color[1] * alpha + png.data[idx + 1] * (1 - alpha));
        png.data[idx + 2] = Math.round(color[2] * alpha + png.data[idx + 2] * (1 - alpha));
        png.data[idx + 3] = Math.round(newA * 255);
      }
    }
  }
}

// Generate App Icon PNG
function createIcon({ width, height, isTransparentBg = false, isBackgroundOnly = false }) {
  const png = new PNG({ width, height });

  const bg = [11, 28, 90]; // #0B1C5A
  const cyan = [0, 198, 255]; // #00C6FF

  // Fill background
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      if (isTransparentBg) {
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
      } else {
        png.data[idx] = bg[0];
        png.data[idx + 1] = bg[1];
        png.data[idx + 2] = bg[2];
        png.data[idx + 3] = 255;
      }
    }
  }

  if (!isBackgroundOnly) {
    // Checkmark V points proportional to width/height
    const strokeRadius = width * 0.038;
    const x0 = width * 0.28;
    const y0 = height * 0.50;
    const x1 = width * 0.44;
    const y1 = height * 0.65;
    const x2 = width * 0.72;
    const y2 = height * 0.35;

    // Draw V checkmark
    drawLine(png, x0, y0, x1, y1, strokeRadius, cyan);
    drawLine(png, x1, y1, x2, y2, strokeRadius, cyan);
  }

  return png;
}

const assetsDir = path.join(__dirname, '../assets/images');

// 1. Universal Icon (1024x1024)
const universalIcon = createIcon({ width: 1024, height: 1024 });
fs.writeFileSync(path.join(assetsDir, 'icon.png'), PNG.sync.write(universalIcon));

// 2. Android Foreground (512x512 transparent)
const androidFg = createIcon({ width: 512, height: 512, isTransparentBg: true });
fs.writeFileSync(path.join(assetsDir, 'android-icon-foreground.png'), PNG.sync.write(androidFg));

// 3. Android Background (512x512 solid navy)
const androidBg = createIcon({ width: 512, height: 512, isBackgroundOnly: true });
fs.writeFileSync(path.join(assetsDir, 'android-icon-background.png'), PNG.sync.write(androidBg));

// 4. Splash Icon (512x512 transparent)
const splashIcon = createIcon({ width: 512, height: 512, isTransparentBg: true });
fs.writeFileSync(path.join(assetsDir, 'splash-icon.png'), PNG.sync.write(splashIcon));

// 5. Favicon (48x48)
const favicon = createIcon({ width: 48, height: 48 });
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), PNG.sync.write(favicon));

console.log('Successfully generated all MedVerify app icons!');
