/**
 * ZelligeSVG — reusable Moroccan tilework decorative component.
 * Renders a subtle 8-pointed or 12-pointed geometric star tile as an SVG
 * background watermark. Opacity is intentionally very low (3–8%).
 */

interface ZelligeSVGProps {
  className?: string;
  opacity?: number;
  color?: string;
  variant?: "8star" | "12star" | "diamond" | "arch";
  size?: number;
}

export function ZelligeSVG({
  className = "",
  opacity = 0.05,
  color = "#d97706",
  variant = "8star",
  size = 60,
}: ZelligeSVGProps) {
  const patterns: Record<string, string> = {
    "8star": `
      <path d="M${size / 2} 2 L${size * 0.62} ${size * 0.22} L${size - 2} ${size / 2} L${size * 0.62} ${size * 0.78} L${size / 2} ${size - 2} L${size * 0.38} ${size * 0.78} L2 ${size / 2} L${size * 0.38} ${size * 0.22} Z" fill="${color}" fill-opacity="${opacity}" />
      <path d="M${size / 2} ${size * 0.15} L${size * 0.55} ${size * 0.35} L${size * 0.75} ${size / 2} L${size * 0.55} ${size * 0.65} L${size / 2} ${size * 0.85} L${size * 0.45} ${size * 0.65} L${size * 0.25} ${size / 2} L${size * 0.45} ${size * 0.35} Z" fill="none" stroke="${color}" stroke-width="0.5" stroke-opacity="${opacity * 2}" />
    `,
    "12star": `
      <polygon points="${[...Array(12)].map((_, i) => {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const r = i % 2 === 0 ? size * 0.48 : size * 0.25;
        return `${size / 2 + r * Math.cos(angle)},${size / 2 + r * Math.sin(angle)}`;
      }).join(" ")}" fill="${color}" fill-opacity="${opacity}" />
    `,
    "diamond": `
      <rect x="${size * 0.15}" y="${size * 0.15}" width="${size * 0.7}" height="${size * 0.7}" transform="rotate(45 ${size / 2} ${size / 2})" fill="none" stroke="${color}" stroke-width="0.8" stroke-opacity="${opacity * 2}" />
      <rect x="${size * 0.3}" y="${size * 0.3}" width="${size * 0.4}" height="${size * 0.4}" transform="rotate(45 ${size / 2} ${size / 2})" fill="${color}" fill-opacity="${opacity}" />
    `,
    "arch": `
      <path d="M${size * 0.1} ${size * 0.9} Q${size * 0.1} ${size * 0.2} ${size / 2} ${size * 0.1} Q${size * 0.9} ${size * 0.2} ${size * 0.9} ${size * 0.9} Z" fill="none" stroke="${color}" stroke-width="1" stroke-opacity="${opacity * 3}" />
    `,
  };

  const id = `zellige-${variant}-${size}`;
  const patternDef = patterns[variant] || patterns["8star"];

  return (
    <svg
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id={id}
          x="0"
          y="0"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <g dangerouslySetInnerHTML={{ __html: patternDef }} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/**
 * MoroccanArchSVG — decorative horseshoe arch for auth cards and section headers.
 */
export function MoroccanArchSVG({
  className = "",
  color = "currentColor",
  width = 120,
  height = 80,
}: {
  className?: string;
  color?: string;
  width?: number;
  height?: number;
}) {
  const w = width;
  const h = height;
  const cx = w / 2;

  // Horseshoe arch: two vertical pillars + a semicircle top with pointed Moorish tip
  const archPath = [
    `M${w * 0.15},${h}`,                                  // left pillar bottom
    `L${w * 0.15},${h * 0.55}`,                           // left pillar top
    `Q${w * 0.15},${h * 0.05} ${cx},${0}`,               // left curve to apex
    `Q${w * 0.85},${h * 0.05} ${w * 0.85},${h * 0.55}`,  // right curve from apex
    `L${w * 0.85},${h}`,                                  // right pillar bottom
  ].join(" ");

  return (
    <svg
      aria-hidden="true"
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer arch */}
      <path
        d={archPath}
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity="0.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Inner arch (smaller, inset) */}
      <path
        d={[
          `M${w * 0.22},${h}`,
          `L${w * 0.22},${h * 0.58}`,
          `Q${w * 0.22},${h * 0.12} ${cx},${h * 0.07}`,
          `Q${w * 0.78},${h * 0.12} ${w * 0.78},${h * 0.58}`,
          `L${w * 0.78},${h}`,
        ].join(" ")}
        stroke={color}
        strokeWidth="0.75"
        strokeOpacity="0.3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Small diamond at apex */}
      <path
        d={`M${cx},${h * 0.03} L${cx + 3},${h * 0.07} L${cx},${h * 0.11} L${cx - 3},${h * 0.07} Z`}
        fill={color}
        fillOpacity="0.5"
      />
    </svg>
  );
}

/**
 * GoldCornerAccent — tiny geometric gold flourish for card corners.
 */
export function GoldCornerAccent({
  className = "",
  size = 20,
  position = "top-left",
}: {
  className?: string;
  size?: number;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const transforms: Record<string, string> = {
    "top-left":     "rotate(0)",
    "top-right":    "rotate(90)",
    "bottom-right": "rotate(180)",
    "bottom-left":  "rotate(270)",
  };

  const posClasses: Record<string, string> = {
    "top-left":     "top-0 left-0",
    "top-right":    "top-0 right-0",
    "bottom-right": "bottom-0 right-0",
    "bottom-left":  "bottom-0 left-0",
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox={`0 0 20 20`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute pointer-events-none ${posClasses[position]} ${className}`}
      style={{ transform: transforms[position], transformOrigin: "center" }}
    >
      <path d="M1 1 L8 1 L1 8 Z" fill="#d97706" fillOpacity="0.6" />
      <path d="M1 1 L8 1" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.8" />
      <path d="M1 1 L1 8" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.8" />
      <circle cx="1" cy="1" r="1.5" fill="#fbbf24" fillOpacity="0.7" />
    </svg>
  );
}

/**
 * MoroccanStarSeparator — ornamental star-dot divider line.
 */
export function MoroccanStarSeparator({
  className = "",
  color = "var(--text-gold)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--border-glass-bright)] to-transparent" />
      <span className="text-xs opacity-70" style={{ color }}>✦</span>
      <span className="text-[10px] opacity-40" style={{ color }}>✦</span>
      <span className="text-xs opacity-70" style={{ color }}>✦</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--border-glass-bright)] to-transparent" />
    </div>
  );
}
