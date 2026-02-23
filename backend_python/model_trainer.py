#import pandas as pd
#from sklearn.ensemble import RandomForestClassifier
#import joblib
#
#df = pd.read_csv('train_data.csv')
#X = df.drop('is_safe', axis=1)
#y = df['is_safe']
#
#model = RandomForestClassifier(n_estimators=100)
#model.fit(X, y)
#joblib.dump(model, 'credit_brain.pkl')
#print("✅ Brain Trained!")
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
import joblib

# 1. THE NLP KNOWLEDGE BASE (Random Forest Training)
# Trains the AI to understand Indian UPI context (Suresh, Ankit, etc.)
data = [
    ("NEFT BVP LTD SALARY", 60000, 1, "Income"),
    ("SALARY", 25000, 1, "Income"),
    ("RENT-TRANSFER", -6000, 1, "Essential"),
    ("ANKIT", -20, 25, "Essential"), 
    ("SURESH", -2200, 4, "Essential"),
    ("SUNITA", -1000, 1, "Essential"),
    ("JAIN-STORE", -2000, 1, "Essential"),
    ("SIP-GROWW", -2000, 1, "Investment"),
    ("ZERODHA", -8000, 1, "Investment"),
    ("ZOMATO", -450, 10, "Leisure"),
    ("DREAM11", -5000, 5, "Risky"),
    ("STAKE-CASINO", -15000, 2, "Risky")
] * 100 

df = pd.DataFrame(data, columns=['text', 'amount', 'freq', 'label'])

preprocessor = ColumnTransformer([
    ('text', TfidfVectorizer(ngram_range=(1, 2)), 'text'),
    ('num', StandardScaler(), ['amount', 'freq'])
])

nlp_clf = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])

nlp_clf.fit(df[['text', 'amount', 'freq']], df['label'])

# 2. THE PD (PROBABILITY OF DEFAULT) DATASET
# TARGET: 0 = SAFE (Good Borrower), 1 = DEFAULT (High Risk)
# Features: [Savings_Rate, Risky_Spending_Ratio]
pd_train_data = [
    # [Savings, Risk, Target]
    [0.60, 0.00, 0], [0.50, 0.02, 0], [0.40, 0.05, 0], # High Savings/No Risk = SAFE (0)
    [0.05, 0.50, 1], [0.10, 0.40, 1], [0.02, 0.60, 1], # Low Savings/High Risk = DEFAULT (1)
    [0.25, 0.10, 0], [0.15, 0.30, 1], [0.20, 0.20, 1]  # Mixed cases
] * 200 

pd_df = pd.DataFrame(pd_train_data, columns=['savings', 'risk', 'target'])
pd_model = LogisticRegression()
pd_model.fit(pd_df[['savings', 'risk']], pd_df['target'])

# 3. SAVE BOTH MODELS
joblib.dump(nlp_clf, 'credit_brain.pkl')  # The NLP Detective
joblib.dump(pd_model, 'pd_model.pkl')     # The Risk Judge
print("✅ Full ML Pipeline Trained: NLP Detective + PD Judge (Corrected Logic)")