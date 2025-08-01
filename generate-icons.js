// Simple icon generator using canvas
const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="#2563eb"/>
  <text x="${size/2}" y="${size/2 + size*0.1}" font-family="Arial, sans-serif" font-size="${size*0.4}" fill="white" text-anchor="middle" font-weight="bold">G</text>
</svg>`;
};

// Icon sizes needed
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons (which browsers can handle as PNG alternatives)
sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, svgContent);
  console.log(`Created: icon-${size}x${size}.svg`);
});

// Create shortcut icons
const qrIcon = createSVGIcon(96).replace('G', 'Q');
const calendarIcon = createSVGIcon(96).replace('G', 'C');

fs.writeFileSync(path.join(iconsDir, 'qr-icon.svg'), qrIcon);
fs.writeFileSync(path.join(iconsDir, 'calendar-icon.svg'), calendarIcon);

console.log('All icons generated successfully!');
console.log('Note: These are SVG icons. For PNG icons, use an online converter or image editing tool.');
