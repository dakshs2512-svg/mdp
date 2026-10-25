import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Clock,
  Activity,
  Keyboard,
  MousePointer,
  XCircle,
  Eye,
  Sparkles,
  BookOpen,
  Brain,
  Layers,
  ArrowRight,
  ShieldAlert,
  Shuffle,
} from "lucide-react";
import Button from "../components/Button";
import DisclaimerBanner from "../components/DisclaimerBanner";
import SymbolRenderer from "../components/SymbolRenderer";
import { SYMBOLS } from "../utils/symbols";

export default function TestIntroPage() {
  const navigate = useNavigate();
  const [selectedTaskType, setSelectedTaskType] = useState("symbol_stream"); // "symbol_stream" or "reading"
  const [selectedDuration, setSelectedDuration] = useState(900); // 15 minutes default

  const durationOptions = [
    {
      seconds: 900,
      label: "15 Minutes",
      badge: "Focus Drift Benchmark",
      isDefault: true,
      description: "Recommended benchmark (approx. 220–260 trials). Captures authentic sustained attention drift, post-interruption recovery, and individual signature decay curves.",
    },
    {
      seconds: 120,
      label: "2 Minutes",
      badge: "Quick MDP Grading Demo",
      isDefault: false,
      description: "High-speed demonstration protocol (approx. 35–45 trials). Ideal for quick college viva evaluations and live testing without sitting for 15 minutes.",
    },
    {
      seconds: 300,
      label: "5 Minutes",
      badge: "Fast Assessment",
      isDefault: false,
      description: "Balanced intermediate trial for observing early reaction time divergence and motor pacing variability.",
    },
    {
      seconds: 600,
      label: "10 Minutes",
      badge: "Standard Protocol",
      isDefault: false,
      description: "Classical sustained attention protocol with robust CUSUM change-point modeling.",
    },
    {
      seconds: 1200,
      label: "20 Minutes",
      badge: "Extended Research",
      isDefault: false,
      description: "Extended continuous vigilance protocol for in-depth fatigue and individual signature profiling.",
    },
  ];

  const handleStartTest = () => {
    if (selectedTaskType === "working_memory") {
      navigate(`/test/working-memory?duration=${selectedDuration}`);
    } else if (selectedTaskType === "task_switching") {
      navigate(`/test/task-switching?duration=${selectedDuration}`);
    } else if (selectedTaskType === "reading") {
      navigate(`/test/reading?duration=${selectedDuration}`);
    } else {
      navigate(`/test/session?duration=${selectedDuration}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121A2B] border border-violet-500/30 text-xs text-violet-300 font-mono">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>MDP Continuous Attention Task Setup</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
          Select Task Paradigm & Duration
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Perform a realistic, continuous concentration task while the AI records non-medical behavioural signals to detect the exact moment attention begins slipping.
        </p>
      </div>

      {/* Task Paradigm Selector: Task A vs Task B vs Task C */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>1. Choose Cognitive Task Paradigm</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option A: Continuous Symbol Vigilance (SART / CPT) */}
          <button
            onClick={() => setSelectedTaskType("symbol_stream")}
            className={`text-left p-5 rounded-2xl border transition-all space-y-3 ${
              selectedTaskType === "symbol_stream"
                ? "bg-violet-950/30 border-violet-500 shadow-lg shadow-violet-600/20 ring-1 ring-violet-500"
                : "bg-[#121A2B] border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Eye className="w-5 h-5" />
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                selectedTaskType === "symbol_stream" ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "bg-slate-800 text-slate-400"
              }`}>
                Continuous Vigilance
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Symbol Stream Detection
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Observe a flow of geometric symbols. Press Spacebar or Click exclusively for target symbols while withholding on distractors.
              </p>
            </div>

            <div className="text-[11px] font-mono text-cyan-300 pt-1">
              ✓ Fast response inhibition • Motor jitter tracking
            </div>
          </button>

          {/* Option B: Continuous Reading & Comprehension */}
          <button
            onClick={() => setSelectedTaskType("reading")}
            className={`text-left p-5 rounded-2xl border transition-all space-y-3 ${
              selectedTaskType === "reading"
                ? "bg-violet-950/30 border-violet-500 shadow-lg shadow-violet-600/20 ring-1 ring-violet-500"
                : "bg-[#121A2B] border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/30">
                <BookOpen className="w-5 h-5" />
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                selectedTaskType === "reading" ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "bg-slate-800 text-slate-400"
              }`}>
                Work Simulation
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Reading & Comprehension
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Read technical literature passages, answer inline checks, and handle simulated task switches while tracking scrolling backtracking.
              </p>
            </div>

            <div className="text-[11px] font-mono text-violet-300 pt-1">
              ✓ Backtracking detection • Context switch penalty
            </div>
          </button>

          {/* Option C: Working Memory & Instruction Tracking */}
          <button
            onClick={() => setSelectedTaskType("working_memory")}
            className={`text-left p-5 rounded-2xl border transition-all space-y-3 ${
              selectedTaskType === "working_memory"
                ? "bg-violet-950/30 border-violet-500 shadow-lg shadow-violet-600/20 ring-1 ring-violet-500"
                : "bg-[#121A2B] border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Brain className="w-5 h-5" />
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                selectedTaskType === "working_memory" ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "bg-slate-800 text-slate-400"
              }`}>
                Multi-Step Memory
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Working Memory & Tracking
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Remember and execute multi-step symbol selection instructions in sequence order. Sequence length scales progressively across 6 short rounds.
              </p>
            </div>

            <div className="text-[11px] font-mono text-amber-300 pt-1">
              ✓ Progressive sequence length • Planning vs execution RT
            </div>
          </button>
        </div>
      </div>

      {/* Task-Specific Rules Preview */}
      {selectedTaskType === "symbol_stream" ? (
        <div className="rounded-2xl bg-[#121A2B] p-6 border border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-violet-400" />
            <span>Stimulus Discrimination Rules</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-500/40 flex items-center gap-4">
              <SymbolRenderer symbol={SYMBOLS.BLUE_CIRCLE} size={64} />
              <div className="space-y-1">
                <div className="text-xs font-mono font-bold text-sky-300 uppercase">Target Stimulus</div>
                <div className="text-sm font-bold text-white">Blue Circle</div>
                <div className="text-xs text-slate-300 font-mono">PRESS SPACEBAR OR CLICK</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/40 flex items-center gap-4">
              <SymbolRenderer symbol={SYMBOLS.PURPLE_CIRCLE} size={64} />
              <div className="space-y-1">
                <div className="text-xs font-mono font-bold text-purple-300 uppercase">Distractor Stimulus</div>
                <div className="text-sm font-bold text-white">Purple / Other Shapes</div>
                <div className="text-xs text-slate-300 font-mono">DO NOT RESPOND (WITHHOLD)</div>
              </div>
            </div>
          </div>
        </div>
      ) : selectedTaskType === "reading" ? (
        <div className="rounded-2xl bg-[#121A2B] p-6 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>Reading Task Protocol</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#0B1020] p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-white">1. Read Passages</div>
              <p className="text-slate-400">Technical sections presented naturally. Reading pace and scroll backtracking are measured.</p>
            </div>
            <div className="bg-[#0B1020] p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-white">2. Micro-Checks</div>
              <p className="text-slate-400">Answer factual multiple choice questions to assess comprehension and revision hesitation.</p>
            </div>
            <div className="bg-[#0B1020] p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-white">3. Task Switches</div>
              <p className="text-slate-400">Handles occasional simulated interruptions to calculate distraction recovery latency.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#121A2B] p-6 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-400" />
            <span>Working Memory & Instruction Tracking Protocol</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#0B1020] p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-white">1. Practice & Instructions</div>
              <p className="text-slate-400">Short interactive trial teaches card layout and order retention mechanics.</p>
            </div>
            <div className="bg-[#0B1020] p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-white">2. Sequential Execution</div>
              <p className="text-slate-400">Select items in exact sequence order using cards or number keys 1–6.</p>
            </div>
            <div className="bg-[#0B1020] p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="font-bold text-white">3. Demand Scaling</div>
              <p className="text-slate-400">Demands scale from 2 to 4 items across 6 rounds, tracking planning latency vs. execution speed.</p>
            </div>
          </div>
        </div>
      )}

      {/* Duration Selector */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>2. Select Task Duration</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {durationOptions.map((opt) => {
            const isSelected = selectedDuration === opt.seconds;
            return (
              <button
                key={opt.seconds}
                onClick={() => setSelectedDuration(opt.seconds)}
                className={`text-left p-4 rounded-xl border transition-all space-y-2 ${
                  isSelected
                    ? "bg-violet-600/20 border-violet-500 ring-1 ring-violet-500 text-white"
                    : "bg-[#121A2B] border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white font-mono">{opt.label}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    isSelected ? "bg-violet-500 text-white" : "bg-slate-800 text-slate-400"
                  }`}>
                    {opt.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Start Button & Disclaimer */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
        <div className="text-xs text-slate-400 font-mono">
          Task: {selectedTaskType === "symbol_stream" ? "Symbol Vigilance" : selectedTaskType === "reading" ? "Reading Comprehension" : "Working Memory & Tracking"} • {Math.floor(selectedDuration / 60)} minutes
        </div>

        <Button
          onClick={handleStartTest}
          variant="primary"
          size="lg"
          className="w-full sm:w-auto px-8 py-3.5 text-base font-bold"
        >
          <Play className="w-5 h-5 mr-2 fill-current" />
          Begin Concentration Task
        </Button>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
