import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // High payload limit for compressed artwork base64 images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  const dataFilePath = path.join(__dirname, 'src', 'data', 'saved_paintings.json');

  // GET /api/paintings - Fetch all server-saved paintings
  app.get('/api/paintings', (req, res) => {
    try {
      if (fs.existsSync(dataFilePath)) {
        const raw = fs.readFileSync(dataFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return res.json(Array.isArray(parsed) ? parsed : []);
      }
      return res.json([]);
    } catch (err) {
      console.error('Error reading saved paintings:', err);
      return res.json([]);
    }
  });

  // POST /api/paintings - Save paintings array to server filesystem
  app.post('/api/paintings', (req, res) => {
    try {
      const paintings = req.body;
      if (Array.isArray(paintings)) {
        fs.writeFileSync(dataFilePath, JSON.stringify(paintings, null, 2), 'utf-8');
        return res.json({ success: true, count: paintings.length });
      }
      return res.status(400).json({ error: 'Expected an array of paintings' });
    } catch (err) {
      console.error('Error saving paintings:', err);
      return res.status(500).json({ error: 'Failed to write paintings to disk' });
    }
  });

  // Vite middleware for frontend SPA in development mode
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
