import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  ArrowRight,
  Layers,
  Filter,
  CheckCircle2,
  RefreshCw,
  Info,
} from 'lucide-react';
import type { RiskItem } from '../types/index.js';
import { fetchRiskRadar } from '../lib/api.js';

interface RiskRadarViewProps {
  onOpenTask: (taskId: string) => void;
}

export const RiskRadarView: React.FC<RiskRadarViewProps> = ({ onOpenTask }) => {
  const [data, setData] = useState<{
    overallRiskScore: number;
    riskLevel: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
    summary: string;
    risks: RiskItem[];
  } | null>(null);

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const loadRisks = async () => {
    try {
      setLoading(true);
      const res = await fetchRiskRadar('proj-techfest-2026');
      setData(res);
    } catch (err) {
      console.error('Failed to load risk radar data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRisks();
  }, []);

  const filteredRisks = (data?.risks || []).filter(
    (r) => severityFilter === 'ALL' || r.severity === severityFilter
  );

  const getSeverityBadge = (sev: RiskItem['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded text-[#F16C75] bg-[#F16C75]/10 border border-[#F16C75]/20">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded text-[#F6BC58] bg-[#F6BC58]/10 border border-[#F6BC58]/20">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded text-[#4DD9E8] bg-[#4DD9E8]/10 border border-[#4DD9E8]/20">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded text-[#28D6A0] bg-[#28D6A0]/10 border border-[#28D6A0]/20">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8B7CFF] mb-1">
            <span>Predictive Intelligence</span>
            <span>·</span>
            <span className="text-[#F6BC58]">Deterministic Risk Radar</span>
            <span>·</span>
            <span className="text-neutral-400">Zero Checkbox Trust</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Operations Risk Radar
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Automated analysis of evidence gaps, temporal blockers, and non-visual uncertainty indicators.
          </p>
        </div>

        <button
          onClick={loadRisks}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 bg-[#0D1321] border border-neutral-800 rounded-lg hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Scoring</span>
        </button>
      </div>

      {/* Risk Index Overview Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Main Score Dial */}
          <div className="md:col-span-4 p-6 rounded-2xl bg-[#0D1321] border border-neutral-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                Composite Operational Risk Score
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-extrabold font-mono text-[#F6BC58] tabular-nums">
                  {data.overallRiskScore}
                </span>
                <span className="text-sm font-mono text-neutral-400">/ 100</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Risk Severity Level</span>
                <span className="font-bold text-[#F6BC58]">{data.riskLevel}</span>
              </div>
              <p className="text-[11px] text-neutral-500 font-mono">
                Methodology: Deterministic rule-based weighting across safety & evidence gaps.
              </p>
            </div>
          </div>

          {/* Risk Summary Statement */}
          <div className="md:col-span-8 p-6 rounded-2xl bg-[#0D1321] border border-neutral-800 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B7CFF] block">
                Executive Risk Assessment
              </span>
              <p className="text-sm text-neutral-200 leading-relaxed font-medium">
                {data.summary}
              </p>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Life-safety egress requirements and unverified electronic signals (laser projector transmission) constitute the primary operational risk items requiring on-site human inspection before venue doors open.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <span>Audited Project: College Tech Fest 2026</span>
              <span className="font-mono text-[11px]">5 Monitored Physical Zones</span>
            </div>
          </div>
        </div>
      )}

      {/* Severity Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#0D1321] border border-neutral-800 rounded-xl overflow-x-auto text-xs">
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              severityFilter === sev
                ? 'bg-[#141C2D] text-white font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {sev === 'ALL' ? 'All Risk Items' : `${sev} Severity`}
          </button>
        ))}
      </div>

      {/* Risk Items List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400">Loading risk radar analysis...</div>
        ) : filteredRisks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0D1321] border border-neutral-800 text-xs text-neutral-400">
            No risk factors match this filter.
          </div>
        ) : (
          filteredRisks.map((risk) => (
            <div
              key={risk.id}
              className="p-5 rounded-2xl bg-[#0D1321] border border-neutral-800 hover:border-neutral-700 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#141C2D] border border-neutral-800 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-[#F6BC58]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{risk.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <span className="font-mono text-[11px]">Category: {risk.category}</span>
                      <span>·</span>
                      <span className="font-mono text-[11px]">Impact: {risk.impactScore}/100</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {getSeverityBadge(risk.severity)}
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed pl-11">
                {risk.explanation}
              </p>

              {/* Actionable recommendation */}
              <div className="ml-11 p-3 rounded-xl bg-[#141C2D] border border-neutral-800/80 text-xs space-y-1">
                <span className="font-semibold text-[#8B7CFF] uppercase text-[10px] tracking-wider block">
                  Recommended Action:
                </span>
                <p className="text-neutral-300 leading-relaxed">{risk.recommendedAction}</p>
              </div>

              {/* Task Link */}
              {risk.relatedTaskId && (
                <div className="ml-11 pt-1 flex items-center justify-between text-xs text-neutral-400">
                  <span>Related: {risk.relatedTaskTitle || risk.relatedTaskId}</span>
                  <button
                    onClick={() => onOpenTask(risk.relatedTaskId!)}
                    className="inline-flex items-center gap-1 text-[#8B7CFF] hover:underline"
                  >
                    <span>View Task Evidence</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
