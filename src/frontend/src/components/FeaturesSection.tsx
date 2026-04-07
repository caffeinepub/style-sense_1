import { Palette, Scan, Shirt, Zap } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Scan,
    title: "Skin Tone Detection",
    description:
      "Our AI analyzes your unique skin tone from your photo with precision, identifying undertones (warm, cool, neutral) to build a truly personalized palette.",
    tag: "AI-Powered",
    accent: "#C16A5A",
  },
  {
    icon: Palette,
    title: "Color Palette",
    description:
      "Receive a curated palette of 6 colors scientifically matched to your skin tone, with exact hex codes so you can shop with confidence.",
    tag: "Personalized",
    accent: "#D4A940",
  },
  {
    icon: Shirt,
    title: "Outfit Recommendations",
    description:
      "Get 4 complete outfit recommendations styled around your color palette — each with occasion, description, and specific color combinations.",
    tag: "Styled for You",
    accent: "#008080",
  },
  {
    icon: Zap,
    title: "Instant Analysis",
    description:
      "Powered by Groq's lightning-fast inference, get your full style analysis in seconds. No waiting, no subscriptions — just instant fashion intelligence.",
    tag: "Real-Time",
    accent: "#162A4A",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24 bg-cream-light"
      data-ocid="features.section"
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
            WHY STYLE SENSE
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Intelligence Meets Style
          </h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mt-4" />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow"
              data-ocid={`features.item.${i + 1}`}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${feature.accent}20` }}
              >
                <feature.icon size={22} style={{ color: feature.accent }} />
              </div>
              <span
                className="inline-block font-body text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full mb-3"
                style={{
                  backgroundColor: `${feature.accent}15`,
                  color: feature.accent,
                }}
              >
                {feature.tag}
              </span>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
