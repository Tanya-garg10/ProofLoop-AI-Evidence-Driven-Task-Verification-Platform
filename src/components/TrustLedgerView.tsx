import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Lock,
  FileCheck,
  RefreshCw,
  ExternalLink,
  Filter,
  Check,
} from 'lucide-react';
import type { TrustLedgerEvent } from '../types/index.js';
import { fetchTrustLedger, verifyLedgerIntegrity } from '../lib/api.js';

interface TrustLedgerViewProps {
  onOpenTask: (taskId: string) => void;
}

export const TrustLedgerView: React.FC<TrustLedgerViewProps> = ({ onOpenTask }) => {
  const [events, setEvents] = useState<TrustLedgerEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [verifiedEventId, setVerifiedEventId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await fetchTrustLedger('proj-techfest-2026');
      setEvents(res);
    } catch (err) {
      console.error('Failed to load trust ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleVerifyEvent = async (id: string) => {
    try {
      setVerifyingId(id);
      const res = await verifyLedgerIntegrity(id);
      if (res.verified) {
        setVerifiedEventId(id);
        setTimeout(() => setVerifiedEventId(null), 4000);
      }
    } catch (err) {
      console.error('Integrity verification failed:', err);
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesRole = roleFilter === 'ALL' || e.actorRole === roleFilter;
    const matchesSearch =
      e.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.result.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.integrityHash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8B7CFF] mb-1">
            <span>Cryptographic Governance</span>
            <span>·</span>
            <span className="text-[#4DD9E8]">SHA-256 Tamper-Evident Ledger</span>
            <span>·</span>
            <span className="text-neutral-400">Zero Fabricated Proofs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Trust & Audit Ledger
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Immutable log of task genesis, evidence attachments, autonomous AI decisions, and human sign-offs with SHA-256 checksums.
          </p>
        </div>

        <button
          onClick={loadEvents}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 bg-[#0D1321] border border-neutral-800 rounded-lg hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0D1321] border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, actor, or SHA-256 hash..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#141C2D] border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#8B7CFF]"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {[
            { key: 'ALL', label: 'All Events' },
            { key: 'SAFETY_REVIEWER', label: 'Safety Reviewer' },
            { key: 'AUTONOMOUS_AI_ENGINE', label: 'Autonomous AI' },
            { key: 'FIELD_INSPECTOR', label: 'Field Inspector' },
            { key: 'ORGANIZER', label: 'Organizer' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                roleFilter === tab.key
                  ? 'bg-[#141C2D] text-white font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Stream */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400">Loading cryptographic ledger...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0D1321] border border-neutral-800 text-xs text-neutral-400">
            No events match the search query.
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isVerified = verifiedEventId === evt.id;
            const isVerifying = verifyingId === evt.id;

            return (
              <div
                key={evt.id}
                className="p-5 rounded-2xl bg-[#0D1321] border border-neutral-800 hover:border-neutral-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#8B7CFF] bg-[#8B7CFF]/10 px-2 py-0.5 rounded border border-[#8B7CFF]/20">
                      {evt.action}
                    </span>
                    <span className="font-bold text-white">{evt.actor}</span>
                    <span className="text-neutral-500">·</span>
                    <span className="font-mono text-[11px] text-neutral-400">
                      {evt.actorRole}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-neutral-400">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  {evt.result}
                </p>

                {/* Cryptographic SHA-256 Hash Row */}
                <div className="p-2.5 rounded-xl bg-[#141C2D] border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono">
                  <div className="flex items-center gap-2 truncate text-neutral-400">
                    <Lock className="w-3 h-3 text-[#4DD9E8] shrink-0" />
                    <span className="text-neutral-500 shrink-0">SHA-256:</span>
                    <span className="text-[#4DD9E8] truncate">{evt.integrityHash}</span>
                  </div>

                  <button
                    onClick={() => handleVerifyEvent(evt.id)}
                    disabled={isVerifying}
                    className={`px-2.5 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition-all shrink-0 ${
                      isVerified
                        ? 'bg-[#28D6A0] text-black'
                        : 'bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-700'
                    }`}
                  >
                    {isVerified ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Hash Verified (NIST FIPS 180-4)</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3 h-3" />
                        <span>{isVerifying ? 'Hashing...' : 'Verify Checksum'}</span>
                      </>
                    )}
                  </button>
                </div>

                {evt.relatedTaskId && (
                  <div className="pt-1 flex items-center justify-between text-xs text-neutral-400">
                    <span>Task: {evt.relatedTaskTitle || evt.relatedTaskId}</span>
                    <button
                      onClick={() => onOpenTask(evt.relatedTaskId!)}
                      className="text-[#8B7CFF] hover:underline"
                    >
                      Inspect Task Evidence
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
