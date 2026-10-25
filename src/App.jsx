import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import TestIntroPage from "./pages/TestIntroPage";
import ActiveTestPage from "./pages/ActiveTestPage";
import ReadingTestPage from "./pages/ReadingTestPage";
import WorkingMemoryTestPage from "./pages/WorkingMemoryTestPage";
import TaskSwitchingTestPage from "./pages/TaskSwitchingTestPage";
import ResultsDashboardPage from "./pages/ResultsDashboardPage";
import ScienceAboutPage from "./pages/ScienceAboutPage";
import Button from "./components/Button";
import { AlertCircle } from "lucide-react";

/**
 * Scroll to top or anchor element on route change
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

/**
 * 404 Not Found Page
 */
function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 mx-auto flex items-center justify-center border border-violet-500/30">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h1 className="text-2xl font-bold text-white font-sans">
        Page Not Found
      </h1>
      <p className="text-xs text-slate-400 leading-relaxed">
        The requested research module or route does not exist.
      </p>
      <Button to="/" variant="primary" size="md">
        Return to Home
      </Button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-[#0B1020] text-slate-100 font-sans selection:bg-violet-600/30 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/test" element={<TestIntroPage />} />
            <Route path="/test/session" element={<ActiveTestPage />} />
            <Route path="/test/reading" element={<ReadingTestPage />} />
            <Route path="/test/working-memory" element={<WorkingMemoryTestPage />} />
            <Route path="/test/task-switching" element={<TaskSwitchingTestPage />} />
            <Route path="/results" element={<ResultsDashboardPage />} />
            <Route path="/science" element={<ScienceAboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
