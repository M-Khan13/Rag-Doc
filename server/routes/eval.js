import express from 'express'
import { embed } from '../lib/embed.js'
import { cosineSimilarity } from '../lib/similarity.js'
import { generate, REFUSAL_STRING } from '../lib/generate.js'
import { config } from '../config.js'
import { evalSet } from '../eval/questions.js'
import Chunk from '../models/Chunk.js'

const router = express.Router()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function retrieve(question) {
  const qVec = await embed(question, 'query')
  const chunks = await Chunk.find({}).lean()
  return chunks
    .map((c) => ({ score: cosineSimilarity(qVec, c.embedding), page: c.page, content: c.content }))
    .sort((a, b) => b.score - a.score)
    .slice(0, config.topK)
}

// mode:
//   'retrieval' (default) -> page-hit scoring only, NO LLM calls, instant/unlimited
//   'full'                -> also calls generate() for expectRefusal questions,
//                            throttled to respect the 5 req/min free tier
router.post('/eval', async (req, res) => {
  try {
    const mode = req.body?.mode || 'retrieval'
    const total = await Chunk.countDocuments()
    if (total === 0) return res.status(400).json({ error: 'No chunks stored — ingest first' })

    const rows = []
    for (const item of evalSet) {
      const top = await retrieve(item.q)
      const topPage = top[0]?.page
      const topScore = top[0]?.score ?? 0

      if (item.expectRefusal) {
        // Refusal can only be judged by asking the model. Skip in retrieval mode.
        if (mode !== 'full') {
          rows.push({ q: item.q, skipped: true, detail: 'refusal check (run mode=full)', topScore: round(topScore) })
          console.log(`SKIP | ${item.q} (needs LLM — mode=full)`)
          continue
        }
        await sleep(13000) // ~5 req/min headroom
        const answer = await generate(item.q, top)
        const refused = answer.trim() === REFUSAL_STRING
        rows.push({ q: item.q, pass: refused, detail: refused ? 'refused (correct)' : 'ANSWERED (should refuse)', topScore: round(topScore) })
        console.log(`${refused ? 'PASS' : 'FAIL'} | ${item.q} — ${refused ? 'refused' : 'ANSWERED (bad)'}`)
      } else {
        // Page-hit: pure retrieval, no LLM.
        const pass = topPage === item.expectPage
        rows.push({ q: item.q, pass, detail: `top p.${topPage} (want p.${item.expectPage})`, topScore: round(topScore) })
        console.log(`${pass ? 'PASS' : 'FAIL'} | ${item.q}`)
        console.log(`       top p.${topPage} (want p.${item.expectPage}) | topScore ${topScore.toFixed(4)}`)
      }
    }

    const scored = rows.filter((r) => !r.skipped)
    const passed = scored.filter((r) => r.pass).length
    console.log(`\n=== ${passed}/${scored.length} scored passed | chunk ${config.chunkSize}/${config.chunkOverlap} topK ${config.topK} prefixes ${config.usePrefixes} | mode ${mode} ===\n`)

    res.json({ summary: { passed, scored: scored.length, config, mode }, rows })
  } catch (err) {
    console.error('Eval failed:', err.message)
    res.status(500).json({ error: err.message })
  }
})

const round = (n) => Number((n || 0).toFixed(4))

export default router