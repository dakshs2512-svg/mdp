import React from "react";
import { UserCheck, ShieldCheck, Zap, AlertTriangle, Lightbulb, Users, Compass } from "lucide-react";

export default function SignatureCard({
  signature = null,
  onSelectArchetype = null,
  activeArchetype = "person_a",
  className = "",
}) {
  if (!signature) return null;

  const {
    signatureId,
    title,
    summary,
    triggerCondition,
    resilienceScore,
    recommendedStrategy,
    radarMetrics = {},
  } = signature;

  const metricLabels = [
    { key: "sustainedVigilance", label: "Sustained Vigilance", desc: "Resistance to time-based cognitive fatigue" },
    { key: "switchTolerance", label: "Task-Switch Tolerance", desc: "Stability when changing subtasks or contexts" },
    { key: "interruptionRecovery", label: "Interruption Recovery", desc: "Speed of re-stabilizing after disruptions" },
    { key: "inhibitoryControl", label: "Inhibitory Control", desc: "Suppression of impulsive distractor responses" },
    { key: "motorConsistency", label: "Motor Consistency", desc: "Low reaction time variance and cursor steadiness" },
  ];

  return (
    <div className={`rounded-2xl bg-[#121A2B] p-5 sm:p-6 border border-slate-800 space-y-6 ${className}`}>
      {/* Top Bar with Archetype Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-violet-400" />
              Discovered Attention Signature
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/30">
              Personalized Pattern
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Machine learning identifies the specific conditions under which your sustained attention begins to decline.
          </p>
        </div>

        {/* Archetype Quick Switcher for Demonstrations */}
        {onSelectArchetype && (
          <div className="flex items-center gap-1.5 bg-[#0B1020] p-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-mono text-[11px] px-2 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" /> Archetypes:
            </span>
            <button
              onClick={() => onSelectArchetype("person_a")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeArchetype === "person_a"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Person A
            </button>
            <button
              onClick={() => onSelectArchetype("person_b")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeArchetype === "person_b"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Person B
            </button>
            <button
              onClick={() => onSelectArchetype("person_c")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeArchetype === "person_c"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Person C
            </button>
          </div>
        )}
      </div>

      {/* Hero Signature Banner */}
      <div className="bg-gradient-to-r from-violet-950/40 via-[#10172A] to-cyan-950/30 p-5 rounded-2xl border border-violet-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider">
              Dominant Attention Profile
            </div>
            <h4 className="text-xl font-extrabold text-white">
              {title}
            </h4>
          </div>

          <div className="flex items-center gap-2 bg-[#0B1020]/80 px-3.5 py-2 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Resilience Index:</span>
            <span className="text-base font-mono font-bold text-cyan-300">
              {resilienceScore} / 100
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed">
          {summary}
        </p>

        {/* Trigger Condition Box */}
        <div className="flex items-start gap-2.5 bg-[#0B1020]/90 p-3 rounded-xl border border-amber-500/30 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">Deterioration Trigger: </strong>
            <span className="text-slate-300">{triggerCondition}</span>
          </div>
        </div>
      </div>

      {/* 5-Axis Cognitive Dimension Bars */}
      <div className="space-y-3">
        <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Cognitive Stressor Resistance Breakdown
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {metricLabels.map((item) => {
            const score = radarMetrics[item.key] ?? 70;
            const barColor =
              score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-cyan-500" : "bg-amber-500";

            return (
              <div key={item.key} className="bg-[#0B1020]/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{item.label}</span>
                  <span className="font-mono font-bold text-cyan-300">{score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Strategy */}
      <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/30 text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-emerald-300 font-bold">
          <Lightbulb className="w-4 h-4 text-emerald-400" />
          Optimal Pacing & Mitigation Strategy
        </div>
        <p className="text-slate-300 leading-relaxed">
          {recommendedStrategy}
        </p>
      </div>
    </div>
  );
}
