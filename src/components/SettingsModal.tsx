import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Shield,
} from 'lucide-react';
import type { User } from '../types/index.js';
import { fetchProviders, resetDemoState } from '../lib/api.js';

interface SettingsModalProps {
  currentUser: User | null;
  demoUsers: User[];
  onSelectUser: (user: User) => void;
  onClose: () => void;
  onDemoReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  demoUsers,
  onSelectUser,
  onClose,
  onDemoReset,
}) => {
  const [providers, setProviders] = useState<any>(null);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders().then(setProviders).catch(console.error);
  }, []);

  const handleReset = async () => {
    try {
      setResetting(true);
      await resetDemoState();
      setResetMessage('Demo state restored: College Tech Fest Setup refreshed.');
      onDemoReset();
      setTimeout(() => setResetMessage(null), 3000);
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-neutral-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-white">System Settings & Role Switcher</h2>
            <p className="text-xs text-neutral-400">
              Switch user personas, inspect AI provider status, and reset demo datasets.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Switcher */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
            Select Active User Persona
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {demoUsers.map((u) => {
              const active = currentUser?.id === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onSelectUser(u)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    active
                      ? 'bg-[#182235] border-[#7C8CFF] shadow-sm shadow-[#7C8CFF]/20'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-7 h-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{u.name}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{u.role}</div>
                    </div>
                  </div>
                  {active && (
                    <span className="text-[10px] font-mono font-semibold text-[#7C8CFF]">
                      Active User
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Provider Telemetry */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
            AI Provider Infrastructure
          </label>
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Meta Muse Spark 1.3 (Planner)</span>
              <span className="font-mono text-[11px] text-neutral-300">
                {providers?.metaMuseSpark?.status || 'CHECKING'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Meta SAM 3.1 (Segment Anything)</span>
              <span className="font-mono text-[11px] text-neutral-300">
                {providers?.metaSAM?.status || 'CHECKING'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Meta Muse Voice Transcribe</span>
              <span className="font-mono text-[11px] text-neutral-300">
                {providers?.metaMuseVoice?.status || 'CHECKING'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Meta Muse Image (Optional)</span>
              <span className="font-mono text-[11px] text-neutral-300">
                {providers?.metaMuseImage?.status || 'CHECKING'}
              </span>
            </div>
          </div>
        </div>

        {/* Demo Reset Action */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
          <div className="text-xs text-neutral-400">
            {resetMessage ? (
              <span className="text-[#22C58B] font-medium">{resetMessage}</span>
            ) : (
              <span>Restore original College Tech Fest scenario state</span>
            )}
          </div>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-200 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 rounded-lg transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Baseline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
