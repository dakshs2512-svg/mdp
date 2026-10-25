import React from "react";
import {
  Brain,
  Activity,
  Layers,
  ShieldAlert,
  Clock,
  Award,
  ArrowRight,
} from "lucide-react";
import Button from "../components/Button";
import DisclaimerBanner from "../components/DisclaimerBanner";

export default function ScienceAboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fade-in">
      
      {/* ----------------- PAGE HEADER ----------------- */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121A2B] border border-violet-500/30 text-xs text-violet-300 font-mono">
          <Brain className="w-3.5 h-3.5 text-cyan-400" />
          <span>MDP Cognitive Science Foundations</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
          The Science of Continuous Attention Dynamics
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          How behavioural signals—reaction speed, variability, and motor errors—reveal the subtle temporal onset of performance fatigue during continuous concentration.
        </p>
      </div>

      {/* Critical Medical Disclaimer Header Callout */}
      <DisclaimerBanner />

      {/* ----------------- CORE CONCEPTS ----------------- */}
      <section className="space-y-6">
        <div className="border-b border-slate-800 pb-2">
          <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest">
            Theoretical Framework
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">
            Three Core Psychophysical Mechanisms
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Concept 1: Sustained Attention */}
          <div className="rounded-2xl bg-[#121A2B] p-6 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-sans">
              1. Sustained Attention (Vigilance)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The capacity to maintain focused cognitive activity over prolonged, monotonous durations. First formally studied by Norman Mackworth (1948) through the Clock Test, researchers noted that human detection efficiency naturally declines over time—known as the <em>vigilance decrement</em>.
            </p>
          </div>

          {/* Concept 2: Response Inhibition */}
          <div className="rounded-2xl bg-[#121A2B] p-6 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-sans">
              2. Response Inhibition
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The executive function required to suppress an automatic motor reaction when an unexpected distractor appears (as in Go/No-Go and SART paradigms). Failing to withhold response generates a <strong>commission error</strong>, signaling reduced top-down prefrontal control.
            </p>
          </div>

          {/* Concept 3: Performance Variability */}
          <div className="rounded-2xl bg-[#121A2B] p-6 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-sans">
              3. Intra-Individual Variability (IIV)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rather than looking solely at average reaction time, cognitive scientists examine how wildly an individual's latency fluctuates from trial to trial. The <strong>Coefficient of Variation (CV = SD / Mean)</strong> provides a normalized measure of attentional stability.
            </p>
          </div>

        </div>
      </section>

      {/* ----------------- INDIRECT VS DIRECT MEASUREMENT ----------------- */}
      <section className="rounded-2xl bg-[#121A2B] p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold text-violet-400 uppercase tracking-widest">
            Epistemological Boundary
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Indirect Behavioural Indicators vs Direct Neurological Measurements
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            A crucial scientific distinction must be maintained between observing motor actions and measuring internal brain states.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* What Focus Drift Measures */}
          <div className="p-5 rounded-xl bg-[#0B1020] border border-cyan-500/20 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold font-sans">
              <Activity className="w-4 h-4" />
              <span>What Focus Drift Measures (Indirect Signals)</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><strong>Keypress latency:</strong> Elapsed time between browser render and hardware input switch.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><strong>Omission errors:</strong> Physical absence of input during a target stimulus presentation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><strong>Commission errors:</strong> Inadvertent or anticipatory presses on distractor stimuli.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span><strong>Statistical variance:</strong> Rolling variance and change-point estimation across trials.</span>
              </li>
            </ul>
          </div>

          {/* What It Does NOT Measure */}
          <div className="p-5 rounded-xl bg-[#0B1020] border border-red-500/20 space-y-3">
            <div className="flex items-center gap-2 text-red-400 text-sm font-bold font-sans">
              <ShieldAlert className="w-4 h-4" />
              <span>What It Does NOT Measure (Direct Biology)</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>Direct neural firing:</strong> Does not record EEG, fNIRS, or fMRI brain waves.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>Neurotransmitters:</strong> Cannot infer dopamine, norepinephrine, or serotonin levels.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>Clinical diagnosis:</strong> Cannot determine whether a participant has ADHD or ADD.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">•</span>
                <span><strong>Intellectual capability:</strong> Reaction speed does not equate to intelligence or general competence.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* ----------------- MATHEMATICAL ALGORITHM ----------------- */}
      <section className="rounded-2xl bg-[#121A2B] p-6 sm:p-8 border border-slate-800 space-y-5">
        <div className="space-y-1">
          <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest">
            Algorithm Formulation
          </span>
          <h2 className="text-xl font-bold text-white">
            How the Drift Point is Calculated
          </h2>
          <p className="text-xs text-slate-400">
            Transparent, first-year understandable mathematical procedures implemented in Focus Drift.
          </p>
        </div>

        <div className="space-y-4 text-xs text-slate-300 font-mono bg-[#0B1020] p-5 rounded-xl border border-slate-800 overflow-x-auto">
          <div>
            <span className="text-slate-500">// 1. Establish Baseline from first 25% of trials:</span>
            <p className="text-cyan-300 mt-1">
              Mean_base = (Σ RT_i) / N_base
            </p>
            <p className="text-cyan-300">
              SD_base = sqrt( Σ (RT_i - Mean_base)^2 / (N_base - 1) )
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-slate-500">// 2. Dynamic Drift Threshold:</span>
            <p className="text-violet-300 mt-1">
              Threshold_RT = Mean_base + 1.35 * max(SD_base, 35ms)
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-slate-500">// 3. Change-Point Detection:</span>
            <p className="text-amber-300 mt-1">
              Drift_Point = min(Trial_k) where Rolling_Avg_4(RT_k) ≥ Threshold_RT OR Consecutive_Errors ≥ 2
            </p>
          </div>
        </div>
      </section>

      {/* ----------------- ABOUT THE MDP PROJECT ----------------- */}
      <section id="about" className="rounded-2xl bg-gradient-to-r from-violet-950/30 via-[#121A2B] to-[#121A2B] p-6 sm:p-8 border border-violet-500/30 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-bold text-white">
            About the MDP Project
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Focus Drift was engineered as an undergraduate <strong>Multidisciplinary Project (MDP)</strong> bringing together Computer Science, Human-Computer Interaction (HCI), and Experimental Cognitive Psychology.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 space-y-1">
            <div className="font-semibold text-white">Computer Science</div>
            <p className="text-slate-400 text-[11px]">
              High-frequency timer management, sub-millisecond DOM event loops, and client-side reactive state machines.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 space-y-1">
            <div className="font-semibold text-white">Cognitive Science</div>
            <p className="text-slate-400 text-[11px]">
              Implementation of Sustained Attention to Response Task (SART) and Intra-Individual Variability modeling.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 space-y-1">
            <div className="font-semibold text-white">HCI & Research Ethics</div>
            <p className="text-slate-400 text-[11px]">
              Accessible, non-coercive UI design with zero telemetry, data privacy by default, and medical disclaimers.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800">
          <span className="text-xs font-mono text-slate-400">
            Stack: React • Vite • Tailwind CSS • Recharts • FastAPI
          </span>
          <Button
            to="/test"
            size="sm"
            variant="primary"
            icon={ArrowRight}
            iconPosition="right"
          >
            Launch SART Protocol
          </Button>
        </div>
      </section>

    </div>
  );
}
