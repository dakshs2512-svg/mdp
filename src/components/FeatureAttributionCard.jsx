import React from "react";
import { Sparkles, ArrowUpRight, ArrowDownRight, Layers, HelpCircle } from "lucide-react";

export default function FeatureAttributionCard({
  features = [],
  className = "",
}) {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-2xl bg-[#121A2B] p-5 sm:p-6 border border-slate-800 space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Behavioural Feature Attribution
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Inflection Explainability
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Identifies which digital non-medical behavioural signals shifted most sharply immediately before and at the drift point.
          </p>
        </div>
      </div>

      {/* Feature Attribution Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
              <th className="pb-3 font-semibold">Behavioural Signal</th>
              <th className="pb-3 font-semibold">Pre-Drift Baseline</th>
              <th className="pb-3 font-semibold">Post-Drift Phase</th>
              <th className="pb-3 font-semibold">Shift Delta</th>
              <th className="pb-3 font-semibold">Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {features.map((feat, index) => {
              const isUp = feat.direction === "up";
              const isHighImpact = feat.impact === "High";

              return (
                <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pr-4">
                    <div className="font-semibold text-white">
                      {feat.feature}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 max-w-sm">
                      {feat.description}
                    </div>
                  </td>

                  <td className="py-3.5 pr-4 font-mono text-slate-300">
                    {feat.preValue}
                  </td>

                  <td className="py-3.5 pr-4 font-mono font-semibold text-white">
                    {feat.postValue}
                  </td>

                  <td className="py-3.5 pr-4 font-mono font-bold">
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs ${
                      isHighImpact
                        ? "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                        : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                    }`}>
                      {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {feat.delta}
                    </span>
                  </td>

                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      isHighImpact
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        : "bg-slate-700/50 text-slate-300"
                    }`}>
                      {feat.impact} Impact
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rationale explanation footer */}
      <div className="bg-[#0B1020]/70 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-200">How to interpret:</strong> In cognitive science and psychophysics, an abrupt explosion in response-time variability (CV) combined with omission clustering indicates momentary microsleeps and executive control depletion, rather than simple muscular fatigue.
        </p>
      </div>
    </div>
  );
}
