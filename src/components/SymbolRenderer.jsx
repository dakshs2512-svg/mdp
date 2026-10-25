import React from "react";

/**
 * SymbolRenderer — Renders geometric visual stimuli with calm, high-contrast clarity.
 * Prevents distracting animations during active continuous testing.
 */
export default function SymbolRenderer({ symbol, size = 140, className = "" }) {
  if (!symbol) return null;

  const { shape, primaryColor, borderColor } = symbol;

  return (
    <div
      className={`flex items-center justify-center select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-label={symbol.label}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {shape === "circle" && (
          <circle
            cx="50"
            cy="50"
            r="40"
            fill={primaryColor}
            stroke={borderColor}
            strokeWidth="5"
          />
        )}

        {shape === "square" && (
          <rect
            x="14"
            y="14"
            width="72"
            height="72"
            rx="8"
            fill={primaryColor}
            stroke={borderColor}
            strokeWidth="5"
          />
        )}

        {shape === "diamond" && (
          <polygon
            points="50,10 90,50 50,90 10,50"
            fill={primaryColor}
            stroke={borderColor}
            strokeWidth="5"
          />
        )}

        {shape === "triangle" && (
          <polygon
            points="50,12 90,86 10,86"
            fill={primaryColor}
            stroke={borderColor}
            strokeWidth="5"
            strokeLinejoin="round"
          />
        )}

        {shape === "hexagon" && (
          <polygon
            points="50,10 88,30 88,70 50,90 12,70 12,30"
            fill={primaryColor}
            stroke={borderColor}
            strokeWidth="5"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  );
}
