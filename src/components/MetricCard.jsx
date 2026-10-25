import React from "react";

export default function MetricCard({
  title,
  value,
  unit = "",
  description,
  badge,
  badgeVariant = "default",
  icon: Icon,
  accentColor = "violet", // "violet" | "cyan" | "emerald" | "amber"
  className = "",
}) {
  const accentStyles = {
    violet: {
      border: "border-violet-500/20 hover:border-violet-500/40",
      glow: "hover:shadow-glow-violet",
      iconBg: "bg-violet-500/10 text-violet-400 border border-violet-500/30",
      highlight: "text-violet-400",
    },
    cyan: {
      border: "border-cyan-500/20 hover:border-cyan-500/40",
      glow: "hover:shadow-glow-cyan",
      iconBg: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30",
      highlight: "text-cyan-400",
    },
    emerald: {
      border: "border-emerald-500/20 hover:border-emerald-500/40",
      glow: "hover:shadow-sm",
      iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
      highlight: "text-emerald-400",
    },
    amber: {
      border: "border-amber-500/20 hover:border-amber-500/40",
      glow: "hover:shadow-sm",
      iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
      highlight: "text-amber-400",
    },
  };

  const style = accentStyles[accentColor] || accentStyles.violet;

  const badgeStyles = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/30",
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  };

  return (
    <div
      className={`rounded-2xl bg-[#121A2B] p-5 sm:p-6 border transition-all duration-300 ${style.border} ${style.glow} ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-semibold text-slate-400 font-mono">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
        {description && (
          <span className="text-slate-400 leading-snug line-clamp-2">
            {description}
          </span>
        )}
        {badge && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono border font-medium shrink-0 ml-auto ${
              badgeStyles[badgeVariant] || badgeStyles.default
            }`}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
