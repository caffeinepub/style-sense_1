import { Toaster } from "@/components/ui/sonner";
import { useCallback } from "react";
import { AnalysisHub } from "./components/AnalysisHub";
import { FeaturesSection } from "./components/FeaturesSection";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { HowItWorks } from "./components/HowItWorks";
import { Navbar } from "./components/Navbar";
import { OutfitShowcase } from "./components/OutfitShowcase";

export default function App() {
  const scrollToAnalysis = useCallback(() => {
    document
      .getElementById("analysis-hub")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      <Navbar onTryNow={scrollToAnalysis} />
      <main>
        <HeroSection onAnalyze={scrollToAnalysis} />
        <AnalysisHub />
        <FeaturesSection />
        <OutfitShowcase />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
