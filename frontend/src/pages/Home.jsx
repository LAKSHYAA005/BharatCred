import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { Button } from '../components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion'

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
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const openBankStatementPicker = () => {
    bankStatementInputRef.current?.click()
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
    <div className="w-full py-8">
      <section className="flex w-full items-start pt-6">
        <div className="min-w-0 w-full max-w-5xl space-y-7">
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
              >
                Check Credit Score
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

          {/* Loading */}
          {loading && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Analysing your bank statement — this may take 15–30 seconds…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive">
              {error}
            </div>
          )}

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
              src="/logo.png"
              alt="Credit score insights"
              width="560"
              height="360"
              loading="lazy"
              className="h-auto w-full rounded-xl object-contain"
            />
          </div>
          <div className="order-2 space-y-4">
            <h2 className="text-2xl font-semibold sm:text-3xl">Why Our Credit Score</h2>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Our score view explains what is helping and hurting your profile, so you can focus on the right financial actions.
              Instead of showing just a number, BharatCred highlights behavior patterns and practical next steps that improve your
              credit health over time.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full pb-14">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="order-2 space-y-4 md:order-1">
            <h2 className="text-2xl font-semibold sm:text-3xl">How to Use It</h2>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Sign in and upload your bank statement.
              Review your score factors and trend indicators.
              Follow the suggestions to improve repayment behavior and utilization.
              Recheck regularly to track progress.
            </p>
          </div>
          <div className="order-1 md:order-2">
            <img
              src="/banks/hdfc.png"
              alt="How to use BharatCred"
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
              How do I upload my bank statement?
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">
              Click on Submit Bank Statements and choose your PDF file to begin.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="rounded-xl border border-border/70 px-4">
            <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline">
              How can I check my credit score?
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">
              Use the Check Credit Score button from the home page.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="rounded-xl border border-border/70 px-4">
            <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline">
              Do I need to sign in first?
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">
              Yes, sign in to access all features and save your progress securely.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  )
}
