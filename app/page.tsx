import { Hero } from '@/components/hero'
import { Features } from '@/components/features'
import { HowItWorks } from '@/components/how-it-works'
import { CTA } from '@/components/cta'
import { Footer } from '@/components/footer'
import Header from '@/components/Header'

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">

  <div
    className="
      absolute
      inset-0
      -z-10
      bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]
      bg-[size:48px_48px]
    "
  />
  <Header />
  <Hero />
  <Features />
  <HowItWorks />
  <CTA />
  <Footer />

</main>
  )
}
