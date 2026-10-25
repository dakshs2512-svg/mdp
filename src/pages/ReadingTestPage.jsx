import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Clock,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  RotateCcw,
  Zap,
  Activity,
  Layers,
} from "lucide-react";
import Button from "../components/Button";
import { startMouseTracking, stopMouseTracking, snapshotAndResetMouseTrial } from "../utils/mouseTracker";
import { analyzeSessionData } from "../utils/api";
import { saveSession } from "../utils/storage";

// Realistic technical reading material (Distributed Systems & Consensus)
const READING_SECTIONS = [
  {
    id: "sec_1",
    subtaskId: "ch1_paxos",
    title: "1. The Foundations of State Machine Replication",
    content: `State machine replication (SMR) is a general technique for implementing a fault-tolerant service by replicating servers and coordinating client interactions with server copies. The core premise is that multiple deterministic state machines, initialized in the identical state and presented with the exact same sequence of input commands, will produce identical outputs and transition into identical terminal states. In asynchronous networks subject to crash-recovery faults, achieving deterministic consensus requires resolving non-trivial race conditions without violating safety invariants.`,
    question: {
      prompt: "What ensures identical states across replicas in state machine replication?",
      options: [
        "Identical input command sequences applied to deterministic state machines",
        "Continuous clock synchronization using hardware atomic clocks",
        "Randomized client request ordering with exponential backoff",
        "Periodic state snapshotting without consensus logs"
      ],
      correctIndex: 0,
      targetKey: "deterministic"
    }
  },
  {
    id: "sec_2",
    subtaskId: "ch2_raft",
    title: "2. Leader Election and Term Monotonicity",
    content: `In modern consensus protocols such as Raft, time is divided into arbitrary terms of monotonic increasing order. Each term begins with an election, in which one or more candidates attempt to supply a quorum of positive votes. If a candidate obtains votes from a majority of nodes across the cluster, it acts as leader for the remainder of that term. The leader handles all log replication requests. If an election splits votes such that no candidate reaches majority, the term ends without a leader, and a new term begins after randomized election timeouts expire.`,
    question: {
      prompt: "Under what condition does an election term terminate without a leader?",
      options: [
        "When node heartbeats exceed 5000 milliseconds",
        "When votes split and no candidate secures a majority quorum",
        "When clients flood the cluster with concurrent write requests",
        "When follower logs deviate by more than three entries"
      ],
      correctIndex: 1,
      targetKey: "split_votes"
    }
  },
  {
    id: "sec_3",
    subtaskId: "ch3_byzantine",
    title: "3. Byzantine Fault Tolerance and Quorum Thresholds",
    content: `When nodes in a distributed cluster can exhibit arbitrary or malicious behavior—including transmitting conflicting messages to different peers—the model shifts from benign crash-fault tolerance to Byzantine Fault Tolerance (BFT). In a system containing f Byzantine nodes, a classical PBFT consensus protocol requires at least 3f + 1 total replicas. This mathematical bound ensures that even if f nodes fail to respond, and f responding nodes provide malicious fabricated data, the remaining f + 1 correct nodes still form a decisive majority over the faulty responses.`,
    question: {
      prompt: "How many total replicas are required in PBFT to tolerate f Byzantine nodes?",
      options: [
        "2f + 1 replicas",
        "3f + 1 replicas",
        "4f + 2 replicas",
        "f * (f + 1) replicas"
      ],
      correctIndex: 1,
      targetKey: "3f_plus_1"
    }
  },
  {
    id: "sec_4",
    subtaskId: "ch4_vector_clocks",
    title: "4. Partial Ordering and Causal Consistency",
    content: `In distributed storage systems lacking physical clock synchronization, causality is captured via vector clocks or Lamport timestamps. A vector clock for an n-process system is an array of n logical clock integers. Each process increments its own component before generating an event. When sending a message, the full vector timestamp is transmitted. Upon receipt, the destination node updates each vector entry by computing the element-wise maximum. Two events are causally concurrent if neither vector dominates the other across all dimensions.`,
    question: {
      prompt: "When are two distributed events deemed causally concurrent?",
      options: [
        "When their physical NTP timestamps differ by less than 10 milliseconds",
        "When neither vector clock timestamp dominates the other across all indices",
        "When both events are executed within the same Raft term",
        "When the coordinator node assigns them the identical monotonically increasing sequence"
      ],
      correctIndex: 1,
      targetKey: "neither_dominates"
    }
  }
];

export default function ReadingTestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const durationParam = parseInt(searchParams.get("duration"), 10);
  const totalDurationSeconds = (!isNaN(durationParam) && durationParam > 0) ? durationParam : 600;

  // Session state
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [hasBacktracked, setHasBacktracked] = useState(false);
  const [backtrackCount, setBacktrackCount] = useState(0);
  const [revisionsCount, setRevisionsCount] = useState(0);

  // Simulated task switch / distraction alert
  const [taskSwitchActive, setTaskSwitchActive] = useState(false);
  const [taskSwitchStartTime, setTaskSwitchStartTime] = useState(null);
  const [switchRecoveryDuration, setSwitchRecoveryDuration] = useState(null);

  // Completed trials accumulator
  const trialsRef = useRef([]);
  const sectionStartTimeRef = useRef(performance.now());
  const trialIndexRef = useRef(1);
  const scrollPositionRef = useRef(0);
  const isFinishedRef = useRef(false);

  // Start telemetry on mount
  useEffect(() => {
    startMouseTracking();
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= totalDurationSeconds && !isFinishedRef.current) {
          finishSession();
        }
        return next;
      });
    }, 1000);

    // Track scroll backtracking
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll < scrollPositionRef.current - 150) {
        setHasBacktracked(true);
        setBacktrackCount((c) => c + 1);
      }
      scrollPositionRef.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Schedule a simulated task-switch interruption around 25% or 50% into session
    const switchTimeout = setTimeout(() => {
      if (!isFinishedRef.current) {
        setTaskSwitchActive(true);
        setTaskSwitchStartTime(performance.now());
      }
    }, Math.min(45000, Math.floor(totalDurationSeconds * 250)));

    return () => {
      clearInterval(interval);
      clearTimeout(switchTimeout);
      stopMouseTracking();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [totalDurationSeconds]);

  // Complete simulated task switch
  const handleResolveTaskSwitch = () => {
    const now = performance.now();
    const durationS = (now - (taskSwitchStartTime || now)) / 1000;
    setSwitchRecoveryDuration(durationS);
    setTaskSwitchActive(false);

    // Record as an explicit task switch trial
    const mouseStats = snapshotAndResetMouseTrial();
    trialsRef.current.push({
      trialIndex: trialIndexRef.current++,
      timestampMs: elapsedSeconds * 1000,
      stimulusType: "task_switch",
      symbolId: "task_switch_alert",
      symbolLabel: "Task Switch Interruption",
      isTarget: true,
      responseGiven: true,
      reactionTimeMs: Math.round(durationS * 1000),
      isCorrect: true,
      inputDevice: "mouse",
      interrupted: true,
      isTaskSwitch: true,
      recoveryTimeS: Math.round(durationS * 10) / 10,
      backtracked: false,
      ...mouseStats,
    });
  };

  // Begin answering the section comprehension question
  const handleProceedToQuestion = () => {
    setIsAnswering(true);
    setSelectedOption(null);
    setQuestionStartTime(performance.now());
    snapshotAndResetMouseTrial();
  };

  // Select an option with revision tracking
  const handleSelectOption = (idx) => {
    if (selectedOption !== null && selectedOption !== idx) {
      setRevisionsCount((c) => c + 1);
    }
    setSelectedOption(idx);
  };

  // Submit answer and proceed
  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    const now = performance.now();
    const rt = now - (questionStartTime || now);
    const section = READING_SECTIONS[currentSectionIndex];
    const isCorrect = selectedOption === section.question.correctIndex;
    const mouseStats = snapshotAndResetMouseTrial();

    // Record question trial
    trialsRef.current.push({
      trialIndex: trialIndexRef.current++,
      timestampMs: elapsedSeconds * 1000,
      stimulusType: "reading_comprehension",
      symbolId: section.id,
      symbolLabel: section.title,
      isTarget: true,
      responseGiven: true,
      reactionTimeMs: Math.round(rt),
      isCorrect,
      errorType: isCorrect ? null : "comprehension_lapse",
      inputDevice: "mouse",
      interrupted: false,
      isTaskSwitch: true,
      subtaskId: section.subtaskId,
      backtracked: hasBacktracked,
      recoveryTimeS: switchRecoveryDuration || 3.0,
      ...mouseStats,
    });

    // Reset section states
    setHasBacktracked(false);
    setSelectedOption(null);
    setIsAnswering(false);

    // Advance section or loop through materials
    if (currentSectionIndex < READING_SECTIONS.length - 1) {
      setCurrentSectionIndex((idx) => idx + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Completed all reading sections or duration elapsed
      finishSession();
    }
  };

  // Finish session and analyze
  const finishSession = async () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    stopMouseTracking();

    const result = await analyzeSessionData(
      trialsRef.current,
      totalDurationSeconds,
      `session-reading-${Date.now()}`,
      {
        taskType: "reading_comprehension",
        interruptionsCount: switchRecoveryDuration ? 1 : 0,
        backtrackCount,
        inactivityPeriodsCount: revisionsCount,
      }
    );

    saveSession(result);
    navigate("/results");
  };

  const currentSection = READING_SECTIONS[currentSectionIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      {/* Top Telemetry Bar */}
      <div className="bg-[#121A2B] p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Continuous Reading & Comprehension Task
            </h2>
            <div className="text-xs text-slate-400 font-mono">
              Section {currentSectionIndex + 1} of {READING_SECTIONS.length} • Real work simulation
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

          <button
            onClick={finishSession}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors font-medium"
          >
            Finish Early
          </button>
        </div>
      </div>

      {/* Simulated Urgent Task-Switch Distraction Modal */}
      {taskSwitchActive && (
        <div className="bg-gradient-to-r from-amber-950/60 via-[#1A1425] to-rose-950/60 p-6 rounded-2xl border-2 border-amber-500 shadow-2xl space-y-4 animate-bounce-subtle">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-amber-300">
                ⚡ Simulated Context Switch Interruption
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                A high-priority operational alert requires immediate verification. The AI is currently measuring your <strong>task-switching latency</strong> and <strong>distraction recovery time</strong>.
              </p>
            </div>
          </div>

          <div className="bg-[#0B1020]/90 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 font-mono">
            <div>Verification Code: <strong>RECOVERY_CHECK_#849</strong></div>
            <div className="text-slate-400 text-[11px]">Click the verification button below to resolve the disruption and return to reading.</div>
          </div>

          <Button
            onClick={handleResolveTaskSwitch}
            variant="primary"
            size="md"
            className="w-full justify-center bg-amber-600 hover:bg-amber-500 text-black font-bold"
          >
            Acknowledge & Return to Passage
          </Button>
        </div>
      )}

      {/* Main Reading Passage Card */}
      {!isAnswering ? (
        <div className="bg-[#121A2B] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-xl font-extrabold text-white font-sans tracking-tight">
              {currentSection.title}
            </h3>
          </div>

          <div className="text-slate-200 text-sm sm:text-base leading-relaxed tracking-normal space-y-4 font-sans font-normal">
            <p>{currentSection.content}</p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 font-mono">
              {hasBacktracked ? (
                <span className="text-amber-400">↺ Backtracking detected (re-reading scroll)</span>
              ) : (
                <span>Read steadily without rushing</span>
              )}
            </div>

            <Button
              onClick={handleProceedToQuestion}
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
            >
              Ready for Comprehension Check <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      ) : (
        /* Comprehension Check Arena */
        <div className="bg-[#121A2B] p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 animate-fade-in">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">
              Comprehension Check: Section {currentSectionIndex + 1}
            </h3>
          </div>

          <p className="text-base text-slate-100 font-medium">
            {currentSection.question.prompt}
          </p>

          <div className="space-y-3">
            {currentSection.question.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3 ${
                    isSelected
                      ? "bg-violet-600/20 border-violet-500 text-white font-medium shadow-md shadow-violet-600/20"
                      : "bg-[#0B1020] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5 ${
                    isSelected ? "bg-violet-500 text-white" : "bg-slate-800 text-slate-400"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400 font-mono">
              {revisionsCount > 0 && <span>Revisions: {revisionsCount}</span>}
            </div>

            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              variant="primary"
              size="md"
            >
              Submit Answer & Continue <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
