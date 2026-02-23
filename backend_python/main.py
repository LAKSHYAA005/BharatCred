from fastapi import FastAPI
import joblib
import pandas as pd
import numpy as np
from pydantic import BaseModel
from typing import List
import uvicorn

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
    # A. Pre-Processing
    df = pd.DataFrame([t.dict() for t in txns])
    df['date'] = pd.to_datetime(df['date'])
    df['month_year'] = df['date'].dt.to_period('M')
    
    # B. NLP CATEGORIZATION
    freq_map = df['description'].value_counts().to_dict()

    def predict_with_confidence(row):
        if nlp_model is None: return "Essential", 1.0
        features = pd.DataFrame([[row['description'], row['amount'], freq_map[row['description']]]], 
                                columns=['text', 'amount', 'freq'])
        probs = nlp_model.predict_proba(features)[0] 
        max_idx = np.argmax(probs)
        return nlp_model.classes_[max_idx], probs[max_idx]

    results = df.apply(predict_with_confidence, axis=1)
    df['cat'] = [r[0] for r in results]
    df['conf'] = [r[1] for r in results]
    
    # C. BEHAVIORAL FEATURES
    total_months = df['month_year'].nunique()
    total_income = df[df['cat'] == 'Income']['amount'].sum()
    avg_monthly_income = total_income / total_months if total_months > 0 else 0
    
    total_debits = df[df['amount'] < 0]['amount'].abs().sum()
    non_income_credits = df[(df['amount'] > 0) & (df['cat'] != 'Income')]['amount'].sum()
    net_spend = max(1, total_debits - non_income_credits)
    
    savings_rate = (total_income - net_spend) / total_income if total_income > 0 else 0
    risky_amt = df[df['cat'] == 'Risky']['amount'].abs().sum()
    risky_ratio = risky_amt / net_spend if net_spend > 0 else 0

    # NEW: Cash Blind-Spot Detection
    # Detects ATM or Cash Withdrawals to calculate transparency ratio
    cash_df = df[df['description'].str.contains('ATM|CASH|WITHDRAWAL', case=False)]
    total_cash_withdrawn = cash_df['amount'].abs().sum()
    cash_ratio = total_cash_withdrawn / total_income if total_income > 0 else 0

    # D. THE PD LAYER (LOGISTIC REGRESSION)
    ml_features = np.array([[savings_rate, risky_ratio]])
    
    if pd_model:
        prob_default = pd_model.predict_proba(ml_features)[0][1]
        
        # Blind-Spot Penalty: Artificially increase PD if behavior is hidden in cash
        # If cash_ratio > 30%, we start increasing the risk probability
        if cash_ratio > 0.3:
            prob_default = min(1.0, prob_default + (cash_ratio * 0.25))
    else:
        prob_default = 0.5 

    # E. NATURAL SCALING
    raw_ml_score = 350 + ((1 - prob_default) * 530)
    
    # F. STABILITY-BOOSTED CAPACITY
    if avg_monthly_income > 0:
        base_mult = 0.45 + (np.log10(avg_monthly_income) / 11)
        
        # Stability Bonus: Rewards 0% Risk + Elite Savings + Low Cash Usage
        stability_bonus = 0.06 if (risky_ratio == 0 and savings_rate > 0.4 and cash_ratio < 0.2) else 0
        
        capacity_multiplier = min(base_mult + stability_bonus, 1.1)
    else:
        capacity_multiplier = 0.45
    
    final_score = int(raw_ml_score * capacity_multiplier)
    final_score = max(300, min(900, final_score))

    return {
        "credit_score": final_score,
        "ml_pipeline": {
            "probability_of_default": f"{round(prob_default * 100, 2)}%",
            "behavioral_transparency": f"{round((1 - cash_ratio) * 100)}%"
        },
        "market_analysis": {
            "status": "Excellent" if final_score > 750 else "Good" if final_score > 650 else "High Risk",
            "discipline_bonus_applied": True if stability_bonus > 0 else False,
            "cash_usage_alert": "High" if cash_ratio > 0.4 else "Normal"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)