
import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema({
  docId: { type: String, required: true, index: true },
  filename: { type: String, required: true },
  content: { type: String, required: true },
  page: { type: Number, required: true },
  chunkIndex: { type: Number, required: true },
  embedding: { type: [Number], required: true },
}, { timestamps: true });

export default mongoose.model('Chunk', chunkSchema);