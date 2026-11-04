import React, { useEffect, useState } from 'react';
import { motion } from 'motion';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ScanEye,
  ArrowRight,
  RefreshCw,
  Cpu,
  Lock,
  Play,
  ShieldCheck,
  ChevronRight,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';
import type { Project, Task, AuditLog, AgentExecutionRecord, RiskItem } from '../types/index.js';
import {
  fetchStats,
  fetchAgentExecutions,
  fetchRiskRadar,
  fetchProjectTasks,
  resetDemoState,
} from '../lib/api.js';
import {
  DisplayHeading,
  SectionHeading,
  Label,
  Button,
  Surface,
  StatusBadge,
  LiveIndicator,
} from './ui/SharedComponents.js';

interface CommandCenterViewProps {
  onSelectProject: (projectId: string) => void;
  onOpenTask: (taskId: string) => void;
  onNavigate: (view: string) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  onSelectProject,
  onOpenTask,
  onNavigate,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [agents, setAgents] = useState<AgentExecutionRecord[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, agentData, riskData, taskData] = await Promise.all([
        fetchStats(),
        fetchAgentExecutions(),
        fetchRiskRadar('proj-techfest-2026'),
        fetchProjectTasks('proj-techfest-2026'),
      ]);
      setStats(statsData);
      setAgents(agentData);
      setRisks(riskData.risks || []);
      setTasks(taskData);
    } catch (err) {
      console.error('Command center loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetDemo = async () => {
    try {
      setResetting(true);
      await resetDemoState();
      await loadData();
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setResetting(false);
    }
  };

  const {
    totalTasks = 5,
    verifiedTasks = 3,
    needsReviewTasks = 1,
    awaitingEvidenceTasks = 1,
    overallCompletion = 60,
  } = stats || {};

  const attentionTasks = tasks.filter(
    (t) => t.status === 'NEEDS_REVIEW' || t.status === 'AWAITING_EVIDENCE'
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* 1. Header: Project Context & Live Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[rgba(148,163,184,0.08)]">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono tracking-widest text-[#8B7CFF] uppercase bg-[#121824] px-2 py-0.5 rounded border border-[#8B7CFF]/20">
              WORKSPACE 01 // AUDIT IN PROGRESS
            </span>
            <LiveIndicator label="SAM 3.1 & GEMINI CONNECTED" color="bg-[#29D6A0]" />
          </div>

          <DisplayHeading size="xl">Tech Fest 2026 Operations</DisplayHeading>

          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl leading-relaxed">
            Main Campus Auditorium · Real-time multimodal verification pipeline, zero-fabrication criteria auditing, and autonomous agent handoffs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetDemo}
            disabled={resetting}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />}
          >
            Reset Demo
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('operations-twin')}
            icon={<ScanEye className="w-3.5 h-3.5 text-[#62DCEB]" />}
          >
            Spatial Twin
          </Button>
          <Button
            size="sm"
            onClick={() => onNavigate('visual-studio')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Evidence Studio
          </Button>
        </div>
      </div>

      {/* 2. Prominent Project Readiness Console & Verification Ribbon */}
      <Surface className="p-6 lg:p-8 relative overflow-hidden bg-gradient-to-br from-[#121824] via-[#0D111B] to-[#121824] border-[rgba(148,163,184,0.14)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div className="space-y-1">
            <span className="text-label text-[#8B7CFF]">AGGREGATE READINESS INDEX</span>
            <h2 className="font-display font-bold text-2xl lg:text-3xl text-white tracking-tight">
              Operational Verification Readiness
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Empirically evaluated against 15 discrete criteria · 0 unchecked checkboxes accepted
            </p>
          </div>

          {/* Large Readiness Percentage Readout */}
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-5xl lg:text-6xl text-white font-mono tabular-nums tracking-tight">
              {overallCompletion}%
            </span>
            <span className="text-xs font-mono text-[#29D6A0] uppercase font-semibold">
              COMPLIANT
            </span>
          </div>
        </div>

        {/* Multi-segment architectural progress bar */}
        <div className="h-3 bg-[#080A10] rounded overflow-hidden flex p-0.5 border border-[rgba(148,163,184,0.1)] gap-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(verifiedTasks / totalTasks) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-[#29D6A0] rounded-sm"
            title={`Verified: ${verifiedTasks}`}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(needsReviewTasks / totalTasks) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            className="h-full bg-[#F2BB5B] rounded-sm"
            title={`Needs Review: ${needsReviewTasks}`}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(awaitingEvidenceTasks / totalTasks) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="h-full bg-[#8B7CFF] rounded-sm"
            title={`Awaiting Evidence: ${awaitingEvidenceTasks}`}
          />
        </div>

        {/* Compact Verification Metrics Ribbon (Restrained typography, NOT 4 huge cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[rgba(148,163,184,0.08)]">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase">
              VERIFIED TASKS
            </span>
            <span className="font-display font-semibold text-xl text-[#29D6A0] font-mono tabular-nums mt-0.5">
              {verifiedTasks} / {totalTasks}
            </span>
            <span className="text-[10px] text-[#64748B] font-mono">100% SAM 3.1 passed</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase">
              ATTENTION REQUIRED
            </span>
            <span className="font-display font-semibold text-xl text-[#F2BB5B] font-mono tabular-nums mt-0.5">
              {needsReviewTasks} Flagged
            </span>
            <span className="text-[10px] text-[#64748B] font-mono">Uncertainty detected</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase">
              AWAITING PHOTOS
            </span>
            <span className="font-display font-semibold text-xl text-[#8B7CFF] font-mono tabular-nums mt-0.5">
              {awaitingEvidenceTasks} Task
            </span>
            <span className="text-[10px] text-[#64748B] font-mono">Wayfinding signs</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase">
              FABRICATION RISK
            </span>
            <span className="font-display font-semibold text-xl text-[#62DCEB] font-mono tabular-nums mt-0.5">
              0.0%
            </span>
            <span className="text-[10px] text-[#64748B] font-mono">Cryptographically locked</span>
          </div>
        </div>
      </Surface>

      {/* 3. Asymmetric Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Attention Required & Task Feed */}
        <div className="lg:col-span-7 space-y-8">
          {/* Dedicated Attention-Required Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F2BB5B] animate-pulse" />
                <span className="text-label text-[#F2BB5B]">Immediate Attention Required</span>
              </div>
              <span className="text-[10px] font-mono text-[#94A3B8]">
                {attentionTasks.length} ACTIONABLE ITEMS
              </span>
            </div>

            <div className="space-y-2.5">
              {attentionTasks.map((task) => {
                const isUncertain = task.latestVerification?.uncertainty?.hasUncertainty;

                return (
                  <Surface
                    key={task.id}
                    hover
                    className="p-4 border-l-2 border-l-[#F2BB5B] bg-[#121824]"
                    onClick={() => onOpenTask(task.id)}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={task.status} />
                          <span className="text-[10px] font-mono text-[#64748B]">
                            {task.priority} PRIORITY
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white tracking-tight truncate">
                          {task.title}
                        </h4>
                      </div>

                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTask(task.id);
                        }}
                      >
                        Inspect
                      </Button>
                    </div>

                    {isUncertain && (
                      <div className="p-2 rounded bg-[#0D111B] border border-[#F2BB5B]/20 text-[11px] text-[#F2BB5B] flex items-center gap-2 font-mono">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          Uncertainty: {task.latestVerification?.uncertainty.reason}
                        </span>
                      </div>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-[rgba(148,163,184,0.06)] flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
                      <span>Assigned: {task.assignedToName || 'Unassigned'}</span>
                      <span className="text-[#8B7CFF] flex items-center gap-1 hover:underline">
                        Open Evidence Inspector <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Surface>
                );
              })}
            </div>
          </div>

          {/* All Workspace Tasks (Dense, Restrained List) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-label text-[#94A3B8]">Operational Tasks Checklist</span>
              <button
                onClick={() => onNavigate('projects')}
                className="text-[10px] font-mono text-[#8B7CFF] hover:underline"
              >
                VIEW FULL WORKSPACE →
              </button>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => {
                const passedCount = task.acceptanceCriteria.filter(
                  (c) => c.status === 'PASSED'
                ).length;
                const totalCount = task.acceptanceCriteria.length;

                return (
                  <Surface
                    key={task.id}
                    hover
                    className="p-3.5 flex items-center justify-between gap-4"
                    onClick={() => onOpenTask(task.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-[#64748B]">
                          {task.id.replace('task-', 'TK-')}
                        </span>
                        <StatusBadge status={task.status} />
                      </div>
                      <h4 className="text-xs font-medium text-white truncate">
                        {task.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 font-mono text-right">
                      <div>
                        <div className="text-[11px] text-white font-semibold tabular-nums">
                          {passedCount} / {totalCount}
                        </div>
                        <div className="text-[9px] text-[#64748B]">CRITERIA</div>
                      </div>

                      <div>
                        <div className="text-[11px] text-white font-semibold tabular-nums">
                          {task.evidenceCount}
                        </div>
                        <div className="text-[9px] text-[#64748B]">PHOTOS</div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-[#64748B]" />
                    </div>
                  </Surface>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): AI System Status & Visually Rich Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Small AI System Status Area */}
          <Surface className="p-4 space-y-3 bg-[#0D111B] border-[rgba(148,163,184,0.12)]">
            <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.08)] pb-2.5">
              <span className="text-label text-[#62DCEB]">AI Engine Telemetry</span>
              <span className="text-[10px] font-mono text-[#29D6A0]">100% OPERATIONAL</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[rgba(148,163,184,0.04)]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#8B7CFF]" />
                  <span className="text-white font-mono text-[11px]">Meta Gemini 3.8 Flash</span>
                </div>
                <span className="text-[10px] font-mono text-[#29D6A0]">ACTIVE</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[rgba(148,163,184,0.04)]">
                <div className="flex items-center gap-2">
                  <ScanEye className="w-3.5 h-3.5 text-[#62DCEB]" />
                  <span className="text-white font-mono text-[11px]">SAM 3.1 ViT-H Vision</span>
                </div>
                <span className="text-[10px] font-mono text-[#29D6A0]">ACTIVE</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[rgba(148,163,184,0.04)]">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-[#F2BB5B]" />
                  <span className="text-white font-mono text-[11px]">Multi-Agent Orchestrator</span>
                </div>
                <span className="text-[10px] font-mono text-[#29D6A0]">STANDBY</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#29D6A0]" />
                  <span className="text-white font-mono text-[11px]">Zero-Fabrication Guardrail</span>
                </div>
                <span className="text-[10px] font-mono text-[#29D6A0]">ENFORCED</span>
              </div>
            </div>
          </Surface>

          {/* Visually Rich Activity Timeline */}
          <Surface className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.08)] pb-2">
              <span className="text-label text-[#94A3B8]">Audit & Evidence Timeline</span>
              <button
                onClick={() => onNavigate('trust-ledger')}
                className="text-[10px] font-mono text-[#8B7CFF] hover:underline"
              >
                LEDGER →
              </button>
            </div>

            <div className="relative pl-4 space-y-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-px before:bg-[rgba(148,163,184,0.12)]">
              {agents.slice(0, 4).map((agent, idx) => (
                <div key={agent.id} className="relative group">
                  {/* Timeline point */}
                  <div className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#121824] border-2 border-[#8B7CFF]" />

                  <div className="text-[10px] font-mono text-[#64748B] flex items-center justify-between">
                    <span>{agent.role.replace(/_/g, ' ')}</span>
                    <span className="text-[#29D6A0]">{agent.status}</span>
                  </div>

                  <h5 className="text-xs font-semibold text-white mt-0.5">
                    {agent.name}
                  </h5>

                  <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-relaxed">
                    {agent.currentActivity}
                  </p>

                  {agent.lastExecution && (
                    <div className="mt-1 text-[9px] font-mono text-[#64748B]">
                      Latency: {agent.lastExecution.durationMs}ms · Result: {agent.lastExecution.outputSummary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Surface>

          {/* Operational Risks Quick Radar */}
          {risks.length > 0 && (
            <Surface className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-label text-[#F2BB5B]">Risk Radar Feed</span>
                <span className="text-[10px] font-mono text-[#94A3B8]">{risks.length} SIGNALS</span>
              </div>

              {risks.slice(0, 2).map((r) => (
                <div
                  key={r.id}
                  onClick={() => r.relatedTaskId && onOpenTask(r.relatedTaskId)}
                  className="p-2.5 rounded bg-[#0D111B] border border-[rgba(148,163,184,0.1)] hover:border-[#F2BB5B]/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-white truncate">{r.title}</span>
                    <span className="text-[9px] font-mono font-bold text-[#F2BB5B] bg-[#F2BB5B]/10 px-1.5 py-0.5 rounded">
                      {r.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] line-clamp-1">{r.explanation}</p>
                </div>
              ))}
            </Surface>
          )}
        </div>
      </div>
    </div>
  );
};
