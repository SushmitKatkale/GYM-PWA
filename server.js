import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 4173;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Add PWA headers
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});

// Serve manifest with correct content type
app.get('/manifest.webmanifest', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(__dirname, 'dist', 'manifest.webmanifest'));
});

// Catch all handler for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`\n🏋️‍♂️  GYM PWA Test Server Running!`);
  console.log(`📱 Local:   http://localhost:${port}/`);
  console.log(`🌐 Network: http://your-ip:${port}/`);
  console.log(`\n📲 Ready for APK conversion!`);
});
