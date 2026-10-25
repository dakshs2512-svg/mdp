import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Clock,
  XCircle,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Keyboard,
  MousePointer,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Button from "../components/Button";
import SymbolRenderer from "../components/SymbolRenderer";
import { SYMBOLS, generateRandomStimulus, createPracticeSequence, TASK_TARGETS, getNextTaskTarget, generateStimulusForTarget } from "../utils/symbols";
import { analyzeSessionData } from "../utils/api";
import { saveSession } from "../utils/storage";
import { startMouseTracking, stopMouseTracking, snapshotAndResetMouseTrial } from "../utils/mouseTracker";

// Test flow stages
const STAGE_INSTRUCTIONS = "instructions";
const STAGE_PRACTICE = "practice";
const STAGE_PRACTICE_SUMMARY = "practice_summary";
const STAGE_COUNTDOWN = "countdown";
const STAGE_MAIN_TEST = "main_test";
const STAGE_COMPLETION = "completion";
const STAGE_ANALYZING = "analyzing";

export default function ActiveTestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const durationParam = parseInt(searchParams.get("duration"), 10);
  // Default is 10 minutes (600s), but allows 60s demo or custom
  const totalDurationSeconds = (!isNaN(durationParam) && durationParam > 0) ? durationParam : 600;

  // Active Flow Stage
  const [stage, setStage] = useState(STAGE_INSTRUCTIONS);
  const [countdown, setCountdown] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [autoNavCountdown, setAutoNavCountdown] = useState(5);

  // Stimulus Display State
  const [currentSymbol, setCurrentSymbol] = useState(null);
  const [currentTargetSymbol, setCurrentTargetSymbol] = useState(SYMBOLS.BLUE_CIRCLE);
  const [practiceFeedback, setPracticeFeedback] = useState(null); // Practice round feedback only
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceSequence, setPracticeSequence] = useState(() => createPracticeSequence());
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 5 });

  // Main Test Progress & Telemetry State
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [trialsRecorded, setTrialsRecorded] = useState([]);
  const [trialCount, setTrialCount] = useState(0);

  // Summary State for Completion Screen
  const [completionSummary, setCompletionSummary] = useState(null);

  // -------------------- TIMING & SCHEDULER REFS --------------------
  // Monotonic hardware clock references
  const testStartTimeRef = useRef(null);
  const stimulusTimerRef = useRef(null);
  const responseWindowTimerRef = useRef(null);
  const isiTimerRef = useRef(null);
  const clockIntervalRef = useRef(null);

  // Active stimulus tracking ref (avoids React stale closures)
  const activeStimulusRef = useRef({
    trialIndex: 0,
    symbol: null,
    isTarget: false,
    onsetTime: 0,
    responseRegistered: false,
    rt: null,
    inputDevice: null,
    interrupted: false,
  });

  // Session Data Accumulators
  const allTrialsRef = useRef([]);
  const previousStimulusIdRef = useRef(null);
  const currentTargetRef = useRef(SYMBOLS.BLUE_CIRCLE);
  const interruptionsRef = useRef([]);
  const blurStartRef = useRef(null);
  const lastActivityTimeRef = useRef(null);
  const inactivityPeriodsRef = useRef([]);
  const isFinishedRef = useRef(false);
  const isPausedRef = useRef(false);

  // Keep isPausedRef synchronized
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // -------------------- CLEANUP TIMERS --------------------
  const clearAllTimers = useCallback(() => {
    if (stimulusTimerRef.current) clearTimeout(stimulusTimerRef.current);
    if (responseWindowTimerRef.current) clearTimeout(responseWindowTimerRef.current);
    if (isiTimerRef.current) clearTimeout(isiTimerRef.current);
    if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
  }, []);

  // -------------------- WINDOW FOCUS & VISIBILITY MONITORING --------------------
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleWindowLostFocus("Tab switched or minimized");
      }
    };

    const handleWindowBlur = () => {
      handleWindowLostFocus("Window focus lost");
    };

    const handleWindowFocus = () => {
      if (blurStartRef.current) {
        const duration = Math.round(performance.now() - blurStartRef.current);
        interruptionsRef.current.push({
          timestampMs: Math.round(blurStartRef.current - (testStartTimeRef.current || performance.now())),
          durationMs: duration,
          reason: "Window focus restored",
        });
        blurStartRef.current = null;
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  const handleWindowLostFocus = (reason) => {
    if (stage === STAGE_MAIN_TEST && !isFinishedRef.current && !isPausedRef.current) {
      blurStartRef.current = performance.now();
      // Mark current active stimulus as interrupted
      activeStimulusRef.current.interrupted = true;
      setIsPaused(true);
      setPauseReason(reason);
      clearAllTimers();
    }
  };

  // -------------------- ACCIDENTAL UNLOAD PROTECTION --------------------
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (stage === STAGE_MAIN_TEST && !isFinishedRef.current) {
        e.preventDefault();
        e.returnValue = "An active focus test is in progress. Are you sure you want to exit?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [stage]);

  // -------------------- PRACTICE ROUND SCHEDULER --------------------
  const startPracticeRound = () => {
    clearAllTimers();
    const nextSequence = createPracticeSequence();
    setPracticeSequence(nextSequence);
    setStage(STAGE_PRACTICE);
    setPracticeIndex(0);
    setPracticeFeedback(null);
    setPracticeScore({ correct: 0, total: nextSequence.length });
    runPracticeTrial(0, 0);
  };

  const runPracticeTrial = (index, currentCorrect) => {
    if (index >= practiceSequence.length) {
      // Practice complete
      setStage(STAGE_PRACTICE_SUMMARY);
      return;
    }

    const symbol = practiceSequence[index];
    const onset = performance.now();

    activeStimulusRef.current = {
      trialIndex: index + 1,
      symbol,
      isTarget: symbol.isTarget,
      onsetTime: onset,
      responseRegistered: false,
      rt: null,
      inputDevice: null,
      interrupted: false,
    };

    setCurrentSymbol(symbol);
    setPracticeIndex(index + 1);
    setPracticeFeedback(null);

    // Stimulus duration: 850ms
    stimulusTimerRef.current = setTimeout(() => {
      setCurrentSymbol(null); // Hide symbol

      // Response window ends after 950ms total
      responseWindowTimerRef.current = setTimeout(() => {
        const curr = activeStimulusRef.current;
        let isCorrect = false;
        let feedbackMsg = "";

        if (curr.isTarget) {
          if (curr.responseRegistered) {
            isCorrect = true;
            feedbackMsg = `✓ Correct Hit! (${curr.rt} ms)`;
          } else {
            isCorrect = false;
            feedbackMsg = "✗ Missed Target — Press Space or Click when Blue Circle appears";
          }
        } else {
          if (!curr.responseRegistered) {
            isCorrect = true;
            feedbackMsg = `✓ Good Withhold! (${curr.symbol.label} ignored)`;
          } else {
            isCorrect = false;
            feedbackMsg = `✗ False Alarm — Do not respond to ${curr.symbol.label}`;
          }
        }

        const nextCorrect = isCorrect ? currentCorrect + 1 : currentCorrect;
        setPracticeScore({ correct: nextCorrect, total: practiceSequence.length });
        setPracticeFeedback({ isCorrect, msg: feedbackMsg });

        // Inter-stimulus interval with feedback display (1300ms)
        isiTimerRef.current = setTimeout(() => {
          setPracticeFeedback(null);
          runPracticeTrial(index + 1, nextCorrect);
        }, 1300);

      }, 100);

    }, 850);
  };

  // -------------------- START MAIN TEST COUNTDOWN --------------------
  const startMainTestCountdown = () => {
    clearAllTimers();
    setStage(STAGE_COUNTDOWN);
    setCountdown(3);
  };

  useEffect(() => {
    if (stage === STAGE_COUNTDOWN) {
      if (countdown > 1) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          launchMainTest();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [stage, countdown]);

  // -------------------- LAUNCH MAIN TEST --------------------
  const launchMainTest = () => {
    clearAllTimers();
    setStage(STAGE_MAIN_TEST);
    setIsPaused(false);
    isFinishedRef.current = false;
    allTrialsRef.current = [];
    previousStimulusIdRef.current = null;
    currentTargetRef.current = SYMBOLS.BLUE_CIRCLE;
    setCurrentTargetSymbol(SYMBOLS.BLUE_CIRCLE);
    interruptionsRef.current = [];
    inactivityPeriodsRef.current = [];

    const now = performance.now();
    testStartTimeRef.current = now;
    lastActivityTimeRef.current = now;
    startMouseTracking();
    setElapsedSeconds(0);
    setTrialsRecorded([]);
    setTrialCount(0);

    // Start 1-second elapsed clock
    clockIntervalRef.current = setInterval(() => {
      if (isPausedRef.current || isFinishedRef.current) return;

      const elapsed = Math.floor((performance.now() - testStartTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);

      // Inactivity check: if no motor activity for > 6 seconds
      const sinceLastActivity = (performance.now() - lastActivityTimeRef.current) / 1000;
      if (sinceLastActivity > 6.0) {
        inactivityPeriodsRef.current.push({
          timestampSec: elapsed,
          durationSec: Math.round(sinceLastActivity),
        });
      }

      if (elapsed >= totalDurationSeconds) {
        finishMainTest();
      }
    }, 1000);

    // Schedule trial #1
    scheduleNextMainStimulus(1);
  };

  // -------------------- MAIN TEST CONTROLLED SCHEDULER --------------------
  const scheduleNextMainStimulus = (nextIndex) => {
    if (isFinishedRef.current || isPausedRef.current) return;

    // Randomized inter-stimulus interval: 1000ms – 1750ms
    const randomizedIsi = 1000 + Math.random() * 750;

    isiTimerRef.current = setTimeout(() => {
      if (isFinishedRef.current || isPausedRef.current) return;

      // The active target is shown in the UI. After a correct trial, the rule
      // advances to the next target, so the assessment includes task switching.
      const symbol = generateStimulusForTarget(
        currentTargetRef.current,
        0.75,
        previousStimulusIdRef.current
      );
      previousStimulusIdRef.current = symbol.id;
      const onset = performance.now();

      activeStimulusRef.current = {
        trialIndex: nextIndex,
        symbol,
        isTarget: symbol.isTarget,
        onsetTime: onset,
        responseRegistered: false,
        rt: null,
        inputDevice: null,
        interrupted: false,
      };

      setTrialCount(nextIndex);
      setCurrentSymbol(symbol);

      // Presentation duration: 800ms
      const presentationDuration = 800;
      stimulusTimerRef.current = setTimeout(() => {
        // Clear symbol from screen (calm fixation period)
        setCurrentSymbol(null);

        // Response grace window: 150ms after offset (total response window 950ms)
        const responseGraceWindow = 150;
        responseWindowTimerRef.current = setTimeout(() => {
          finalizeStimulusTrial(nextIndex);
          // Schedule next stimulus
          scheduleNextMainStimulus(nextIndex + 1);
        }, responseGraceWindow);

      }, presentationDuration);

    }, randomizedIsi);
  };

  // -------------------- FINALIZE STIMULUS TRIAL --------------------
  const finalizeStimulusTrial = (trialIndex) => {
    const curr = activeStimulusRef.current;
    if (!curr || curr.trialIndex !== trialIndex) return;

    const isTarget = curr.isTarget;
    const responded = curr.responseRegistered;
    const rt = curr.rt;
    const timestampMs = Math.round(curr.onsetTime - testStartTimeRef.current);

    let isCorrect = false;
    let errorType = null;
    let outcome = "normal";

    if (isTarget) {
      if (responded) {
        isCorrect = true;
        outcome = "correct_hit";
      } else {
        isCorrect = false;
        errorType = curr.interrupted ? "interruption_miss" : "omission";
        outcome = curr.interrupted ? "interruption_miss" : "missed_target";
      }
    } else {
      if (responded) {
        isCorrect = false;
        errorType = "commission";
        outcome = "false_alarm";
      } else {
        isCorrect = true;
        outcome = "correct_rejection";
      }
    }

    const mouseStats = snapshotAndResetMouseTrial();

    const trialRecord = {
      trialIndex,
      timestampMs,
      stimulusType: isTarget ? "target" : "nontarget",
      symbolId: curr.symbol.id,
      symbolLabel: curr.symbol.label,
      isTarget,
      responseGiven: responded,
      reactionTimeMs: rt,
      isCorrect,
      errorType,
      outcome,
      inputDevice: curr.inputDevice,
      interrupted: curr.interrupted,
      ...mouseStats,
    };

    allTrialsRef.current.push(trialRecord);
    setTrialsRecorded([...allTrialsRef.current]);

    if (isCorrect) {
      const nextTarget = getNextTaskTarget(currentTargetRef.current.id);
      currentTargetRef.current = nextTarget;
      setCurrentTargetSymbol(nextTarget);
    }
  };

  // -------------------- USER MOTOR INPUT HANDLER --------------------
  const registerUserResponse = useCallback((device) => {
    const now = performance.now();
    lastActivityTimeRef.current = now;

    // Handle Practice Round Input
    if (stage === STAGE_PRACTICE) {
      const curr = activeStimulusRef.current;
      if (!curr || curr.responseRegistered || !currentSymbol) return;

      curr.responseRegistered = true;
      curr.rt = Math.round(now - curr.onsetTime);
      curr.inputDevice = device;
      return;
    }

    // Handle Main Test Input
    if (stage === STAGE_MAIN_TEST) {
      if (isPausedRef.current || isFinishedRef.current) return;

      const curr = activeStimulusRef.current;

      // Ignore responses outside active stimulus or if already responded
      if (!curr || curr.responseRegistered) return;

      // If clicked during presentation window
      if (currentSymbol && curr.onsetTime) {
        curr.responseRegistered = true;
        curr.rt = Math.round(now - curr.onsetTime);
        curr.inputDevice = device;
      }
    }
  }, [stage, currentSymbol]);

  // -------------------- KEYBOARD LISTENER --------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Space key for stimulus response
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        registerUserResponse("keyboard");
      }
      // Escape key to toggle pause
      if (e.key === "Escape" && stage === STAGE_MAIN_TEST) {
        togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [registerUserResponse, stage]);

  // -------------------- PAUSE & RESUME CONTROLS --------------------
  const togglePause = () => {
    if (stage !== STAGE_MAIN_TEST || isFinishedRef.current) return;

    if (!isPaused) {
      // Pause
      clearAllTimers();
      setIsPaused(true);
      setPauseReason("Manually Paused by Participant");
    } else {
      // Resume
      setIsPaused(false);
      setPauseReason("");
      lastActivityTimeRef.current = performance.now();
      scheduleNextMainStimulus(trialCount + 1);
    }
  };

  // -------------------- ABORT CONFIRMATION --------------------
  const handleAbort = () => {
    clearAllTimers();
    if (window.confirm("Abort the active concentration test and return to introduction?")) {
      navigate("/test");
    } else {
      if (stage === STAGE_MAIN_TEST && !isPaused) {
        scheduleNextMainStimulus(trialCount + 1);
      }
    }
  };

  // -------------------- FINISH & DISPLAY COMPLETION SCREEN --------------------
  const finishMainTest = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    clearAllTimers();
    stopMouseTracking();

    const trials = allTrialsRef.current;
    if (trials.length === 0) {
      navigate("/test");
      return;
    }

    const targets = trials.filter((t) => t.isTarget);
    const nonTargets = trials.filter((t) => !t.isTarget);
    const correctHits = targets.filter((t) => t.responseGiven).length;
    const missedTargets = targets.filter((t) => !t.responseGiven).length;
    const falseAlarms = nonTargets.filter((t) => t.responseGiven).length;
    const correctRejections = nonTargets.filter((t) => !t.responseGiven).length;

    const validRts = targets
      .filter((t) => t.responseGiven && t.reactionTimeMs && t.reactionTimeMs >= 100)
      .map((t) => t.reactionTimeMs);

    const meanRt = validRts.length > 0 ? Math.round(validRts.reduce((a, b) => a + b, 0) / validRts.length) : 0;
    const sortedRts = [...validRts].sort((a, b) => a - b);
    const medianRt = sortedRts.length > 0 ? sortedRts[Math.floor(sortedRts.length / 2)] : 0;

    const keyboardCount = trials.filter((t) => t.inputDevice === "keyboard").length;
    const mouseCount = trials.filter((t) => t.inputDevice === "mouse").length;

    const summary = {
      durationSeconds: totalDurationSeconds,
      actualElapsedSeconds: elapsedSeconds,
      totalStimuli: trials.length,
      totalTargets: targets.length,
      totalNonTargets: nonTargets.length,
      correctHits,
      missedTargets,
      falseAlarms,
      correctRejections,
      accuracyPct: Math.round(((correctHits + correctRejections) / trials.length) * 1000) / 10,
      meanRt,
      medianRt,
      keyboardCount,
      mouseCount,
      interruptionsCount: interruptionsRef.current.length,
    };

    setCompletionSummary(summary);
    setStage(STAGE_COMPLETION);
    setAutoNavCountdown(5);

  }, [clearAllTimers, elapsedSeconds, navigate, totalDurationSeconds]);

  // -------------------- AUTO-NAVIGATE TO RESULTS DASHBOARD --------------------
  useEffect(() => {
    if (stage === STAGE_COMPLETION) {
      if (autoNavCountdown > 0) {
        const timer = setTimeout(() => setAutoNavCountdown((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        submitAndNavigateToResults();
      }
    }
  }, [stage, autoNavCountdown]);

  const submitAndNavigateToResults = async () => {
    clearAllTimers();
    setStage(STAGE_ANALYZING);

    const finalTrials = allTrialsRef.current;
    const metadata = {
      interruptionsCount: interruptionsRef.current.length,
      inactivityPeriodsCount: inactivityPeriodsRef.current.length,
      inputBreakdown: {
        keyboard: finalTrials.filter((t) => t.inputDevice === "keyboard").length,
        mouse: finalTrials.filter((t) => t.inputDevice === "mouse").length,
      },
    };

    try {
      const analyzed = await analyzeSessionData(finalTrials, totalDurationSeconds, null, metadata);
      if (analyzed) {
        saveSession(analyzed);
      }
      navigate("/results");
    } catch (err) {
      console.error("Analysis failed:", err);
      navigate("/results");
    }
  };

  // -------------------- TIME FORMATTER --------------------
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalDurationSeconds) * 100));

  // =========================================================================
  // VIEW RENDERER
  // =========================================================================

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6 max-w-5xl mx-auto px-4 sm:px-6 relative select-none">
      
      {/* -------------------- 1. STAGE: CHAMBER INSTRUCTIONS -------------------- */}
      {stage === STAGE_INSTRUCTIONS && (
        <div className="max-w-2xl mx-auto my-auto p-6 sm:p-8 rounded-3xl bg-[#121A2B] border border-slate-800 space-y-6 shadow-card animate-fade-in">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/40 uppercase tracking-widest font-bold">
              Continuous Performance Protocol
            </span>
            <h2 className="text-2xl font-bold text-white font-sans">
              Symbol Detection Task Rules
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Symbols appear one at a time in the center of the arena. Respond as quickly and accurately as possible exclusively to the designated target.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/40 flex flex-col items-center text-center space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300 font-bold">
                Target Symbol
              </span>
              <SymbolRenderer symbol={SYMBOLS.BLUE_CIRCLE} size={80} />
              <p className="text-xs font-bold text-white">Blue Circle</p>
              <p className="text-[11px] text-sky-200/80">
                Press <strong>Spacebar</strong> or click Target Button
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center text-center space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                Non-Target Distractors
              </span>
              <div className="flex items-center gap-2 py-2">
                <SymbolRenderer symbol={SYMBOLS.PURPLE_CIRCLE} size={48} />
                <SymbolRenderer symbol={SYMBOLS.AMBER_DIAMOND} size={48} />
                <SymbolRenderer symbol={SYMBOLS.CYAN_SQUARE} size={48} />
              </div>
              <p className="text-xs font-bold text-white">Purple Circle & Other Shapes</p>
              <p className="text-[11px] text-slate-400">
                <strong>Withhold</strong> response (do not press)
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <span>Spacebar (recommended) or Click</span>
            </span>
            <span className="font-mono text-slate-500">
              Protocol: {totalDurationSeconds === 600 ? "10 Min Research" : `${totalDurationSeconds}s`}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between gap-4">
            <Button to="/test" variant="ghost" size="md">
              Return to Settings
            </Button>
            <Button
              onClick={startPracticeRound}
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              className="px-6"
            >
              Start Practice Round (5 Trials)
            </Button>
          </div>
        </div>
      )}

      {/* -------------------- 2. STAGE: PRACTICE ROUND WITH FEEDBACK -------------------- */}
      {stage === STAGE_PRACTICE && (
        <div className="flex-1 flex flex-col justify-between space-y-6 animate-fade-in">
          {/* Practice Top Bar */}
          <div className="bg-[#121A2B] rounded-2xl p-4 border border-violet-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/40 font-bold">
                PRACTICE ROUND
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Trial {practiceIndex} of {practiceSequence.length}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Target: <strong className="text-sky-400">Blue Circle</strong>
            </span>
          </div>

          {/* Central Practice Task Arena */}
          <div className="flex-1 min-h-[380px] rounded-3xl bg-[#0B1020] border-2 border-slate-800 flex flex-col items-center justify-center relative">
            {currentSymbol ? (
              <SymbolRenderer symbol={currentSymbol} size={130} />
            ) : (
              <div className="w-6 h-6 flex items-center justify-center text-slate-700">
                <div className="w-1 h-4 bg-slate-700 rounded-full" />
                <div className="h-1 w-4 bg-slate-700 rounded-full -ml-2.5" />
              </div>
            )}

            {/* Practice Feedback Notice */}
            <div className="h-8 mt-6">
              {practiceFeedback && (
                <span
                  className={`text-xs font-mono px-3 py-1 rounded-full border animate-fade-in ${
                    practiceFeedback.isCorrect
                      ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40"
                      : "bg-red-950/40 text-red-300 border-red-500/40"
                  }`}
                >
                  {practiceFeedback.msg}
                </span>
              )}
            </div>
          </div>

          {/* Practice Bottom Response Button */}
          <div className="flex items-center justify-between bg-[#121A2B] p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono">
              Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-white border border-slate-700">Spacebar</kbd> or click button:
            </span>
            <Button
              onClick={() => registerUserResponse("mouse")}
              variant="cyan"
              size="md"
              icon={MousePointer}
            >
              Target Response Button
            </Button>
          </div>
        </div>
      )}

      {/* -------------------- 3. STAGE: PRACTICE SUMMARY SCREEN -------------------- */}
      {stage === STAGE_PRACTICE_SUMMARY && (
        <div className="max-w-md mx-auto my-auto p-6 sm:p-8 rounded-3xl bg-[#121A2B] border border-slate-800 text-center space-y-6 shadow-card animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white font-sans">
              Practice Round Complete
            </h3>
            <p className="text-xs text-slate-400">
              You scored <strong className="text-emerald-400">{practiceScore.correct} / {practiceScore.total}</strong> correct discriminations.
            </p>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-[#0B1020] p-4 rounded-xl border border-slate-800 text-left">
            During the scored main test, <strong>no immediate feedback will be shown</strong> to keep the environment calm and prevent distraction. Keep your focus on the center symbol.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={startPracticeRound}
              variant="secondary"
              size="md"
              icon={RotateCcw}
              iconPosition="left"
              className="w-full sm:w-auto"
            >
              Repeat Practice
            </Button>
            <Button
              onClick={startMainTestCountdown}
              variant="primary"
              size="md"
              icon={Play}
              iconPosition="right"
              className="w-full sm:w-auto"
            >
              Start Main Test ({totalDurationSeconds === 600 ? "10m Protocol" : `${totalDurationSeconds}s`})
            </Button>
          </div>
        </div>
      )}

      {/* -------------------- 4. STAGE: CALM 3-2-1 COUNTDOWN -------------------- */}
      {stage === STAGE_COUNTDOWN && (
        <div className="max-w-md mx-auto my-auto text-center space-y-4 animate-scale-in">
          <p className="text-xs font-mono uppercase tracking-widest text-violet-400">
            Main Test Starting In
          </p>
          <div className="text-8xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
            {countdown}
          </div>
          <p className="text-xs text-slate-400">
            Rest your finger lightly on <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono border border-slate-700">Spacebar</kbd> or cursor over the button.
          </p>
        </div>
      )}

      {/* -------------------- 5. STAGE: MAIN CONTINUOUS PERFORMANCE TEST -------------------- */}
      {stage === STAGE_MAIN_TEST && (
        <div className="flex-1 flex flex-col justify-between animate-fade-in relative">
          
          {/* Pause Modal Overlay */}
          {isPaused && (
            <div className="absolute inset-0 z-40 bg-[#0B1020]/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Pause className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-sans">
                  Test Paused
                </h3>
                <p className="text-xs text-amber-300 font-mono">
                  {pauseReason || "Session paused"}
                </p>
                <p className="text-xs text-slate-400 max-w-sm pt-1">
                  Your elapsed test time and trial timing are safely suspended. This interruption is logged separately from cognitive lapse metrics.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button onClick={togglePause} variant="primary" size="md" icon={Play} iconPosition="left">
                  Resume Test
                </Button>
                <Button onClick={handleAbort} variant="ghost" size="md">
                  Abort
                </Button>
              </div>
            </div>
          )}

          {/* Top Control & Telemetry Bar */}
          <div className="bg-[#121A2B] rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-mono font-bold text-white uppercase tracking-wider">
                  Active Concentration Chamber
                </span>
                <span className="hidden sm:inline-block text-slate-600">|</span>
                <span className="hidden sm:inline-block font-mono text-slate-400">
                  Current target: {currentTargetSymbol.label}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {trialsRecorded.length >= 8 && (
                  <button
                    type="button"
                    onClick={finishMainTest}
                    className="px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-500/40 font-mono text-[11px] transition-all"
                    title="Finish test now and calculate results for demonstration"
                  >
                    Finish Early & Analyze
                  </button>
                )}
                <button
                  type="button"
                  onClick={togglePause}
                  className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-xs transition-colors"
                  title="Pause test (Escape)"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
                <button
                  type="button"
                  onClick={handleAbort}
                  className="text-slate-400 hover:text-red-400 flex items-center gap-1 font-mono text-xs transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Exit</span>
                </button>
              </div>
            </div>

            {/* Progress Bar & Timers */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Elapsed: <strong>{formatTime(elapsedSeconds)}</strong></span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-400">{formatTime(totalDurationSeconds)}</span>
                </span>
                <span>
                  Remaining: <strong className="text-slate-200">{formatTime(remainingSeconds)}</strong>
                </span>
                <span className="hidden sm:inline-block text-slate-500">
                  Trial #{trialCount} ({trialsRecorded.length} logged)
                </span>
              </div>

              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Calm Central Symbol Arena (No Distracting Animations) */}
          <div
            onClick={() => registerUserResponse("mouse")}
            role="button"
            tabIndex={0}
            aria-label={`Concentration arena. Click or press Space when ${currentTargetSymbol.label} appears.`}
            className="my-6 flex-1 min-h-[380px] sm:min-h-[440px] rounded-3xl bg-[#0B1020] border-2 border-slate-800/90 flex flex-col items-center justify-center relative cursor-pointer select-none focus:outline-none"
          >
            {/* Subtle scientific grid background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

            {/* Central Symbol (Pure static rendering, zero distracting bounce or glow) */}
            <div className="relative z-10">
              {currentSymbol ? (
                <SymbolRenderer symbol={currentSymbol} size={140} />
              ) : (
                <div className="w-6 h-6 flex items-center justify-center text-slate-800 opacity-60">
                  <div className="w-1 h-3 bg-slate-700 rounded-full" />
                  <div className="h-1 w-3 bg-slate-700 rounded-full -ml-2" />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Accessible Target Response Button & Info */}
          <div className="bg-[#121A2B] rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span className="text-slate-300">
                Respond to <strong className="text-sky-400">{currentTargetSymbol.label}</strong> only.
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Withhold on all other symbols. Correct trials switch the target.</span>
            </div>

            <Button
              onClick={() => registerUserResponse("mouse")}
              variant="cyan"
              size="md"
              icon={MousePointer}
              className="w-full sm:w-auto px-6 py-2.5 font-bold"
            >
              PRESS [SPACEBAR] OR CLICK
            </Button>
          </div>

        </div>
      )}

      {/* -------------------- 6. STAGE: COMPLETION SCREEN -------------------- */}
      {stage === STAGE_COMPLETION && completionSummary && (
        <div className="max-w-2xl mx-auto my-auto p-6 sm:p-8 rounded-3xl bg-[#121A2B] border border-slate-800 space-y-6 shadow-card animate-fade-in">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white font-sans">
              Concentration Test Completed
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Duration: {formatTime(completionSummary.actualElapsedSeconds)} • {completionSummary.totalStimuli} stimuli recorded
            </p>
          </div>

          {/* Metrics Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3.5 rounded-xl bg-[#0B1020] border border-slate-800 space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Correct Hits</span>
              <p className="text-xl font-bold text-white font-sans">{completionSummary.correctHits} / {completionSummary.totalTargets}</p>
              <span className="text-[10px] text-emerald-400 font-mono">Targets Pressed</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B1020] border border-slate-800 space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Missed Targets</span>
              <p className="text-xl font-bold text-white font-sans">{completionSummary.missedTargets}</p>
              <span className="text-[10px] text-amber-400 font-mono">Omission Lapses</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B1020] border border-slate-800 space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase">False Alarms</span>
              <p className="text-xl font-bold text-white font-sans">{completionSummary.falseAlarms}</p>
              <span className="text-[10px] text-red-400 font-mono">Distractor Presses</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B1020] border border-slate-800 space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Median Latency</span>
              <p className="text-xl font-bold text-white font-sans">{completionSummary.medianRt} ms</p>
              <span className="text-[10px] text-cyan-400 font-mono">Mean: {completionSummary.meanRt}ms</span>
            </div>
          </div>

          {/* Input Device Breakdown & Interruption Notice */}
          <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Keyboard: {completionSummary.keyboardCount}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MousePointer className="w-3.5 h-3.5 text-violet-400" />
                <span>Mouse/Touch: {completionSummary.mouseCount}</span>
              </span>
              <span className="text-slate-400">
                Interruptions: {completionSummary.interruptionsCount}
              </span>
            </div>
          </div>

          {/* Auto-Navigation Notice & Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 text-xs">
            <span className="font-mono text-slate-400 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Redirecting to Dashboard in <strong>{autoNavCountdown}s</strong>...</span>
            </span>

            <Button
              onClick={submitAndNavigateToResults}
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full sm:w-auto px-6"
            >
              View Results Dashboard Now
            </Button>
          </div>
        </div>
      )}

      {/* -------------------- 7. STAGE: ANALYZING OVERLAY -------------------- */}
      {stage === STAGE_ANALYZING && (
        <div className="fixed inset-0 z-50 bg-[#0B1020]/95 backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[#121A2B] border border-violet-500/40 flex items-center justify-center text-cyan-400 shadow-glow-violet">
              <Cpu className="w-8 h-8 animate-pulse text-violet-400" />
            </div>
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin absolute -bottom-2 -right-2" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-white font-sans">
              Computing Concentration Dynamics
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Running baseline change-point modeling via FastAPI backend...
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
