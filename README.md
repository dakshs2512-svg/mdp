# FOCUS DRIFT — Sustained Attention & Attention Drift AI Platform

> **College Multidisciplinary Project (MDP)**  
> **Problem Statement:** *“How can machine learning identify and characterize the point at which an individual's sustained attention begins to deteriorate during a continuous cognitive task?”*  
> **Domain:** Behavioural Computing, Cognitive Science, and Human-Computer Interaction (HCI)

---

## 💡 The Core Problem

Someone with ADHD or sustained attention fatigue can start a task completely normally and then, **during the task**, their attention can gradually drift. Most tools focus on clinical diagnosis, general symptom screening, or medication logs. They do not answer the practical real-time question:

> **“I'm working right now. When did my attention start deteriorating, and what was happening immediately before it?”**

Focus Drift records **non-medical digital behavioral markers** during continuous realistic computer tasks (without EEG, smartwatches, or clinical hardware) and uses machine learning to:
1. Identify the exact temporal transition: **Focused $\rightarrow$ Unstable $\rightarrow$ Attention Drift** (e.g. *"Attention instability began at 8 min 42 sec"*).
2. Pinpoint **which behavioral features changed at that point** (feature attribution).
3. Discover **individual attention signatures** (Person A time-decay vs. Person B task-switch vulnerability vs. Person C interruption fragility).

---

## 🎯 The Final Prototype Metrics

```text
FOCUS DRIFT
Task: 15-minute concentration task
Afterward:
Attention stability: 74%
First detected drift: 8 min 42 sec
Response variability: ↑ 31%
Missed targets: 7
Distraction recovery time: 14 sec

Continuous Attention Trajectory Graph:
Attention
100% |████████████████
 80% |██████████████
 60% |██████████
 40% |██████
     +--------------------
       0   5   10   15 min
                 ↑
            drift begins (8 min 42 sec)
```

---

## 🔬 Non-Medical Behavioural Signals Recorded

| Signal | Description | Cognitive Significance |
| :--- | :--- | :--- |
| **Response Time (RT)** | Reaction time in milliseconds from stimulus onset to motor input | Processing speed & alertness |
| **Response Time Variability ($RTCV$)** | Standard deviation of RT divided by Mean RT | Hallmark digital marker of attentional lapses |
| **Missed Targets (Omission Errors)** | Target stimuli with no response registered | Microsleeps & vigilance dropouts |
| **Accidental Clicks (Commission Errors)** | Responses on distractor stimuli | Response inhibition & executive control failure |
| **Task Switching Cost** | Latency and error spikes upon switching subtasks | Context switching cognitive penalty |
| **Distraction Recovery Time** | Time in seconds for RTs to return to baseline after an interruption | Attentional re-stabilization efficiency |
| **Mouse Dynamics** | Cursor path tortuosity, velocity, and hesitation jitter before clicking | Sub-threshold motor instability and indecision |
| **Backtracking** | Scrolling backwards to re-read previous sentences/paragraphs | Working memory lapses during active reading |

---

## 🔥 Individual Attention Signatures

- **Person A (Time-Decay Drift)**:
  - *Profile:* Performance is steady initially but degrades monotonically after ~10–12 minutes of continuous unbroken vigilance.
  - *Mitigation:* Micro-interval pacing (12-minute focus sprints + 90-second sensory resets).
- **Person B (Task-Switching Vulnerability)**:
  - *Profile:* Performance remains stable for 25 minutes during single-tasking, but deteriorates rapidly and suffers high error bursts immediately following context shifts.
  - *Mitigation:* Subtask batching and unified multi-tab shielding.
- **Person C (Interruption Fragility)**:
  - *Profile:* Performance becomes erratic after repeated disruptions, with prolonged recovery times (14–18 seconds) before regaining baseline motor rhythm.
  - *Mitigation:* Full-screen focus mode and notification shielding.

---

## 🛠️ Dual Cognitive Task Paradigms

1. **Task A: Continuous Symbol Stream Vigilance (SART / CPT Task)**:
   - Stream of geometric shapes. Respond exclusively to the target (Cyan Ring / Blue Circle) while withholding responses on distractors (Purple Circle, Diamond, etc.).
2. **Task B: Continuous Technical Reading & Micro-Comprehension**:
   - Structured technical literature passages on distributed systems, inline factual comprehension checks, scrolling backtracking detection, and simulated context-switch alerts.
3. **Flexible Durations**:
   - **2 min:** Quick College MDP Presentation / Viva Demo
   - **5 min:** Fast Assessment
   - **10 min:** Standard Continuous Vigilance
   - **15 min:** Focus Drift Benchmark (Recommended)
   - **20 min:** Extended Research Protocol

---

## 🚀 Running Locally with Visual Studio Code

### Quick Start (One Command)
Open your terminal in the project directory:
```bash
cd /Users/aditrisingh/.gemini/antigravity/scratch/focus-drift
./run.sh
```
This automatically boots:
- 🚀 **FastAPI AI Engine** on `http://127.0.0.1:8000`
- 🌐 **Vite React Frontend** on `http://localhost:5173`

### In Visual Studio Code:
1. Open folder `/Users/aditrisingh/.gemini/antigravity/scratch/focus-drift` in VS Code.
2. Press `Cmd + Shift + P` $\rightarrow$ **Tasks: Run Task** $\rightarrow$ **Start Full Focus Drift System**.
3. To debug Python ML code, press `F5` (**Python: FastAPI Backend**). Set breakpoints in `backend/main.py`.
4. Detailed guide available in [`VS_CODE_GUIDE.md`](./VS_CODE_GUIDE.md).

---

## ⚠️ Important Scientific & Ethical Disclaimer

**FOCUS DRIFT IS STRICTLY AN ACADEMIC RESEARCH & BEHAVIOURAL DEMONSTRATION TOOL.**  
- **It is NOT an ADHD diagnosis tool.**
- It does **not** diagnose attention deficit hyperactivity disorder, clinical attention deficits, or neurological disorders.
- It does **not** directly measure neurochemical or brain wave activity (e.g., EEG/fMRI).
- All variations are non-medical behavioral proxies influenced by sleep, physical fatigue, display refresh rates, caffeine, and environment.
