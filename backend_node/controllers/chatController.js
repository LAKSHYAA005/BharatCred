import { chatCompletion } from '../services/openaiService.js';

export const chat = async (req, res) => {
    try {
        const { messages } = req.body;
        const data = await chatCompletion(messages);
        res.json(data);
    } catch (error) {
        console.error("Error calling LLM:", error.message);
        console.error("Response data:", error.response?.data);
        res.status(500).json({ error: "LLM call failed", details: error.response?.data });
    }
};
