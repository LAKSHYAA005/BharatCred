import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { analyzeCredit } from './controllers/creditController.js';
import { chat } from './controllers/chatController.js';
import { analyzeFromPdf } from './controllers/pdfController.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.post('/api/analyze-credit', analyzeCredit);
app.post('/api/analyze-pdf', upload.single('file'), analyzeFromPdf);
app.post('/api/chat', chat);

app.listen(5000, () => console.log('Node Bridge running on port 5000'));