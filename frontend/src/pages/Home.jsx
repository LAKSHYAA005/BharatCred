import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, useAuth } from '@clerk/clerk-react'
import { Button } from '../components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion'
import CreditGauge from '../components/CreditGauge'
import BharatLoading from '../components/BharatLoading'

const partnerLogos = [
  { name: 'Axis Bank', src: '/banks/axis.png' },
  { name: 'HDFC Bank', src: '/banks/hdfc.png' },
  { name: 'ICICI Bank', src: '/banks/icici.png' },
  { name: 'IDFC First Bank', src: '/banks/idfc.png' },
  { name: 'Kotak Mahindra Bank', src: '/banks/kotak.png' },
  { name: 'State Bank of India', src: '/banks/SBI.png' },
  { name: 'Yes Bank', src: '/banks/yesbank.png' },
]

export default function Home() {
  const bankStatementInputRef = useRef(null)
  const [partnerCarouselApi, setPartnerCarouselApi] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checkingScore, setCheckingScore] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { userId } = useAuth()

  const openBankStatementPicker = () => {
    bankStatementInputRef.current?.click()
  }

  const handleCheckCreditScore = async () => {
    if (!userId) return
    setCheckingScore(true)
    setError(null)

    try {
      const response = await fetch(`/api/reports/${userId}`)

      if (response.status === 404) {
        setError('No credit report found. Please submit a bank statement first.')
        return
      }

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to fetch credit report')
      }

      const data = await response.json()
      navigate('/results', { state: { result: data } })
    } catch (err) {
      setError(err.message)
    } finally {
      setCheckingScore(false)
    }
  }

  const handleBankStatementSubmit = async (event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData,
        headers: userId ? { 'x-clerk-user-id': userId } : {},
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Analysis failed')
      }

      const data = await response.json()
      navigate('/results', { state: { result: data } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      event.target.value = ''
    }
  }

  useEffect(() => {
    if (!partnerCarouselApi) {
      return
    }

    const autoplayTimer = setInterval(() => {
      partnerCarouselApi.scrollNext()
    }, 2200)

    return () => {
      clearInterval(autoplayTimer)
    }
  }, [partnerCarouselApi])

  return (
    <>
      {/* Full-screen loading animation for bank statement analysis */}
      {loading && <BharatLoading />}

      <div className="w-full py-8">
        <section className="flex w-full items-center justify-between pt-6 gap-10">
        <div className="min-w-0 w-full max-w-4xl space-y-7">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Smart Credit Intelligence</p>
          <h1 className="text-balance max-w-4xl text-5xl font-bold leading-[1.06] sm:text-6xl lg:text-7xl xl:text-8xl">
            Build Your Credit Journey With Confidence
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
            BharatCred helps you understand your credit profile, track key factors, and make better financial decisions.
          </p>

          <SignedIn>
            <section className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <input
                ref={bankStatementInputRef}
                type="file"
                name="bankStatement"
                aria-label="Upload bank statement PDF"
                accept="application/pdf"
                className="hidden"
                onChange={handleBankStatementSubmit}
              />

              <Button
                type="button"
                onClick={openBankStatementPicker}
                className="h-12 w-full rounded-xl px-4 text-sm font-semibold sm:w-56"
                variant="outline"
              >
                Submit Bank Statement
              </Button>

              <Button
                type="button"
                className="h-12 w-full rounded-xl px-4 text-sm font-semibold sm:w-56"
                onClick={handleCheckCreditScore}
                disabled={checkingScore}
              >
                {checkingScore ? 'Loading…' : 'Check Credit Score'}
              </Button>
            </section>
          </SignedIn>

          <SignedOut>
            <section className="mt-7 w-full">
              <SignInButton mode="redirect">
                <Button
                  type="button"
                  className="h-12 w-full rounded-xl px-4 text-sm font-semibold sm:w-56"
                >
                  Check Credit Score
                </Button>
              </SignInButton>
            </section>
          </SignedOut>

          {/* Loading - only show inline loader for checking score */}
          {checkingScore && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Fetching your saved credit report…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive">
              {error}
            </div>
          )}

        </div>

        {/* Credit Score Gauge - visible on larger screens */}
        <div className="hidden lg:flex items-center justify-center">
          <CreditGauge decorative={true} />
        </div>
      </section>

      <section className="relative left-1/2 right-1/2 mt-24 w-screen -translate-x-1/2 px-4 pb-14 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-center text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">Our Trusted Partners</h2>

        <Carousel setApi={setPartnerCarouselApi} opts={{ align: 'start', loop: true }} className="w-full px-12">
          <CarouselContent>
            {partnerLogos.length > 0 ? (
              partnerLogos.map((logo) => (
                <CarouselItem key={logo.src} className="basis-1/2 md:basis-1/4 lg:basis-1/5">
                  <div className="flex h-24 items-center justify-center rounded-xl border border-border bg-card p-4">
                    <img
                      src={logo.src}
                      alt={logo.name}
                      width="160"
                      height="64"
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </CarouselItem>
              ))
            ) : (
              <CarouselItem className="basis-full">
                <div className="flex h-24 items-center justify-center rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                  Partner logos are unavailable right now.
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious aria-label="Previous partner" className="left-2" />
          <CarouselNext aria-label="Next partner" className="right-2" />
        </Carousel>
      </section>

      <section className="w-full pb-14">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="order-1">
            <img
              src="/images-Photoroom.png"
              alt="Credit score insights"
              width="560"
              height="360"
              loading="lazy"
              className="h-auto w-full object-contain"
            />
          </div>
          <div className="order-2 space-y-4">
            <h2 className="text-2xl font-semibold sm:text-3xl">Why Our Credit Score</h2>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              BharatScore provides a behavioral-first alternative to traditional credit systems. By auditing UPI transactions with NLP, it rewards financial discipline rather than just loan history. It eliminates information asymmetry by identifying cash blind-spots and offers precise risk insights through a Machine Learning-driven Probability of Default. It is a fairer, real-time diagnostic for modern earners.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full pb-14">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="order-2 space-y-4 md:order-1">
            <h2 className="text-2xl font-semibold sm:text-3xl">Is your bank statement telling the whole story?</h2>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Traditional scores ignore the nuances of your daily discipline. BharatScore audits your real-world UPI patterns with NLP to reward the financial integrity others miss. It's a fairer, real-time diagnostic that turns your transaction history into a verified asset.
            </p>
          </div>
          <div className="order-1 md:order-2">
            <img
              src="/bank-statement.png"
              alt="Bank statement analysis"
              width="560"
              height="360"
              loading="lazy"
              className="h-auto w-full rounded-xl object-contain"
            />
          </div>
        </div>
      </section>

      <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Frequently Asked Questions</h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Find quick answers about uploading statements, checking your score, and getting started.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          <AccordionItem value="faq-1" className="rounded-xl border border-border/70 px-4">
            <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline">
              How does BharatScore differ from my CIBIL score?
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">
              Traditional scores like CIBIL primarily track your history with loans and credit cards. BharatScore is a behavioral-first alternative that audits your everyday UPI transactions using NLP to reward financial discipline, even if you have no prior loan history.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="rounded-xl border border-border/70 px-4">
            <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline">
              Is my bank statement data secure?
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">
              Your privacy is our priority. BharatCred uses an automated ML pipeline to extract behavioral patterns without storing your raw transaction descriptions. We analyze financial markers like savings rates and risk ratios rather than personal details.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="rounded-xl border border-border/70 px-4">
            <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline">
              What counts as "Risky Spending" in my audit?
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">
              Our engine identifies high-frequency outflows to speculative platforms, such as gambling apps or high-stakes trading, which can spike your Probability of Default (PD) and lower your overall score.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-4" className="rounded-xl border border-border/70 px-4">
            <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline">
              Can I improve my score if I have high cash usage?
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">
              Yes. High cash usage creates blind spots in your profile. By switching to digital UPI payments, you increase your Transparency Index, which helps the model grant you a higher stability bonus.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-5" className="rounded-xl border border-border/70 px-4">
            <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline">
              Why did my score decrease despite a high income?
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">
              BharatScore uses logarithmic scaling for income. Having a high salary isn't enough—the model also checks your Savings Rate and Leisure-to-Essential spending ratio to ensure you have a sufficient cushion to repay debts.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-6" className="rounded-xl border border-border/70 px-4">
            <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline">
              How often can I re-check my score?
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">
              You can refresh your audit whenever you have a new month of transaction data. Regular checks help you track how changes in your spending habits directly impact your market reliability.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
    </>
  )
}
