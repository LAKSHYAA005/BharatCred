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
    const { financial_health_metrics, category_distribution, ai_verdict, spending_breakdown_rupees } = behavioral_insights;

    const spendingInfo = spending_breakdown_rupees
        ? `- Investment Spending: ${spending_breakdown_rupees.total_investment}
- Risky Spending: ${spending_breakdown_rupees.total_risky}
- Leisure Spending: ${spending_breakdown_rupees.total_leisure}
- Essential Spending: ${spending_breakdown_rupees.total_essential}`
        : `- Risky Spending: ${financial_health_metrics.risky_spending_total || "N/A"}`;

    const prompt = `You are a financial analyst for BharatCred. Analyze the following credit report and respond ONLY with a valid JSON object in this exact format:
{
  "summary": "A detailed overview of the person's financial health and CIBIL score of ${credit_score} in approximately 150 words.",
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4", "strength 5"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3", "weakness 4", "weakness 5"],
  "improvements": ["actionable tip 1", "actionable tip 2", "actionable tip 3", "actionable tip 4", "actionable tip 5"]
}

Rules:
- summary: must be approximately 150 words, covering overall financial health, score reasoning, and key observations
- strengths: 4-5 specific reasons why the score is at its current level (positive factors)
- weaknesses: 4-5 specific reasons holding the score back or increasing risk
- improvements: 4-5 concrete, actionable steps the person can take to improve their CIBIL score
- Be direct, friendly, and specific to the data provided
- Return ONLY the JSON, no extra text

Credit Report Data:
- CIBIL Score: ${credit_score} (${market_analysis.status})
- Monthly Income (avg): ${financial_health_metrics.monthly_income_avg}
- Savings Rate: ${financial_health_metrics.savings_rate}
- Transparency Index: ${financial_health_metrics.transparency_index}
${spendingInfo}
- Spending Categories: ${JSON.stringify(category_distribution)}
- Risk Status: ${ai_verdict.risk_status}
- Primary Impact Factor: ${ai_verdict.primary_impact_factor}
- Stability Bonus: ${ai_verdict.stability_bonus}
- Probability of Default: ${ml_engine_diagnostics.probability_of_default}
- NLP Classification Confidence: ${ml_engine_diagnostics.nlp_classification_confidence}
- Capacity Multiplier: ${ml_engine_diagnostics.capacity_multiplier_used}
- Cash Usage Alert: ${market_analysis.cash_usage_alert}`;

    const messagesWithSystem = [
        { role: "system", content: "You are a financial assistant for BharatCred. Analyze credit reports and always respond with valid JSON only." },
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

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
};
