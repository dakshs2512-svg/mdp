import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

/**
 * Reusable Scientific & Non-Diagnostic Disclaimer Banner
 */
export default function DisclaimerBanner({ compact = false, className = "" }) {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-xs ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
        <span><strong>Academic Research Tool:</strong> Not an ADHD or clinical diagnosis instrument.</span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl bg-slate-900/80 border border-violet-500/20 shadow-sm relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <p className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-2">
            <span>MDP Research & Ethics Protocol</span>
            <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-normal">Non-Diagnostic</span>
          </p>
          <p className="text-slate-400 leading-relaxed">
            Focus Drift studies <strong>intra-individual reaction time variability</strong> during continuous tasks. 
            Behavioural signals (reaction speed, lapses, and errors) are indirect functional observations influenced by sleep, circadian rhythms, caffeine, and environmental factors. 
            This application <strong>does not diagnose ADHD, ADD, or neurological conditions</strong>, nor does it measure direct brain physiology.
          </p>
        </div>
      </div>
    </div>
  );
}
