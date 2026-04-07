import { Heart, Sparkles } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer
      className="bg-primary text-primary-foreground"
      data-ocid="footer.section"
    >
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary-foreground/10 text-primary-foreground font-bold text-sm font-display">
                S
              </span>
              <span className="font-display font-bold text-xl">
                Style Sense
              </span>
            </div>
            <p className="font-body text-sm text-primary-foreground/70 leading-relaxed max-w-xs">
              Your personal AI stylist. Powered by advanced vision AI to detect
              your unique skin tone and craft a personalized color story — just
              for you.
            </p>
            <div className="flex items-center gap-2 mt-4 text-primary-foreground/50">
              <Sparkles size={12} />
              <span className="font-body text-xs">
                Powered by Groq LLaMA 4 Vision
              </span>
            </div>
          </div>

          {/* Nav links */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-primary-foreground/50 mb-4">
              Navigate
            </p>
            <ul className="space-y-2">
              {["Features", "AI Stylist", "How It Works", "FAQ"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                    className="font-body text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                    data-ocid="footer.link"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Colors showcase */}
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-primary-foreground/50 mb-4">
              Sample Palettes
            </p>
            <div className="space-y-3">
              {[
                {
                  name: "Warm Season",
                  colors: ["#C16A5A", "#D4A940", "#228B22"],
                },
                {
                  name: "Cool Season",
                  colors: ["#008080", "#162A4A", "#6B7FA3"],
                },
              ].map((palette) => (
                <div key={palette.name}>
                  <p className="font-body text-xs text-primary-foreground/50 mb-1.5">
                    {palette.name}
                  </p>
                  <div className="flex gap-1.5">
                    {palette.colors.map((c) => (
                      <div
                        key={c}
                        className="w-7 h-7 rounded-full border border-white/20"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-primary-foreground/50">
            &copy; {year} Style Sense. All rights reserved.
          </p>
          <p className="font-body text-xs text-primary-foreground/50 flex items-center gap-1">
            Built with{" "}
            <Heart size={11} className="fill-current text-rose-400" /> using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors underline underline-offset-2"
              data-ocid="footer.link"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
