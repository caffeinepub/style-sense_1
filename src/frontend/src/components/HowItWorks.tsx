import { Brain, Stars, Upload } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload Your Photo",
    description:
      "Take a photo or upload an existing one. For best results, use a clear, well-lit photo of your face without heavy filters.",
    color: "#C16A5A",
  },
  {
    step: "02",
    icon: Brain,
    title: "AI Analyzes",
    description:
      "Our vision AI powered by Groq's ultra-fast inference examines your skin tone, undertones, and unique complexion characteristics.",
    color: "#162A4A",
  },
  {
    step: "03",
    icon: Stars,
    title: "Get Recommendations",
    description:
      "Receive your personalized color palette with 6 curated swatches and 4 complete outfit recommendations tailored specifically for you.",
    color: "#D4A940",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-background"
      data-ocid="how-it-works.section"
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            SIMPLE PROCESS
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            How It Works
          </h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mt-4" />
        </motion.div>

        <div className="relative">
          {/* Connector line - desktop */}
          <div className="hidden lg:block absolute top-20 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center"
                data-ocid={`how-it-works.item.${i + 1}`}
              >
                {/* Step number circle */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6 relative z-10 shadow-card"
                  style={{ backgroundColor: step.color }}
                >
                  <step.icon size={24} color="white" />
                </div>

                <span
                  className="font-display font-bold text-5xl absolute -top-4 -right-2 opacity-[0.07] pointer-events-none select-none"
                  style={{ color: step.color }}
                >
                  {step.step}
                </span>

                <div className="bg-card rounded-2xl p-6 shadow-card border border-border w-full">
                  <div
                    className="font-body text-xs font-bold uppercase tracking-widest mb-3"
                    style={{ color: step.color }}
                  >
                    Step {step.step}
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
