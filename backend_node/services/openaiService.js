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

    // Dynamic counts based on score
    const strengthCount = credit_score >= 750 ? 5 : credit_score >= 650 ? 4 : 2;
    const weaknessCount = credit_score >= 750 ? 2 : credit_score >= 650 ? 3 : 5;
    const improvementCount = credit_score >= 750 ? 3 : credit_score >= 650 ? 4 : 5;

    const spendingInfo = spending_breakdown_rupees
        ? `- Total Income: ${spending_breakdown_rupees.total_income}
- Investment Spending: ${spending_breakdown_rupees.total_investment}
- Risky Spending: ${spending_breakdown_rupees.total_risky}
- Leisure Spending: ${spending_breakdown_rupees.total_leisure}
- Essential Spending: ${spending_breakdown_rupees.total_essential}`
        : `- Risky Spending: ${financial_health_metrics.risky_spending_total || "N/A"}`;

    const prompt = `You are a financial analyst for BharatCred. Analyze the following credit report and respond ONLY with a valid JSON object in this exact format:
{
  "summary": "A detailed overview of the person's financial health and CIBIL score of ${credit_score} in approximately 150 words.",
  "strengths": ["strength 1", ..., "strength ${strengthCount}"],
  "weaknesses": ["weakness 1", ..., "weakness ${weaknessCount}"],
  "improvements": ["actionable tip 1", ..., "actionable tip ${improvementCount}"]
}

Rules:
- summary: must be approximately 150 words, covering overall financial health, score reasoning, and key observations
- strengths: provide EXACTLY ${strengthCount} specific reasons why the score is at its current level (positive factors)
- weaknesses: provide EXACTLY ${weaknessCount} specific reasons holding the score back or increasing risk
- improvements: provide EXACTLY ${improvementCount} concrete, actionable steps the person can take to improve their CIBIL score
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

export const parsePdfTransactions = async (rawPdfText) => {
    // --- Step A: Extract opening balance from raw text ---
    const obMatch = rawPdfText.match(/Opening Balance[\s\S]*?([\d,]+\.\d{2})/i);
    const openingBalance = obMatch ? parseFloat(obMatch[1].replace(/,/g, '')) : null;

    const prompt = `You are a bank statement parser. Extract all transactions from the following raw text extracted from a PDF bank statement.

Return ONLY a valid JSON array. Each item must have:
- "description": string (the full narration/description)
- "amount": number (see sign rules below)
- "balance": number or null (see balance rules below)
- "date": string (in YYYY-MM-DD format if possible, else as-is)

STEP 1 — CHECK IF THE PDF HAS A BALANCE COLUMN:
Look at the table headers. Does the table have a "Balance" column?

IF YES (Balance column exists):
- "amount": always a POSITIVE number (do NOT determine the sign — it will be computed from balance differences)
- "balance": the running balance AFTER this transaction (always the LAST number on each row)

IF NO (no Balance column — only Debit/Credit or Withdrawal/Deposit):
- "balance": null for every transaction
- "amount": a SIGNED number — you MUST determine the sign:
  • POSITIVE (+) ONLY for: salary, NEFT credits, IMPS received, refunds, cashback, interest credited, dividends
  • NEGATIVE (-) for EVERYTHING else: UPI payments, bills, SIP, EMI, rent, transfers to people, shopping, fuel, charges, subscriptions, personal name transfers (e.g. "Suraj Sharma", "Asha")
  • When in doubt, default to NEGATIVE

OTHER RULES:
- Preserve the FULL description/narration text (include UPI IDs, NEFT references, merchant names).
- Skip non-transaction lines (headers, footers, opening/closing balance rows, totals, page numbers).
- Return ONLY the JSON array, no explanation.

Raw PDF Text:
${rawPdfText.slice(0, 12000)}`;

    const response = await axios.post(
        `${process.env.API_BASE}/chat/completions`,
        {
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a bank statement parser. Always respond with a valid JSON array only." },
                { role: "user", content: prompt },
            ],
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`,
                "Content-Type": "application/json",
            },
        }
    );

    const content = response.data.choices[0].message.content;
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    const rawTxns = JSON.parse(arrayMatch[0]);

    // --- Step B: Determine correct sign using balance differences ---
    let prevBalance = openingBalance;
    const hasBalanceData = rawTxns.some(t => t.balance !== undefined && t.balance !== null);

    const correctedTxns = rawTxns.map((txn) => {
        const currentBalance = txn.balance;

        // Default: keep GPT's original signed amount (don't strip the sign)
        let amount = txn.amount;

        // If we have valid balance data, override with balance-diff (more accurate)
        if (hasBalanceData && prevBalance !== null && currentBalance !== undefined && currentBalance !== null) {
            const diff = currentBalance - prevBalance;
            amount = parseFloat(diff.toFixed(2));
        }

        if (hasBalanceData) {
            prevBalance = currentBalance;
        }

        return {
            description: txn.description,
            amount,
            date: txn.date,
        };
    });

    return correctedTxns;
};
