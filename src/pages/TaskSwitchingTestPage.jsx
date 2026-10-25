import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shuffle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Play,
  Activity,
  Check,
  X,
  RotateCcw,
  ChevronRight,
  Palette,
  Hexagon,
} from "lucide-react";
import Button from "../components/Button";
import { startMouseTracking, stopMouseTracking, snapshotAndResetMouseTrial } from "../utils/mouseTracker";
import { analyzeSessionData } from "../utils/api";
import { saveSession } from "../utils/storage";

// ---------------------------------------------------------------------------
// Stimulus Definitions
// Two dimensions: Colour (Cyan / Amber) × Shape (Circle / Triangle)
// 4 combinations. Both rules apply to all 4 stimuli.
// ---------------------------------------------------------------------------
const STIMULI = [
  { id: "cyan_circle",    colour: "Cyan",  shape: "Circle",   colourIdx: 0, shapeIdx: 0 },
  { id: "cyan_triangle",  colour: "Cyan",  shape: "Triangle", colourIdx: 0, shapeIdx: 1 },
  { id: "amber_circle",   colour: "Amber", shape: "Circle",   colourIdx: 1, shapeIdx: 0 },
  { id: "amber_triangle", colour: "Amber", shape: "Triangle", colourIdx: 1, shapeIdx: 1 },
];

// ---------------------------------------------------------------------------
// Rule definitions – answer options for each rule, answer key function
// ---------------------------------------------------------------------------
const RULES = {
  colour: {
    id: "colour",
    label: "IDENTIFY COLOUR",
    prompt: "What colour is the shape?",
    options: [
      { id: "Cyan",  label: "Cyan",   key: "1", arrowKey: "ArrowLeft" },
      { id: "Amber", label: "Amber",  key: "2", arrowKey: "ArrowRight" },
    ],
    getCorrect: (stimulus) => stimulus.colour,
    badgeColor: "cyan",
  },
  shape: {
    id: "shape",
    label: "IDENTIFY SHAPE",
    prompt: "What shape is shown?",
    options: [
      { id: "Circle",   label: "Circle",   key: "1", arrowKey: "ArrowLeft" },
      { id: "Triangle", label: "Triangle", key: "2", arrowKey: "ArrowRight" },
    ],
    getCorrect: (stimulus) => stimulus.shape,
    badgeColor: "amber",
  },
};

// ---------------------------------------------------------------------------
// Trial-block sequence generator
// Generates a measured session schedule: alternating blocks of 5–7 repeat
// trials per rule, then a switch, repeat for the session duration.
// ---------------------------------------------------------------------------
function generateMeasuredBlocks(totalDurationSeconds) {
  // Approximate timing: each trial ~2.5 s average (including display + RT + gap)
  const trialsEstimate = Math.round((totalDurationSeconds * 1000) / 2500);
  const schedule = [];
  let currentRule = "colour";
  let blockSize = 5 + Math.floor(Math.random() * 3); // 5–7 repeat trials

  for (let i = 0; i < trialsEstimate; i++) {
    if (blockSize <= 0) {
      // Switch rule
      currentRule = currentRule === "colour" ? "shape" : "colour";
      blockSize = 5 + Math.floor(Math.random() * 3);
    }
    const stimulus = STIMULI[Math.floor(Math.random() * STIMULI.length)];
    schedule.push({ stimulus, rule: currentRule });
    blockSize--;
  }
  return schedule;
}

// ---------------------------------------------------------------------------
// Practice block generators
// ---------------------------------------------------------------------------
function makePracticeColour() {
  return [
    { stimulus: STIMULI[0], rule: "colour" }, // cyan_circle
    { stimulus: STIMULI[2], rule: "colour" }, // amber_circle
    { stimulus: STIMULI[1], rule: "colour" }, // cyan_triangle
    { stimulus: STIMULI[3], rule: "colour" }, // amber_triangle
  ];
}
function makePracticeShape() {
  return [
    { stimulus: STIMULI[0], rule: "shape" },
    { stimulus: STIMULI[3], rule: "shape" },
    { stimulus: STIMULI[1], rule: "shape" },
    { stimulus: STIMULI[2], rule: "shape" },
  ];
}
function makePracticeSwitch() {
  return [
    { stimulus: STIMULI[0], rule: "colour" },
    { stimulus: STIMULI[3], rule: "colour" },
    { stimulus: STIMULI[1], rule: "shape" },  // switch
    { stimulus: STIMULI[2], rule: "shape" },
    { stimulus: STIMULI[0], rule: "colour" }, // switch
    { stimulus: STIMULI[3], rule: "colour" },
  ];
}

// ---------------------------------------------------------------------------
// Stages
// ---------------------------------------------------------------------------
const STAGE_INSTRUCTIONS       = "instructions";
const STAGE_PRACTICE_COLOUR    = "practice_colour";
const STAGE_PRACTICE_SHAPE     = "practice_shape";
const STAGE_PRACTICE_SWITCH    = "practice_switch";
const STAGE_PRACTICE_COMPLETE  = "practice_complete";
const STAGE_MAIN_TEST          = "main_test";
const STAGE_COMPLETION         = "completion";

// ---------------------------------------------------------------------------
// Stimulus SVG renderer
// ---------------------------------------------------------------------------
function StimulusShape({ stimulus, size = 140 }) {
  const isCircle = stimulus.shape === "Circle";
  const fill = stimulus.colour === "Cyan" ? "#22d3ee" : "#f59e0b";
  const stroke = stimulus.colour === "Cyan" ? "#06b6d4" : "#d97706";

  return (
    <svg width={size} height={size} viewBox="0 0 140 140" className="drop-shadow-xl">
      {isCircle ? (
        <circle cx="70" cy="70" r="58" fill={fill} stroke={stroke} strokeWidth="4" opacity="0.92" />
      ) : (
        <polygon points="70,14 128,122 12,122" fill={fill} stroke={stroke} strokeWidth="4" opacity="0.92" />
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component: Rule Banner (displayed prominently every trial)
// ---------------------------------------------------------------------------
function RuleBanner({ rule }) {
  const r = RULES[rule];
  return (
    <div
      key={rule}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold font-mono uppercase tracking-widest transition-all ${
        rule === "colour"
          ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-300"
          : "bg-amber-500/15 border-amber-500/50 text-amber-300"
      }`}
    >
      {rule === "colour" ? <Palette className="w-4 h-4" /> : <Hexagon className="w-4 h-4" />}
      Current Rule: {r.label}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: Answer buttons
// ---------------------------------------------------------------------------
function AnswerButtons({ rule, onAnswer, feedback, disabled }) {
  const r = RULES[rule];
  return (
    <div className="flex gap-4 justify-center">
      {r.options.map((opt) => {
        let ringStyle = "border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white";
        if (feedback) {
          if (feedback.selected === opt.id) {
            ringStyle = feedback.correct
              ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
              : "border-rose-500 bg-rose-500/15 text-rose-300";
          } else if (!feedback.correct && feedback.answer === opt.id) {
            ringStyle = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
          }
        }
        return (
          <button
            key={opt.id}
            onClick={() => onAnswer(opt.id)}
            disabled={disabled || !!feedback}
            className={`flex flex-col items-center gap-2 px-8 py-5 rounded-2xl border-2 bg-[#121A2B] transition-all text-left font-semibold min-w-[130px] disabled:opacity-50 ${ringStyle}`}
          >
            <span className="text-xs text-slate-500 font-mono">Press {opt.key}</span>
            <span className="text-xl font-bold">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function TaskSwitchingTestPage() {
  const navigate = useNavigate();

  // Stage state machine
  const [stage, setStage]                       = useState(STAGE_INSTRUCTIONS);
  const [practiceStep, setPracticeStep]         = useState(0); // index within practice block

  // Trial display
  const [currentTrial, setCurrentTrial]         = useState(null);
  const [trialFeedback, setTrialFeedback]       = useState(null); // { selected, answer, correct }
  const [wasSwitch, setWasSwitch]               = useState(false);

  // Progress
  const [trialIndex, setTrialIndex]             = useState(0);
  const [timeElapsed, setTimeElapsed]           = useState(0);
  const [isFinishing, setIsFinishing]           = useState(false);

  // Practice
  const practiceBlockRef  = useRef([]);
  const practiceIndexRef  = useRef(0);

  // Measured session
  const scheduleRef         = useRef([]);
  const scheduleIndexRef    = useRef(0);
  const trialsRef           = useRef([]);
  const trialIndexRef       = useRef(0);
  const testStartTimeRef    = useRef(null);
  const totalDurationRef    = useRef(300); // default 5 min; overridden below
  const prevRuleRef         = useRef(null);
  const trialsSinceSwitchRef = useRef(0);
  const stimulusOnsetRef    = useRef(null);
  const isFinishedRef       = useRef(false);

  // Read search params for duration
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dur = parseInt(params.get("duration") || "300", 10);
    totalDurationRef.current = dur;
  }, []);

  // Timer
  useEffect(() => {
    if (stage !== STAGE_MAIN_TEST) return;
    const interval = setInterval(() => {
      const elapsed = Math.round((Date.now() - testStartTimeRef.current) / 1000);
      setTimeElapsed(elapsed);
      if (elapsed >= totalDurationRef.current && !isFinishedRef.current) {
        finishSession();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  // Keyboard handler
  useEffect(() => {
    const handleKey = (e) => {
      if (trialFeedback) return; // already answered
      if (!currentTrial) return;
      const rule = RULES[currentTrial.rule];
      const byKey    = rule.options.find(o => o.key === e.key);
      const byArrow  = rule.options.find(o => o.arrowKey === e.key);
      const matched  = byKey || byArrow;
      if (matched) {
        e.preventDefault();
        handleAnswer(matched.id);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentTrial, trialFeedback, stage]);

  // ---------------------------------------------------------------------------
  // Display a single trial (practice or main)
  // ---------------------------------------------------------------------------
  const showTrial = useCallback((trialSpec, isSwitchTrial) => {
    setWasSwitch(isSwitchTrial);
    setCurrentTrial(trialSpec);
    setTrialFeedback(null);
    stimulusOnsetRef.current = Date.now();
  }, []);

  // ---------------------------------------------------------------------------
  // Practice flow helpers
  // ---------------------------------------------------------------------------
  const startPracticeBlock = useCallback((block, nextStage) => {
    practiceBlockRef.current  = block;
    practiceIndexRef.current  = 0;
    setPracticeStep(0);
    setStage(nextStage);
    showTrial(block[0], false);
  }, [showTrial]);

  const advancePractice = useCallback(() => {
    const block = practiceBlockRef.current;
    const next  = practiceIndexRef.current + 1;
    practiceIndexRef.current = next;
    setPracticeStep(next);

    if (next < block.length) {
      const prevRule = block[next - 1].rule;
      const isSwitch = block[next].rule !== prevRule;
      showTrial(block[next], isSwitch);
    } else {
      // Move to next practice stage
      if (stage === STAGE_PRACTICE_COLOUR) {
        startPracticeBlock(makePracticeShape(), STAGE_PRACTICE_SHAPE);
      } else if (stage === STAGE_PRACTICE_SHAPE) {
        startPracticeBlock(makePracticeSwitch(), STAGE_PRACTICE_SWITCH);
      } else {
        setCurrentTrial(null);
        setStage(STAGE_PRACTICE_COMPLETE);
      }
    }
  }, [stage, showTrial, startPracticeBlock]);

  // ---------------------------------------------------------------------------
  // Main test helpers
  // ---------------------------------------------------------------------------
  const startMainTest = useCallback(() => {
    const schedule = generateMeasuredBlocks(totalDurationRef.current);
    scheduleRef.current       = schedule;
    scheduleIndexRef.current  = 0;
    trialsRef.current         = [];
    trialIndexRef.current     = 0;
    prevRuleRef.current       = null;
    trialsSinceSwitchRef.current = 0;
    testStartTimeRef.current  = Date.now();
    startMouseTracking();
    setTimeElapsed(0);
    setTrialIndex(0);
    setStage(STAGE_MAIN_TEST);

    const first = schedule[0];
    prevRuleRef.current = first.rule;
    showTrial(first, false);
  }, [showTrial]);

  const advanceMainTrial = useCallback(() => {
    const schedule = scheduleRef.current;
    const nextIdx  = scheduleIndexRef.current + 1;
    scheduleIndexRef.current = nextIdx;

    if (nextIdx >= schedule.length || isFinishedRef.current) {
      finishSession();
      return;
    }

    const next     = schedule[nextIdx];
    const isSwitch = next.rule !== prevRuleRef.current;
    prevRuleRef.current = next.rule;

    if (isSwitch) {
      trialsSinceSwitchRef.current = 0;
    } else {
      trialsSinceSwitchRef.current++;
    }

    setTrialIndex(nextIdx);
    showTrial(next, isSwitch);
  }, [showTrial]);

  // ---------------------------------------------------------------------------
  // Answer handler (both practice + main)
  // ---------------------------------------------------------------------------
  const handleAnswer = useCallback((selectedId) => {
    if (!currentTrial || trialFeedback) return;

    const rt     = Date.now() - (stimulusOnsetRef.current || Date.now());
    const rule   = RULES[currentTrial.rule];
    const correct = rule.getCorrect(currentTrial.stimulus);
    const isCorr  = selectedId === correct;
    const mouseStats = snapshotAndResetMouseTrial();

    setTrialFeedback({ selected: selectedId, answer: correct, correct: isCorr });

    // Only record telemetry during measured session
    if (stage === STAGE_MAIN_TEST) {
      const trialSpec = scheduleRef.current[scheduleIndexRef.current];
      trialsRef.current.push({
        trialIndex:        trialIndexRef.current++,
        timestampMs:       Math.round(Date.now() - testStartTimeRef.current),
        stimulusType:      "task_switch_trial",
        symbolId:          currentTrial.stimulus.id,
        symbolLabel:       `${currentTrial.stimulus.colour} ${currentTrial.stimulus.shape}`,
        isTarget:          true,
        responseGiven:     true,
        reactionTimeMs:    Math.max(80, rt),
        isCorrect:         isCorr,
        errorType:         isCorr ? null : "wrong_answer",
        inputDevice:       "mouse",
        interrupted:       false,
        isTaskSwitch:      wasSwitch,
        activeRule:        currentTrial.rule,
        switchType:        wasSwitch ? "switch" : "repeat",
        trialsSinceSwitch: trialsSinceSwitchRef.current,
        ruleCue:           rule.label,
        ...mouseStats,
      });
    }

    // Advance after feedback display
    setTimeout(() => {
      setTrialFeedback(null);
      setCurrentTrial(null);

      // Brief inter-trial blank
      setTimeout(() => {
        if (stage === STAGE_MAIN_TEST) {
          advanceMainTrial();
        } else {
          advancePractice();
        }
      }, 200);
    }, 600);
  }, [currentTrial, trialFeedback, stage, wasSwitch, advanceMainTrial, advancePractice]);

  // Missed-response timeout
  useEffect(() => {
    if (stage !== STAGE_MAIN_TEST || !currentTrial || trialFeedback) return;
    const timer = setTimeout(() => {
      // Timeout: record omission
      const rule = RULES[currentTrial.rule];
      const mouseStats = snapshotAndResetMouseTrial();
      trialsRef.current.push({
        trialIndex:        trialIndexRef.current++,
        timestampMs:       Math.round(Date.now() - testStartTimeRef.current),
        stimulusType:      "task_switch_trial",
        symbolId:          currentTrial.stimulus.id,
        symbolLabel:       `${currentTrial.stimulus.colour} ${currentTrial.stimulus.shape}`,
        isTarget:          true,
        responseGiven:     false,
        reactionTimeMs:    null,
        isCorrect:         false,
        errorType:         "omission",
        inputDevice:       null,
        interrupted:       false,
        isTaskSwitch:      wasSwitch,
        activeRule:        currentTrial.rule,
        switchType:        wasSwitch ? "switch" : "repeat",
        trialsSinceSwitch: trialsSinceSwitchRef.current,
        ruleCue:           rule.label,
        ...mouseStats,
      });
      setCurrentTrial(null);
      setTimeout(() => advanceMainTrial(), 150);
    }, 3500);
    return () => clearTimeout(timer);
  }, [currentTrial, stage, trialFeedback, wasSwitch, advanceMainTrial]);

  // ---------------------------------------------------------------------------
  // Finish session
  // ---------------------------------------------------------------------------
  const finishSession = useCallback(async () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsFinishing(true);
    stopMouseTracking();
    setStage(STAGE_COMPLETION);

    const dur = Math.round((Date.now() - (testStartTimeRef.current || Date.now())) / 1000);
    const result = await analyzeSessionData(
      trialsRef.current,
      dur,
      `session-ts-${Date.now()}`,
      { taskType: "task_switching", inactivityPeriodsCount: 0 }
    );
    saveSession(result);
    navigate("/results");
  }, [navigate]);

  // ---------------------------------------------------------------------------
  // Progress display helpers
  // ---------------------------------------------------------------------------
  const totalDur    = totalDurationRef.current;
  const progressPct = Math.min(100, Math.round((timeElapsed / totalDur) * 100));
  const remaining   = Math.max(0, totalDur - timeElapsed);
  const remMins     = Math.floor(remaining / 60);
  const remSecs     = remaining % 60;

  // ---------------------------------------------------------------------------
  // RENDER: INSTRUCTIONS
  // ---------------------------------------------------------------------------
  if (stage === STAGE_INSTRUCTIONS) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121A2B] border border-violet-500/30 text-xs text-violet-300 font-mono">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Task Switching & Cognitive Flexibility
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Rule-Switch Concentration Task
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg mx-auto">
            Shapes appear one at a time. A banner always tells you the active rule.
            Respond as quickly and accurately as you can. The rule will change at
            intervals — watch the banner carefully.
          </p>
        </div>

        {/* Rule preview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <Palette className="w-4 h-4" />
              Rule A: Identify Colour
            </div>
            <p className="text-sm text-slate-400">
              When you see this rule, choose whether the shape is <span className="text-cyan-300 font-semibold">Cyan</span> or <span className="text-amber-300 font-semibold">Amber</span>.
            </p>
            <div className="flex gap-2 text-xs font-mono">
              <span className="px-2 py-1 bg-[#0B1020] border border-slate-700 rounded text-slate-300">1 or ← → Cyan</span>
              <span className="px-2 py-1 bg-[#0B1020] border border-slate-700 rounded text-slate-300">2 or → Amber</span>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Hexagon className="w-4 h-4" />
              Rule B: Identify Shape
            </div>
            <p className="text-sm text-slate-400">
              When you see this rule, choose whether the shape is a <span className="text-white font-semibold">Circle</span> or a <span className="text-white font-semibold">Triangle</span>.
            </p>
            <div className="flex gap-2 text-xs font-mono">
              <span className="px-2 py-1 bg-[#0B1020] border border-slate-700 rounded text-slate-300">1 or ← Circle</span>
              <span className="px-2 py-1 bg-[#0B1020] border border-slate-700 rounded text-slate-300">2 or → Triangle</span>
            </div>
          </div>
        </div>

        {/* Practice flow plan */}
        <div className="bg-[#121A2B] rounded-2xl border border-slate-800 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">Practice Session (3 rounds, then the real test)</h3>
          <div className="space-y-2 text-sm text-slate-400">
            {[
              ["Practice 1", "Colour rule only — 4 trials"],
              ["Practice 2", "Shape rule only — 4 trials"],
              ["Practice 3", "Both rules alternating — 6 trials"],
              ["Measured Session", "Full task with planned rule switches"],
            ].map(([step, desc]) => (
              <div key={step} className="flex items-center gap-3">
                <ChevronRight className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                <span className="text-slate-300 font-semibold w-32">{step}</span>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={() => startPracticeBlock(makePracticeColour(), STAGE_PRACTICE_COLOUR)}
            variant="primary"
            size="lg"
            className="px-10"
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            Begin Practice
          </Button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: PRACTICE_COMPLETE
  // ---------------------------------------------------------------------------
  if (stage === STAGE_PRACTICE_COMPLETE) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 space-y-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Practice Complete!</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            You've practised both rules and rule-switching. In the measured session,
            the banner will always tell you the active rule before each trial.
            Respond as quickly and accurately as possible.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/30 text-xs text-violet-300 text-left space-y-1">
          <div className="font-bold mb-2">Quick reminders:</div>
          <div>⚡ Watch the rule banner — it updates whenever the rule changes.</div>
          <div>⌨ Keys <strong>1/2</strong> or <strong>←/→ arrows</strong> for fast responses.</div>
          <div>🎯 You have ~3.5 seconds per trial before it advances.</div>
        </div>
        <Button onClick={startMainTest} variant="primary" size="lg" className="px-10 w-full sm:w-auto">
          <Play className="w-5 h-5 mr-2 fill-current" />
          Start Measured Session
        </Button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: COMPLETION
  // ---------------------------------------------------------------------------
  if (stage === STAGE_COMPLETION) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4 animate-fade-in">
        <Activity className="w-8 h-8 text-violet-400 mx-auto animate-spin" />
        <p className="text-slate-300 font-semibold">Analyzing your session…</p>
        <p className="text-slate-500 text-xs font-mono">Computing switch cost metrics and recovery trajectory</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: PRACTICE or MAIN_TEST (shared trial UI)
  // ---------------------------------------------------------------------------
  const isPractice = stage !== STAGE_MAIN_TEST;
  const practiceLabels = {
    [STAGE_PRACTICE_COLOUR]: { step: 1, label: "Colour Rule Practice" },
    [STAGE_PRACTICE_SHAPE]:  { step: 2, label: "Shape Rule Practice" },
    [STAGE_PRACTICE_SWITCH]: { step: 3, label: "Switching Practice" },
  };
  const pInfo = practiceLabels[stage];
  const totalPracticeTrials = practiceBlockRef.current.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        {isPractice ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="px-2 py-0.5 rounded bg-violet-500/15 border border-violet-500/30 text-violet-300">
              Practice {pInfo?.step}/3
            </span>
            <span>{pInfo?.label}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Session
            </span>
            <span>Trial {trialIndex + 1}</span>
          </div>
        )}

        {!isPractice && (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            {remMins}:{String(remSecs).padStart(2, "0")} remaining
          </div>
        )}

        {isPractice && (
          <div className="text-xs text-slate-500 font-mono">
            {practiceIndexRef.current + 1} / {totalPracticeTrials}
          </div>
        )}
      </div>

      {/* Progress bar (main test only) */}
      {!isPractice && (
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* Rule banner */}
      {currentTrial && (
        <div className="flex flex-col items-center gap-2">
          {wasSwitch && stage === STAGE_MAIN_TEST && (
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">
              ↑ Rule changed
            </div>
          )}
          <RuleBanner rule={currentTrial.rule} />
          {wasSwitch && stage === STAGE_PRACTICE_SWITCH && (
            <div className="text-xs text-violet-400 font-mono">← Rule just switched!</div>
          )}
        </div>
      )}

      {/* Stimulus area */}
      <div className="flex flex-col items-center justify-center min-h-[260px] gap-6">
        {currentTrial ? (
          <>
            {/* Feedback indicator */}
            {trialFeedback && (
              <div className={`flex items-center gap-1.5 text-sm font-semibold ${trialFeedback.correct ? "text-emerald-400" : "text-rose-400"}`}>
                {trialFeedback.correct
                  ? <><Check className="w-4 h-4" /> Correct</>
                  : <><X className="w-4 h-4" /> Incorrect — {RULES[currentTrial.rule].getCorrect(currentTrial.stimulus)}</>
                }
              </div>
            )}

            {/* Symbol */}
            <div className={`transition-all duration-200 ${trialFeedback ? "scale-95 opacity-80" : "scale-100 opacity-100"}`}>
              <StimulusShape stimulus={currentTrial.stimulus} size={140} />
            </div>

            {/* Response buttons */}
            <AnswerButtons
              rule={currentTrial.rule}
              onAnswer={handleAnswer}
              feedback={trialFeedback}
              disabled={isFinishing}
            />

            {/* Keyboard hint */}
            <div className="text-[11px] text-slate-600 font-mono">
              Keys 1 / 2 or ← / → to respond
            </div>
          </>
        ) : (
          <div className="text-slate-600 text-sm font-mono animate-pulse">Next trial loading…</div>
        )}
      </div>

      {/* Practice prompt */}
      {isPractice && stage === STAGE_PRACTICE_COLOUR && (
        <p className="text-center text-xs text-cyan-400/70 font-mono">
          Rule: Identify the <strong>colour</strong> of each shape shown.
        </p>
      )}
      {isPractice && stage === STAGE_PRACTICE_SHAPE && (
        <p className="text-center text-xs text-amber-400/70 font-mono">
          Rule: Identify the <strong>shape</strong> shown (circle or triangle).
        </p>
      )}
      {isPractice && stage === STAGE_PRACTICE_SWITCH && (
        <p className="text-center text-xs text-violet-400/70 font-mono">
          Watch the rule banner — it will switch between Colour and Shape.
        </p>
      )}
    </div>
  );
}
