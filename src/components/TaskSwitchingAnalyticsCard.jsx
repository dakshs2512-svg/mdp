import React from "react";
import {
  Shuffle,
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Target,
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
  ReferenceLine,
  Legend,
} from "recharts";

// ---------------------------------------------------------------------------
// KPI Tile
// ---------------------------------------------------------------------------
function KpiTile({ label, value, unit, sub, accent = "violet" }) {
  const colors = {
    violet: "text-violet-300",
    cyan:   "text-cyan-300",
    amber:  "text-amber-300",
    emerald:"text-emerald-300",
    rose:   "text-rose-300",
  };
  return (
    <div className="bg-[#0B1020] rounded-xl border border-slate-800 p-4 space-y-1">
      <span className="text-xs text-slate-400 block">{label}</span>
      <div className={`text-2xl font-extrabold font-mono ${colors[accent]}`}>
        {value}
        {unit && <span className="text-sm font-medium text-slate-400 ml-1">{unit}</span>}
      </div>
      {sub && <span className="text-[10px] text-slate-500 font-mono">{sub}</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Neutral observation line (plain-language, non-diagnostic)
// ---------------------------------------------------------------------------
function Observation({ text, icon: Icon = Activity, accent = "slate" }) {
  const lineColor = {
    slate:  "border-slate-700 text-slate-300",
    cyan:   "border-cyan-800 text-cyan-300",
    amber:  "border-amber-800 text-amber-300",
    violet: "border-violet-800 text-violet-300",
  }[accent];
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl bg-[#0B1020] border ${lineColor}`}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-80" />
      <p className="text-xs leading-relaxed">{text}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom tooltip for Recharts
// ---------------------------------------------------------------------------
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#121A2B] border border-slate-700 rounded-xl px-3 py-2 text-xs space-y-1 shadow-xl">
      <p className="text-slate-400 font-mono">Trial {label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === "number" ? (p.dataKey.includes("Acc") ? `${p.value}%` : `${p.value} ms`) : p.value}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main analytics card
// ---------------------------------------------------------------------------
export default function TaskSwitchingAnalyticsCard({ analytics = null, className = "" }) {
  if (!analytics) return null;

  const {
    repeatMedianRtMs       = 0,
    switchMedianRtMs       = 0,
    switchCostMs           = 0,
    repeatAccuracyPct      = 0,
    switchAccuracyPct      = 0,
    switchErrorRatePct     = 0,
    repeatErrorRatePct     = 0,
    recoveryTrials         = null,
    totalSwitches          = 0,
    totalRepeatTrials      = 0,
    totalSwitchTrials      = 0,
    trialTimeline          = [],
    recoveryTrajectory     = [],
    observations           = [],
    insufficientData       = false,
  } = analytics;

  const costSign = switchCostMs >= 0 ? "+" : "";

  if (insufficientData) {
    return (
      <div className={`rounded-2xl bg-[#121A2B] p-5 border border-slate-800 space-y-3 ${className}`}>
        <div className="flex items-center gap-2">
          <Shuffle className="w-5 h-5 text-violet-400" />
          <h3 className="text-base font-bold text-white">Task Switching Analysis</h3>
        </div>
        <p className="text-sm text-slate-400">
          Not enough trial data to compute switch-cost metrics. Complete a longer session for detailed results.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-[#121A2B] p-5 sm:p-7 border border-slate-800 space-y-6 ${className}`}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-violet-400" />
              Task Switching & Cognitive Flexibility
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/30">
              Rule-Switch Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {totalSwitches} rule switches • {totalRepeatTrials} repeat trials • {totalSwitchTrials} switch trials
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiTile
          label="Switch Latency Cost"
          value={`${costSign}${Math.round(switchCostMs)}`}
          unit="ms"
          sub="Switch RT − Repeat RT"
          accent="amber"
        />
        <KpiTile
          label="Repeat Accuracy"
          value={`${repeatAccuracyPct.toFixed(1)}%`}
          sub="Stable-rule trials"
          accent="emerald"
        />
        <KpiTile
          label="Switch Accuracy"
          value={`${switchAccuracyPct.toFixed(1)}%`}
          sub="Post-switch trials"
          accent={switchAccuracyPct < repeatAccuracyPct - 5 ? "rose" : "cyan"}
        />
        <KpiTile
          label="Recovery Trials"
          value={recoveryTrials != null ? `~${recoveryTrials}` : "N/A"}
          sub="Trials to return to baseline"
          accent="violet"
        />
      </div>

      {/* Trial-by-trial RT timeline */}
      {trialTimeline.length > 2 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Reaction Time Timeline
            <span className="text-xs font-normal text-slate-500">— switch trials marked</span>
          </h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trialTimeline} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="trial" tick={{ fontSize: 10, fill: "#64748b" }} label={{ value: "Trial #", position: "insideBottomRight", offset: -5, fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} unit="ms" width={50} />
                <Tooltip content={<CustomTooltip />} />
                {trialTimeline
                  .filter(t => t.isSwitch)
                  .map(t => (
                    <ReferenceLine key={t.trial} x={t.trial} stroke="#a78bfa" strokeDasharray="3 2" strokeOpacity={0.5} />
                  ))}
                <ReferenceLine y={repeatMedianRtMs} stroke="#34d399" strokeDasharray="4 2" strokeOpacity={0.6} label={{ value: "Repeat median", position: "insideTopRight", fontSize: 9, fill: "#34d399" }} />
                <ReferenceLine y={switchMedianRtMs} stroke="#f59e0b" strokeDasharray="4 2" strokeOpacity={0.6} label={{ value: "Switch median", position: "insideBottomRight", fontSize: 9, fill: "#f59e0b" }} />
                <Line
                  type="monotone"
                  dataKey="rt"
                  name="Reaction Time"
                  stroke="#22d3ee"
                  strokeWidth={1.5}
                  dot={({ cx, cy, payload }) => (
                    payload.isSwitch
                      ? <circle key={payload.trial} cx={cx} cy={cy} r={5} fill="#a78bfa" stroke="#7c3aed" strokeWidth={1.5} />
                      : <circle key={payload.trial} cx={cx} cy={cy} r={2.5} fill="#22d3ee" stroke="transparent" />
                  )}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono px-2">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-400 inline-block" /> Rule switch trial</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-emerald-400 inline-block" /> Repeat median</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-amber-400 inline-block" /> Switch median</span>
          </div>
        </div>
      )}

      {/* Post-switch recovery trajectory */}
      {recoveryTrajectory.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Post-Switch Recovery Trajectory
            <span className="text-xs font-normal text-slate-500">— performance vs distance from switch</span>
          </h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recoveryTrajectory} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis yAxisId="rt" tick={{ fontSize: 10, fill: "#64748b" }} unit="ms" width={50} />
                <YAxis yAxisId="acc" orientation="right" tick={{ fontSize: 10, fill: "#64748b" }} unit="%" width={36} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                <Bar yAxisId="rt"  dataKey="meanRt"  name="Mean RT" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="acc" dataKey="accuracyPct" name="Accuracy %" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Observations */}
      {observations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white">Behavioral Observations</h4>
          <div className="space-y-2">
            {observations.map((obs, i) => (
              <Observation key={i} text={obs.text} icon={obs.icon === "alert" ? AlertTriangle : obs.icon === "check" ? CheckCircle2 : Activity} accent={obs.accent || "slate"} />
            ))}
          </div>
          <p className="text-[10px] text-slate-600 font-mono italic">
            These observations describe response patterns during this session. They are not diagnostic and do not assess cognitive ability or medical conditions.
          </p>
        </div>
      )}
    </div>
  );
}
