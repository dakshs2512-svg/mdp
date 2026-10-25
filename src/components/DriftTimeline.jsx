import React from "react";
import { Clock, Zap, AlertCircle, CheckCircle2 } from "lucide-react";

export default function DriftTimeline({
  phases = [],
  estimatedDriftTimeSeconds = 68,
  durationSeconds = 120,
  className = "",
}) {
  const driftPercentage = durationSeconds > 0 
    ? Math.min(95, Math.max(5, (estimatedDriftTimeSeconds / durationSeconds) * 100))
    : 50;

  return (
    <div className={`rounded-2xl bg-[#121A2B] p-6 border border-slate-800 space-y-6 ${className}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white font-sans">
              Performance Stability Timeline
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20">
              Change-Point Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking the transition from baseline focus to response instability.
          </p>
        </div>

        {/* Estimated Drift Callout */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-300 text-xs font-mono shrink-0">
          <Zap className="w-4 h-4 text-violet-400" />
          <span>Estimated Drift: <strong>{estimatedDriftTimeSeconds}s</strong> into task</span>
        </div>
      </div>

      {/* Visual Timeline Bar */}
      <div className="space-y-2">
        <div className="relative w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex">
          {/* Phase 1 bar: Emerald */}
          <div
            style={{ width: `${Math.max(15, driftPercentage * 0.7)}%` }}
            className="h-full bg-gradient-to-r from-emerald-500/70 to-emerald-400/80 transition-all duration-500"
            title="Phase 1: Baseline Stability"
          />
          {/* Phase 2 bar: Amber */}
          <div
            style={{ width: `${Math.max(10, driftPercentage * 0.3)}%` }}
            className="h-full bg-gradient-to-r from-amber-500/70 to-amber-400/80 transition-all duration-500"
            title="Phase 2: Transition Zone"
          />
          {/* Phase 3 bar: Violet */}
          <div
            style={{ width: `${100 - driftPercentage}%` }}
            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500"
            title="Phase 3: Performance Drift"
          />
        </div>

        {/* Timeline Marker Pin */}
        <div className="relative w-full h-6">
          <div
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-500"
            style={{ left: `${driftPercentage}%` }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-glow-cyan" />
            <span className="text-[10px] font-mono text-cyan-300 font-bold mt-0.5 whitespace-nowrap bg-[#0B1020] px-1.5 py-0.5 rounded border border-cyan-500/30">
              Drift Point: {estimatedDriftTimeSeconds}s
            </span>
          </div>
          <div className="absolute left-0 text-[10px] text-slate-500 font-mono">0s</div>
          <div className="absolute right-0 text-[10px] text-slate-500 font-mono">{durationSeconds}s</div>
        </div>
      </div>

      {/* Phase Cards Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {phases.map((phase, idx) => {
          const isPhase3 = idx === 2;
          const isPhase2 = idx === 1;

          return (
            <div
              key={phase.title}
              className={`p-4 rounded-xl border transition-all ${
                isPhase3
                  ? "bg-violet-950/20 border-violet-500/30"
                  : isPhase2
                  ? "bg-amber-950/10 border-amber-500/20"
                  : "bg-emerald-950/10 border-emerald-500/20"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-mono font-semibold text-slate-400">
                  {phase.timeRange}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                    isPhase3
                      ? "bg-violet-500/20 text-violet-300 border-violet-500/40"
                      : isPhase2
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  }`}
                >
                  {phase.badge}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-1.5">
                {idx === 0 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {idx === 1 && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                {idx === 2 && <AlertCircle className="w-3.5 h-3.5 text-violet-400" />}
                <span>{phase.title}</span>
              </h4>

              <p className="text-xs text-slate-400 leading-relaxed">
                {phase.description}
              </p>

              {phase.meanRt && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between">
                  <span>Avg Latency:</span>
                  <span className="font-mono text-slate-200 font-semibold">{phase.meanRt}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
