import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  Loader2,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const FASHN_KEY_STORAGE = "stylesense_fashn_key";

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfit: {
    title: string;
    occasion: string;
    description: string;
    colors: string[];
  };
  palette: Array<{ name: string; hex: string }>;
  userImageBase64: string | null;
  userImageMimeType?: string;
  groqApiKey: string | null;
}

type TryOnStatus = "idle" | "loading" | "success" | "error";

export function VirtualTryOnModal({
  isOpen,
  onClose,
  outfit,
  palette,
  userImageBase64,
  userImageMimeType = "image/jpeg",
  groqApiKey,
}: VirtualTryOnModalProps) {
  const [fashnApiKey, setFashnApiKey] = useState(
    () => localStorage.getItem(FASHN_KEY_STORAGE) || "",
  );
  const [fashnKeyInput, setFashnKeyInput] = useState(fashnApiKey);
  const [fashnKeySaved, setFashnKeySaved] = useState(
    () => !!localStorage.getItem(FASHN_KEY_STORAGE),
  );
  const [garmentUrl, setGarmentUrl] = useState("");

  const [tryOnStatus, setTryOnStatus] = useState<TryOnStatus>("idle");
  const [tryOnImageUrl, setTryOnImageUrl] = useState<string | null>(null);
  const [tryOnError, setTryOnError] = useState<string | null>(null);

  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs to latest prop values so the effect doesn't need them as deps
  const outfitRef = useRef(outfit);
  const groqApiKeyRef = useRef(groqApiKey);
  const userImageBase64Ref = useRef(userImageBase64);
  const userImageMimeTypeRef = useRef(userImageMimeType);

  outfitRef.current = outfit;
  groqApiKeyRef.current = groqApiKey;
  userImageBase64Ref.current = userImageBase64;
  userImageMimeTypeRef.current = userImageMimeType;

  const generateAiPrompt = useCallback(
    async (apiKey: string, base64: string, mimeType: string) => {
      const currentOutfit = outfitRef.current;
      setPromptLoading(true);
      try {
        const promptText = `Describe this person's appearance for AI image generation: their gender presentation, approximate age, hair color and style, skin tone, and facial features. Then create a detailed image generation prompt for them wearing this outfit:\n\nOutfit: ${currentOutfit.title} - ${currentOutfit.description}\nColors: ${currentOutfit.colors.join(", ")}\nOccasion: ${currentOutfit.occasion}\n\nFormat: A single detailed paragraph prompt starting with "A [person description] wearing [outfit description]..." suitable for Midjourney, DALL-E, or Stable Diffusion. Include lighting, style, and photographic quality descriptors.`;

        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "meta-llama/llama-4-scout-17b-16e-instruct",
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "image_url",
                      image_url: { url: `data:${mimeType};base64,${base64}` },
                    },
                    { type: "text", text: promptText },
                  ],
                },
              ],
              max_tokens: 400,
              temperature: 0.6,
            }),
          },
        );

        if (!response.ok) throw new Error("Failed to generate prompt");
        const data = (await response.json()) as {
          choices: Array<{ message: { content: string } }>;
        };
        const content = data.choices[0]?.message?.content?.trim() || "";
        setGeneratedPrompt(content);
      } catch {
        const o = outfitRef.current;
        const fallback = `A person wearing ${o.title}: ${o.description}. Color palette: ${o.colors.join(", ")}. Occasion: ${o.occasion}. Professional fashion photography, studio lighting, full body shot, high resolution, photorealistic.`;
        setGeneratedPrompt(fallback);
      } finally {
        setPromptLoading(false);
      }
    },
    [],
  );

  // Generate prompt when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Reset state on open
    setTryOnStatus("idle");
    setTryOnImageUrl(null);
    setTryOnError(null);
    setGeneratedPrompt(null);
    setPromptCopied(false);

    const key = groqApiKeyRef.current;
    const base64 = userImageBase64Ref.current;
    const mimeType = userImageMimeTypeRef.current;
    const o = outfitRef.current;

    if (key && base64) {
      generateAiPrompt(key, base64, mimeType);
    } else {
      const fallback = `A fashion model wearing ${o.title}: ${o.description}. Color palette: ${o.colors.join(", ")}. Occasion: ${o.occasion}. Professional fashion photography, studio lighting, full body shot, high resolution, photorealistic.`;
      setGeneratedPrompt(fallback);
    }

    return () => {
      if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [isOpen, generateAiPrompt]);

  const saveFashnKey = () => {
    if (fashnKeyInput.trim()) {
      localStorage.setItem(FASHN_KEY_STORAGE, fashnKeyInput.trim());
      setFashnApiKey(fashnKeyInput.trim());
      setFashnKeySaved(true);
    }
  };

  const copyPrompt = async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setPromptCopied(true);
      if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
      promptTimerRef.current = setTimeout(() => setPromptCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard
      const el = document.createElement("textarea");
      el.value = generatedPrompt;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setPromptCopied(true);
      if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
      promptTimerRef.current = setTimeout(() => setPromptCopied(false), 2000);
    }
  };

  const runTryOn = async () => {
    if (!fashnApiKey || !garmentUrl.trim() || !userImageBase64) return;

    setTryOnStatus("loading");
    setTryOnError(null);
    setTryOnImageUrl(null);

    try {
      const runRes = await fetch("https://api.fashn.ai/v1/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${fashnApiKey}`,
        },
        body: JSON.stringify({
          model_image: `data:${userImageMimeType};base64,${userImageBase64}`,
          garment_image: garmentUrl.trim(),
          category: "auto",
        }),
      });

      if (!runRes.ok) {
        const errData = await runRes.json().catch(() => ({}));
        const errMsg =
          (errData as { error?: { message?: string } }).error?.message || "";
        if (runRes.status === 401) throw new Error("Invalid Fashn.ai API key");
        if (runRes.status === 422)
          throw new Error(
            "Invalid image or garment URL. Make sure the garment URL is a direct link to a clothing image.",
          );
        if (runRes.status === 429)
          throw new Error("Rate limit reached. Please try again in a moment.");
        throw new Error(errMsg || `API error: ${runRes.status}`);
      }

      const runData = (await runRes.json()) as { id: string };
      const predictionId = runData.id;

      // Poll for completion
      let polls = 0;
      const MAX_POLLS = 10;

      const poll = async (): Promise<void> => {
        if (polls >= MAX_POLLS) {
          throw new Error("Try-on is taking too long. Please try again later.");
        }
        polls++;

        const statusRes = await fetch(
          `https://api.fashn.ai/v1/status/${predictionId}`,
          {
            headers: { Authorization: `Bearer ${fashnApiKey}` },
          },
        );

        if (!statusRes.ok) throw new Error("Failed to check status");

        const statusData = (await statusRes.json()) as {
          status: string;
          output?: string[];
          error?: string;
        };

        if (statusData.status === "completed" && statusData.output?.[0]) {
          setTryOnImageUrl(statusData.output[0]);
          setTryOnStatus("success");
          return;
        }

        if (statusData.status === "failed") {
          throw new Error(statusData.error || "Try-on generation failed");
        }

        // Still processing — poll again
        await new Promise<void>((resolve) => {
          pollTimerRef.current = setTimeout(resolve, 3000);
        });
        return poll();
      };

      await poll();
    } catch (err) {
      setTryOnStatus("error");
      setTryOnError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    }
  };

  // Resolved hex colors from palette names
  const resolvedColors = outfit.colors
    .map((name) => palette.find((p) => p.name === name)?.hex ?? name)
    .filter(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0 gap-0 bg-card border-border rounded-2xl"
        data-ocid="tryon.modal"
      >
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <DialogTitle className="font-display text-xl font-bold text-foreground">
                {outfit.title}
              </DialogTitle>
              <Badge variant="secondary" className="font-body text-xs mt-1.5">
                {outfit.occasion}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* LEFT: Outfit details */}
          <div className="space-y-4">
            <div className="bg-secondary rounded-xl p-4 border border-border">
              <p className="font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Outfit Details
              </p>
              <p className="font-body text-sm text-foreground leading-relaxed">
                {outfit.description}
              </p>

              {/* Color chips */}
              <div className="flex flex-wrap gap-2 mt-3">
                {outfit.colors.map((colorName, idx) => {
                  const hex = resolvedColors[idx] || colorName;
                  const isHex = hex.startsWith("#");
                  return (
                    <span
                      key={colorName}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-card border border-border font-body text-xs text-foreground"
                    >
                      {isHex && (
                        <span
                          className="w-3 h-3 rounded-full inline-block border border-white/30 shadow-sm"
                          style={{ backgroundColor: hex }}
                        />
                      )}
                      {colorName}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* User portrait thumbnail */}
            {userImageBase64 && (
              <div className="rounded-xl overflow-hidden border border-border">
                <p className="font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground px-3 pt-3 pb-2">
                  Your Portrait
                </p>
                <img
                  src={`data:${userImageMimeType};base64,${userImageBase64}`}
                  alt="Your portrait"
                  className="w-full max-h-44 object-cover object-top"
                />
              </div>
            )}

            {/* Showcase note when no user photo */}
            {!userImageBase64 && (
              <div className="rounded-xl bg-accent/10 border border-accent/20 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-accent-foreground" />
                  <p className="font-body text-xs font-semibold text-foreground">
                    Showcase Mode
                  </p>
                </div>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  Upload your portrait in the Analysis Hub to get a personalized
                  AI prompt and virtual try-on with your photo.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Try-on + Prompt */}
          <div className="space-y-5">
            {/* Virtual Try-On section (only when user photo present) */}
            {userImageBase64 && (
              <div className="bg-secondary rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-primary" />
                  <p className="font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Virtual Try-On
                  </p>
                  <a
                    href="https://fashn.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-primary hover:text-primary/80 transition-colors"
                    data-ocid="tryon.link"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* Fashn.ai key */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fashn-key"
                    className="font-body text-xs text-foreground"
                  >
                    Fashn.ai API Key
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="fashn-key"
                      type="password"
                      placeholder="fashn_live_..."
                      value={fashnKeyInput}
                      onChange={(e) => {
                        setFashnKeyInput(e.target.value);
                        setFashnKeySaved(false);
                      }}
                      className="font-body text-xs rounded-xl border-border flex-1"
                      data-ocid="tryon.input"
                    />
                    <Button
                      size="sm"
                      onClick={saveFashnKey}
                      disabled={!fashnKeyInput.trim() || fashnKeySaved}
                      className="rounded-xl font-body text-xs px-3 bg-primary text-primary-foreground"
                      data-ocid="tryon.save_button"
                    >
                      {fashnKeySaved ? <Check size={12} /> : "Save"}
                    </Button>
                  </div>
                  <p className="font-body text-[10px] text-muted-foreground">
                    Get your key at{" "}
                    <a
                      href="https://fashn.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      fashn.ai
                    </a>
                  </p>
                </div>

                {/* Garment URL */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="garment-url"
                    className="font-body text-xs text-foreground"
                  >
                    Garment Image URL
                  </Label>
                  <Input
                    id="garment-url"
                    type="url"
                    placeholder="https://example.com/shirt.jpg"
                    value={garmentUrl}
                    onChange={(e) => setGarmentUrl(e.target.value)}
                    className="font-body text-xs rounded-xl border-border"
                    data-ocid="tryon.search_input"
                  />
                  <p className="font-body text-[10px] text-muted-foreground">
                    Paste a direct clothing image URL from a shopping site (e.g.
                    Amazon, Zara).
                  </p>
                </div>

                {/* Try On button */}
                <Button
                  onClick={runTryOn}
                  disabled={
                    !fashnApiKey ||
                    !garmentUrl.trim() ||
                    tryOnStatus === "loading"
                  }
                  className="w-full rounded-xl font-body text-sm bg-primary text-primary-foreground"
                  data-ocid="tryon.primary_button"
                >
                  {tryOnStatus === "loading" ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" />
                      Generating try-on image...
                    </>
                  ) : (
                    <>
                      <Eye size={14} className="mr-2" />
                      Try On
                    </>
                  )}
                </Button>

                {/* Loading state */}
                {tryOnStatus === "loading" && (
                  <p
                    className="font-body text-[10px] text-muted-foreground text-center"
                    data-ocid="tryon.loading_state"
                  >
                    This may take 15–30 seconds...
                  </p>
                )}

                {/* Error */}
                <AnimatePresence>
                  {tryOnStatus === "error" && tryOnError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl"
                      data-ocid="tryon.error_state"
                    >
                      <p className="font-body text-xs text-destructive">
                        {tryOnError}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Result image */}
                <AnimatePresence>
                  {tryOnStatus === "success" && tryOnImageUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="rounded-xl overflow-hidden border border-border"
                      data-ocid="tryon.success_state"
                    >
                      <img
                        src={tryOnImageUrl}
                        alt="Virtual try-on result"
                        className="w-full object-cover"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* AI Generation Prompt */}
            <div className="bg-secondary rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-primary" />
                <p className="font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  AI Generation Prompt
                </p>
              </div>

              <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
                Use this prompt in Midjourney, DALL·E, Stable Diffusion, or any
                AI image tool.
              </p>

              {promptLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-5/6 rounded" />
                  <Skeleton className="h-3 w-4/5 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                </div>
              ) : generatedPrompt ? (
                <div className="relative">
                  <pre
                    className="font-body text-[11px] text-foreground leading-relaxed whitespace-pre-wrap bg-card border border-border rounded-xl p-3 select-all"
                    style={{ fontFamily: "inherit" }}
                  >
                    {generatedPrompt}
                  </pre>
                </div>
              ) : null}

              <Button
                variant="outline"
                size="sm"
                onClick={copyPrompt}
                disabled={!generatedPrompt || promptLoading}
                className="w-full rounded-xl font-body text-xs border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                data-ocid="tryon.secondary_button"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {promptCopied ? (
                    <motion.span
                      key="copied"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-1.5"
                    >
                      <Check size={12} className="text-green-600" />
                      Copied!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-1.5"
                    >
                      <Copy size={12} />
                      Copy Prompt
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
