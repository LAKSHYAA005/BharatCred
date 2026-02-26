import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import CreditGauge from '../components/CreditGauge'

function MetricCard({ label, value, sub }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card px-6 py-5 hover:shadow-lg hover:border-primary/30 transition-all duration-200">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold">{value ?? '—'}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </div>
  )
}

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state?.result) {
    return (
      <div className="flex flex-col items-center gap-4 py-32 text-center">
        <p className="text-muted-foreground">No results to display.</p>
        <Button onClick={() => navigate('/')}>Go Back Home</Button>
      </div>
    )
  }

  const { result } = state
  const insights = result.behavioral_insights ?? {}
  const metrics = insights.financial_health_metrics ?? {}
  const breakdown = insights.spending_breakdown_rupees ?? {}
  const verdict = insights.ai_verdict ?? {}
  const catDist = insights.category_distribution ?? {}
  const diag = result.ml_engine_diagnostics ?? {}
  const market = result.market_analysis ?? {}
  const ai = result.ai_summary ?? null

  const score = result.credit_score ?? 0
  const scoreColor =
    score >= 750 ? 'text-green-500' : score >= 650 ? 'text-yellow-500' : 'text-red-500'
  const scoreRingColor =
    score >= 750 ? 'bg-green-500/10 ring-green-500/30' : score >= 650 ? 'bg-yellow-500/10 ring-yellow-500/30' : 'bg-red-500/10 ring-red-500/30'

  return (
    <div className="w-full space-y-12 py-8">

      {/* Header row */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">BharatCred</p>
          <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">Credit Report</h1>
        </div>
        <Button variant="outline" size="lg" onClick={() => navigate('/')}>← New Analysis</Button>
      </div>

      {/* Score hero */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Credit Gauge */}
        <div className="flex items-center justify-center rounded-3xl border border-border bg-gradient-to-br from-card to-muted/20 py-12">
          <CreditGauge score={score} />
        </div>

        {/* Right: Summary & Status */}
        <div className="rounded-3xl border border-border bg-card p-8 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Credit Status</p>
            <h2 className={`text-4xl font-extrabold ${scoreColor} mb-2`}>{market.status}</h2>
            <p className="text-lg text-muted-foreground">{verdict.primary_impact_factor}</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm text-muted-foreground">Risk Status</span>
              <span className="font-semibold">{verdict.risk_status}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm text-muted-foreground">Stability Bonus</span>
              <span className="font-semibold">{verdict.stability_bonus}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <span className="text-sm text-muted-foreground">Cash Usage</span>
              <span className="font-semibold">{market.cash_usage_alert}</span>
            </div>
          </div>

          {ai?.summary && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Quick Summary</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {ai.summary}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Financial Health */}
      <Section title="Financial Health Metrics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard label="Avg Monthly Income" value={metrics.monthly_income_avg} />
          <MetricCard label="Savings Rate" value={metrics.savings_rate} sub="income minus expenses / income" />
          <MetricCard label="Transparency Index" value={metrics.transparency_index} sub="non-cash transactions" />
        </div>
      </Section>

      {/* Spending Breakdown */}
      <Section title="Spending Breakdown">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard label="Total Income" value={breakdown.total_income} />
          <MetricCard label="Essential Spend" value={breakdown.total_essential} />
          <MetricCard label="Investments" value={breakdown.total_investment} />
          <MetricCard label="Leisure Spend" value={breakdown.total_leisure} />
          <MetricCard label="Risky Spend" value={breakdown.total_risky} />
        </div>
      </Section>

      {/* Category Distribution */}
      <Section title="Transaction Categories">
        <div className="flex flex-wrap gap-3">
          {Object.entries(catDist).map(([cat, count]) => (
            <div key={cat} className="flex items-center gap-2 rounded-full border border-border bg-gradient-to-r from-card to-muted/20 px-5 py-2.5 text-sm hover:shadow-md transition-shadow">
              <span className="font-medium">{cat}</span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{count} txns</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ML Diagnostics */}
      <Section title="Model Diagnostics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard label="Probability of Default" value={diag.probability_of_default} />
          <MetricCard label="NLP Confidence" value={diag.nlp_classification_confidence} />
          <MetricCard label="Capacity Multiplier" value={diag.capacity_multiplier_used} />
        </div>
      </Section>

      {/* AI Summary */}
      {ai && (
        <Section title="Detailed Financial Analysis">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Strengths */}
            <div className="rounded-2xl border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center ring-2 ring-green-500/30">
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-green-500">
                  Strengths
                </h3>
              </div>
              <ul className="space-y-3">
                {ai.strengths?.map((s, i) => (
                  <li key={i} className="flex gap-3 group">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0 group-hover:scale-150 transition-transform" />
                    <span className="text-sm leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="rounded-2xl border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center ring-2 ring-red-500/30">
                  <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-red-500">
                  Weaknesses
                </h3>
              </div>
              <ul className="space-y-3">
                {ai.weaknesses?.map((w, i) => (
                  <li key={i} className="flex gap-3 group">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0 group-hover:scale-150 transition-transform" />
                    <span className="text-sm leading-relaxed">{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="rounded-2xl border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center ring-2 ring-blue-500/30">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-blue-400">
                  How to Improve
                </h3>
              </div>
              <ul className="space-y-3">
                {ai.improvements?.map((imp, i) => (
                  <li key={i} className="flex gap-3 group">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0 group-hover:scale-150 transition-transform" />
                    <span className="text-sm leading-relaxed">{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      )}

      {/* Parsed Transactions */}
      {result.parsed_transactions?.length > 0 && (
        <Section title={`Transaction History (${result.parsed_transactions.length} transactions)`}>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.parsed_transactions.map((txn, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">{txn.date}</td>
                      <td className="px-6 py-4 text-sm">{txn.description}</td>
                      <td className={`px-6 py-4 text-right text-sm font-semibold whitespace-nowrap ${txn.amount >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                        {txn.amount >= 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>
      )}

      <div className="pb-12">
        <Button variant="outline" onClick={() => navigate('/')}>← Run Another Analysis</Button>
      </div>
    </div>
  )
}
