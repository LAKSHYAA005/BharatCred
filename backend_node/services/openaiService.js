import axios from 'axios';

const SYSTEM_PROMPT = `You are a helpful financial assistant for BharatCred. 
You help users understand their credit score, loan eligibility, and financial health.
Always respond in a clear, concise, and friendly manner.`;

export const chatCompletion = async (messages, model = "gpt-4o-mini") => {
    const messagesWithSystem = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
    ];

    const response = await axios.post(
        `${process.env.API_BASE}/chat/completions`,
        {
            model,
            messages: messagesWithSystem,
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`,
                "Content-Type": "application/json",
            },
        }
    );
    return response.data;
};

export const analyzeCreditWithAI = async (mlData) => {
    const { credit_score, behavioral_insights, ml_engine_diagnostics, market_analysis } = mlData;
    const { financial_health_metrics, category_distribution, ai_verdict } = behavioral_insights;

    const prompt = `You are a financial analyst. Based on the following credit report data, provide a summary within 150 words. Include:
1. Key financial insights from the data.
2. A clear reason why the CIBIL score of ${credit_score} is considered ${market_analysis.status.toLowerCase()}.
3. Any risks or strengths worth highlighting.

Credit Report Data:
- CIBIL Score: ${credit_score} (${market_analysis.status})
- Monthly Income (avg): ${financial_health_metrics.monthly_income_avg}
- Savings Rate: ${financial_health_metrics.savings_rate}
- Transparency Index: ${financial_health_metrics.transparency_index}
- Risky Spending: ${financial_health_metrics.risky_spending_total}
- Spending Categories: ${JSON.stringify(category_distribution)}
- Risk Status: ${ai_verdict.risk_status}
- Primary Impact Factor: ${ai_verdict.primary_impact_factor}
- Stability Bonus: ${ai_verdict.stability_bonus}
- Probability of Default: ${ml_engine_diagnostics.probability_of_default}
- NLP Classification Confidence: ${ml_engine_diagnostics.nlp_classification_confidence}
- Cash Usage Alert: ${market_analysis.cash_usage_alert}

Respond in plain English. Be concise, friendly, and stay within 150 words.`;

    const messagesWithSystem = [
        { role: "system", content: "You are a financial assistant for BharatCred. Summarize credit reports clearly and concisely." },
        { role: "user", content: prompt },
    ];

    const response = await axios.post(
        `${process.env.API_BASE}/chat/completions`,
        { model: "gpt-4o-mini", messages: messagesWithSystem },
        {
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`,
                "Content-Type": "application/json",
            },
        }
    );
    return response.data.choices[0].message.content;
};
