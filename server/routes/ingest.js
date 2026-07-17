import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { PDFParse } from 'pdf-parse';
import { chunkPages } from '../lib/chunk.js';
import { embed } from '../lib/embed.js';
import Chunk from '../models/Chunk.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/ingest', upload.single('file'), async (req, res) => {
  let parser;
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    parser = new PDFParse({ data: req.file.buffer });
    const result = await parser.getText();
    const chunks = chunkPages(result.pages);

    console.log('--- FILE:', req.file.originalname);
    console.log('--- PAGES:', result.total);
    console.log('--- CHUNKS:', chunks.length);
    console.log('--- PAGE COUNT MATCH:', result.pages.length === result.total);

    const docId = crypto.randomUUID();
    const docs = [];

    for (const c of chunks) {
      const embedding = await embed(c.content);
      docs.push({
        docId,
        filename: req.file.originalname,
        content: c.content,
        page: c.page,
        chunkIndex: c.chunkIndex,
        embedding,
      });
      console.log(`embedded ${c.chunkIndex + 1}/${chunks.length} → dim ${embedding.length}`);
    }

    await Chunk.insertMany(docs);

    res.json({
      docId,
      filename: req.file.originalname,
      pages: result.total,
      chunks: docs.length,
    });
  } catch (err) {
    console.error('Ingest failed:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (parser) await parser.destroy();
  }
});

router.delete('/chunks', async (req, res) => {
  const r = await Chunk.deleteMany({});
  res.json({ deleted: r.deletedCount });
});

router.get('/chunks/count', async (req, res) => {
  res.json({ count: await Chunk.countDocuments() });
});

export default router;