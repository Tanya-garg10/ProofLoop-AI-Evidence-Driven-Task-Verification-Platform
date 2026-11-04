import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Compass,
  Sparkles,
  Cpu,
  ScanEye,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FileCheck2,
  FileText,
  Settings,
  Server,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { User } from '../types/index.js';

interface NavigationRailProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User | null;
  onOpenSettings: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenSettings,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const navGroups = [
    {
      group: 'OPERATIONS',
      items: [
        { id: 'command-center', label: 'COMMAND', icon: Activity },
        { id: 'projects', label: 'WORKSPACES', icon: Layers },
        { id: 'operations-twin', label: 'SPATIAL TWIN', icon: Compass },
      ],
    },
    {
      group: 'INTELLIGENCE',
      items: [
        { id: 'visual-studio', label: 'EVIDENCE STUDIO', icon: ScanEye, highlight: true },
        { id: 'planner', label: 'AI PLANNER', icon: Sparkles },
        { id: 'agent-control', label: 'CONTROL ROOM', icon: Cpu },
        { id: 'verification', label: 'VERIFICATION', icon: CheckCircle2 },
        { id: 'risk-radar', label: 'RISK RADAR', icon: AlertTriangle },
      ],
    },
    {
      group: 'GOVERNANCE',
      items: [
        { id: 'review-queue', label: 'REVIEW QUEUE', icon: FileCheck2 },
        { id: 'trust-ledger', label: 'TRUST LEDGER', icon: ShieldCheck },
        { id: 'reports', label: 'AUDIT REPORTS', icon: FileText },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'ai-connections', label: 'AI ENGINES', icon: Server },
        { id: 'settings', label: 'SETTINGS', icon: Settings },
      ],
    },
  ];

  const isActive = (id: string) =>
    currentView === id || (id === 'projects' && currentView === 'project-detail');

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 236 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="hidden md:flex print:hidden flex-col bg-[#080A10] border-r border-[rgba(148,163,184,0.08)] select-none shrink-0 h-screen sticky top-0 z-30"
    >
      {/* 1. Rail Brand Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-[rgba(148,163,184,0.08)]">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left group overflow-hidden"
          title="Return to Landing Page"
        >
          <div className="w-7 h-7 rounded bg-[#121824] border border-[#8B7CFF]/40 flex items-center justify-center text-[#8B7CFF] font-mono font-bold text-xs shadow-[0_0_12px_rgba(139,124,255,0.2)] group-hover:scale-105 transition-transform shrink-0">
            PL
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display font-bold text-xs tracking-tight text-white flex items-center gap-1.5 truncate">
                <span>PROOFLOOP</span>
                <span className="text-[9px] font-mono text-[#8B7CFF] bg-[#8B7CFF]/15 px-1 rounded">
                  OS
                </span>
              </div>
              <div className="text-[9px] font-mono text-[#64748B] tracking-wider truncate">
                THE EVIDENCE OS
              </div>
            </div>
          )}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#121824] transition-colors"
          title={collapsed ? 'Expand rail' : 'Collapse rail'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 2. Workspace Selector Strip */}
      {!collapsed ? (
        <div className="px-3 pt-3 pb-2 border-b border-[rgba(148,163,184,0.06)] relative">
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-[#0D111B] border border-[rgba(148,163,184,0.12)] hover:border-[rgba(148,163,184,0.25)] text-left transition-all"
          >
            <div className="min-w-0 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#29D6A0] shrink-0" />
              <div className="truncate">
                <div className="text-[10px] font-mono font-semibold text-white tracking-wide truncate">
                  TECH FEST 2026
                </div>
                <div className="text-[9px] font-mono text-[#64748B]">Auditorium Wing</div>
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-[#94A3B8] shrink-0" />
          </button>

          {/* Quick workspace dropdown */}
          {workspaceMenuOpen && (
            <div className="absolute left-3 right-3 top-12 z-50 rounded-lg bg-[#121824] border border-[rgba(148,163,184,0.2)] p-1.5 shadow-2xl space-y-1">
              <div
                onClick={() => {
                  onNavigate('command-center');
                  setWorkspaceMenuOpen(false);
                }}
                className="p-2 rounded hover:bg-[#192232] cursor-pointer text-left"
              >
                <div className="text-[11px] font-semibold text-white">Tech Fest 2026</div>
                <div className="text-[9px] text-[#29D6A0] font-mono">ACTIVE AUDIT · 5 TASKS</div>
              </div>
              <div
                onClick={() => {
                  onNavigate('projects');
                  setWorkspaceMenuOpen(false);
                }}
                className="p-2 rounded hover:bg-[#192232] cursor-pointer text-left border-t border-[rgba(148,163,184,0.1)] text-[10px] font-mono text-[#8B7CFF]"
              >
                + VIEW ALL WORKSPACES
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-2 flex justify-center border-b border-[rgba(148,163,184,0.06)]">
          <div
            title="Tech Fest 2026"
            className="w-8 h-8 rounded bg-[#121824] border border-[rgba(148,163,184,0.1)] flex items-center justify-center text-[#29D6A0]"
          >
            <Building2 className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* 3. Grouped Navigation Rail Items */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-0.5">
            {!collapsed && (
              <div className="px-2.5 pb-1 text-[9px] font-mono font-semibold tracking-wider text-[#64748B] uppercase">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded transition-all relative text-left group ${
                    active
                      ? 'bg-[#121824] text-white border border-[rgba(139,124,255,0.35)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0D111B]'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active
                        ? 'text-[#8B7CFF]'
                        : item.highlight
                        ? 'text-[#62DCEB] group-hover:text-white'
                        : 'text-[#64748B] group-hover:text-white'
                    }`}
                  />

                  {!collapsed && (
                    <span
                      className={`text-[11px] font-mono tracking-wide truncate ${
                        active ? 'font-semibold text-white' : 'font-normal'
                      }`}
                    >
                      {item.label}
                    </span>
                  )}

                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-[#8B7CFF] rounded-r" />
                  )}

                  {item.highlight && !collapsed && !active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#62DCEB]" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* 4. User Profile & Role Switcher Area */}
      <div className="p-2 border-t border-[rgba(148,163,184,0.08)] bg-[#080A10]">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2.5 p-1.5 rounded hover:bg-[#121824] transition-colors text-left"
          title="Switch User / Account Settings"
        >
          <div className="w-7 h-7 rounded-full bg-[#121824] border border-[rgba(148,163,184,0.18)] overflow-hidden shrink-0 flex items-center justify-center">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-[#94A3B8]" />
            )}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-white truncate">
                {currentUser?.name || 'Operator'}
              </div>
              <div className="text-[9px] font-mono text-[#8B7CFF] tracking-wider uppercase truncate">
                {currentUser?.role || 'FIELD_INSPECTOR'}
              </div>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
};
