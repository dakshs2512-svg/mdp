import React from "react";
import {
  Play,
  BookOpen,
  Activity,
  Zap,
  TrendingDown,
  Layers,
  ShieldCheck,
  ArrowRight,
  Clock,
  Target,
  CheckCircle2,
  Lock,
} from "lucide-react";
import Button from "../components/Button";
import PerformanceChart from "../components/PerformanceChart";
import { ILLUSTRATIVE_SAMPLE_SESSION } from "../utils/sampleData";

export default function LandingPage() {
  const sampleTrials = ILLUSTRATIVE_SAMPLE_SESSION.trials;

  return (
    <div className="relative overflow-hidden">
      {/* Background radial glow & grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-radial-glow pointer-events-none" />

      {/* -------------------- HERO SECTION -------------------- */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          
          {/* MDP Research Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121A2B] border border-violet-500/30 text-xs text-violet-300 font-mono shadow-glow-subtle animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span>College Multidisciplinary Project (MDP)</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-300 font-semibold">Behavioural Computing</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] font-sans">
            Your focus doesn't disappear{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400">
              all at once.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Sustained attention decays along subtle micro-fluctuations. Focus Drift tracks millisecond-level behavioural signals—reaction time jitter, missed targets, and motor inhibition lapses—to estimate when concentration begins to destabilize.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Button
              to="/test"
              size="lg"
              variant="primary"
              icon={Play}
              iconPosition="right"
              className="w-full sm:w-auto"
            >
              Start Focus Test
            </Button>
            <Button
              to="/science"
              size="lg"
              variant="secondary"
              icon={BookOpen}
              iconPosition="left"
              className="w-full sm:w-auto"
            >
              Explore the Science
            </Button>
          </div>

          {/* Quick Stats Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>1 to 3 Min Protocol</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-violet-400" />
              <span>Sub-ms Precision</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Client-Side Privacy</span>
            </span>
          </div>

        </div>

        {/* Hero Interactive Chart Preview */}
        <div className="mt-14 max-w-4xl mx-auto">
          <div className="relative">
            {/* Glow frame behind chart */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-cyan-500/20 to-purple-600/20 rounded-3xl blur-xl opacity-60" />
            
            <div className="relative">
              {/* Illustrative Ribbon */}
              <div className="mb-2 flex items-center justify-between text-xs px-2 text-slate-400">
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Interactive Sample Trajectory Preview</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono">
                  Illustrative Demo Data
                </span>
              </div>

              <PerformanceChart
                trials={sampleTrials}
                driftTrialIndex={ILLUSTRATIVE_SAMPLE_SESSION.metrics.estimatedDriftTrial}
                baselineMean={325}
                isSample={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- THREE CORE FEATURE CARDS -------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest">
            Behavioural Analytics
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">
            Three Pillars of Continuous Attention Analysis
          </h2>
          <p className="text-sm text-slate-400">
            Moving beyond simple average scores to capture dynamic, time-series performance changes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Detect Drift */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-sans">
              Detect Drift
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pinpoint the precise temporal inflection point where your reaction times begin to widen and deviate from your initial cognitive baseline.
            </p>
            <div className="pt-2 border-t border-slate-800/80 text-xs font-mono text-violet-300 flex items-center gap-1.5">
              <span>Change-Point Model</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Discover Patterns */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-sans">
              Discover Patterns
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Separate attentional lapses (omission errors) from impulsive responses (commission errors) and measure Intra-Individual Reaction Time Variability (IIV).
            </p>
            <div className="pt-2 border-t border-slate-800/80 text-xs font-mono text-cyan-300 flex items-center gap-1.5">
              <span>Error Categorization</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3: Understand Recovery */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-sans">
              Understand Recovery
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Observe whether your mental focus exhibits temporary rebound spikes after micro-lapses or continuously deteriorates under sustained task pacing.
            </p>
            <div className="pt-2 border-t border-slate-800/80 text-xs font-mono text-emerald-300 flex items-center gap-1.5">
              <span>Vigilance Dynamics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* -------------------- HOW IT WORKS (3 STEPS) -------------------- */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-mono font-semibold text-violet-400 uppercase tracking-widest">
            Experimental Protocol
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight font-sans">
            How Focus Drift Works
          </h2>
          <p className="text-sm text-slate-400">
            A standardized Continuous Performance Task protocol implemented with modern browser APIs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Step 1 */}
          <div className="relative rounded-2xl bg-[#121A2B] p-6 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold font-mono text-cyan-400">01</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Stimulus Phase
              </span>
            </div>
            <h3 className="text-base font-bold text-white font-sans">
              Continuous Stimulus Presentation
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Geometric visual stimuli appear at randomized inter-stimulus intervals (1000ms–2200ms). You respond rapidly to targets (SPACEBAR or tap) and withhold responses to rare distractors.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-2xl bg-[#121A2B] p-6 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold font-mono text-violet-400">02</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/30">
                Data Collection
              </span>
            </div>
            <h3 className="text-base font-bold text-white font-sans">
              Sub-Millisecond Event Logging
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every motor response is clocked using high-precision hardware timestamps (<code className="text-violet-300">performance.now()</code>). Omissions, commissions, and latency fluctuations are logged event-by-event.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-2xl bg-[#121A2B] p-6 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-extrabold font-mono text-indigo-400">03</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Analysis & Drift
              </span>
            </div>
            <h3 className="text-base font-bold text-white font-sans">
              Algorithmic Drift Estimation
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our algorithm computes rolling Coefficient of Variation (CV) against your baseline stability period to determine the exact point where performance instability set in.
            </p>
          </div>

        </div>

        {/* Start Test Prompt Card */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-violet-950/40 via-[#121A2B] to-cyan-950/40 p-8 border border-violet-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-card">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-lg font-bold text-white">
              Ready to observe your concentration trajectory?
            </h4>
            <p className="text-xs text-slate-400">
              Takes just 1 to 2 minutes. Completely anonymous and client-side.
            </p>
          </div>
          <Button
            to="/test"
            size="md"
            variant="cyan"
            icon={Play}
            iconPosition="right"
          >
            Launch Test Chamber
          </Button>
        </div>
      </section>

      {/* -------------------- SCIENTIFIC LIMITATIONS & PRIVACY -------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Limitations Card */}
          <div className="rounded-2xl bg-[#121A2B] p-6 sm:p-7 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">
                Scientific Limitations & Non-Diagnostic Notice
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In cognitive psychology, reaction time and error rates are <strong>indirect behavioural proxies</strong>. They do not measure direct neurological firing, brain chemistry, or neurodivergence.
            </p>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>Not ADHD Diagnosis:</strong> Focus Drift must never be interpreted as an assessment or diagnosis for ADHD or clinical attention deficits.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>External Noise Factors:</strong> Screen refresh rates (60Hz vs 144Hz), physical fatigue, caffeine intake, keyboard latency, and ambient noise affect results.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>MDP Academic Scope:</strong> Created strictly as an undergraduate multidisciplinary demonstration project.</span>
              </li>
            </ul>
          </div>

          {/* Privacy & Ethics Card */}
          <div className="rounded-2xl bg-[#121A2B] p-6 sm:p-7 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5 text-cyan-400">
              <Lock className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">
                Data Privacy & Ethical Protocol
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              We uphold strict academic research ethics. Your cognitive data belongs solely to you and is processed under zero-cloud principles:
            </p>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2 bg-[#0B1020] p-3 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero telemetry or analytics trackers sent to external servers.</span>
              </div>
              <div className="flex items-center gap-2 bg-[#0B1020] p-3 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Session metrics stored exclusively in your browser's <code className="text-cyan-300">localStorage</code>.</span>
              </div>
              <div className="flex items-center gap-2 bg-[#0B1020] p-3 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Export your trial data anytime in open CSV or JSON formats.</span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
