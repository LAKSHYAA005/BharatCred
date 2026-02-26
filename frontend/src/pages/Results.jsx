import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'

function MetricCard({ label, value, sub }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value ?? '—'}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
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
    <div className="w-full space-y-10 py-8">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">BharatCred</p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Credit Report</h1>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>← New Analysis</Button>
      </div>

      {/* Score hero */}
      <div className="flex flex-col items-center gap-2 rounded-3xl border border-border bg-card py-10 text-center sm:flex-row sm:items-center sm:gap-10 sm:px-12 sm:text-left">
        <div className={`flex h-32 w-32 shrink-0 items-center justify-center rounded-full ring-4 ${scoreRingColor}`}>
          <span className={`text-5xl font-extrabold ${scoreColor}`}>{score}</span>
        </div>
        <div className="space-y-1">
          <p className={`text-2xl font-bold ${scoreColor}`}>{market.status}</p>
          <p className="text-muted-foreground">{verdict.primary_impact_factor}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            <span className="rounded-full border border-border px-3 py-1 text-xs">
              Risk: <span className="font-semibold">{verdict.risk_status}</span>
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-xs">
              Stability Bonus: <span className="font-semibold">{verdict.stability_bonus}</span>
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-xs">
              Cash Usage: <span className="font-semibold">{market.cash_usage_alert}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Financial Health */}
      <Section title="Financial Health Metrics">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MetricCard label="Avg Monthly Income" value={metrics.monthly_income_avg} />
          <MetricCard label="Savings Rate" value={metrics.savings_rate} sub="income minus expenses / income" />
          <MetricCard label="Transparency Index" value={metrics.transparency_index} sub="non-cash transactions" />
        </div>
      </Section>

      {/* Spending Breakdown */}
      <Section title="Spending Breakdown">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
            <div key={cat} className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
              <span className="font-medium">{cat}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{count} txns</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ML Diagnostics */}
      <Section title="Model Diagnostics">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MetricCard label="Probability of Default" value={diag.probability_of_default} />
          <MetricCard label="NLP Confidence" value={diag.nlp_classification_confidence} />
          <MetricCard label="Capacity Multiplier" value={diag.capacity_multiplier_used} />
        </div>
      </Section>

      {/* AI Summary */}
      {ai && (
        <Section title="AI Financial Analysis">
          <div className="rounded-2xl border border-border bg-card px-6 py-6 space-y-6">
            <p className="text-base leading-relaxed text-muted-foreground">{ai.summary}</p>

            <div className="grid gap-6 sm:grid-cols-3">
              {/* Strengths */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-green-500">
                  Strengths
                </p>
                <ul className="space-y-2">
                  {ai.strengths?.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-0.5 text-green-500">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-red-500">
                  Weaknesses
                </p>
                <ul className="space-y-2">
                  {ai.weaknesses?.map((w, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-0.5 text-red-400">✗</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-400">
                  How to Improve
                </p>
                <ul className="space-y-2">
                  {ai.improvements?.map((imp, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-0.5 text-blue-400">→</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Parsed Transactions */}
      {result.parsed_transactions?.length > 0 && (
        <Section title={`Parsed Transactions (${result.parsed_transactions.length})`}>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {result.parsed_transactions.map((txn, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{txn.date}</td>
                    <td className="px-4 py-3">{txn.description}</td>
                    <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${txn.amount >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                      {txn.amount >= 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <div className="pb-12">
        <Button variant="outline" onClick={() => navigate('/')}>← Run Another Analysis</Button>
      </div>
    </div>
  )
}
