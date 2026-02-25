import { useEffect, useRef, useState } from 'react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { Button } from '../components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion'

const partnerLogos = [
  '/banks/axis.png',
  '/banks/hdfc.png',
  '/banks/icici.png',
  '/banks/idfc.png',
  '/banks/kotak.png',
  '/banks/SBI.png',
  '/banks/yesbank.png',
]

export default function Home() {
  const bankStatementInputRef = useRef(null)
  const [partnerCarouselApi, setPartnerCarouselApi] = useState(null)

  const openBankStatementPicker = () => {
    bankStatementInputRef.current?.click()
  }

  const handleBankStatementSubmit = (event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) {
      return
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
    <div className="w-full px-6 py-10 md:px-10 lg:px-14">
      <main className="flex w-full items-start pt-4">
        <div className="max-w-3xl space-y-5">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">Smart Credit Intelligence</p>
          <h1 className="text-5xl font-bold leading-tight text-white md:text-7xl">
            Build your credit journey with confidence.
          </h1>
          <p className="text-lg text-white/75 md:text-xl">
            BharatCred helps you understand your credit profile, track key factors, and make better financial decisions.
          </p>

          <SignedIn>
            <section className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <input
                ref={bankStatementInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleBankStatementSubmit}
              />

              <Button
                type="button"
                onClick={openBankStatementPicker}
                className="h-12 w-full rounded-xl border border-white bg-white! px-4 text-sm font-semibold text-black! shadow-md transition-transform hover:-translate-y-0.5 hover:bg-neutral-100! sm:w-56"
                variant="outline"
              >
                Submit Bank Statements
              </Button>

              <Button
                type="button"
                className="h-12 w-full rounded-xl border border-white bg-white! px-4 text-sm font-semibold text-black! shadow-md transition-transform hover:-translate-y-0.5 hover:bg-neutral-100! sm:w-56"
                variant="outline"
              >
                Check your credit score
              </Button>
            </section>
          </SignedIn>

          <SignedOut>
            <section className="mt-7 w-full">
              <SignInButton mode="redirect">
                <Button
                  type="button"
                  className="h-12 w-full rounded-xl border border-white bg-white! px-4 text-sm font-semibold text-black! shadow-md transition-transform hover:-translate-y-0.5 hover:bg-neutral-100! sm:w-56"
                  variant="outline"
                >
                  Check your credit score
                </Button>
              </SignInButton>
            </section>
          </SignedOut>
        </div>
      </main>

      <section className="mt-14 w-full pb-10">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-white/70">Our trusted partners</h2>

        <Carousel setApi={setPartnerCarouselApi} opts={{ align: 'start', loop: true }} className="w-full px-12">
          <CarouselContent>
            {partnerLogos.map((logo) => (
              <CarouselItem key={logo} className="basis-1/2 md:basis-1/4 lg:basis-1/5">
                <div className="flex h-24 items-center justify-center rounded-xl border border-white/15 bg-white p-4">
                  <img src={logo} alt="Partner bank" className="h-full w-full object-contain" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 border-white/20 bg-white text-black hover:bg-neutral-100" />
          <CarouselNext className="right-0 border-white/20 bg-white text-black hover:bg-neutral-100" />
        </Carousel>
      </section>

      <section className="w-full pb-12">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-white/70">Questions & Answers</h2>

        <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-2">
          <Accordion type="single" collapsible>
            <AccordionItem value="faq-1" className="border-white/15">
              <AccordionTrigger className="text-white">How do I upload my bank statement?</AccordionTrigger>
              <AccordionContent className="text-white/75">
                Click on Submit Bank Statements and choose your PDF file to begin.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="border-white/15">
              <AccordionTrigger className="text-white">How can I check my credit score?</AccordionTrigger>
              <AccordionContent className="text-white/75">
                Use the Check your credit score button from the home page.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3" className="border-white/15">
              <AccordionTrigger className="text-white">Do I need to sign in first?</AccordionTrigger>
              <AccordionContent className="text-white/75">
                Yes, sign in to access all features and save your progress securely.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  )
}
