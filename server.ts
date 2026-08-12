import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GeminiService } from './server/services/geminiService';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'LuminaSQL', time: new Date().toISOString() });
  });

  app.post('/api/ai/generate-sql', async (req, res) => {
    try {
      const { userQuery, schema, conversationHistory, settings } = req.body;
      if (!userQuery || !schema) {
        return res.status(400).json({ error: 'Missing required parameters (userQuery, schema)' });
      }
      const result = await GeminiService.generateSQL(userQuery, schema, conversationHistory || [], settings);
      res.json(result);
    } catch (err: any) {
      console.error('API generate-sql error:', err);
      res.status(500).json({ error: err?.message || 'Failed to generate SQL' });
    }
  });

  app.post('/api/ai/correct-sql', async (req, res) => {
    try {
      const { failedSql, errorMessage, userQuery, schema } = req.body;
      const result = await GeminiService.correctSQL(failedSql, errorMessage, userQuery, schema);
      res.json(result);
    } catch (err: any) {
      console.error('API correct-sql error:', err);
      res.status(500).json({ error: err?.message || 'Failed to correct SQL' });
    }
  });

  app.post('/api/ai/explain-result', async (req, res) => {
    try {
      const { userQuery, sql, queryResult, schema, settings } = req.body;
      const result = await GeminiService.explainResult(userQuery, sql, queryResult, schema, settings);
      res.json(result);
    } catch (err: any) {
      console.error('API explain-result error:', err);
      res.status(500).json({ error: err?.message || 'Failed to explain result' });
    }
  });

  // Vite development middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LuminaSQL server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
