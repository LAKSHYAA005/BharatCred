import express from 'express';
import axios from 'axios';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/analyze-credit', async (req, res) => {
    try {
        // req.body should be the transaction JSON array from your frontend
        const pythonResponse = await axios.post('http://127.0.0.1:8000/get-score', req.body);
        res.json(pythonResponse.data);
    } catch (error) {
        console.error("Error talking to Python AI:", error.message);
        res.status(500).json({ error: "AI Analysis failed" });
    }
});

app.listen(5000, () => console.log('Node Bridge running on port 5000'));