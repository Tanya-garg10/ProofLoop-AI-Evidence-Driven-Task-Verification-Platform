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
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';
import type { User } from '../types/index.js';

interface CommandNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User | null;
  onOpenSettings: () => void;
}

export const CommandNav: React.FC<CommandNavProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenSettings,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'command-center', label: 'Command Center', icon: Activity },
        { id: 'projects', label: 'Projects', icon: Layers },
        { id: 'operations-twin', label: 'Operations Twin', icon: Compass },
      ],
    },
    {
      group: 'INTELLIGENCE',
      items: [
        { id: 'planner', label: 'AI Planner', icon: Sparkles },
        { id: 'agent-control', label: 'Agent Control Room', icon: Cpu },
        { id: 'visual-studio', label: 'Visual Proof Studio', icon: ScanEye },
        { id: 'verification', label: 'Verification Center', icon: CheckCircle2 },
        { id: 'risk-radar', label: 'Risk Radar', icon: AlertTriangle },
      ],
    },
    {
      group: 'GOVERNANCE',
      items: [
        { id: 'trust-ledger', label: 'Trust Ledger', icon: ShieldCheck },
        { id: 'review-queue', label: 'Review Queue', icon: FileCheck2 },
        { id: 'reports', label: 'Reports', icon: FileText },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'ai-connections', label: 'AI Connections', icon: Server },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#070A12]/95 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate('command-center')}
          className="flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#8B7CFF] to-[#4DD9E8] flex items-center justify-center text-white font-bold text-xs">
            PL
          </div>
          <span className="font-bold text-sm text-white">ProofLoop AI</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-[#0D1321] border border-neutral-800 text-neutral-300"
          >
            <UserIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg bg-[#0D1321] border border-neutral-800 text-neutral-300"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[#070A12] border-r border-neutral-800/80 transition-all duration-300 select-none ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Lockup */}
        <div className="p-4 border-b border-neutral-800/80 flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group overflow-hidden"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8B7CFF] to-[#4DD9E8] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md shadow-[#8B7CFF]/20 group-hover:scale-105 transition-transform">
              PL
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-sm text-white tracking-tight leading-tight">
                  ProofLoop AI
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  v3.8 Enterprise
                </span>
              </div>
            )}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              {!collapsed ? (
                <div className="px-3 text-[10px] font-mono font-bold tracking-wider text-neutral-400 uppercase">
                  {grp.group}
                </div>
              ) : (
                <div className="w-4 h-0.5 bg-neutral-800 mx-auto my-2" />
              )}

              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentView === item.id ||
                  (item.id === 'projects' && currentView === 'project-detail');

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#141C2D] text-[#8B7CFF] font-semibold border border-[#8B7CFF]/30 shadow-sm shadow-[#8B7CFF]/15'
                        : 'text-neutral-400 hover:text-white hover:bg-[#0D1321]'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#8B7CFF]' : 'text-neutral-400'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Persona & Role Footer */}
        <div className="p-3 border-t border-neutral-800/80">
          <button
            onClick={onOpenSettings}
            className="w-full p-2 rounded-xl bg-[#0D1321] border border-neutral-800 hover:border-neutral-700 transition-all flex items-center gap-2.5 text-left"
          >
            <div className="w-7 h-7 rounded-full bg-neutral-800 overflow-hidden shrink-0">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-4 h-4 text-neutral-400 m-1.5" />
              )}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Elena Rostova'}</p>
                <p className="text-[10px] font-mono text-[#8B7CFF] truncate">
                  {currentUser?.role || 'ORGANIZER'}
                </p>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <span className="text-base font-bold text-white">ProofLoop Navigation</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-lg text-neutral-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {navGroups.map((grp) => (
              <div key={grp.group} className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">
                  {grp.group}
                </span>
                <div className="grid grid-cols-1 gap-1 pt-1">
                  {grp.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          setMobileOpen(false);
                        }}
                        className={`flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold ${
                          isActive ? 'bg-[#141C2D] text-[#8B7CFF]' : 'text-neutral-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
