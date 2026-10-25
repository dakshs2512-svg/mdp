/**
 * Focus Drift — High-Precision Mouse & Cursor Dynamics Telemetry
 * 
 * Tracks fine-grained non-medical behavioral motor markers:
 * 1. Path length (total pixels traversed)
 * 2. Cursor velocity (pixels/ms)
 * 3. Spatial Jitter / Hesitation Index:
 *    Ratio of actual curvilinear cursor path to straight-line Euclidean distance
 *    (Higher score indicates indecision, hesitation, or motor instability)
 * 4. Micro-idle duration:
 *    Cumulative milliseconds of cursor stillness during active stimulus presentation
 */

let isTracking = false;
let lastX = null;
let lastY = null;
let lastTimestamp = null;
let totalPathLength = 0;
let initialX = null;
let initialY = null;
let idleTimeMs = 0;
let lastMoveTimestamp = null;
let sampleCount = 0;
let velocities = [];

export function startMouseTracking() {
  if (isTracking || typeof window === "undefined") return;
  isTracking = true;
  totalPathLength = 0;
  initialX = null;
  initialY = null;
  idleTimeMs = 0;
  velocities = [];
  lastMoveTimestamp = performance.now();

  const handleMouseMove = (e) => {
    const now = performance.now();
    const x = e.clientX;
    const y = e.clientY;

    if (initialX === null) {
      initialX = x;
      initialY = y;
    }

    if (lastX !== null && lastY !== null && lastTimestamp !== null) {
      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const dt = now - lastTimestamp;

      if (dist > 0.5) {
        totalPathLength += dist;
        if (dt > 0) {
          velocities.push(dist / dt);
        }
      }

      // Check if cursor was idle before this move
      if (lastMoveTimestamp && now - lastMoveTimestamp > 500) {
        idleTimeMs += (now - lastMoveTimestamp);
      }
    }

    lastX = x;
    lastY = y;
    lastTimestamp = now;
    lastMoveTimestamp = now;
    sampleCount++;
  };

  window.addEventListener("mousemove", handleMouseMove, { passive: true });
  window._focusDriftMouseHandler = handleMouseMove;
}

export function stopMouseTracking() {
  if (!isTracking || typeof window === "undefined") return;
  if (window._focusDriftMouseHandler) {
    window.removeEventListener("mousemove", window._focusDriftMouseHandler);
    window._focusDriftMouseHandler = null;
  }
  isTracking = false;
}

/**
 * Snapshots telemetry for the current trial and resets accumulators for the next trial
 */
export function snapshotAndResetMouseTrial() {
  const now = performance.now();
  if (lastMoveTimestamp && now - lastMoveTimestamp > 400) {
    idleTimeMs += (now - lastMoveTimestamp);
  }

  // Calculate Euclidean straight line distance
  let euclideanDist = 0;
  if (initialX !== null && lastX !== null && initialY !== null && lastY !== null) {
    const dx = lastX - initialX;
    const dy = lastY - initialY;
    euclideanDist = Math.sqrt(dx * dx + dy * dy);
  }

  // Hesitation index = actual path / Euclidean (min 1.0, normalized score)
  let jitterScore = 1.0;
  if (euclideanDist > 10) {
    jitterScore = Math.min(5.0, Math.max(1.0, totalPathLength / euclideanDist));
  } else if (totalPathLength > 20) {
    // Wandered without net displacement
    jitterScore = Math.min(5.0, 1.0 + (totalPathLength / 50.0));
  }

  const avgVelocity = velocities.length > 0 
    ? velocities.reduce((a, b) => a + b, 0) / velocities.length 
    : 0;

  const result = {
    mousePathLength: Math.round(totalPathLength),
    mouseJitterScore: Math.round(jitterScore * 100) / 100,
    mouseIdleMs: Math.round(idleTimeMs),
    mouseVelocity: Math.round(avgVelocity * 1000) // pixels per sec
  };

  // Reset for next trial
  totalPathLength = 0;
  initialX = lastX;
  initialY = lastY;
  idleTimeMs = 0;
  velocities = [];
  lastMoveTimestamp = performance.now();

  return result;
}
