import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

/**
 * Custom Tooltip for Recharts
 */
function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isOmission = data.type === "omission";
    const isCommission = data.type === "commission";
    const isDriftPoint = data.type === "drift_point";

    return (
      <div className="bg-[#0E1528] p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1 z-50">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1 mb-1">
          <span className="font-mono font-bold text-slate-200">
            Trial #{data.trialIndex}
          </span>
          <span className="font-mono text-slate-400">
            {data.timeSec ? `${data.timeSec}s` : label}
          </span>
        </div>

        <div className="space-y-1">
          {data.rt !== null ? (
            <p className="flex items-center justify-between gap-3 text-cyan-300 font-mono">
              <span>Reaction Time:</span>
              <strong>{data.rt} ms</strong>
            </p>
          ) : (
            <p className="text-red-400 font-mono">
              {isOmission ? "Missed Target (Omission)" : "No Response (Inhibition)"}
            </p>
          )}

          {data.rollingRt && (
            <p className="flex items-center justify-between gap-3 text-violet-300 font-mono">
              <span>Rolling Avg (4-trial):</span>
              <span>{data.rollingRt} ms</span>
            </p>
          )}

          {isDriftPoint && (
            <div className="mt-1 pt-1 border-t border-slate-800 text-[11px] text-amber-400 font-semibold">
              ⚡ Performance Drift Point Detected
            </div>
          )}

          {isCommission && (
            <div className="mt-1 pt-1 border-t border-slate-800 text-[11px] text-red-400 font-semibold">
              ⚠️ Distractor Response (Commission)
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export default function PerformanceChart({
  trials = [],
  driftTrialIndex = null,
  baselineMean = null,
  isSample = false,
  className = "",
}) {
  if (!trials || trials.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center rounded-2xl bg-[#121A2B] border border-slate-800 text-slate-500 text-sm">
        No trial data available for visualization.
      </div>
    );
  }

  // Calculate chart min and max for clean scaling
  const validRts = trials.map((t) => t.rt).filter((rt) => typeof rt === "number" && !isNaN(rt));
  const minRt = validRts.length > 0 ? Math.max(150, Math.min(...validRts) - 40) : 200;
  const maxRt = validRts.length > 0 ? Math.min(850, Math.max(...validRts) + 60) : 600;

  return (
    <div className={`rounded-2xl bg-[#121A2B] p-5 sm:p-6 border border-slate-800 space-y-4 ${className}`}>
      
      {/* Chart Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white font-sans">
              Reaction Time Trajectory & Drift
            </h3>
            {isSample && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Illustrative Preview Data
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Latency per trial (cyan dots) against 4-trial moving average (violet line).
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Raw RT</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-violet-400" />
            <span>Moving Avg</span>
          </span>
          {driftTrialIndex && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-amber-400" />
              <span>Drift Point</span>
            </span>
          )}
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-72 sm:h-80 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trials}
            margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1E293B"
              vertical={false}
            />
            <XAxis
              dataKey="trialIndex"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              tickMargin={8}
              label={{
                value: "Trial Index (Consecutive Stimuli)",
                position: "insideBottom",
                offset: -4,
                fill: "#64748B",
                fontSize: 10,
              }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              tickMargin={8}
              domain={[minRt, maxRt]}
              unit="ms"
            />
            <Tooltip content={<CustomChartTooltip />} />

            {/* Baseline Reference */}
            {baselineMean && (
              <ReferenceLine
                y={baselineMean}
                stroke="#10B981"
                strokeDasharray="4 4"
                label={{
                  value: `Baseline (${baselineMean}ms)`,
                  fill: "#10B981",
                  fontSize: 10,
                  position: "insideTopLeft",
                }}
              />
            )}

            {/* Drift Point Vertical Marker */}
            {driftTrialIndex && (
              <ReferenceLine
                x={driftTrialIndex}
                stroke="#F59E0B"
                strokeDasharray="3 3"
                label={{
                  value: `Drift Onset (Trial ${driftTrialIndex})`,
                  fill: "#F59E0B",
                  fontSize: 10,
                  position: "insideTopRight",
                }}
              />
            )}

            {/* Raw Reaction Times */}
            <Line
              type="monotone"
              dataKey="rt"
              name="Reaction Time"
              stroke="#38BDF8"
              strokeWidth={1.5}
              dot={{ r: 3, fill: "#38BDF8", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#38BDF8", stroke: "#0B1020", strokeWidth: 2 }}
              connectNulls={false}
            />

            {/* Moving Average */}
            <Line
              type="monotone"
              dataKey="rollingRt"
              name="Rolling Average"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800">
        <span>Unit: Milliseconds (ms) latency from visual onset</span>
        <span>Sampling Precision: Sub-millisecond performance.now()</span>
      </div>

    </div>
  );
}
