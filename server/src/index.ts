import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import { authRouter } from './routes/auth.js';
import './dbSetup.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', authRouter);

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://localhost:${port}`);
});

