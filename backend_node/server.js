import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mongoose from 'mongoose';
import { analyzeCredit } from './controllers/creditController.js';
import { chat } from './controllers/chatController.js';
import { analyzeFromPdf } from './controllers/pdfController.js';
import { getUserReports } from './controllers/creditController.js';

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.post('/api/analyze-credit', analyzeCredit);
app.post('/api/analyze-pdf', upload.single('file'), analyzeFromPdf);
app.post('/api/chat', chat);
app.get('/api/reports/:userId', getUserReports);

app.listen(5000, () => console.log('Node Bridge running on port 5000'));