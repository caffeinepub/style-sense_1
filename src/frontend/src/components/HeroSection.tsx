import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onAnalyze: () => void;
}

export function HeroSection({ onAnalyze }: HeroSectionProps) {
  return (
    <section
      className="relative overflow-hidden bg-background bg-vignette pt-16 pb-24"
      data-ocid="hero.section"
    >
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-[600px]">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col justify-center"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={16} className="text-gold" />
              <span className="font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                AI-Powered Fashion Analysis
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              Your Personal
              <br />
              <em className="not-italic text-primary">AI Stylist</em>
            </h1>

            <p className="font-body text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
              Upload your photo. Our AI detects your skin tone, builds a
              personalized color palette, and recommends outfits uniquely
              crafted for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onAnalyze}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-navy-light font-body font-semibold px-8 py-4 h-auto text-base rounded-xl group"
                data-ocid="hero.primary_button"
              >
                Analyze My Style
                <ArrowRight
                  size={18}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="font-body font-medium text-base border-border hover:bg-secondary rounded-xl h-auto py-4"
                data-ocid="hero.secondary_button"
              >
                How It Works
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-border">
              <div className="text-center">
                <p className="font-display font-bold text-2xl text-foreground">
                  10K+
                </p>
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">
                  Styles Analyzed
                </p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="font-display font-bold text-2xl text-foreground">
                  98%
                </p>
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">
                  Satisfaction Rate
                </p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="font-display font-bold text-2xl text-foreground">
                  50+
                </p>
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">
                  Color Palettes
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Fashion Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative flex justify-center"
          >
            <div className="relative w-full max-w-md">
              {/* Decorative background shape */}
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background:
                    "linear-gradient(135deg, #D4A940 0%, #C16A5A 40%, #162A4A 100%)",
                  transform: "rotate(3deg) scale(1.03)",
                  opacity: 0.15,
                }}
              />
              <img
                src="/assets/generated/hero-fashion-model.dim_600x750.jpg"
                alt="Fashion model wearing earth-tone ensemble"
                className="relative w-full rounded-3xl object-cover shadow-elevated"
                style={{ aspectRatio: "4/5", maxHeight: "560px" }}
              />
              {/* Floating palette chip */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -left-6 bottom-16 bg-card rounded-2xl shadow-elevated p-4 hidden md:block"
              >
                <p className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Your Palette
                </p>
                <div className="flex gap-1.5">
                  {[
                    "#C16A5A",
                    "#D4A940",
                    "#228B22",
                    "#008080",
                    "#162A4A",
                    "#800020",
                  ].map((c) => (
                    <div
                      key={c}
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* AI badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="absolute -right-4 top-8 bg-primary text-primary-foreground rounded-2xl shadow-elevated px-4 py-3 hidden md:flex items-center gap-2"
              >
                <Sparkles size={16} />
                <span className="font-body text-sm font-semibold">
                  AI Analysis
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
