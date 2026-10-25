# Visual Studio Code Developer & Presentation Guide
## Focus Drift — Cognitive Behavioral Dynamics Platform

Welcome to the **Focus Drift** codebase! This guide is written specifically to help you open, code, debug, and present this project smoothly in **Visual Studio Code (VS Code)** on macOS.

---

## 🚀 1. Opening the Project in Visual Studio Code

### Step 1: Open the Project Directory
Launch Visual Studio Code and open the directory:
1. In the top menu bar, click **File** $\rightarrow$ **Open Folder...**
2. Navigate to:
   ```
   /Users/aditrisingh/.gemini/antigravity/scratch/focus-drift
   ```
3. Click **Open**.

*(Alternatively from your macOS Terminal)*:
```bash
cd /Users/aditrisingh/.gemini/antigravity/scratch/focus-drift
code .
```

### Step 2: Set Python Interpreter
VS Code is pre-configured via `.vscode/settings.json` to automatically use the pre-built virtual environment:
- If prompted in the bottom-right corner to select a Python interpreter, choose:
  ```
  ./backend/venv/bin/python (Python 3.14)
  ```

---

## ⚡ 2. Running the Full System in VS Code

You have three convenient ways to launch:

### Method A: One-Click Terminal Launch (Easiest)
Open the integrated terminal in VS Code (`Ctrl + ~` or `Cmd + J`) and run:
```bash
./run.sh
```
This automatically starts:
- 🚀 **FastAPI AI Engine** on `http://127.0.0.1:8000`
- 🌐 **Vite React Frontend** on `http://localhost:5173`
- Press `Ctrl + C` in the terminal anytime to cleanly stop both services.

---

### Method B: VS Code Tasks Menu
1. Press `Cmd + Shift + P` (or `Ctrl + Shift + P` on Windows/Linux).
2. Type **Tasks: Run Task** and press **Enter**.
3. Select **Start Full Focus Drift System**.
   - This launches the backend and frontend in parallel inside dedicated VS Code terminal tabs!

---

### Method C: One-Click F5 Debugger
1. Press `Cmd + Shift + D` to open the **Run & Debug** panel on the left sidebar.
2. Select **Python: FastAPI Backend** from the dropdown at the top.
3. Press **F5** (or click the green Play icon).
4. Set breakpoints anywhere in `backend/main.py` (e.g. inside `compute_cusum_drift` or `classify_individual_attention_signature`) to inspect real-time variables during analysis!

---

## 📂 3. Code Architecture & Where Everything Lives

```
focus-drift/
├── .vscode/                     # Pre-configured VS Code workspace settings
│   ├── launch.json              # F5 debugging configuration for Python and Chrome
│   ├── tasks.json               # Tasks for starting and building Vite and FastAPI
│   ├── settings.json            # Interpreter path & terminal PATH auto-configuration
│   └── extensions.json          # Recommended extensions (Python, Tailwind, ESLint)
│
├── backend/
│   ├── main.py                  # ⭐ FastAPI service: CUSUM / EWMA change-point detection,
│   │                            #   feature attribution, and attention signature classifier
│   ├── requirements.txt         # Dependencies (FastAPI, Uvicorn, NumPy, Pydantic)
│   └── venv/                    # Pre-installed Python 3.14 environment
│
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx      # Scientific hero page with preview demo
│   │   ├── TestIntroPage.jsx    # Mode selector: Symbol Vigilance vs Reading Task
│   │   ├── ActiveTestPage.jsx   # 🎯 Task A: Continuous Symbol Vigilance (SART / CPT)
│   │   ├── ReadingTestPage.jsx  # 📚 Task B: Technical Reading & Micro-Comprehension
│   │   ├── ResultsDashboardPage.jsx # 📊 Interactive results & signature dashboard
│   │   └── ScienceAboutPage.jsx # College MDP academic literature & references
│   │
│   ├── components/
│   │   ├── AttentionTrajectoryGraph.jsx # ⭐ 100% -> 40% Attention curve with "Drift Begins"
│   │   ├── SignatureCard.jsx            # ⭐ Individual Signatures (Person A, B, C)
│   │   ├── FeatureAttributionCard.jsx   # ⭐ "What changed at drift onset" explainability
│   │   ├── PerformanceChart.jsx         # Trial-by-trial RT time-series with baseline
│   │   ├── DriftTimeline.jsx            # 3-Phase horizontal stability breakdown
│   │   └── MetricCard.jsx               # Stat KPI card for summary metrics
│   │
│   └── utils/
│       ├── mouseTracker.js      # High-precision cursor velocity, path & motor jitter
│       ├── driftAnalysis.js     # Mathematical change-point engine in JavaScript
│       ├── api.js               # Dual-mode API client with instant offline fallback
│       ├── sampleData.js        # 15-minute benchmark data and archetype definitions
│       └── storage.js           # Private on-device localStorage & CSV/JSON exporter
│
├── run.sh                       # One-click dual-service launch script
└── VS_CODE_GUIDE.md             # This guide!
```

---

## 🎓 4. Answering Questions in College Viva / Evaluations

| Question | Where to Show the Code | How It Works |
| :--- | :--- | :--- |
| **"What is the mathematical definition of the drift point?"** | `backend/main.py` lines 70–95 & `src/utils/driftAnalysis.js` | Uses **CUSUM (Cumulative Sum Control Chart)** and rolling Intra-Individual Coefficient of Variation ($RTCV = SD / Mean$) to identify when reaction times persistently deviate beyond the baseline warm-up phase ($> \mu_0 + 1.3\sigma$). |
| **"How does the AI discover individual attention signatures?"** | `backend/main.py` lines 180–245 (`classify_individual_attention_signature`) | Evaluates the primary vector of deterioration: **Person A** drops monotonically after ~10–12 minutes; **Person B** incurs steep latency/error spikes immediately on task switches; **Person C** exhibits prolonged recovery latency ($>12\text{s}$) post-interruption. |
| **"How do you know which behavioural signals changed?"** | `backend/main.py` lines 98–175 (`calculate_feature_attribution`) | Compares the pre-drift baseline phase against the post-drift phase across 5 dimensions ($RTCV$, omission rate, false alarms, distraction recovery latency, and mouse jitter index). |
| **"Why doesn't this require medical hardware (EEG)?"** | `src/pages/ScienceAboutPage.jsx` | Sustained attention, vigilance decrement, and response inhibition have well-established psychophysical behavioral proxies in cognitive science (Mackworth, SART, Continuous Performance Tests). |

---

## 🛠️ 5. Recommended VS Code Extensions

When you open this folder in VS Code, you can click **Install All** on the recommended extensions prompt, which includes:
- **Python** (`ms-python.python`)
- **Python Debugger** (`ms-python.debugpy`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **ESLint** (`dbaeumer.vscode-eslint`)
