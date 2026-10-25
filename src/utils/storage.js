/**
 * Focus Drift — Local Browser Storage & Export Utility
 * 
 * Manages participant session persistence and research exports (JSON/CSV).
 * All data remains 100% on the local client to maintain privacy.
 */

const ACTIVE_SESSION_KEY = "focus_drift_latest_session";
const SESSION_HISTORY_KEY = "focus_drift_session_history";

/**
 * Save completed session into localStorage
 */
export function saveSession(sessionData) {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionData));
    
    // Also append to session history array (capped at last 10)
    const history = getSessionHistory();
    const updatedHistory = [
      {
        sessionId: sessionData.sessionId,
        completedAt: sessionData.completedAt,
        durationSeconds: sessionData.durationSeconds,
        medianRtMs: sessionData.metrics.medianRtMs,
        stabilityScore: sessionData.metrics.stabilityScore,
        estimatedDriftTimeSeconds: sessionData.metrics.estimatedDriftTimeSeconds,
        isSample: false
      },
      ...history.filter(h => h.sessionId !== sessionData.sessionId)
    ].slice(0, 10);

    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(updatedHistory));
    return true;
  } catch (err) {
    console.error("Failed to save session to localStorage:", err);
    return false;
  }
}

/**
 * Retrieve the most recent session from localStorage,
 * or return the illustrative sample data if none exists.
 */
export function getLatestSession() {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.metrics) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read session from localStorage, falling back to sample:", err);
  }
  return null;
}

/**
 * Retrieve session history summary list
 */
export function getSessionHistory() {
  try {
    const raw = localStorage.getItem(SESSION_HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read session history:", err);
  }
  return [];
}

/**
 * Clear local session data
 */
export function clearAllLocalSessions() {
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    localStorage.removeItem(SESSION_HISTORY_KEY);
    return true;
  } catch (err) {
    console.error("Failed to clear local sessions:", err);
    return false;
  }
}

/**
 * Export session data as JSON file download
 */
export function exportSessionAsJson(sessionData) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessionData, null, 2));
  const downloadAnchor = document.createElement("a");
  const filename = `focus-drift-${sessionData.sessionId || 'session'}.json`;
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Export session trial data as CSV file download
 */
export function exportSessionAsCsv(sessionData) {
  if (!sessionData || !sessionData.trials) return;

  const headers = [
    "Trial",
    "TimestampSec",
    "Symbol",
    "IsTarget",
    "ReactionTimeMs",
    "RollingRtMs",
    "IsCorrect",
    "InputDevice",
    "Outcome",
    "Interrupted",
  ];
  const rows = sessionData.trials.map(t => [
    t.trialIndex,
    t.timeSec,
    t.symbolLabel || t.stimulus || "",
    t.isTarget !== undefined ? (t.isTarget ? "true" : "false") : "",
    t.rt !== null ? t.rt : "",
    t.rollingRt !== null ? t.rollingRt : "",
    t.isCorrect ? "true" : "false",
    t.inputDevice || "",
    t.type || "",
    t.interrupted ? "true" : "false",
  ]);

  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", url);
  downloadAnchor.setAttribute("download", `focus-drift-${sessionData.sessionId || 'session'}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
