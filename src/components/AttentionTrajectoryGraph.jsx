import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { TrendingDown, Zap, Clock, ShieldAlert } from "lucide-react";

/**
 * Custom Tooltip for Attention Trajectory
 */
function TrajectoryTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isDrift = data.phaseState === "drift";
    const isUnstable = data.phaseState === "unstable";

    return (
      <div className="bg-[#0E1528] p-3 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-1.5 z-50">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-1.5">
          <span className="font-mono font-bold text-slate-200">
            {data.timeSec ? `${Math.floor(data.timeSec / 60)}m ${Math.floor(data.timeSec % 60)}s` : `${label}s`}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
            isDrift ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" :
            isUnstable ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
            "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          }`}>
            {data.phaseState || "focused"}
          </span>
        </div>

        <div className="space-y-1 font-mono">
          <div className="flex items-center justify-between gap-4 text-cyan-300 font-bold">
            <span>Estimated Attention:</span>
            <span>{data.attentionPct ?? 100}%</span>
          </div>

          {data.rt && (
            <div className="flex items-center justify-between gap-4 text-slate-400">
              <span>Reaction Time:</span>
              <span>{data.rt} ms</span>
            </div>
          )}

          {data.mouseJitter && (
            <div className="flex items-center justify-between gap-4 text-slate-400">
              <span>Motor Jitter:</span>
              <span>{data.mouseJitter}</span>
            </div>
          )}

          {data.type === "drift_point" && (
            <div className="pt-1 text-[11px] text-amber-400 font-bold flex items-center gap-1 border-t border-slate-800">
              <Zap className="w-3 h-3" /> Drift Inflection Point
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export default function AttentionTrajectoryGraph({
  trials = [],
  driftTimeSeconds = null,
  driftFormatted = "8 min 42 sec",
  stabilityPct = 74,
  className = "",
}) {
  const [viewMode, setViewMode] = useState("attention"); // "attention" or "reactionTime"

  if (!trials || trials.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center rounded-2xl bg-[#121A2B] border border-slate-800 text-slate-500 text-sm">
        No trajectory data available.
      </div>
    );
  }

  // Format time labels (e.g. 0m, 5m, 10m, 15m)
  const formatTimeTick = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return s === 0 ? `${mins}m` : `${mins}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`rounded-2xl bg-[#121A2B] p-5 sm:p-6 border border-slate-800 space-y-5 ${className}`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-cyan-400" />
              Continuous Attention Trajectory
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/30">
              Change-Point AI
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quantifies the temporal transition from optimal focus to progressive attention instability.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#0B1020] p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode("attention")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === "attention"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Attention % (100% → 40%)
          </button>
          <button
            onClick={() => setViewMode("reactionTime")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === "reactionTime"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Motor Latency (ms)
          </button>
        </div>
      </div>

      {/* Trajectory Inflection Callout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0B1020]/60 p-3.5 rounded-xl border border-slate-800/80 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">First Detected Drift</div>
            <div className="font-mono font-bold text-emerald-300 text-sm">
              {driftFormatted}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Attention Stability</div>
            <div className="font-mono font-bold text-cyan-300 text-sm">
              {stabilityPct}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Post-Drift State</div>
            <div className="font-mono font-bold text-amber-300 text-sm">
              Attention Slip Active
            </div>
          </div>
        </div>
      </div>

      {/* Main Graph */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === "attention" ? (
            <AreaChart data={trials} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="attentionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                  <stop offset="60%" stopColor="#8B5CF6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="timeSec"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={formatTimeTick}
              />
              <YAxis
                domain={[30, 100]}
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<TrajectoryTooltip />} />

              {driftTimeSeconds && (
                <ReferenceLine
                  x={driftTimeSeconds}
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{
                    value: `↑ Drift begins (${driftFormatted})`,
                    position: "top",
                    fill: "#FBBF24",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
              )}

              <Area
                type="monotone"
                dataKey="attentionPct"
                name="Attention Stability"
                stroke="#38BDF8"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#attentionGradient)"
                activeDot={{ r: 6, fill: "#38BDF8", stroke: "#0B1020", strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <LineChart data={trials} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="timeSec"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={formatTimeTick}
              />
              <YAxis
                domain={["auto", "auto"]}
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `${v}ms`}
              />
              <Tooltip content={<TrajectoryTooltip />} />

              {driftTimeSeconds && (
                <ReferenceLine
                  x={driftTimeSeconds}
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{
                    value: `Drift Onset`,
                    position: "top",
                    fill: "#FBBF24",
                    fontSize: 11,
                  }}
                />
              )}

              <Line
                type="monotone"
                dataKey="rt"
                stroke="#38BDF8"
                strokeWidth={1.5}
                dot={{ r: 2.5, fill: "#38BDF8" }}
                name="Trial RT"
              />
              <Line
                type="monotone"
                dataKey="rollingRt"
                stroke="#A855F7"
                strokeWidth={2.5}
                dot={false}
                name="Moving Average"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Graph Legend & Annotation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Attention Stability %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-400"></span>
            <span>Drift Inflection Point</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
            <span>Attention Drift Phase</span>
          </div>
        </div>
        <div className="font-mono text-slate-500">
          Evaluated over continuous time-series trials
        </div>
      </div>
    </div>
  );
}
