import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Eye,
  ImageIcon,
  Loader2,
  Lock,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { OutfitIllustration } from "./OutfitIllustration";
import { VirtualTryOnModal } from "./VirtualTryOnModal";

type ColorSwatch = { name: string; hex: string };
type OutfitRec = {
  title: string;
  occasion: string;
  description: string;
  colors: string[];
};
type AnalysisResult = {
  skinTone: string;
  undertone: string;
  palette: ColorSwatch[];
  outfits: OutfitRec[];
};

const GROQ_API_KEY_STORAGE = "stylesense_groq_api_key";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ANALYSIS_PROMPT = `You are a professional color analyst and fashion stylist. Analyze the person in this photo and provide:

1. Skin tone category (one of: Fair, Light, Light Medium, Medium, Warm Medium, Olive, Tan, Deep Tan, Deep, Rich Deep)
2. Undertone (Warm, Cool, or Neutral)
3. A personalized color palette of exactly 6 colors that complement this skin tone (provide name and hex code for each)
4. Exactly 4 outfit recommendations tailored to these colors

Respond ONLY with valid JSON in this exact format:
{
  "skinTone": "Warm Medium",
  "undertone": "Warm",
  "palette": [
    {"name": "Terracotta", "hex": "#C16A5A"},
    {"name": "Warm Caramel", "hex": "#C68642"},
    {"name": "Forest Green", "hex": "#228B22"},
    {"name": "Burnt Sienna", "hex": "#E97451"},
    {"name": "Deep Teal", "hex": "#008080"},
    {"name": "Rich Burgundy", "hex": "#800020"}
  ],
  "outfits": [
    {
      "title": "Earth Tone Ensemble",
      "occasion": "Casual Day Out",
      "description": "A warm terracotta blouse paired with caramel-toned trousers creates a harmonious, earthy look that beautifully complements warm skin tones.",
      "colors": ["Terracotta", "Warm Caramel", "Forest Green"]
    }
  ]
}`;

export function AnalysisHub() {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem(GROQ_API_KEY_STORAGE) || "",
  );
  const [savedKey, setSavedKey] = useState(
    () => !!localStorage.getItem(GROQ_API_KEY_STORAGE),
  );
  const [apiKeyInput, setApiKeyInput] = useState(apiKey);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [tryOnOutfit, setTryOnOutfit] = useState<OutfitRec | null>(null);
  const [tryOnOpen, setTryOnOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WEBP).");
      return;
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setImage(file);
    setImagePreview(url);
    setImageBase64(null);
    setResult(null);
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const saveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem(GROQ_API_KEY_STORAGE, apiKeyInput.trim());
      setApiKey(apiKeyInput.trim());
      setSavedKey(true);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setImage(null);
    setImagePreview(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
  };

  const analyze = async () => {
    if (!image) {
      setError("Please upload a portrait first.");
      return;
    }
    if (!apiKey.trim()) {
      setError("Please save your Groq API key first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const base64Image = await fileToBase64(image);
      const mimeType = image.type || "image/jpeg";

      // Store for use in VirtualTryOnModal
      setImageBase64(base64Image);
      setImageMimeType(mimeType);

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
                    image_url: {
                      url: `data:${mimeType};base64,${base64Image}`,
                    },
                  },
                  {
                    type: "text",
                    text: ANALYSIS_PROMPT,
                  },
                ],
              },
            ],
            max_tokens: 1200,
            temperature: 0.3,
          }),
        },
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg =
          (errData as { error?: { message?: string } }).error?.message ||
          `API error: ${response.status}`;
        if (response.status === 401)
          throw new Error("Invalid API key. Please check your Groq API key.");
        if (response.status === 429)
          throw new Error(
            "Rate limit reached. Please wait a moment and try again.",
          );
        throw new Error(msg);
      }

      const data = (await response.json()) as {
        choices: Array<{ message: { content: string } }>;
      };
      const content = data.choices[0]?.message?.content || "";

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch)
        throw new Error("Could not parse AI response. Please try again.");

      const parsed = JSON.parse(jsonMatch[0]) as AnalysisResult;
      setResult(parsed);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="analysis-hub"
      className="py-24 bg-background"
      data-ocid="analysis.section"
    >
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            YOUR PERSONAL AI STYLIST
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Analysis Hub
          </h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mt-4" />
        </motion.div>

        {/* API Key Row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-lg mx-auto mb-12"
        >
          <div className="bg-card rounded-2xl shadow-card p-5 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Lock size={14} className="text-muted-foreground" />
              <Label
                htmlFor="api-key"
                className="font-body text-sm font-semibold text-foreground"
              >
                Groq API Key
              </Label>
              {savedKey && (
                <CheckCircle2 size={14} className="text-green-600 ml-auto" />
              )}
            </div>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                placeholder="gsk_..."
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setSavedKey(false);
                }}
                className="font-body text-sm flex-1 rounded-xl border-border"
                data-ocid="analysis.input"
              />
              <Button
                onClick={saveApiKey}
                disabled={!apiKeyInput.trim() || savedKey}
                className="bg-primary text-primary-foreground font-body text-sm rounded-xl px-4"
                data-ocid="analysis.save_button"
              >
                {savedKey ? "Saved" : "Save Key"}
              </Button>
            </div>
            <p className="font-body text-xs text-muted-foreground mt-2">
              Get your free API key at{" "}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                console.groq.com
              </a>
              . Key is stored locally only.
            </p>
          </div>
        </motion.div>

        {/* Two-column: Upload + Results */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* LEFT: Upload */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="font-display text-xl font-bold text-foreground">
                  Upload Your Photo
                </h3>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  Upload a clear portrait for accurate skin tone analysis.
                </p>
              </div>

              <div className="p-6">
                {/* Drop zone */}
                <label
                  htmlFor="dropzone-input"
                  className={`dropzone-dashed relative block transition-all duration-200 cursor-pointer ${
                    isDragging ? "scale-[1.01] border-primary bg-secondary" : ""
                  }`}
                  style={{ minHeight: 220 }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  data-ocid="analysis.dropzone"
                >
                  <AnimatePresence mode="wait">
                    {imagePreview ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full h-full flex items-center justify-center p-4"
                      >
                        <img
                          src={imagePreview}
                          alt="Your uploaded portrait"
                          className="max-h-52 max-w-full rounded-xl object-contain shadow-card"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute top-2 right-2 bg-card rounded-full p-1.5 shadow-card hover:bg-secondary transition-colors"
                          aria-label="Remove portrait"
                        >
                          <X size={14} className="text-foreground" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-full py-10 px-4 text-center"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                          <Upload size={28} className="text-muted-foreground" />
                        </div>
                        <p className="font-body text-sm font-semibold text-foreground mb-1">
                          Drag &amp; drop or click to upload
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          JPG, PNG, WEBP up to 10MB
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </label>

                <input
                  id="dropzone-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFile(e.target.files[0])
                  }
                />

                {/* Action buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-background hover:bg-secondary transition-colors font-body text-sm text-muted-foreground"
                    onClick={() => cameraInputRef.current?.click()}
                    aria-label="Open camera"
                    data-ocid="analysis.upload_button"
                  >
                    <Camera size={16} />
                    Camera
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-background hover:bg-secondary transition-colors font-body text-sm text-muted-foreground"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Browse gallery"
                    data-ocid="analysis.upload_button"
                  >
                    <ImageIcon size={16} />
                    Gallery
                  </button>
                </div>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="sr-only"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFile(e.target.files[0])
                  }
                />

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mt-4 flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-xl"
                      data-ocid="analysis.error_state"
                    >
                      <AlertCircle
                        size={14}
                        className="text-destructive mt-0.5 shrink-0"
                      />
                      <p className="font-body text-xs text-destructive">
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Analyze button */}
                <Button
                  onClick={analyze}
                  disabled={loading || !image}
                  className="w-full mt-5 bg-primary text-primary-foreground hover:bg-navy-light font-body font-semibold text-sm h-12 rounded-xl"
                  data-ocid="analysis.primary_button"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="mr-2" />
                      Analyze My Style
                    </>
                  )}
                </Button>

                {loading && (
                  <p
                    className="font-body text-xs text-muted-foreground text-center mt-2"
                    data-ocid="analysis.loading_state"
                  >
                    Analyzing your skin tone and building your palette...
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Results */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden h-full">
              <div className="p-6 border-b border-border">
                <h3 className="font-display text-xl font-bold text-foreground">
                  AI Analysis Results
                </h3>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  Your personalized style profile.
                </p>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16 gap-4"
                      data-ocid="analysis.loading_state"
                    >
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-secondary" />
                        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="font-body text-sm font-semibold text-foreground">
                          Analyzing your portrait...
                        </p>
                        <p className="font-body text-xs text-muted-foreground mt-1">
                          Detecting skin tone &amp; building your palette
                        </p>
                      </div>
                    </motion.div>
                  ) : result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                      data-ocid="analysis.success_state"
                    >
                      {/* Skin tone */}
                      <div className="p-4 rounded-xl bg-secondary border border-border">
                        <p className="font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                          Detected Skin Tone
                        </p>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm shrink-0"
                            style={{
                              backgroundColor:
                                result.palette[0]?.hex || "#C16A5A",
                            }}
                          />
                          <div>
                            <p className="font-body font-semibold text-foreground text-sm">
                              {result.skinTone}
                            </p>
                            <p className="font-body text-xs text-muted-foreground">
                              Undertone: {result.undertone}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Color Palette */}
                      <div>
                        <p className="font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                          Your Color Palette
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {result.palette.map((swatch, i) => (
                            <motion.div
                              key={swatch.name}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.07 }}
                              className="flex flex-col items-center gap-1.5"
                            >
                              <div
                                className="w-12 h-12 rounded-xl shadow-sm border-2 border-white"
                                style={{ backgroundColor: swatch.hex }}
                              />
                              <p className="font-body text-xs font-medium text-foreground text-center leading-tight">
                                {swatch.name}
                              </p>
                              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wide">
                                {swatch.hex}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Outfit Recommendations — Lookbook Grid */}
                      <div>
                        <p className="font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                          Outfit Lookbook
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {result.outfits.map((outfit, i) => {
                            // Resolve hex colors from palette for this outfit
                            const resolvedColors = outfit.colors
                              .map(
                                (colorName) =>
                                  result.palette.find(
                                    (p) => p.name === colorName,
                                  )?.hex ?? colorName,
                              )
                              .filter(Boolean);

                            // Ensure at least 3 colors
                            while (resolvedColors.length < 3) {
                              resolvedColors.push(
                                result.palette[resolvedColors.length]?.hex ??
                                  "#888888",
                              );
                            }

                            return (
                              <motion.div
                                key={outfit.title}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-card transition-shadow"
                                data-ocid={`analysis.item.${i + 1}`}
                              >
                                {/* Outfit illustration */}
                                <div
                                  className="relative overflow-hidden"
                                  style={{ height: 160 }}
                                >
                                  <OutfitIllustration
                                    colors={resolvedColors}
                                    occasion={outfit.occasion}
                                    title={outfit.title}
                                    className="h-40"
                                  />
                                </div>

                                {/* Card body */}
                                <div className="p-3">
                                  <p className="font-body font-semibold text-xs text-foreground leading-snug mb-1">
                                    {outfit.title}
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className="font-body text-[9px] mb-2"
                                  >
                                    {outfit.occasion}
                                  </Badge>
                                  <p className="font-body text-[10px] text-muted-foreground leading-relaxed line-clamp-3">
                                    {outfit.description}
                                  </p>
                                  {/* Color chips */}
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {outfit.colors.map((colorName) => {
                                      const swatch = result.palette.find(
                                        (p) => p.name === colorName,
                                      );
                                      return (
                                        <span
                                          key={colorName}
                                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-secondary border border-border font-body text-[9px] text-muted-foreground"
                                        >
                                          {swatch && (
                                            <span
                                              className="w-1.5 h-1.5 rounded-full inline-block"
                                              style={{
                                                backgroundColor: swatch.hex,
                                              }}
                                            />
                                          )}
                                          {colorName}
                                        </span>
                                      );
                                    })}
                                  </div>

                                  {/* Visualize Outfit button */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2 font-body text-[10px] border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors rounded-xl h-7 px-2"
                                    onClick={() => {
                                      setTryOnOutfit(outfit);
                                      setTryOnOpen(true);
                                    }}
                                    data-ocid={`analysis.visualize_button.${i + 1}`}
                                  >
                                    <Eye size={10} className="mr-1" />
                                    Visualize Outfit
                                  </Button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16 px-6 text-center"
                      data-ocid="analysis.empty_state"
                    >
                      <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-5">
                        <Sparkles size={32} className="text-muted-foreground" />
                      </div>
                      <p className="font-body text-sm font-semibold text-foreground mb-2">
                        Ready for your analysis
                      </p>
                      <p className="font-body text-xs text-muted-foreground leading-relaxed">
                        Upload a portrait to see your personalized color palette
                        and outfit recommendations uniquely crafted for you.
                      </p>
                      <div className="flex gap-2 mt-6">
                        {[
                          "#C16A5A",
                          "#D4A940",
                          "#008080",
                          "#162A4A",
                          "#228B22",
                          "#800020",
                        ].map((c) => (
                          <div
                            key={c}
                            className="w-7 h-7 rounded-full border-2 border-white shadow-sm opacity-40"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Virtual Try-On Modal */}
      {tryOnOutfit && (
        <VirtualTryOnModal
          isOpen={tryOnOpen}
          onClose={() => {
            setTryOnOpen(false);
            setTryOnOutfit(null);
          }}
          outfit={tryOnOutfit}
          palette={result?.palette ?? []}
          userImageBase64={imageBase64}
          userImageMimeType={imageMimeType}
          groqApiKey={apiKey || null}
        />
      )}
    </section>
  );
}
