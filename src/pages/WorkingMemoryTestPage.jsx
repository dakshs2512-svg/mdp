import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Brain,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Play,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Check,
  X,
  Keyboard,
} from "lucide-react";
import Button from "../components/Button";
import SymbolRenderer from "../components/SymbolRenderer";
import { WORKING_MEMORY_GRID_SYMBOLS, SYMBOLS } from "../utils/symbols";
import { startMouseTracking, stopMouseTracking, snapshotAndResetMouseTrial } from "../utils/mouseTracker";
import { analyzeSessionData } from "../utils/api";
import { saveSession } from "../utils/storage";

// Multi-round progression (6 rounds, 4–6 minutes total gameplay)
const TASK_ROUNDS = [
  {
    roundNumber: 1,
    sequenceLength: 2,
    title: "Round 1: 2-Step Baseline",
    instruction: "Select the Blue Circle, then the Emerald Triangle.",
    targetSequence: [SYMBOLS.BLUE_CIRCLE, SYMBOLS.EMERALD_TRIANGLE],
    showDelay: 0,
    hint: "Click the cards in exact sequence order or press keys 1–6."
  },
  {
    roundNumber: 2,
    sequenceLength: 2,
    title: "Round 2: 2-Step Pacing",
    instruction: "Select the Cyan Square, then the Rose Hexagon.",
    targetSequence: [SYMBOLS.CYAN_SQUARE, SYMBOLS.ROSE_HEXAGON],
    showDelay: 0,
    hint: "Maintain a steady rhythm without rushing."
  },
  {
    roundNumber: 3,
    sequenceLength: 3,
    title: "Round 3: 3-Step Sequence",
    instruction: "Select the Amber Diamond, then the Blue Circle, then the Purple Circle.",
    targetSequence: [SYMBOLS.AMBER_DIAMOND, SYMBOLS.BLUE_CIRCLE, SYMBOLS.PURPLE_CIRCLE],
    showDelay: 0,
    hint: "Sequence length expanded to 3 items."
  },
  {
    roundNumber: 4,
    sequenceLength: 3,
    title: "Round 4: 3-Step Retention",
    instruction: "Select the Emerald Triangle, then the Cyan Square, then the Amber Diamond.",
    targetSequence: [SYMBOLS.EMERALD_TRIANGLE, SYMBOLS.CYAN_SQUARE, SYMBOLS.AMBER_DIAMOND],
    showDelay: 0,
    hint: "Track all three targets in sequential order."
  },
  {
    roundNumber: 5,
    sequenceLength: 4,
    title: "Round 5: 4-Step Cognitive Load",
    instruction: "Select the Rose Hexagon, then the Blue Circle, then the Amber Diamond, then the Emerald Triangle.",
    targetSequence: [SYMBOLS.ROSE_HEXAGON, SYMBOLS.BLUE_CIRCLE, SYMBOLS.AMBER_DIAMOND, SYMBOLS.EMERALD_TRIANGLE],
    showDelay: 0,
    hint: "Sequence length is now 4 items. Form an internal sequence before starting."
  },
  {
    roundNumber: 6,
    sequenceLength: 4,
    title: "Round 6: 4-Step Recovery & Fatigue",
    instruction: "Select the Purple Circle, then the Cyan Square, then the Rose Hexagon, then the Blue Circle.",
    targetSequence: [SYMBOLS.PURPLE_CIRCLE, SYMBOLS.CYAN_SQUARE, SYMBOLS.ROSE_HEXAGON, SYMBOLS.BLUE_CIRCLE],
    showDelay: 0,
    hint: "Final evaluation round: testing stability under sustained mental demands."
  }
];

// Practice Sequence (Length 2)
const PRACTICE_ROUND = {
  roundNumber: 0,
  sequenceLength: 2,
  title: "Guided Practice Round",
  instruction: "Select the Blue Circle, then the Amber Diamond.",
  targetSequence: [SYMBOLS.BLUE_CIRCLE, SYMBOLS.AMBER_DIAMOND],
  hint: "Practice clicking the matching symbol cards in order or use number keys 1–6."
};

const STAGE_INSTRUCTIONS = "instructions";
const STAGE_PRACTICE = "practice";
const STAGE_MAIN_TEST = "main_test";
const STAGE_ROUND_TRANSITION = "round_transition";
const STAGE_COMPLETION = "completion";

export default function WorkingMemoryTestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const durationParam = parseInt(searchParams.get("duration"), 10);
  const totalDurationSeconds = (!isNaN(durationParam) && durationParam > 0) ? durationParam : 360; // default ~6 minutes

  const [stage, setStage] = useState(STAGE_INSTRUCTIONS);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // 0-indexed step in active sequence
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Selection & Feedback state
  const [selectedCardsHistory, setSelectedCardsHistory] = useState([]);
  const [cardFeedback, setCardFeedback] = useState(null); // { id, state: "correct" | "error" }
  const [instructionOnsetMs, setInstructionOnsetMs] = useState(0);
  const [firstActionTaken, setFirstActionTaken] = useState(false);
  const [planningLatencyMs, setPlanningLatencyMs] = useState(0);
  const [lastStepTimestamp, setLastStepTimestamp] = useState(0);
  const [inactivityLapsesCount, setInactivityLapsesCount] = useState(0);

  // Telemetry references
  const trialsRef = useRef([]);
  const trialIndexRef = useRef(1);
  const testStartTimeRef = useRef(0);
  const isFinishedRef = useRef(false);
  const inactivityTimerRef = useRef(null);

  const activeRound = stage === STAGE_PRACTICE ? PRACTICE_ROUND : TASK_ROUNDS[currentRoundIndex];

  // Start telemetry and clock on main test launch
  useEffect(() => {
    let clockInterval = null;
    if (stage === STAGE_MAIN_TEST) {
      testStartTimeRef.current = performance.now();
      startMouseTracking();

      clockInterval = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next >= totalDurationSeconds && !isFinishedRef.current) {
            finishSession();
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (clockInterval) clearInterval(clockInterval);
      stopMouseTracking();
    };
  }, [stage, totalDurationSeconds]);

  // Inactivity tracking: resets when user interacts
  const resetInactivityWatchdog = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      if (stage === STAGE_MAIN_TEST && !isFinishedRef.current) {
        setInactivityLapsesCount((c) => c + 1);
      }
    }, 4500); // 4.5s of no interaction flags potential attention pause
  }, [stage]);

  // Handle beginning of a round
  const startRound = useCallback((roundIdx) => {
    setCurrentRoundIndex(roundIdx);
    setCurrentStepIndex(0);
    setSelectedCardsHistory([]);
    setCardFeedback(null);
    setFirstActionTaken(false);
    const now = performance.now();
    setInstructionOnsetMs(now);
    setLastStepTimestamp(now);
    snapshotAndResetMouseTrial();
    resetInactivityWatchdog();
  }, [resetInactivityWatchdog]);

  // Register user card selection (Click or Keyboard 1-6)
  const handleCardSelection = (symbol, cardIndex) => {
    if (cardFeedback) return; // Prevent double taps during transition
    const now = performance.now();
    resetInactivityWatchdog();

    // 1. Initial Planning Latency (measured on step 0)
    let planLatency = planningLatencyMs;
    if (!firstActionTaken) {
      planLatency = Math.round(now - instructionOnsetMs);
      setPlanningLatencyMs(planLatency);
      setFirstActionTaken(true);
    }

    // 2. Individual step execution response time
    const stepRt = Math.round(now - lastStepTimestamp);
    setLastStepTimestamp(now);

    const expectedSymbol = activeRound.targetSequence[currentStepIndex];
    const isCorrect = symbol.id === expectedSymbol.id;

    // Categorize error type if incorrect
    let errorType = null;
    let isOrderError = false;
    let isItemError = false;

    if (!isCorrect) {
      const inSequence = activeRound.targetSequence.some((s) => s.id === symbol.id);
      if (inSequence) {
        errorType = "order_error";
        isOrderError = true;
      } else {
        errorType = "item_error";
        isItemError = true;
      }
    }

    // 3. Snapshot motor telemetry
    const mouseStats = snapshotAndResetMouseTrial();

    // 4. Record trial event
    if (stage === STAGE_MAIN_TEST) {
      trialsRef.current.push({
        trialIndex: trialIndexRef.current++,
        timestampMs: Math.round(now - testStartTimeRef.current),
        stimulusType: "working_memory",
        symbolId: symbol.id,
        symbolLabel: symbol.label,
        isTarget: true,
        responseGiven: true,
        reactionTimeMs: Math.max(120, stepRt),
        isCorrect,
        errorType,
        inputDevice: "mouse",
        interrupted: false,
        sequenceLength: activeRound.sequenceLength,
        itemPosition: currentStepIndex + 1,
        planningLatencyMs: planLatency,
        isOrderError,
        isItemError,
        roundNumber: activeRound.roundNumber,
        instructionText: activeRound.instruction,
        ...mouseStats,
      });
    }

    // Visual feedback
    setCardFeedback({ id: symbol.id, state: isCorrect ? "correct" : "error" });
    setSelectedCardsHistory((prev) => [...prev, { symbol, isCorrect }]);

    setTimeout(() => {
      setCardFeedback(null);
      const nextStep = currentStepIndex + 1;

      if (nextStep < activeRound.sequenceLength) {
        setCurrentStepIndex(nextStep);
      } else {
        // Sequence completed! Advance round or complete
        handleSequenceCompleted();
      }
    }, 450);
  };

  // Sequence completed handler
  const handleSequenceCompleted = () => {
    if (stage === STAGE_PRACTICE) {
      setStage(STAGE_ROUND_TRANSITION);
      return;
    }

    const nextRound = currentRoundIndex + 1;
    if (nextRound < TASK_ROUNDS.length) {
      setStage(STAGE_ROUND_TRANSITION);
    } else {
      finishSession();
    }
  };

  // Keyboard navigation (Keys 1 to 6)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (stage !== STAGE_PRACTICE && stage !== STAGE_MAIN_TEST) return;
      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 6) {
        const symbol = WORKING_MEMORY_GRID_SYMBOLS[keyNum - 1];
        if (symbol) {
          handleCardSelection(symbol, keyNum - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stage, currentStepIndex, activeRound, cardFeedback]);

  // Finish session & analyze
  const finishSession = async () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    stopMouseTracking();

    const result = await analyzeSessionData(
      trialsRef.current,
      totalDurationSeconds,
      `session-wm-${Date.now()}`,
      {
        taskType: "working_memory",
        inactivityPeriodsCount: inactivityLapsesCount,
      }
    );

    saveSession(result);
    navigate("/results");
  };

  // Launch Practice
  const handleStartPractice = () => {
    setStage(STAGE_PRACTICE);
    startRound(0);
  };

  // Transition from practice to Main Test
  const handleStartMainTest = () => {
    setStage(STAGE_MAIN_TEST);
    startRound(0);
  };

  // Transition between rounds
  const handleProceedToNextRound = () => {
    setStage(STAGE_MAIN_TEST);
    startRound(currentRoundIndex + 1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in select-none">
      
      {/* ----------------- TOP TELEMETRY BAR ----------------- */}
      <div className="bg-[#121A2B] p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/30">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Working Memory & Instruction Tracking
            </h2>
            <div className="text-xs text-slate-400 font-mono">
              {stage === STAGE_PRACTICE ? "Guided Practice" : `Round ${activeRound.roundNumber} of ${TASK_ROUNDS.length}`} • Length {activeRound.sequenceLength} Sequence
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-[#0B1020] px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-bold">
              {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, "0")} / {Math.floor(totalDurationSeconds / 60)}:00
            </span>
          </div>

          {stage === STAGE_MAIN_TEST && (
            <button
              onClick={finishSession}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors font-medium"
            >
              Finish Early
            </button>
          )}
        </div>
      </div>

      {/* ----------------- STAGE 1: INSTRUCTIONS & RULES ----------------- */}
      {stage === STAGE_INSTRUCTIONS && (
        <div className="bg-[#121A2B] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 animate-fade-in">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs text-violet-300 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Instruction Memory Protocol</span>
            </div>
            <h3 className="text-2xl font-extrabold text-white">
              Task Rules & Mechanics
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              In this task, you will receive sequential instructions requiring you to remember and execute multi-step symbol selections in exact order.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 space-y-1.5">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Brain className="w-4 h-4" /> 1. Read & Encode
              </div>
              <p className="text-slate-400 leading-relaxed">
                Read the instruction sequence displayed at the top. Form a mental sequence before you make your first selection.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 space-y-1.5">
              <div className="font-bold text-violet-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> 2. Execute in Order
              </div>
              <p className="text-slate-400 leading-relaxed">
                Click each card in order or press number keys <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono">6</kbd>. Breadcrumbs guide your progress.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 space-y-1.5">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> 3. Progressive Length
              </div>
              <p className="text-slate-400 leading-relaxed">
                Demands scale from 2 items up to 4 items across 6 short rounds. No deceptive instructions or surprise changes.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 font-mono">
              Short interactive practice round (~45s) before the main session.
            </div>

            <Button
              onClick={handleStartPractice}
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
            >
              Start Practice Round <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ----------------- STAGE: ROUND TRANSITION INTERMISSION ----------------- */}
      {stage === STAGE_ROUND_TRANSITION && (
        <div className="bg-[#121A2B] p-8 rounded-2xl border border-slate-800 text-center space-y-5 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white">
              {currentRoundIndex === 0 && stage !== STAGE_MAIN_TEST ? "Practice Round Complete!" : `Round ${activeRound.roundNumber} Complete!`}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Take a breath. When you're ready, proceed to the next sequence round.
            </p>
          </div>

          <div className="pt-2">
            {currentRoundIndex === 0 && stage !== STAGE_MAIN_TEST ? (
              <Button onClick={handleStartMainTest} variant="primary" size="md">
                Begin Main Test (Round 1) <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button onClick={handleProceedToNextRound} variant="primary" size="md">
                Proceed to Round {currentRoundIndex + 2} <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ----------------- STAGES 2 & 3: ACTIVE PLAY ARENA ----------------- */}
      {(stage === STAGE_PRACTICE || stage === STAGE_MAIN_TEST) && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Instruction & Breadcrumbs Banner */}
          <div className="bg-[#121A2B] p-6 rounded-2xl border-2 border-violet-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
                  {stage === STAGE_PRACTICE ? "PRACTICE INSTRUCTION" : `ROUND ${activeRound.roundNumber}: ${activeRound.title.toUpperCase()}`}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Step <strong className="text-white">{currentStepIndex + 1}</strong> of {activeRound.sequenceLength}
              </div>
            </div>

            {/* Main Instruction Prompt */}
            <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {activeRound.instruction}
            </div>

            {/* Sequence Breadcrumb Steps */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {activeRound.targetSequence.map((target, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const historyEntry = selectedCardsHistory[idx];

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                      isCompleted
                        ? historyEntry?.isCorrect
                          ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                          : "bg-rose-950/40 border-rose-500/50 text-rose-300"
                        : isCurrent
                        ? "bg-violet-600/30 border-violet-400 text-white shadow-md ring-1 ring-violet-400 font-bold"
                        : "bg-[#0B1020] border-slate-800 text-slate-500 opacity-60"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span>{target.label}</span>
                    {isCompleted && (
                      historyEntry?.isCorrect ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-rose-400 ml-1" />
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6-Card Interactive Symbol Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {WORKING_MEMORY_GRID_SYMBOLS.map((symbol, idx) => {
              const isFeedbackCard = cardFeedback && cardFeedback.id === symbol.id;
              const feedbackState = isFeedbackCard ? cardFeedback.state : null;

              return (
                <button
                  key={symbol.id}
                  onClick={() => handleCardSelection(symbol, idx)}
                  disabled={cardFeedback !== null}
                  className={`relative p-5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-3 group active:scale-95 ${
                    feedbackState === "correct"
                      ? "bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500"
                      : feedbackState === "error"
                      ? "bg-rose-950/60 border-rose-500 shadow-lg shadow-rose-500/20 ring-2 ring-rose-500 animate-shake"
                      : "bg-[#121A2B] border-slate-800 hover:border-slate-600 hover:bg-[#162136]"
                  }`}
                >
                  {/* Keyboard shortcut pill */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-[#0B1020] border border-slate-800 text-[10px] font-mono text-slate-400 group-hover:text-cyan-300">
                    Key {idx + 1}
                  </span>

                  {/* Symbol SVG */}
                  <div className="py-2">
                    <SymbolRenderer symbol={symbol} size={80} />
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {symbol.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Pacing Guide */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2">
            <div className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-slate-500" />
              <span>Use mouse clicks or keys <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white">6</kbd></span>
            </div>
            <div>
              {activeRound.hint}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
