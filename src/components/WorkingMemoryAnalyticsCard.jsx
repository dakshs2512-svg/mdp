import React from "react";
import {
  Brain,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  HelpCircle,
  Activity,
  ListOrdered,
  Shuffle,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function WorkingMemoryAnalyticsCard({
  analytics = null,
  className = "",
}) {
  if (!analytics) return null;

  const {
    roundStats = [],
    sequenceLengthBreakdown = [],
    errorBreakdown = {},
    planningVsExecution = {},
    recoveryObserved = false,
    selfComparisonInsight = "",
  } = analytics;

  const { orderErrors = 0, itemErrors = 0, omissions = 0, totalErrors = 0 } = errorBreakdown;
  const { avgPlanningLatencyMs = 1250, avgStepRtMs = 420, planningRatio = 2.9 } = planningVsExecution;

  return (
    <div className={`rounded-2xl bg-[#121A2B] p-5 sm:p-7 border border-slate-800 space-y-6 ${className}`}>
      
      {/* ----------------- HEADER ----------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              Working Memory & Instruction Tracking Analysis
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/30">
              Cognitive Load Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracks retention, instruction sequence scaling, and self-recovery across increasing memory load.
          </p>
        </div>
      </div>

      {/* ----------------- SUMMARY METRIC TILES ----------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-[#0B1020] border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-mono block">Planning Latency</span>
          <div className="text-lg font-bold font-mono text-cyan-300">
            {avgPlanningLatencyMs} ms
          </div>
          <span className="text-[10px] text-slate-400">Encoding before 1st step</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B1020] border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-mono block">Step Execution Speed</span>
          <div className="text-lg font-bold font-mono text-white">
            {avgStepRtMs} ms
          </div>
          <span className="text-[10px] text-slate-400">Per-item selection latency</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B1020] border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-mono block">Order Errors</span>
          <div className="text-lg font-bold font-mono text-amber-300">
            {orderErrors}
          </div>
          <span className="text-[10px] text-amber-400/80">Correct item, wrong order</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0B1020] border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase font-mono block">Item Substitutions</span>
          <div className="text-lg font-bold font-mono text-rose-300">
            {itemErrors}
          </div>
          <span className="text-[10px] text-rose-400/80">Incorrect item selected</span>
        </div>
      </div>

      {/* ----------------- CHARTS GRID (2 COLUMNS) ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Intra-Individual Round-by-Round Trajectory */}
        <div className="p-4 rounded-xl bg-[#0B1020]/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              Round-by-Round Accuracy Progression
            </span>
            <span className="text-[10px] font-mono text-slate-400">Self-Baseline Comparison</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={roundStats} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="round"
                  stroke="#64748B"
                  fontSize={11}
                  tickFormatter={(r) => `R${r}`}
                />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0E1528] p-2.5 rounded-lg border border-slate-700 text-xs font-mono space-y-1">
                          <div className="font-bold text-white">Round {d.round} (Length {d.sequenceLength})</div>
                          <div className="text-cyan-300">Accuracy: {d.accuracyPct}%</div>
                          <div className="text-slate-400">Step RT: {d.meanRtMs}ms</div>
                          <div className="text-slate-400">Planning: {d.planningLatencyMs}ms</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracyPct"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#38BDF8" }}
                  name="Accuracy"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 font-mono text-center">
            Evaluates learning effect vs. cognitive fatigue across rounds
          </div>
        </div>

        {/* Chart 2: Sequence Length Cognitive Demand Scaling */}
        <div className="p-4 rounded-xl bg-[#0B1020]/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-violet-400" />
              Cognitive Demand Scaling (Sequence Length)
            </span>
            <span className="text-[10px] font-mono text-slate-400">Length 2 vs 3 vs 4</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sequenceLengthBreakdown} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="sequenceLength"
                  stroke="#64748B"
                  fontSize={11}
                  tickFormatter={(l) => `${l} Items`}
                />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0E1528] p-2.5 rounded-lg border border-slate-700 text-xs font-mono space-y-1">
                          <div className="font-bold text-white">Sequence Length: {d.sequenceLength}</div>
                          <div className="text-violet-300">Accuracy: {d.accuracyPct}%</div>
                          <div className="text-slate-400">Mean RT: {d.meanRtMs}ms</div>
                          <div className="text-slate-400">Variability (CV): {d.coefficientOfVariation}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="accuracyPct" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 font-mono text-center">
            Measures capacity retention as working memory demands expand
          </div>
        </div>

      </div>

      {/* ----------------- SELF-OBSERVATION EXPLANATION ----------------- */}
      <div className="bg-violet-950/20 p-4 rounded-xl border border-violet-500/30 text-xs space-y-2">
        <div className="flex items-center gap-2 text-violet-300 font-bold">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Intra-Individual Behavioral Observation
        </div>
        <p className="text-slate-300 leading-relaxed font-sans">
          {selfComparisonInsight || "Your performance demonstrated consistent instruction retention across sequences."}
        </p>
      </div>

    </div>
  );
}
