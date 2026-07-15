import express from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/ingest', upload.single('file'), async (req, res) => {
  let parser;
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    parser = new PDFParse({ data: req.file.buffer });
    const result = await parser.getText();

    console.log('--- FILE:', req.file.originalname);
    console.log('--- RESULT KEYS:', Object.keys(result));
    console.log('--- CHARS:', result.text.length);
    console.log('--- FIRST 500 ---');
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