import { cn } from "@/lib/utils";

interface OutfitIllustrationProps {
  colors: string[]; // hex color array, min 2
  occasion: string;
  title: string;
  className?: string;
}

const CHIP_LABELS = ["top", "bottom", "accent"];

// A stylized fashion croquis SVG — elongated proportions, chic silhouette
export function OutfitIllustration({
  colors,
  occasion,
  className,
}: OutfitIllustrationProps) {
  const topColor = colors[0] ?? "#C16A5A";
  const bottomColor = colors[1] ?? "#C68642";
  const accentColor = colors[2] ?? "#228B22";

  const filterId = `shadow-${topColor.replace("#", "")}-${bottomColor.replace("#", "")}`;

  return (
    <div
      className={cn(
        "relative w-full flex flex-col items-center bg-gradient-to-b from-secondary/60 to-secondary/20 overflow-hidden",
        className,
      )}
    >
      {/* Occasion badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-block px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm font-body text-[9px] font-semibold uppercase tracking-widest text-white/90">
          {occasion}
        </span>
      </div>

      {/* Color chips — subtle row at top right */}
      <div className="absolute top-3 right-3 z-10 flex gap-1">
        {[topColor, bottomColor, accentColor].map((c, i) => (
          <div
            key={CHIP_LABELS[i]}
            className="w-3 h-3 rounded-full border border-white/50 shadow-sm"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* SVG Fashion Croquis */}
      <svg
        viewBox="0 0 120 220"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ maxHeight: 220 }}
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feOffset dx="1" dy="2" result="offsetBlur" />
            <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
          </filter>

          {/* Top highlight overlay */}
          <linearGradient
            id={`topGrad-${filterId}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="white" stopOpacity="0.18" />
            <stop offset="50%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="black" stopOpacity="0.14" />
          </linearGradient>

          {/* Bottom highlight overlay */}
          <linearGradient
            id={`bottomGrad-${filterId}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="white" stopOpacity="0.12" />
            <stop offset="50%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="black" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        {/* === BACKGROUND FLOOR SHADOW === */}
        <ellipse cx="60" cy="215" rx="28" ry="5" fill="rgba(0,0,0,0.07)" />

        {/* === HEAD & NECK === */}
        <ellipse cx="60" cy="18" rx="9" ry="11" fill="#E8C4A0" />
        <path
          d="M51 14 Q52 6 60 5 Q68 6 69 14 Q66 8 60 7 Q54 8 51 14Z"
          fill="#5C3D2E"
        />
        <rect x="57" y="27" width="6" height="8" rx="2" fill="#E0B990" />

        {/* === SHOULDERS / COLLAR === */}
        <path
          d="M44 38 Q52 33 60 33 Q68 33 76 38 L78 50 Q70 46 60 46 Q50 46 42 50Z"
          fill={topColor}
        />
        <path
          d="M44 38 Q52 33 60 33 Q68 33 76 38 L78 50 Q70 46 60 46 Q50 46 42 50Z"
          fill={`url(#topGrad-${filterId})`}
        />

        {/* === TOP / BLOUSE === */}
        <path
          d="M42 50 Q38 58 38 75 Q38 88 42 95 Q50 98 60 98 Q70 98 78 95 Q82 88 82 75 Q82 58 78 50 Q70 46 60 46 Q50 46 42 50Z"
          fill={topColor}
          filter={`url(#${filterId})`}
        />
        <path
          d="M42 50 Q38 58 38 75 Q38 88 42 95 Q50 98 60 98 Q70 98 78 95 Q82 88 82 75 Q82 58 78 50 Q70 46 60 46 Q50 46 42 50Z"
          fill={`url(#topGrad-${filterId})`}
        />

        {/* V-neckline detail */}
        <path
          d="M55 35 L60 47 L65 35"
          stroke="rgba(0,0,0,0.12)"
          strokeWidth="0.8"
          fill="none"
        />

        {/* === ARMS === */}
        <path
          d="M42 52 Q34 58 32 72 Q31 82 34 90 Q36 94 38 93 Q40 83 42 74 Q43 62 45 55Z"
          fill={topColor}
        />
        <path
          d="M42 52 Q34 58 32 72 Q31 82 34 90 Q36 94 38 93 Q40 83 42 74 Q43 62 45 55Z"
          fill={`url(#topGrad-${filterId})`}
        />
        <ellipse
          cx="35"
          cy="93"
          rx="4"
          ry="5"
          fill="#E0B990"
          transform="rotate(-15 35 93)"
        />

        <path
          d="M78 52 Q86 58 88 72 Q89 82 86 90 Q84 94 82 93 Q80 83 78 74 Q77 62 75 55Z"
          fill={topColor}
        />
        <path
          d="M78 52 Q86 58 88 72 Q89 82 86 90 Q84 94 82 93 Q80 83 78 74 Q77 62 75 55Z"
          fill={`url(#topGrad-${filterId})`}
        />
        <ellipse
          cx="85"
          cy="93"
          rx="4"
          ry="5"
          fill="#E0B990"
          transform="rotate(15 85 93)"
        />

        {/* Waist tuck */}
        <path
          d="M46 90 Q50 96 60 97 Q70 96 74 90"
          stroke="rgba(0,0,0,0.07)"
          strokeWidth="1"
          fill="none"
        />

        {/* === BOTTOMS === */}
        {/* Waistband */}
        <rect
          x="43"
          y="95"
          width="34"
          height="8"
          rx="2"
          fill={accentColor}
          opacity="0.7"
        />

        {/* Left trouser leg */}
        <path
          d="M43 100 Q42 118 41 135 Q40 150 39 165 Q44 168 50 166 Q53 150 54 135 Q55 120 57 100Z"
          fill={bottomColor}
          filter={`url(#${filterId})`}
        />
        <path
          d="M43 100 Q42 118 41 135 Q40 150 39 165 Q44 168 50 166 Q53 150 54 135 Q55 120 57 100Z"
          fill={`url(#bottomGrad-${filterId})`}
        />
        <path
          d="M50 100 Q50 120 50 140"
          stroke="rgba(0,0,0,0.09)"
          strokeWidth="0.7"
          fill="none"
        />

        {/* Right trouser leg */}
        <path
          d="M77 100 Q78 118 79 135 Q80 150 81 165 Q76 168 70 166 Q67 150 66 135 Q65 120 63 100Z"
          fill={bottomColor}
          filter={`url(#${filterId})`}
        />
        <path
          d="M77 100 Q78 118 79 135 Q80 150 81 165 Q76 168 70 166 Q67 150 66 135 Q65 120 63 100Z"
          fill={`url(#bottomGrad-${filterId})`}
        />
        <path
          d="M70 100 Q70 120 70 140"
          stroke="rgba(0,0,0,0.09)"
          strokeWidth="0.7"
          fill="none"
        />

        {/* Crotch join */}
        <path
          d="M57 100 Q60 110 63 100"
          fill={bottomColor}
          stroke="rgba(0,0,0,0.07)"
          strokeWidth="0.5"
        />

        {/* === SHOES === */}
        <path
          d="M39 163 Q36 167 34 170 Q32 172 36 173 Q44 174 50 172 Q52 169 50 166Z"
          fill={accentColor}
        />
        <rect
          x="34"
          y="170"
          width="3"
          height="6"
          rx="1"
          fill={accentColor}
          opacity="0.8"
        />

        <path
          d="M81 163 Q84 167 86 170 Q88 172 84 173 Q76 174 70 172 Q68 169 70 166Z"
          fill={accentColor}
        />
        <rect
          x="83"
          y="170"
          width="3"
          height="6"
          rx="1"
          fill={accentColor}
          opacity="0.8"
        />

        {/* === HANDBAG === */}
        <path
          d="M86 94 Q90 93 93 95 Q95 100 93 106 Q90 108 86 107 Q83 105 83 100 Q83 95 86 94Z"
          fill={accentColor}
          opacity="0.85"
        />
        <path
          d="M88 94 Q88 90 86 88"
          stroke={accentColor}
          strokeWidth="1.5"
          fill="none"
          opacity="0.85"
        />
        <circle cx="89" cy="101" r="1.2" fill="rgba(255,255,255,0.6)" />
      </svg>
    </div>
  );
}
