import express from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { chunkPages } from '../lib/chunk.js';

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
console.log('--- SAMPLE CHUNK 1 ---');
console.log(chunks[1]);

res.json({
  filename: req.file.originalname,
  pages: result.total,
  chunks: chunks.length,
});

    console.log('--- FILE:', req.file.originalname);
    console.log('--- RESULT KEYS:', Object.keys(result));
    console.log('--- CHARS:', result.text.length);
    console.log('--- FIRST 500 ---');
    console.log('--- TOTAL:', result.total);
console.log('--- PAGE 1 SHAPE:', JSON.stringify(result.pages[0]).slice(0, 300));
console.log('--- PAGE KEYS:', Object.keys(result.pages[0]));
console.log('--- ENUMS:', result.pages.map(p => p.enum));
console.log('--- PAGE COUNT MATCH:', result.pages.length === result.total);
    console.log(result.text.slice(0, 500));

    res.json({
      filename: req.file.originalname,
      chars: result.text.length,
      preview: result.text.slice(0, 200),
    });
  } catch (err) {
    console.error('Ingest failed:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (parser) await parser.destroy();
  }
});

export default router;