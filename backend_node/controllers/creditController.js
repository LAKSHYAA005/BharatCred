import axios from 'axios';
import { analyzeCreditWithAI } from '../services/openaiService.js';

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
