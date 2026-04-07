import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface NavbarProps {
  onTryNow: () => void;
}

export function Navbar({ onTryNow }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Features", href: "#features" },
    { label: "AI Stylist", href: "#analysis-hub" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-sm border-b border-border shadow-xs"
      data-ocid="navbar.panel"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 font-display font-bold text-xl text-primary"
          data-ocid="navbar.link"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            S
          </span>
          <span className="tracking-tight">Style Sense</span>
        </a>

        {/* Desktop Nav */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="navbar.link"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            onClick={onTryNow}
            className="bg-primary text-primary-foreground hover:bg-navy-light font-body font-medium px-5 rounded-xl"
            data-ocid="navbar.primary_button"
          >
            Try Now
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          data-ocid="navbar.toggle"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-t border-border overflow-hidden"
          >
            <nav className="flex flex-col gap-1 px-6 py-4">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-body text-sm font-medium py-2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileOpen(false)}
                  data-ocid="navbar.link"
                >
                  {link.label}
                </a>
              ))}
              <Button
                onClick={() => {
                  setMobileOpen(false);
                  onTryNow();
                }}
                className="mt-2 bg-primary text-primary-foreground font-body"
                data-ocid="navbar.primary_button"
              >
                Try Now
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
