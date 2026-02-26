import mongoose from 'mongoose';

const creditReportSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    credit_score: Number,
    risk_category: String,
    behavioral_insights: {
      financial_health_metrics: {
        monthly_income_avg: mongoose.Schema.Types.Mixed,
        savings_rate: mongoose.Schema.Types.Mixed,
        transparency_index: mongoose.Schema.Types.Mixed,
      },
      spending_breakdown_rupees: {
        total_income: mongoose.Schema.Types.Mixed,
        total_essential: mongoose.Schema.Types.Mixed,
        total_investment: mongoose.Schema.Types.Mixed,
        total_leisure: mongoose.Schema.Types.Mixed,
        total_risky: mongoose.Schema.Types.Mixed,
      },
      ai_verdict: {
        primary_impact_factor: String,
        risk_status: String,
        stability_bonus: mongoose.Schema.Types.Mixed,
      },
      category_distribution: mongoose.Schema.Types.Mixed,
    },
    ml_engine_diagnostics: {
      probability_of_default: mongoose.Schema.Types.Mixed,
      nlp_classification_confidence: mongoose.Schema.Types.Mixed,
      capacity_multiplier_used: mongoose.Schema.Types.Mixed,
    },
    market_analysis: {
      status: String,
      cash_usage_alert: String,
    },
    ai_summary: {
      summary: String,
      strengths: [String],
      weaknesses: [String],
      improvements: [String],
    },
    parsed_transactions: [
      {
        date: String,
        description: String,
        amount: Number,
      },
    ],
  },
  { timestamps: true }
);

const CreditReport = mongoose.model('CreditReport', creditReportSchema);

export default CreditReport;
