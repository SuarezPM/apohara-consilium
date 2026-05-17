import {
  Navbar,
  Hero,
  TrustBar,
  TryItPanel,
  HowItWorks,
  Comparison,
  WhyThisMatters,
  CTAFinal,
  Footer,
} from "@/sections";

export default function App() {
  return (
    <div className="min-h-screen">
      <a
        href="#try"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-3 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-pixel-sans focus:text-[11px]"
      >
        Skip to demo
      </a>

      <Navbar />

      <main>
        <Hero />
        <TrustBar />
        <TryItPanel />
        <HowItWorks />
        <Comparison />
        <WhyThisMatters />
        <CTAFinal />
      </main>

      <Footer />
    </div>
  );
}
