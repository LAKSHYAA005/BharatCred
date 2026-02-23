from fastapi import FastAPI
import joblib
import pandas as pd
from pydantic import BaseModel
from typing import List
import uvicorn

app = FastAPI()

# ==========================================
# 1. TRAIN THE BRAIN (Runs once on startup)
# ==========================================
def train_model():
    print("🧠 Reading CSV and training the AI...")
    try:
        df = pd.read_csv('processed_credit_features.csv')
        X = df[['total_spend', 'essential_ratio', 'investment_ratio', 'leisure_ratio', 'risky_ratio']]
        y = df['is_safe']
        model = pd.Series(RandomForestClassifier(n_estimators=100).fit(X, y)) # Quick fix for demo
        from sklearn.ensemble import RandomForestClassifier
        model = RandomForestClassifier(n_estimators=100)
        model.fit(X, y)
        joblib.dump(model, 'credit_brain.pkl')
        print("✅ AI Brain is trained and saved!")
    except Exception as e:
        print(f"❌ Training Error: {e}")

# ==========================================
# 2. CATEGORIZER (Turning Text into Numbers)
# ==========================================
def get_category(text):
    text = text.lower()
    if any(k in text for k in ['salary', 'refund', 'interest']): return 'Income'
    if any(k in text for k in ['zomato', 'swiggy', 'pvr', 'movie', 'mall']): return 'Leisure'
    if any(k in text for k in ['rent', 'electricity', 'groceries', 'milk']): return 'Essential'
    if any(k in text for k in ['dream11', 'rummy', 'casino', 'stake', 'bet']): return 'Risky'
    if any(k in text for k in ['fund', 'sip', 'stock', 'lic']): return 'Investment'
    return 'Other'

class Transaction(BaseModel):
    description: str
    amount: float

# ==========================================
# 3. DYNAMIC SCORING ENGINE
# ==========================================
@app.post("/get-score")
def calculate_score(txns: List[Transaction]):
    df_raw = pd.DataFrame([t.dict() for t in txns])
    df_raw['cat'] = df_raw['description'].apply(get_category)
    
    # Logic: treat negative as spend, positive as income (standard banking)
    total_income = df_raw[df_raw['cat'] == 'Income']['amount'].sum()
    total_spend = df_raw[df_raw['amount'] < 0]['amount'].abs().sum()
    
    if total_spend == 0: return {"credit_score": 300}

    # Ratio Math
    ess = df_raw[df_raw['cat'] == 'Essential']['amount'].abs().sum() / total_spend
    inv = df_raw[df_raw['cat'] == 'Investment']['amount'].abs().sum() / total_spend
    lei = df_raw[df_raw['cat'] == 'Leisure']['amount'].abs().sum() / total_spend
    ris = df_raw[df_raw['cat'] == 'Risky']['amount'].abs().sum() / total_spend

    # A. Get AI Base (from pkl)
    model = joblib.load('credit_brain.pkl')
    features = pd.DataFrame([[total_spend, ess, inv, lei, ris]], 
                            columns=['total_spend', 'essential_ratio', 'investment_ratio', 'leisure_ratio', 'risky_ratio'])
    
    ai_prob = model.predict_proba(features)[0][1] 

    # B. DYNAMIC MATH (To prevent 900/300 jumps)
    # Start with a base of 400 + AI contribution (max 300)
    base = 400 + (ai_prob * 300) 
    
    # Add behavioral adjustments
    savings_rate = (total_income - total_spend) / total_income if total_income > 0 else 0
    savings_mod = savings_rate * 100  # Up to +100 for saving 100%
    invest_mod = inv * 100           # Up to +100 for high investment
    risky_mod = ris * 250            # Up to -250 for heavy gambling

    final_score = int(base + savings_mod + invest_mod - risky_mod)
    
    # Bound the score realistically
    final_score = max(300, min(880, final_score))

    return {
        "credit_score": final_score,
        "financial_health": {
            "income": round(total_income, 2),
            "savings_potential": f"{round(savings_rate*100)}%",
            "risk_warning": "High" if ris > 0.1 else "Normal"
        }
    }

if __name__ == "__main__":
    train_model()
    uvicorn.run(app, host="127.0.0.1", port=8000)