import React from "react";
import { Link } from "react-router-dom";
import { Activity, ShieldCheck, Cpu, Code2, HeartHandshake } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#070B16] border-t border-slate-800/80 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#121A2B] border border-violet-500/40">
                <Activity className="w-4 h-4 text-violet-400" />
              </div>
              <span className="font-bold text-slate-100 text-base font-sans tracking-tight">
                FOCUS<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">DRIFT</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20">
                College MDP
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Focus Drift is an academic research application exploring how human task performance fluctuates over continuous concentration intervals. Built for our Multidisciplinary Project (MDP) in behavioural computing and cognitive science.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1 bg-[#0E1528] px-2 py-1 rounded border border-slate-800">
                <Code2 className="w-3 h-3 text-cyan-400" /> React + Vite
              </span>
              <span className="flex items-center gap-1 bg-[#0E1528] px-2 py-1 rounded border border-slate-800">
                <Cpu className="w-3 h-3 text-violet-400" /> Tailwind + Recharts
              </span>
              <span className="flex items-center gap-1 bg-[#0E1528] px-2 py-1 rounded border border-slate-800">
                FastAPI Engine
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider font-mono">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition-colors">Home Landing</Link>
              </li>
              <li>
                <Link to="/test" className="hover:text-cyan-400 transition-colors">Test Protocol (/test)</Link>
              </li>
              <li>
                <Link to="/test/session" className="hover:text-cyan-400 transition-colors">Active Task Chamber</Link>
              </li>
              <li>
                <Link to="/results" className="hover:text-cyan-400 transition-colors">Results Dashboard</Link>
              </li>
              <li>
                <Link to="/science" className="hover:text-cyan-400 transition-colors">Cognitive Science & Methods</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Research Ethics & Privacy */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider font-mono">
              Research & Privacy
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Client-Side Local Processing</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero Third-Party Tracking</span>
              </li>
              <li className="flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>Open MDP Academic Resource</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Ethical Non-Diagnostic Disclaimer Box */}
        <div className="p-4 rounded-xl bg-[#0E1528] border border-slate-800 text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider font-mono">
            <span>Non-Diagnostic Disclaimer</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            <strong>Important Medical & Psychological Notice:</strong> Focus Drift is purely an experimental demonstration designed for undergraduate research evaluation. It measures behavioral output (response speed and error variation) during an isolated visual task. It <strong>never</strong> measures direct brain activity and <strong>must not be used</strong> to diagnose, screen, or treat ADHD, ADD, executive dysfunction, or any psychiatric or neurological condition. Individual performance fluctuates widely based on fatigue, screen contrast, sleep, caffeine, and stress.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Focus Drift Project — College Multidisciplinary Project (MDP). For educational evaluation.</p>
          <p className="font-mono text-slate-400">Dark Midnight / Electric Violet & Cyan Edition</p>
        </div>

      </div>
    </footer>
  );
}
