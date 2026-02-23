from fastapi import FastAPI
import joblib
import pandas as pd
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from datetime import timedelta

app = FastAPI()

# ==========================================
# 1. DATA MODELS
# ==========================================
class Transaction(BaseModel):
    description: str
    amount: float  # Negative for Spends, Positive for Income/Credits
    date: str 

# ==========================================
# 2. THE CATEGORIZER (The "Parser")
# ==========================================
def get_category(text, amount):
    text = text.lower()
    
    # Income/Salary (Supports Corporate Names)
    if any(k in text for k in ['salary', 'ltd', 'limited', 'corp', 'bvp', 'refund', 'interest', 'inward']): 
        return 'Income'
    
    # Chemist/Pharmacy (Specific Essential)
    if any(k in text for k in ['chemist', 'pharmacy', 'medicos', 'miglani']):
        return 'Essential'
        
    # Magnitude-Based Logic (e.g., Jain Store)
    if 'jain store' in text:
        return 'Essential' if abs(amount) > 500 else 'Leisure'

    # Leisure (Wants)
    if any(k in text for k in ['zomato', 'swiggy', 'pvr', 'movie', 'mall', 'shopping', 'amazon', 'club', 'restraunt']): 
        return 'Leisure'
    
    # Essential (Needs)
    if any(k in text for k in ['rent', 'bill', 'electricity', 'wifi', 'groceries', 'milk', 'auto', 'chai', 'tea']): 
        return 'Essential'
    
    # Risky (Red Flags)
    if any(k in text for k in ['dream11', 'rummy', 'casino', 'stake', 'bet', 'gaming']): 
        return 'Risky'
    
    # Investment (Green Flags)
    if any(k in text for k in ['fund', 'sip', 'stock', 'lic', 'insurance', 'zerodha', 'groww']): 
        return 'Investment'
        
    return 'Other'

# ==========================================
# 3. HOME ROUTE (Fixes the "Normal Tab" Error)
# ==========================================
@app.get("/")
def home():
    return {
        "project": "Credit_Wise API",
        "status": "Online",
        "docs_url": "/docs",
        "author": "Lakshya Chhabra"
    }

# ==========================================
# 4. THE CORE SCORING ENGINE
# ==========================================
@app.post("/get-score")
def calculate_score(txns: List[Transaction]):
    # A. Initial Processing
    df = pd.DataFrame([t.dict() for t in txns])
    df['date'] = pd.to_datetime(df['date'])
    df['cat'] = df.apply(lambda x: get_category(x['description'], x['amount']), axis=1)
    df['month_year'] = df['date'].dt.to_period('M')
    
    total_months = df['month_year'].nunique()
    total_income = df[df['cat'] == 'Income']['amount'].sum()

    # B. OFFSET LOGIC (The Friend-Split Solver)
    leisure_txns = df[(df['cat'] == 'Leisure') & (df['amount'] < 0)].copy()
    other_credits = df[(df['cat'] == 'Other') & (df['amount'] > 0)].copy()
    
    net_leisure_spend = 0
    for idx, row in leisure_txns.iterrows():
        window_end = row['date'] + timedelta(days=1)
        matches = other_credits[(other_credits['date'] >= row['date']) & (other_credits['date'] <= window_end)]
        
        offset = matches['amount'].sum()
        actual_cost = abs(row['amount']) - offset
        net_leisure_spend += max(0, actual_cost)

    # C. SMART PATTERN RECOGNITION (Rent & Local Vendors)
    other_txns = df[(df['cat'] == 'Other') & (df['amount'] < 0)]
    detected_essential_amt = 0
    stability_points = 0
    
    summary = other_txns.groupby('description').agg({'amount': 'mean', 'month_year': 'nunique', 'description': 'count'})
    for desc, row in summary.iterrows():
        avg_val = abs(row['amount'])
        # Monthly Rent/Fixed (High Value, 2+ months)
        if row['month_year'] >= 2 and avg_val > 3000:
            detected_essential_amt += avg_val * row['month_year']
            stability_points += 40 
        # Local Vendor Pattern (Small Value, 4+ times total)
        elif row['description'] >= 4 and avg_val < 2000:
            detected_essential_amt += avg_val * row['description']
            stability_points += 15

    # D. FINAL FEATURE AGGREGATION
    total_debits = df[df['amount'] < 0]['amount'].abs().sum()
    total_non_income_credits = df[(df['amount'] > 0) & (df['cat'] != 'Income')]['amount'].sum()
    net_spend = total_debits - total_non_income_credits
    
    if net_spend <= 0: return {"credit_score": 300, "message": "No outflow detected"}

    ess_amt = df[df['cat'] == 'Essential']['amount'].abs().sum() + detected_essential_amt
    inv_amt = df[df['cat'] == 'Investment']['amount'].abs().sum()
    ris_amt = df[df['cat'] == 'Risky']['amount'].abs().sum()

    ess_ratio = min(ess_amt / net_spend, 1.0)
    inv_ratio = min(inv_amt / net_spend, 1.0)
    lei_ratio = min(net_leisure_spend / net_spend, 1.0)
    ris_ratio = min(ris_amt / net_spend, 1.0)

    # E. AI PREDICTION (Placeholder logic if model not loaded)
    try:
        model = joblib.load('credit_brain.pkl')
        features = pd.DataFrame([[net_spend/total_months, ess_ratio, inv_ratio, lei_ratio, ris_ratio]], 
                                columns=['total_spend', 'essential_ratio', 'investment_ratio', 'leisure_ratio', 'risky_ratio'])
        ai_prob = model.predict_proba(features)[0][1]
    except:
        ai_prob = 0.5 

    # F. DYNAMIC MATH
    savings_rate = (total_income - net_spend) / total_income if total_income > 0 else 0
    base = 300 + (ai_prob * 400)
    
    final_score = int(base + (inv_ratio * 120) + (savings_rate * 60) + min(stability_points, 100) - (ris_ratio * 250))
    final_score = max(300, min(880, final_score))

    return {
        "credit_score": final_score,
        "analysis": {
            "net_monthly_spend": round(net_spend / total_months, 2),
            "savings_rate": f"{round(savings_rate * 100)}%",
            "friend_splits_reconciled": f"₹{round(total_non_income_credits)}",
            "detected_fixed_obligations": bool(detected_essential_amt > 0)
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)