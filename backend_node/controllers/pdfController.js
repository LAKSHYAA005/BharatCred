import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import axios from 'axios';
import { parsePdfTransactions, analyzeCreditWithAI } from '../services/openaiService.js';
import CreditReport from '../models/CreditReport.js';

// Resolve worker path from node_modules (import.meta.resolve works in Node 22+)
pdfjsLib.GlobalWorkerOptions.workerSrc = import.meta.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');

async function extractTextFromPdf(buffer) {
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array, useWorkerFetch: false, isEvalSupported: false, disableFontFace: true });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }
    return fullText;
}

export const analyzeFromPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded.' });
        }

        // STEP 1: Extract raw text from PDF
        const rawText = await extractTextFromPdf(req.file.buffer);

        if (!rawText || rawText.trim().length === 0) {
            return res.status(422).json({ error: 'Could not extract text from PDF. It may be a scanned/image-based PDF.' });
        }

        // STEP 2: OpenAI parses raw text → [{description, amount, date}]
        console.log('--- RAW PDF TEXT (first 3000 chars) ---');
        console.log(rawText.slice(0, 3000));
        console.log('--- END RAW TEXT ---');

        const transactions = await parsePdfTransactions(rawText);

        console.log('--- PARSED TRANSACTIONS (first 10) ---');
        console.log(JSON.stringify(transactions.slice(0, 10), null, 2));
        console.log(`Total transactions: ${transactions.length}`);
        const positiveSum = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
        const negativeSum = transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
        console.log(`Sum of positive amounts (income): ₹${positiveSum}`);
        console.log(`Sum of negative amounts (expenses): ₹${negativeSum}`);
        console.log('--- END TRANSACTIONS ---');

        if (!transactions || transactions.length === 0) {
            return res.status(422).json({ error: 'No transactions found in the PDF.' });
        }

        // STEP 3: Send clean transactions to Python ML model (/get-score)
        const mlResponse = await axios.post('http://127.0.0.1:8000/get-score', transactions);
        const mlData = mlResponse.data;

        // STEP 4: Generate structured AI summary
        const aiSummary = await analyzeCreditWithAI(mlData);

        // STEP 5: Return full result to frontend
        const result = {
            ...mlData,
            parsed_transactions: transactions,
            ai_summary: aiSummary,
        };

        // STEP 6: Save to MongoDB if userId is provided
        const userId = req.headers['x-clerk-user-id'];
        if (userId) {
            try {
                await CreditReport.findOneAndUpdate(
                    { userId },
                    { userId, ...result },
                    { upsert: true, returnDocument: 'after' }
                );
                console.log('Credit report saved for user:', userId);
            } catch (dbErr) {
                console.error('Failed to save credit report:', dbErr.message);
            }
        }

        res.json(result);

    } catch (error) {
        console.error('Error in PDF analysis:', error.message);
        console.error('Response data:', error.response?.data);
        res.status(500).json({ error: 'PDF analysis failed', details: error.response?.data || error.message });
    }
};
