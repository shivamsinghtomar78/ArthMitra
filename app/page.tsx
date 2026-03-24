import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"
import { FeaturesGrid } from "@/components/landing/FeaturesGrid"
import { HeroSection } from "@/components/landing/HeroSection"
import { HowItWorks } from "@/components/landing/HowItWorks"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <section className="border-b border-line bg-surface py-4">
        <div className="section-shell flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p className="text-sm font-medium text-bodyText">
            Trusted by 10,000+ Indians managing their finances
          </p>
          <p className="text-sm text-mutedText">★★★★★ 4.9/5 from early users</p>
        </div>
      </section>
      <FeaturesGrid />
      <HowItWorks />
      <Footer />
    </main>
  )
}
