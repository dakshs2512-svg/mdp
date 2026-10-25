/**
 * Focus Drift — API Client Service
 * 
 * Manages communication between React frontend and FastAPI backend (http://127.0.0.1:8000).
 * Provides automatic fallback to local client-side analysis if the backend is unreachable.
 */

import { analyzeSessionTrials } from "./driftAnalysis";
import { ARCHETYPES, ILLUSTRATIVE_SAMPLE_SESSION } from "./sampleData";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * Check health status of the FastAPI backend
 */
export async function checkBackendHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return { online: true, status: "connected", service: data.service || "FastAPI" };
    }
    return { online: false, status: "error", code: res.status };
  } catch (err) {
    clearTimeout(timeoutId);
    return { online: false, status: "offline", error: err.message };
  }
}

/**
 * Fetch simulated session data for Person A, Person B, or Person C
 */
export async function fetchSimulatedArchetype(archetype = "person_a", durationSeconds = 900) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(`${API_BASE_URL}/api/simulate/${archetype}?duration_seconds=${durationSeconds}`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("Backend simulation fetch failed, using client archetype fallback:", err.message);
  }

  // Fallback: return client-side sample modified for this archetype
  const baseSample = JSON.parse(JSON.stringify(ILLUSTRATIVE_SAMPLE_SESSION));
  const arch = ARCHETYPES[archetype] || ARCHETYPES.person_a;
  baseSample.attentionSignature = {
    signatureId: arch.id,
    title: `${arch.name}: ${arch.subtitle}`,
    summary: arch.description,
    triggerCondition: arch.trigger,
    resilienceScore: arch.resilienceScore,
    recommendedStrategy: archetype === "person_b" 
      ? "Implement task-batching: execute similar subtasks in unified blocks; eliminate multi-tab context shifts."
      : (archetype === "person_c" 
          ? "Deploy aggressive environmental gating: full-screen focus mode, notification shielding, and 2-minute resumption warm-ups."
          : "Use micro-interval pacing: 12-minute focus sprints coupled with 90-second sensory resets."),
    radarMetrics: arch.radarMetrics
  };
  return baseSample;
}

/**
 * Submit session trials to FastAPI backend /api/analyze with automatic client fallback
 */
export async function analyzeSessionData(trials, durationSeconds = 600, sessionId = null, sessionMetadata = {}) {
  const finalSessionId = sessionId || `session-${Date.now()}`;
  
  const payload = {
    sessionId: finalSessionId,
    durationSeconds,
    taskType: sessionMetadata.taskType || "symbol_stream",
    interruptionsCount: sessionMetadata.interruptionsCount || 0,
    inactivityPeriodsCount: sessionMetadata.inactivityPeriodsCount || 0,
    totalDistractionRecoveryS: sessionMetadata.totalDistractionRecoveryS || 0,
    trials: trials.map((t, idx) => ({
      trialIndex: t.trialIndex || (idx + 1),
      timestampMs: t.timestampMs || 0,
      stimulusType: t.stimulusType || (t.isTarget ? "target" : "nontarget"),
      symbolId: t.symbolId || null,
      symbolLabel: t.symbolLabel || null,
      isTarget: Boolean(t.isTarget ?? (t.stimulusType === "target")),
      responseGiven: Boolean(t.responseGiven),
      reactionTimeMs: t.reactionTimeMs ? Number(t.reactionTimeMs) : null,
      isCorrect: Boolean(t.isCorrect),
      errorType: t.errorType || null,
      inputDevice: t.inputDevice || "keyboard",
      interrupted: Boolean(t.interrupted),
      mousePathLength: t.mousePathLength || 0,
      mouseJitterScore: t.mouseJitterScore || 0,
      mouseIdleMs: t.mouseIdleMs || 0,
      isTaskSwitch: Boolean(t.isTaskSwitch),
      subtaskId: t.subtaskId || null,
      backtracked: Boolean(t.backtracked),
      recoveryTimeS: t.recoveryTimeS ? Number(t.recoveryTimeS) : null,
      sequenceLength: t.sequenceLength || t.sequence_length || null,
      itemPosition: t.itemPosition || t.item_position || null,
      planningLatencyMs: t.planningLatencyMs || t.planning_latency_ms || null,
      isOrderError: Boolean(t.isOrderError || t.is_order_error),
      isItemError: Boolean(t.isItemError || t.is_item_error),
      roundNumber: t.roundNumber || t.round_number || null,
      instructionText: t.instructionText || t.instruction_text || null,
      activeRule: t.activeRule || t.active_rule || null,
      switchType: t.switchType || t.switch_type || null,
      trialsSinceSwitch: t.trialsSinceSwitch ?? t.trials_since_switch ?? null,
      ruleCue: t.ruleCue || t.rule_cue || null,
    })),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      return {
        ...result,
        analyzedBy: "Focus Drift AI Engine (v2.0)",
        backendUrl: API_BASE_URL,
      };
    } else {
      console.warn(`FastAPI returned status ${response.status}. Falling back to client-side engine.`);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("FastAPI backend unreachable or timed out. Falling back to client-side engine:", err.message);
  }

  // Graceful Fallback: Local Client-Side Analysis
  const localAnalysis = analyzeSessionTrials(trials, durationSeconds, sessionMetadata);
  return {
    ...localAnalysis,
    sessionId: finalSessionId,
    analyzedBy: "Client-Side Engine (Local Fallback)",
    backendUrl: null,
  };
}
