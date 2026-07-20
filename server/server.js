import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import ingestRouter from './routes/ingest.js';
import queryRouter from './routes/query.js';
import evalRouter from './routes/eval.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', ingestRouter);
app.use('/api', queryRouter);
app.use('/api', evalRouter);
app.use('/api', queryRouter);

app.get('/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    mongo: states[mongoose.connection.readyState],
    db: mongoose.connection.name,
  });
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Mongo connected → db: ${mongoose.connection.name}`);
    app.listen(process.env.PORT, () =>
      console.log(`Server on http://localhost:${process.env.PORT}`)
    );
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
};




start();