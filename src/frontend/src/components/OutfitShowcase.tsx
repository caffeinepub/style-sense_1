import { Button } from "@/components/ui/button";
import { Eye, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { OutfitIllustration } from "./OutfitIllustration";
import { VirtualTryOnModal } from "./VirtualTryOnModal";

const outfits = [
  {
    title: "Earth Tone Ensemble",
    occasion: "Casual Day Out",
    description:
      "Warm terracotta blouse with caramel trousers. Effortlessly earthy and perfectly coordinated for warm complexions.",
    colors: ["#C16A5A", "#C68642", "#228B22"],
    rating: 4.9,
    reviews: 142,
  },
  {
    title: "Teal Power Look",
    occasion: "Professional Meeting",
    description:
      "Deep teal blazer over a crisp white shirt with navy trousers. Authority meets elegance in this boardroom-ready outfit.",
    colors: ["#008080", "#F5F5F5", "#162A4A"],
    rating: 4.8,
    reviews: 98,
  },
  {
    title: "Burgundy Evening",
    occasion: "Evening Out",
    description:
      "Rich burgundy dress with gold accessories creates a luxurious evening look that flatters warm and deep skin tones beautifully.",
    colors: ["#800020", "#D4A940", "#2C1A0E"],
    rating: 5.0,
    reviews: 211,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={
            s <= Math.round(rating) ? "fill-gold text-gold" : "text-border"
          }
        />
      ))}
      <span className="font-body text-xs text-muted-foreground ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export function OutfitShowcase() {
  const [tryOnOutfit, setTryOnOutfit] = useState<(typeof outfits)[0] | null>(
    null,
  );
  const [tryOnOpen, setTryOnOpen] = useState(false);

  return (
    <section className="py-24 bg-cream-light" data-ocid="outfits.section">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            CURATED FOR YOU
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Outfit Recommendations
          </h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mt-4" />
          <p className="font-body text-sm text-muted-foreground mt-4 max-w-md mx-auto">
            Discover outfits curated by AI that perfectly complement your unique
            color season.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-7 max-w-5xl mx-auto">
          {outfits.map((outfit, i) => (
            <motion.article
              key={outfit.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="bg-card rounded-2xl shadow-card border border-border overflow-hidden group hover:shadow-elevated transition-shadow"
              data-ocid={`outfits.item.${i + 1}`}
            >
              {/* Outfit illustration replaces color banner */}
              <div className="relative h-52 overflow-hidden">
                <OutfitIllustration
                  colors={outfit.colors}
                  occasion={outfit.occasion}
                  title={outfit.title}
                  className="h-52"
                />
              </div>

              <div className="p-5">
                <span className="font-body text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {outfit.occasion}
                </span>
                <h3 className="font-display text-lg font-bold text-foreground mt-1 mb-2">
                  {outfit.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                  {outfit.description}
                </p>
                <div className="flex items-center justify-between">
                  <StarRating rating={outfit.rating} />
                  <span className="font-body text-xs text-muted-foreground">
                    ({outfit.reviews})
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 font-body text-sm border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors rounded-xl"
                  onClick={() => {
                    setTryOnOutfit(outfit);
                    setTryOnOpen(true);
                  }}
                  data-ocid={`outfits.secondary_button.${i + 1}`}
                >
                  <Eye size={14} className="mr-2" />
                  Visualize Outfit
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Virtual Try-On Modal (showcase mode — no user photo) */}
      {tryOnOutfit && (
        <VirtualTryOnModal
          isOpen={tryOnOpen}
          onClose={() => {
            setTryOnOpen(false);
            setTryOnOutfit(null);
          }}
          outfit={{
            title: tryOnOutfit.title,
            occasion: tryOnOutfit.occasion,
            description: tryOnOutfit.description,
            colors: tryOnOutfit.colors,
          }}
          palette={[]}
          userImageBase64={null}
          groqApiKey={null}
        />
      )}
    </section>
  );
}
