import { BrowserRouter, Routes, Route } from "react-router-dom";
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
  Dashboard,
} from "@/sections";
import { IncidentsPage }     from "@/sections/IncidentsPage";
import { LiveFeedPage }      from "@/sections/LiveFeedPage";
import { JudgeLayerPage }    from "@/sections/JudgeLayerPage";
import { CompliancePage }    from "@/sections/CompliancePage";
import { AgentHealthPage }   from "@/sections/AgentHealthPage";
import { SimulatorPage }     from "@/sections/SimulatorPage";
import { PolicyBuilderPage } from "@/sections/PolicyBuilderPage";
import { AnalyticsPage }     from "@/sections/AnalyticsPage";
import { ReviewQueuePage }   from "@/sections/ReviewQueuePage";
import { SettingsPage }      from "@/sections/SettingsPage";

function LandingPage() {
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Tier-1 active dashboard routes */}
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/incidents"    element={<IncidentsPage />} />
        <Route path="/live-feed"    element={<LiveFeedPage />} />
        <Route path="/judge-layer"  element={<JudgeLayerPage />} />
        <Route path="/compliance"   element={<CompliancePage />} />
        <Route path="/agent-health" element={<AgentHealthPage />} />

        {/* Tier-2 coming-next routes */}
        <Route path="/simulator"      element={<SimulatorPage />} />
        <Route path="/policy-builder" element={<PolicyBuilderPage />} />
        <Route path="/analytics"      element={<AnalyticsPage />} />
        <Route path="/review-queue"   element={<ReviewQueuePage />} />
        <Route path="/settings"       element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
