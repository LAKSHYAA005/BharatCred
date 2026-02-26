from fastapi import FastAPI
import joblib
import pandas as pd
import numpy as np
from pydantic import BaseModel
from typing import List
import uvicorn
import warnings
import re
warnings.filterwarnings("ignore", category=UserWarning)

app = FastAPI()

# ==========================================
# 1. LOAD THE DUAL MODELS
# ==========================================
try:
    nlp_model = joblib.load('credit_brain.pkl')
    pd_model = joblib.load('pd_model.pkl')
except Exception as e:
    nlp_model = None
    pd_model = None
    print(f"⚠️ Warning: Model files not found! Error: {e}")

class Transaction(BaseModel):
    description: str
    amount: float
    date: str 

@app.post("/get-score")
def calculate_score(txns: List[Transaction]):
    # A. PRE-PROCESSING
    df = pd.DataFrame([t.model_dump() for t in txns])

    # Parse ISO dates strictly first (YYYY-MM-DD) to avoid day/month inversion.
    # Fallback to mixed day-first parsing only for non-ISO strings.
    raw_dates = df['date'].astype(str).str.strip()
    iso_mask = raw_dates.str.match(r'^\d{4}-\d{2}-\d{2}$')
    parsed_dates = pd.Series(pd.NaT, index=df.index, dtype='datetime64[ns]')
    parsed_dates.loc[iso_mask] = pd.to_datetime(raw_dates.loc[iso_mask], format='%Y-%m-%d', errors='coerce')
    parsed_dates.loc[~iso_mask] = pd.to_datetime(raw_dates.loc[~iso_mask], format='mixed', dayfirst=True, errors='coerce')

    df['date'] = parsed_dates
    df['month_year'] = df['date'].dt.to_period('M')
    
    # B. NLP CATEGORIZATION (Feature Extraction)
    freq_map = df['description'].value_counts().to_dict()

    INCOME_KEYWORDS = ['salary', 'neftcredit', 'creditinterest', 'freelancecredit', 
                        'interestcredit', 'refund', 'cashback', 'dividend', 'bonuscredit']
    INVESTMENT_KEYWORDS = ['sip', 'elss', 'mutualfund', 'mf', 'equitysip', 'nps', 
                           'ppf', 'indexfund', 'nifty', 'sensex', 'lic', 'insurancepremium',
                           'healthinsurance', 'terminsurance']

    def normalize_text(value: str) -> str:
        lower = str(value).lower().strip()
        return re.sub(r'[^a-z0-9]', '', lower)

    def predict_with_confidence(row):
        if nlp_model is None: return "Essential", 1.0
        desc_normalized = normalize_text(row['description'])

        # Keyword pre-classifier: Income
        if any(k in desc_normalized for k in INCOME_KEYWORDS):
            return "Income", 1.0

        # Keyword pre-classifier: Investment
        if any(k in desc_normalized for k in INVESTMENT_KEYWORDS):
            return "Investment", 1.0

        features = pd.DataFrame([[row['description'], row['amount'], freq_map[row['description']]]], 
                                columns=['text', 'amount', 'freq'])
        probs = nlp_model.predict_proba(features)[0] 
        max_idx = np.argmax(probs)
        return nlp_model.classes_[max_idx], probs[max_idx]

    results = df.apply(predict_with_confidence, axis=1)
    df['cat'] = [r[0] for r in results]
    df['conf'] = [r[1] for r in results]
    
    # C. BEHAVIORAL FEATURES
    # Only count months that have at least one valid (non-NaT) transaction
    valid_months = df[df['month_year'].notna()]['month_year'].nunique()
    total_months = valid_months if valid_months > 0 else 1

    # Income = only positive-amount transactions classified as Income
    # (guards against GPT sending ambiguous credits that the NLP mislabels)
    total_income = df[(df['cat'] == 'Income') & (df['amount'] > 0)]['amount'].sum()
    avg_monthly_income = total_income / total_months if total_months > 0 else 0

    # Actual spending = Essential + Leisure + Risky (investments are savings, not spending)
    essential_spend = df[df['cat'] == 'Essential']['amount'].abs().sum()
    leisure_spend   = df[df['cat'] == 'Leisure']['amount'].abs().sum()
    risky_spend     = df[df['cat'] == 'Risky']['amount'].abs().sum()
    net_spend = max(1, essential_spend + leisure_spend + risky_spend)

    # Savings rate = share of income NOT consumed by expenses
    # (investments count as saved/deployed money, not as spending)
    savings_rate = max(0.0, (total_income - net_spend) / total_income) if total_income > 0 else 0
    risky_amt = risky_spend  # already computed above
    risky_ratio = risky_amt / net_spend if net_spend > 0 else 0

    # CASH BLIND-SPOT DETECTION
    cash_df = df[df['description'].str.contains('ATM|CASH|WITHDRAWAL', case=False)]
    total_cash_withdrawn = cash_df['amount'].abs().sum()
    cash_ratio = total_cash_withdrawn / total_income if total_income > 0 else 0

    # D. THE PD LAYER (LOGISTIC REGRESSION)
    ml_features = np.array([[savings_rate, risky_ratio]])
    
    if pd_model:
        prob_default = pd_model.predict_proba(ml_features)[0][1]
        
        # Blind-Spot Penalty: Increase risk probability if behavior is hidden in cash
        if cash_ratio > 0.3:
            prob_default = min(1.0, prob_default + (cash_ratio * 0.25))
    else:
        prob_default = 0.5 

    # E. NATURAL SCALING
    raw_ml_score = 350 + ((1 - prob_default) * 530)
    
    # F. STABILITY-BOOSTED CAPACITY
    if avg_monthly_income > 0:
        base_mult = 0.45 + (np.log10(avg_monthly_income) / 11)
        
        # Stability Bonus: Rewards 0% Risk + Elite Savings (40%+) + Transparency
        stability_bonus = 0.06 if (risky_ratio == 0 and savings_rate > 0.4 and cash_ratio < 0.2) else 0
        
        capacity_multiplier = min(base_mult + stability_bonus, 1.1)
    else:
        capacity_multiplier = 0.45
        stability_bonus = 0
    
    final_score = int(raw_ml_score * capacity_multiplier)
    final_score = max(300, min(900, final_score))

    # INSIGHTS LOGIC
    if risky_ratio > 0.1:
        primary_driver = "Speculative/Risky Spending Detected"
    elif cash_ratio > 0.3:
        primary_driver = "High Cash Usage (Behavioral Blind-Spot)"
    elif savings_rate < 0.15:
        primary_driver = "Low Monthly Savings Rate"
    else:
        primary_driver = "Consistent Financial Discipline"

   # Extracting exact Rupee amounts for category-specific insights
    # .abs().sum() ensures we get a positive total for debits
    leisure_amt = df[df['cat'] == 'Leisure']['amount'].abs().sum()
    investment_amt = df[df['cat'] == 'Investment']['amount'].abs().sum()
    essential_amt = df[df['cat'] == 'Essential']['amount'].abs().sum()

    return {
        "credit_score": final_score,
        "behavioral_insights": {
            "financial_health_metrics": {
                "monthly_income_avg": f"₹{round(avg_monthly_income, 2)}",
                "savings_rate": f"{round(savings_rate * 100)}%",
                "transparency_index": f"{round((1 - cash_ratio) * 100)}%",
            },
            "spending_breakdown_rupees": {
                "total_income": f"₹{round(total_income, 2)}",
                "total_investment": f"₹{round(investment_amt, 2)}",
                "total_risky": f"₹{round(risky_amt, 2)}",
                "total_leisure": f"₹{round(leisure_amt, 2)}",
                "total_essential": f"₹{round(essential_amt, 2)}"
            },
            "category_distribution": df['cat'].value_counts().to_dict(),
            "ai_verdict": {
                "risk_status": "High" if prob_default > 0.6 else "Moderate" if prob_default > 0.3 else "Low",
                "primary_impact_factor": primary_driver,
                "stability_bonus": "Applied" if stability_bonus > 0 else "Not Eligible"
            }
        },
        "ml_engine_diagnostics": {
            "probability_of_default": f"{round(prob_default * 100, 2)}%",
            "nlp_classification_confidence": f"{round(df['conf'].mean() * 100)}%",
            "capacity_multiplier_used": round(capacity_multiplier, 3)
        },
        "market_analysis": {
            "status": "Excellent" if final_score > 750 else "Good" if final_score > 650 else "High Risk",
            "cash_usage_alert": "High (Action Required)" if cash_ratio > 0.4 else "Normal"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)