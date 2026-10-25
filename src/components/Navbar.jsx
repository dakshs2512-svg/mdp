import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, Menu, X, Play, BarChart2 } from "lucide-react";
import Button from "./Button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "How It Works", path: "/#how-it-works", isAnchor: true },
    { name: "Science", path: "/science", isAnchor: false },
    { name: "About", path: "/science#about", isAnchor: true },
    { name: "Results Dashboard", path: "/results", isAnchor: false },
  ];

  const isActive = (path) => {
    if (path.includes("#")) {
      return location.pathname === "/" && location.hash === path.replace("/", "");
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B1020]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#121A2B] border border-violet-500/30 group-hover:border-violet-500/60 shadow-glow-subtle transition-all duration-300">
            <Activity className="w-5 h-5 text-violet-400 group-hover:text-cyan-400 transition-colors" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base font-sans group-hover:text-slate-100">
                FOCUS<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 font-extrabold ml-1">DRIFT</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono tracking-wider text-slate-400 bg-slate-800/80 rounded border border-slate-700/60 uppercase">
                MDP Research
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight -mt-0.5 hidden sm:block">
              Continuous Attention Dynamics
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => {
            const active = isActive(item.path);
            if (item.isAnchor && location.pathname !== item.path.split("#")[0]) {
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="px-3 py-1.5 text-xs lg:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  {item.name}
                </Link>
              );
            }
            if (item.path.includes("#")) {
              return (
                <a
                  key={item.name}
                  href={item.path}
                  className="px-3 py-1.5 text-xs lg:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  {item.name}
                </a>
              );
            }
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* CTA Button */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to="/results"
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/40"
            title="View latest or demo results"
          >
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dashboard</span>
          </Link>
          <Button
            to="/test"
            size="sm"
            variant="primary"
            icon={Play}
            iconPosition="right"
          >
            Start Focus Test
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to="/test"
            className="px-3 py-1 text-xs rounded-lg bg-violet-600 text-white font-medium flex items-center gap-1"
          >
            <Play className="w-3 h-3" />
            <span>Test</span>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0E1528] px-4 pt-2 pb-5 space-y-2">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg"
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Button
              to="/test"
              size="md"
              variant="primary"
              className="w-full"
              onClick={() => setIsOpen(false)}
              icon={Play}
              iconPosition="right"
            >
              Start Focus Test
            </Button>
            <Button
              to="/results"
              size="md"
              variant="secondary"
              className="w-full"
              onClick={() => setIsOpen(false)}
              icon={BarChart2}
              iconPosition="left"
            >
              View Results Dashboard
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
