import express from 'express';
import { embed } from '../lib/embed.js';
import { cosineSimilarity } from '../lib/similarity.js';
import Chunk from '../models/Chunk.js';
import { generate } from '../lib/generate.js';

const router = express.Router();

router.post('/query', async (req, res) => {
    try {
        const { question, topK = 4 } = req.body;
        if (!question) return res.status(400).json({ error: 'No question provided' });

        const qVec = await embed(question, 'query');
        const chunks = await Chunk.find({}).lean();
        if (chunks.length === 0) return res.status(400).json({ error: 'No chunks stored' });

        const scored = chunks
            .map(c => ({
                score: cosineSimilarity(qVec, c.embedding),
                page: c.page,
                chunkIndex: c.chunkIndex,
                content: c.content,
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);

        console.log(`\nQ: ${question}`);
        scored.forEach(s =>
            console.log(`  ${s.score.toFixed(4)} | p${s.page} #${s.chunkIndex} | ${s.content.slice(0, 60).replace(/\n/g, ' ')}...`)
        );
        const answer = await generate(question, scored);
        console.log(`\nA: ${answer}\n`);


        res.json({
            question,
            answer,
            results: scored.map(s => ({
                score: s.score,
                page: s.page,
                chunkIndex: s.chunkIndex,
                preview: s.content.slice(0, 150),
            })),
        });
    } catch (err) {
        console.error('Query failed:', err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;