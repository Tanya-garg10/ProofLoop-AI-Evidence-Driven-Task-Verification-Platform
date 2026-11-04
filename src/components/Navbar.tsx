import React from 'react';
import { CheckCircle2, ShieldAlert, Sparkles, User as UserIcon } from 'lucide-react';
import type { User } from '../types/index.js';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User | null;
  onOpenSettings: () => void;
  onQuickDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenSettings,
  onQuickDemo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#080B12]/90 backdrop-blur-md border-b border-neutral-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single line, no code comments) */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C8CFF] rounded-lg"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7C8CFF] to-[#A78BFA] flex items-center justify-center text-white shadow-sm shadow-[#7C8CFF]/20 group-hover:scale-105 transition-transform duration-200">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              ProofLoop AI
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`whitespace-nowrap transition-colors ${
              currentView === 'dashboard'
                ? 'text-[#7C8CFF] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('projects')}
            className={`whitespace-nowrap transition-colors ${
              currentView === 'projects' || currentView === 'project-detail'
                ? 'text-[#7C8CFF] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => onNavigate('planner')}
            className={`whitespace-nowrap transition-colors ${
              currentView === 'planner'
                ? 'text-[#7C8CFF] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            AI Planner
          </button>
          <button
            onClick={() => onNavigate('verification')}
            className={`whitespace-nowrap transition-colors ${
              currentView === 'verification'
                ? 'text-[#7C8CFF] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Verification Center
          </button>
          <button
            onClick={() => onNavigate('audit')}
            className={`whitespace-nowrap transition-colors ${
              currentView === 'audit'
                ? 'text-[#7C8CFF] font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Audit Log
          </button>
        </nav>

        {/* Zone 3: 1 primary action / user profile */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickDemo}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#7C8CFF] to-[#6366F1] rounded-lg hover:brightness-110 active:scale-98 transition-all shadow-sm shadow-[#7C8CFF]/25 whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tech Fest Demo</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 hover:text-white transition-all whitespace-nowrap shrink-0"
            title="Switch User & View AI Models"
          >
            <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 overflow-hidden">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-3 h-3" />
              )}
            </div>
            <span className="hidden sm:inline font-mono text-[11px] text-neutral-300">
              {currentUser?.name?.split(' ')[0] || 'User'} · {currentUser?.role || 'ORGANIZER'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
