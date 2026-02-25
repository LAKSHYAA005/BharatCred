import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { analyzeCredit } from './controllers/creditController.js';
import { chat } from './controllers/chatController.js';
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/analyze-credit', analyzeCredit);
app.post('/api/chat', chat);

app.listen(5000, () => console.log('Node Bridge running on port 5000'));