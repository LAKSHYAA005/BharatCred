import axios from 'axios';
import { analyzeCreditWithAI } from '../services/openaiService.js';
import CreditReport from '../models/CreditReport.js';

export const analyzeCredit = async (req, res) => {
    try {
        const pythonResponse = await axios.post('http://127.0.0.1:8000/get-score', req.body);
        const mlData = pythonResponse.data;

        const aiSummary = await analyzeCreditWithAI(mlData);

        res.json({
            ...mlData,
            ai_summary: aiSummary,
        });
    } catch (error) {
        console.error("Error talking to Python AI:", error.message);
        console.error("Response data:", error.response?.data);
        res.status(500).json({ error: "AI Analysis failed", details: error.response?.data });
    }
};

export const getUserReports = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const report = await CreditReport.findOne({ userId }).sort({ updatedAt: -1 }).lean();

        if (!report) {
            return res.status(404).json({ error: 'No credit report found for this user' });
        }

        res.json(report);
    } catch (error) {
        console.error('Error fetching user report:', error.message);
        res.status(500).json({ error: 'Failed to fetch credit report' });
    }
};
