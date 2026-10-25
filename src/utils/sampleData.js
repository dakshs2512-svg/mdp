/**
 * Focus Drift — Sample Performance Dataset & Individual Signature Archetypes
 * 
 * Illustrative benchmark data representing a 15-minute concentration task:
 * - Attention stability: 74%
 * - First detected drift: 8 min 42 sec
 * - Response variability: ↑ 31%
 * - Missed targets: 7
 * - Distraction recovery time: 14 sec
 * - 3 Archetypes: Person A (Time-Decay), Person B (Task-Switch), Person C (Interruption Fragility)
 */

export const ILLUSTRATIVE_SAMPLE_SESSION = {
  sessionId: "sample-15min-benchmark",
  isSample: true,
  sampleLabel: "15-Minute Concentration Task",
  taskType: "symbol_stream",
  durationSeconds: 900, // 15-minute benchmark
  completedAt: new Date(Date.now() - 3600000).toISOString(),
  participantLabel: "MDP Participant Benchmark",
  analyzedBy: "Focus Drift AI Engine",
  
  metrics: {
    attentionStabilityPct: 74.0,
    firstDetectedDriftSec: 522.0,
    firstDetectedDriftFormatted: "8 min 42 sec",
    responseVariabilityChangePct: 31.0,
    omissionCount: 7,
    omissionRatePct: 8.2,
    commissionCount: 4,
    commissionRatePct: 14.3,
    distractionRecoveryTimeSec: 14.0,
    medianRtMs: 348,
    meanRtMs: 372,
    stdDevMs: 82,
    coefficientOfVariation: 0.220,
    totalTrials: 60,
    totalTargets: 45,
    totalNonTargets: 15,
    correctHits: 38,
    correctRejections: 11,
    accuracyPct: 81.7,
    backtrackCount: 2,
    interruptionsCount: 2,
    inactivityPeriodsCount: 3,
    inputBreakdown: { keyboard: 52, mouse: 8 }
  },

  phases: [
    {
      title: "Phase 1: Focused State",
      timeRange: "0:00 – 5:39",
      badge: "Optimal Focus",
      badgeColor: "emerald",
      meanRt: "335 ms",
      description: "Consistent motor response speed, prompt target discrimination, and minimal motor jitter."
    },
    {
      title: "Phase 2: Transition Zone",
      timeRange: "5:39 – 8 min 42 sec",
      badge: "Unstable Attention",
      badgeColor: "amber",
      meanRt: "368 ms",
      description: "Micro-variations begin surfacing; reaction time distribution widens and hand jitter increases."
    },
    {
      title: "Phase 3: Attention Drift",
      timeRange: "8 min 42 sec – 15:00",
      badge: "Drift Detected",
      badgeColor: "violet",
      meanRt: "438 ms",
      description: "Marked latency degradation, omission clustering, and elevated distraction recovery latency."
    }
  ],

  featureAttribution: [
    {
      feature: "Response Time Variability (CV)",
      unit: "%",
      preValue: "0.16",
      postValue: "0.26",
      delta: "+31.0%",
      impact: "High",
      direction: "up",
      description: "Hallmark biomarker of periodic attentional lapses and motor pacing variability."
    },
    {
      feature: "Distraction Recovery Latency",
      unit: "sec",
      preValue: "3.2s",
      postValue: "14.0s",
      delta: "+10.8s",
      impact: "High",
      direction: "up",
      description: "Time elapsed before reaction time stabilizes back to baseline following an interruption."
    },
    {
      feature: "Missed Targets (Omissions)",
      unit: "count",
      preValue: "1 miss (2.5%)",
      postValue: "6 misses (16.2%)",
      delta: "+13.7%",
      impact: "High",
      direction: "up",
      description: "Momentary microsleeps and complete vigilance dropouts during active target presentation."
    },
    {
      feature: "Mouse Hesitation & Jitter Index",
      unit: "index",
      preValue: "1.1",
      postValue: "2.8",
      delta: "+38.4%",
      impact: "Moderate",
      direction: "up",
      description: "Sub-threshold hand tremors, erratic cursor sweeps, and hover indecision before clicking."
    },
    {
      feature: "Response Inhibition (Commissions)",
      unit: "%",
      preValue: "4.0%",
      postValue: "18.2%",
      delta: "+14.2%",
      impact: "Moderate",
      direction: "up",
      description: "Premature pressing on distractor items, signaling impulse control deterioration."
    }
  ],

  attentionSignature: {
    signatureId: "person_a",
    title: "Person A: Time-Decay Drift",
    summary: "Attention degrades progressively over continuous time, becoming unstable around minute 8–12.",
    triggerCondition: "Unbroken continuous focus exceeding sustained vigilance capacity (approx 10–12 minutes).",
    resilienceScore: 72,
    recommendedStrategy: "Use micro-interval pacing: 12-minute focus sprints coupled with 90-second sensory resets.",
    radarMetrics: {
      sustainedVigilance: 65,
      switchTolerance: 82,
      interruptionRecovery: 60,
      inhibitoryControl: 75,
      motorConsistency: 68
    }
  },

  trials: [
    // Phase 1: Focused (0 to ~340s)
    { trialIndex: 1, timeSec: 15.2, stimulus: "target", symbolLabel: "Target", rt: 320, rollingRt: 320, attentionPct: 98, phaseState: "focused", isCorrect: true, type: "normal", mouseJitter: 0.9 },
    { trialIndex: 2, timeSec: 32.1, stimulus: "target", symbolLabel: "Target", rt: 312, rollingRt: 316, attentionPct: 97, phaseState: "focused", isCorrect: true, type: "normal", mouseJitter: 1.0 },
    { trialIndex: 3, timeSec: 48.5, stimulus: "nontarget", symbolLabel: "Distractor", rt: null, rollingRt: 316, attentionPct: 97, phaseState: "focused", isCorrect: true, type: "normal", mouseJitter: 0.8 },
    { trialIndex: 4, timeSec: 65.0, stimulus: "target", symbolLabel: "Target", rt: 335, rollingRt: 322, attentionPct: 96, phaseState: "focused", isCorrect: true, type: "normal", mouseJitter: 1.1 },
    { trialIndex: 5, timeSec: 82.4, stimulus: "target", symbolLabel: "Target", rt: 318, rollingRt: 321, attentionPct: 95, phaseState: "focused", isCorrect: true, type: "normal", mouseJitter: 0.9 },
    { trialIndex: 6, timeSec: 102.1, stimulus: "target", symbolLabel: "Target", rt: 328, rollingRt: 323, attentionPct: 95, phaseState: "focused", isCorrect: true, type: "normal", mouseJitter: 1.0 },
    { trialIndex: 7, timeSec: 121.7, stimulus: "nontarget", symbolLabel: "Distractor", rt: null, rollingRt: 323, attentionPct: 94, phaseState: "focused", isCorrect: true, type: "normal", mouseJitter: 0.7 },
    { trialIndex: 8, timeSec: 140.2, stimulus: "target", symbolLabel: "Target", rt: 330, rollingRt: 325, attentionPct: 94, phaseState: "focused", isCorrect: true, type: "normal", mouseJitter: 1.0 },
    { trialIndex: 9, timeSec: 162.0, stimulus: "target", symbolLabel: "Target", rt: 342, rollingRt: 329, attentionPct: 93, phaseState: "focused", isCorrect: true, type: "normal", mouseJitter: 1.2 },
    { trialIndex: 10, timeSec: 185.3, stimulus: "target", symbolLabel: "Target", rt: 334, rollingRt: 331, attentionPct: 92, phaseState: "focused", isCorrect: true, type: "normal", mouseJitter: 1.1 },
    { trialIndex: 11, timeSec: 210.8, stimulus: "nontarget", symbolLabel: "Distractor", rt: null, rollingRt: 331, attentionPct: 92, phaseState: "focused", isCorrect: true, type: "normal", mouseJitter: 0.9 },
    { trialIndex: 12, timeSec: 235.4, stimulus: "target", symbolLabel: "Target", rt: 338, rollingRt: 333, attentionPct: 91, phaseState: "focused", isCorrect: true, type: "normal", mouseJitter: 1.0 },
    { trialIndex: 13, timeSec: 260.1, stimulus: "target", symbolLabel: "Target", rt: 345, rollingRt: 336, attentionPct: 91, phaseState: "focused", isCorrect: true, type: "normal", mouseJitter: 1.2 },
    { trialIndex: 14, timeSec: 285.9, stimulus: "target", symbolLabel: "Target", rt: 350, rollingRt: 341, attentionPct: 90, phaseState: "focused", isCorrect: true, type: "normal", mouseJitter: 1.3 },
    { trialIndex: 15, timeSec: 310.2, stimulus: "nontarget", symbolLabel: "Distractor", rt: null, rollingRt: 341, attentionPct: 90, phaseState: "focused", isCorrect: true, type: "normal", mouseJitter: 1.1 },
    { trialIndex: 16, timeSec: 335.7, stimulus: "target", symbolLabel: "Target", rt: 348, rollingRt: 344, attentionPct: 89, phaseState: "focused", isCorrect: true, type: "normal", mouseJitter: 1.3 },

    // Phase 2: Transition Zone (340s to 522s / 8m 42s)
    { trialIndex: 17, timeSec: 360.5, stimulus: "target", symbolLabel: "Target", rt: 375, rollingRt: 354, attentionPct: 85, phaseState: "unstable", isCorrect: true, type: "elevated_latency", mouseJitter: 1.7 },
    { trialIndex: 18, timeSec: 385.2, stimulus: "nontarget", symbolLabel: "Distractor", rt: 310, rollingRt: 354, attentionPct: 83, phaseState: "unstable", isCorrect: false, type: "commission", mouseJitter: 2.1 },
    { trialIndex: 19, timeSec: 410.0, stimulus: "target", symbolLabel: "Target", rt: 362, rollingRt: 358, attentionPct: 82, phaseState: "unstable", isCorrect: true, type: "normal", mouseJitter: 1.8 },
    { trialIndex: 20, timeSec: 435.6, stimulus: "target", symbolLabel: "Target", rt: 390, rollingRt: 368, attentionPct: 80, phaseState: "unstable", isCorrect: true, type: "elevated_latency", mouseJitter: 2.2 },
    { trialIndex: 21, timeSec: 462.1, stimulus: "target", symbolLabel: "Target", rt: 370, rollingRt: 374, attentionPct: 78, phaseState: "unstable", isCorrect: true, type: "normal", mouseJitter: 1.9 },
    { trialIndex: 22, timeSec: 488.4, stimulus: "nontarget", symbolLabel: "Distractor", rt: null, rollingRt: 374, attentionPct: 76, phaseState: "unstable", isCorrect: true, type: "normal", mouseJitter: 1.5 },
    { trialIndex: 23, timeSec: 512.9, stimulus: "target", symbolLabel: "Target", rt: 410, rollingRt: 383, attentionPct: 74, phaseState: "unstable", isCorrect: true, type: "elevated_latency", mouseJitter: 2.5 },

    // Trial 24 = Inflection Drift Point (8m 42s / 522s)
    { trialIndex: 24, timeSec: 522.0, stimulus: "target", symbolLabel: "Target", rt: 465, rollingRt: 408, attentionPct: 70, phaseState: "drift", isCorrect: true, type: "drift_point", mouseJitter: 3.2 },

    // Phase 3: Drift & Degradation (522s to 900s)
    { trialIndex: 25, timeSec: 548.3, stimulus: "target", symbolLabel: "Target", rt: null, rollingRt: 408, attentionPct: 66, phaseState: "drift", isCorrect: false, type: "omission", mouseJitter: 2.8 },
    { trialIndex: 26, timeSec: 572.1, stimulus: "nontarget", symbolLabel: "Distractor", rt: null, rollingRt: 408, attentionPct: 63, phaseState: "drift", isCorrect: true, type: "normal", mouseJitter: 2.4 },
    { trialIndex: 27, timeSec: 598.0, stimulus: "target", symbolLabel: "Target", rt: 485, rollingRt: 432, attentionPct: 60, phaseState: "drift", isCorrect: true, type: "elevated_latency", mouseJitter: 3.4 },
    { trialIndex: 28, timeSec: 625.4, stimulus: "target", symbolLabel: "Target", rt: null, rollingRt: 432, attentionPct: 58, phaseState: "drift", isCorrect: false, type: "omission", mouseJitter: 3.1 },
    { trialIndex: 29, timeSec: 650.2, stimulus: "nontarget", symbolLabel: "Distractor", rt: 340, rollingRt: 432, attentionPct: 55, phaseState: "drift", isCorrect: false, type: "commission", mouseJitter: 3.6 },
    { trialIndex: 30, timeSec: 676.8, stimulus: "target", symbolLabel: "Target", rt: 510, rollingRt: 460, attentionPct: 53, phaseState: "drift", isCorrect: true, type: "elevated_latency", mouseJitter: 3.9 },
    { trialIndex: 31, timeSec: 704.5, stimulus: "target", symbolLabel: "Target", rt: 495, rollingRt: 488, attentionPct: 50, phaseState: "drift", isCorrect: true, type: "elevated_latency", mouseJitter: 3.5 },
    { trialIndex: 32, timeSec: 730.0, stimulus: "nontarget", symbolLabel: "Distractor", rt: null, rollingRt: 488, attentionPct: 48, phaseState: "drift", isCorrect: true, type: "normal", mouseJitter: 2.7 },
    { trialIndex: 33, timeSec: 755.2, stimulus: "target", symbolLabel: "Target", rt: null, rollingRt: 488, attentionPct: 45, phaseState: "drift", isCorrect: false, type: "omission", mouseJitter: 3.3 },
    { trialIndex: 34, timeSec: 782.9, stimulus: "target", symbolLabel: "Target", rt: 540, rollingRt: 507, attentionPct: 43, phaseState: "drift", isCorrect: true, type: "elevated_latency", mouseJitter: 4.1 },
    { trialIndex: 35, timeSec: 810.1, stimulus: "nontarget", symbolLabel: "Distractor", rt: 360, rollingRt: 507, attentionPct: 41, phaseState: "drift", isCorrect: false, type: "commission", mouseJitter: 3.7 },
    { trialIndex: 36, timeSec: 838.4, stimulus: "target", symbolLabel: "Target", rt: null, rollingRt: 507, attentionPct: 40, phaseState: "drift", isCorrect: false, type: "omission", mouseJitter: 3.8 },
    { trialIndex: 37, timeSec: 865.0, stimulus: "target", symbolLabel: "Target", rt: 565, rollingRt: 527, attentionPct: 38, phaseState: "drift", isCorrect: true, type: "elevated_latency", mouseJitter: 4.3 },
    { trialIndex: 38, timeSec: 890.2, stimulus: "target", symbolLabel: "Target", rt: 535, rollingRt: 535, attentionPct: 36, phaseState: "drift", isCorrect: true, type: "elevated_latency", mouseJitter: 4.0 }
  ]
};

export const ARCHETYPES = {
  person_a: {
    id: "person_a",
    name: "Person A",
    subtitle: "Time-Decay Drift",
    driftTime: "8 min 42 sec",
    stability: "74%",
    description: "Attention becomes unstable after ~10-12 minutes of unbroken concentration. Exhibits gradual fatigue and widening response time distribution.",
    trigger: "Continuous unbroken duration without sensory pause",
    resilienceScore: 72,
    radarMetrics: {
      sustainedVigilance: 65,
      switchTolerance: 85,
      interruptionRecovery: 68,
      inhibitoryControl: 74,
      motorConsistency: 66
    }
  },
  person_b: {
    id: "person_b",
    name: "Person B",
    subtitle: "Task-Switching Vulnerability",
    driftTime: "Stable until switch",
    stability: "68%",
    description: "Attention remains stable for 25 minutes during uniform tasks, but deteriorates rapidly and suffers high error bursts immediately following task switching.",
    trigger: "Context switching between reading passages and comprehension check questions",
    resilienceScore: 68,
    radarMetrics: {
      sustainedVigilance: 88,
      switchTolerance: 42,
      interruptionRecovery: 70,
      inhibitoryControl: 62,
      motorConsistency: 76
    }
  },
  person_c: {
    id: "person_c",
    name: "Person C",
    subtitle: "Interruption Fragility",
    driftTime: "4 min 40 sec",
    stability: "61%",
    description: "Performance becomes erratic and inconsistent after repeated interruptions. Recovery latency averages 14-18 seconds before returning to baseline pacing.",
    trigger: "External disruptions, notifications, and tab focus loss",
    resilienceScore: 61,
    radarMetrics: {
      sustainedVigilance: 70,
      switchTolerance: 72,
      interruptionRecovery: 38,
      inhibitoryControl: 65,
      motorConsistency: 54
    }
  }
};
