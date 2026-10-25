import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  Download,
  Activity,
  Zap,
  Clock,
  Target,
  Layers,
  FileText,
  ShieldCheck,
  Sparkles,
  Info,
  Trash2,
  Play,
  Cpu,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Compass,
  AlertCircle,
} from "lucide-react";
import Button from "../components/Button";
import MetricCard from "../components/MetricCard";
import DriftTimeline from "../components/DriftTimeline";
import PerformanceChart from "../components/PerformanceChart";
import AttentionTrajectoryGraph from "../components/AttentionTrajectoryGraph";
import FeatureAttributionCard from "../components/FeatureAttributionCard";
import SignatureCard from "../components/SignatureCard";
import WorkingMemoryAnalyticsCard from "../components/WorkingMemoryAnalyticsCard";
import DisclaimerBanner from "../components/DisclaimerBanner";
import { getLatestSession, saveSession, exportSessionAsJson, exportSessionAsCsv, clearAllLocalSessions } from "../utils/storage";
import { ILLUSTRATIVE_SAMPLE_SESSION } from "../utils/sampleData";
import { checkBackendHealth, analyzeSessionData, fetchSimulatedArchetype, API_BASE_URL } from "../utils/api";

export default function ResultsDashboardPage() {
  const [sessionData, setSessionData] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [hasRealSession, setHasRealSession] = useState(false);
  const [backendHealth, setBackendHealth] = useState({ online: false, status: "checking" });
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [activeArchetype, setActiveArchetype] = useState("person_a");

  useEffect(() => {
    // Check backend health status
    checkBackendHealth().then((res) => {
      setBackendHealth(res);
    });

    const saved = getLatestSession();
    if (saved) {
      setSessionData(saved);
      setHasRealSession(true);
      setIsDemoMode(false);
    } else {
      setSessionData(ILLUSTRATIVE_SAMPLE_SESSION);
      setHasRealSession(false);
      setIsDemoMode(true);
    }
  }, []);

  const handleToggleDemoMode = (showDemo) => {
    if (showDemo) {
      setSessionData(ILLUSTRATIVE_SAMPLE_SESSION);
      setIsDemoMode(true);
    } else {
      const saved = getLatestSession();
      if (saved) {
        setSessionData(saved);
        setIsDemoMode(false);
      }
    }
  };

  const handleSelectArchetype = async (archetypeId) => {
    setActiveArchetype(archetypeId);
    try {
      const simulated = await fetchSimulatedArchetype(archetypeId, 900);
      if (simulated) {
        setSessionData(simulated);
        setIsDemoMode(true);
      }
    } catch (err) {
      console.error("Failed to load archetype simulation:", err);
    }
  };

  const handleClearData = () => {
    if (window.confirm("Clear your recorded test session from this browser?")) {
      clearAllLocalSessions();
      setHasRealSession(false);
      setSessionData(ILLUSTRATIVE_SAMPLE_SESSION);
      setIsDemoMode(true);
    }
  };

  const handleReanalyzeWithBackend = async () => {
    if (!sessionData || !sessionData.trials || sessionData.trials.length === 0) return;
    setIsReanalyzing(true);
    try {
      const reanalyzed = await analyzeSessionData(
        sessionData.trials,
        sessionData.durationSeconds || 600,
        sessionData.sessionId,
        {
          taskType: sessionData.taskType || "symbol_stream",
          interruptionsCount: sessionData.metrics?.interruptionsCount || 0,
        }
      );
      if (reanalyzed) {
        saveSession(reanalyzed);
        setSessionData(reanalyzed);
      }
    } catch (err) {
      console.error("Re-analysis failed:", err);
    } finally {
      setIsReanalyzing(false);
    }
  };

  if (!sessionData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Activity className="w-8 h-8 text-violet-400 mx-auto animate-spin" />
        <p className="text-slate-400 text-sm">Loading performance analysis...</p>
      </div>
    );
  }

  const {
    metrics = {},
    trials = [],
    phases = [],
    featureAttribution = [],
    attentionSignature = null,
    durationSeconds = 600,
    completedAt,
    isSample,
    analyzedBy,
    taskType,
  } = sessionData;

  const durationMins = Math.max(1, Math.round(durationSeconds / 60));
  const taskName = taskType === "working_memory"
    ? `${durationMins}-minute working memory & instruction tracking`
    : taskType === "reading_comprehension"
    ? `${durationMins}-minute reading & comprehension task`
    : `${durationMins}-minute concentration task`;

  // Format key figures
  const stabilityDisplay = metrics.attentionStabilityPct ?? metrics.stabilityScore ?? 74;
  const driftDisplay = metrics.firstDetectedDriftFormatted ?? (metrics.estimatedDriftTimeSeconds ? `${metrics.estimatedDriftTimeSeconds}s` : "8 min 42 sec");
  const variabilityChange = metrics.responseVariabilityChangePct ?? 31.0;
  const missedCount = metrics.omissionCount ?? 7;
  const recoveryTimeDisplay = metrics.distractionRecoveryTimeSec ?? 14.0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* ----------------- TOP BANNER & MODE SWITCHER ----------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans tracking-tight">
              Focus Drift Analysis Dashboard
            </h1>
            {isDemoMode || isSample ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Benchmark Preview
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Live Participant Session</span>
              </span>
            )}
            {analyzedBy && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/30 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span>{analyzedBy}</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 flex flex-wrap items-center gap-2">
            <span>
              {isDemoMode || isSample 
                ? "Standardized college MDP benchmark demonstrating AI change-point and attention signatures."
                : `Recorded at ${new Date(completedAt).toLocaleTimeString()} • ${taskName}`}
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-[11px] text-slate-500">
              FastAPI: {backendHealth.online ? (
                <span className="text-emerald-400 font-semibold">Online (port 8000)</span>
              ) : (
                <span className="text-amber-400">Offline (Client Fallback Active)</span>
              )}
            </span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {hasRealSession && (
            <div className="inline-flex rounded-xl bg-[#121A2B] p-1 border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleToggleDemoMode(false)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  !isDemoMode ? "bg-violet-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                My Real Session
              </button>
              <button
                type="button"
                onClick={() => handleToggleDemoMode(true)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  isDemoMode ? "bg-violet-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                Benchmark Demo
              </button>
            </div>
          )}

          {!isDemoMode && hasRealSession && backendHealth.online && (
            <button
              type="button"
              onClick={handleReanalyzeWithBackend}
              disabled={isReanalyzing}
              className="px-3 py-1.5 rounded-xl bg-[#121A2B] hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isReanalyzing ? "animate-spin" : ""}`} />
              <span>{isReanalyzing ? "Analyzing..." : "Re-run via FastAPI"}</span>
            </button>
          )}

          <Button
            to="/test"
            size="sm"
            variant="primary"
            icon={RotateCcw}
            iconPosition="left"
          >
            Retake Test
          </Button>
        </div>
      </div>

      {/* ----------------- EXACT PROTOTYPE SUMMARY HERO BAR ----------------- */}
      <div className="bg-gradient-to-r from-violet-950/50 via-[#121A2B] to-cyan-950/40 p-6 sm:p-7 rounded-2xl border-2 border-violet-500/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
              FOCUS DRIFT PROTOCOL OUTCOME
            </span>
          </div>
          <div className="text-xs font-mono text-slate-300">
            <strong>Task:</strong> <span className="capitalize">{taskName}</span>
          </div>
        </div>

        {/* 5 Core MDP Metrics Callout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-1">
          {/* 1. Attention Stability */}
          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Attention Stability</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white flex items-baseline gap-1">
              <span>{stabilityDisplay}%</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Continuous vigilance</span>
          </div>

          {/* 2. First Detected Drift */}
          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">First Detected Drift</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300 flex items-baseline gap-1">
              <span>{driftDisplay}</span>
            </div>
            <span className="text-[10px] text-amber-400/90 font-mono">Onset inflection point</span>
          </div>

          {/* 3. Response Variability */}
          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Response Variability</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-violet-300 flex items-baseline gap-1">
              <span>↑ {variabilityChange}%</span>
            </div>
            <span className="text-[10px] text-violet-400 font-mono">RTCV divergence</span>
          </div>

          {/* 4. Missed Targets */}
          <div className="space-y-1">
            <span className="text-xs text-slate-400 block font-medium">Missed Targets</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-300 flex items-baseline gap-1">
              <span>{missedCount}</span>
            </div>
            <span className="text-[10px] text-rose-400/90 font-mono">Omission lapses</span>
          </div>

          {/* 5. Distraction Recovery Time */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-400 block font-medium">Distraction Recovery</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-300 flex items-baseline gap-1">
              <span>{recoveryTimeDisplay} sec</span>
            </div>
            <span className="text-[10px] text-cyan-400/90 font-mono">Pacing stabilization</span>
          </div>
        </div>
      </div>

      {/* ----------------- ATTENTION TRAJECTORY GRAPH (100% -> 40%) ----------------- */}
      <AttentionTrajectoryGraph
        trials={trials}
        driftTimeSeconds={metrics.firstDetectedDriftSec || metrics.estimatedDriftTimeSeconds}
        driftFormatted={driftDisplay}
        stabilityPct={stabilityDisplay}
      />

      {/* ----------------- WORKING MEMORY SPECIFIC ANALYTICS ----------------- */}
      {sessionData.workingMemoryAnalytics && (
        <WorkingMemoryAnalyticsCard analytics={sessionData.workingMemoryAnalytics} />
      )}

      {/* ----------------- INDIVIDUAL ATTENTION SIGNATURE CARD ----------------- */}
      <SignatureCard
        signature={attentionSignature}
        onSelectArchetype={handleSelectArchetype}
        activeArchetype={activeArchetype}
      />

      {/* ----------------- BEHAVIOURAL FEATURE ATTRIBUTION ----------------- */}
      <FeatureAttributionCard features={featureAttribution} />

      {/* ----------------- 3-PHASE STABILITY TIMELINE ----------------- */}
      <DriftTimeline
        phases={phases}
        estimatedDriftTimeSeconds={metrics.firstDetectedDriftSec || metrics.estimatedDriftTimeSeconds || 522}
        durationSeconds={durationSeconds}
      />

      {/* ----------------- DETAILED RT TIME-SERIES CHART ----------------- */}
      <PerformanceChart
        trials={trials}
        driftTrialIndex={metrics.estimatedDriftTrial}
        baselineMean={phases && phases[0]?.meanRt ? parseInt(phases[0].meanRt, 10) : metrics.meanRtMs}
        isSample={isDemoMode || isSample}
      />

      {/* ----------------- FOOTER ACTIONS & EXPORT ----------------- */}
      <div className="p-5 rounded-2xl bg-[#121A2B] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 font-mono">
          Session ID: <span className="text-slate-300">{sessionData.sessionId}</span> • Total Trials: {metrics.totalTrials}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => exportSessionAsCsv(sessionData)}
            variant="outline"
            size="sm"
            icon={Download}
          >
            Export CSV
          </Button>

          <Button
            onClick={() => exportSessionAsJson(sessionData)}
            variant="outline"
            size="sm"
            icon={Download}
          >
            Export JSON
          </Button>

          {hasRealSession && (
            <button
              onClick={handleClearData}
              className="text-xs text-slate-500 hover:text-rose-400 transition-colors p-2"
              title="Delete session"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
