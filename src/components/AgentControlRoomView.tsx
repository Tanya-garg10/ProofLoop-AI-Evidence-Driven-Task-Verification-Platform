import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ScanEye,
  ShieldCheck,
  GitBranch,
  Layers,
  ArrowRight,
  Filter,
  Lock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import type { AgentExecutionRecord, Task } from '../types/index.js';
import { fetchAgentExecutions, triggerAgentOrchestration, fetchProjectTasks } from '../lib/api.js';
import {
  DisplayHeading,
  SectionHeading,
  Label,
  Button,
  Surface,
  StatusBadge,
  LiveIndicator,
} from './ui/SharedComponents.js';

interface AgentControlRoomViewProps {
  onOpenTask: (taskId: string) => void;
}

export const AgentControlRoomView: React.FC<AgentControlRoomViewProps> = ({
  onOpenTask,
}) => {
  const [executions, setExecutions] = useState<AgentExecutionRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('task-projector');
  const [running, setRunning] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [execList, taskList] = await Promise.all([
        fetchAgentExecutions(),
        fetchProjectTasks('proj-techfest-2026'),
      ]);
      setExecutions(execList);
      setTasks(taskList);
    } catch (err) {
      console.error('Failed to load agent control room data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunPipeline = async () => {
    try {
      setRunning(true);
      await triggerAgentOrchestration(selectedTaskId);
      await loadData();
    } catch (err) {
      console.error('Pipeline run error:', err);
    } finally {
      setRunning(false);
    }
  };

  const filteredExecutions = executions.filter(
    (e) => roleFilter === 'ALL' || e.role === roleFilter
  );

  const stages = [
    {
      id: 'PLANNING_AGENT',
      name: 'Planning Stage',
      model: 'gemini-3.8-flash',
      icon: Sparkles,
      color: '#8B7CFF',
      role: 'Directive Decomposition & Criteria Mapping',
    },
    {
      id: 'VISUAL_INTELLIGENCE_AGENT',
      name: 'Visual Analysis',
      model: 'Meta SAM 3.1 ViT-H',
      icon: ScanEye,
      color: '#62DCEB',
      role: 'Spatial Object Segmentation & Coordinate Bounding',
    },
    {
      id: 'COMPLIANCE_AGENT',
      name: 'Compliance Audit',
      model: 'Rule Engine v2.6',
      icon: ShieldCheck,
      color: '#F2BB5B',
      role: 'Zero-Fabrication & Non-Visual Gap Discovery',
    },
    {
      id: 'VERIFICATION_AGENT',
      name: 'Verification & Ledger',
      model: 'Synthesis Protocol v3.1',
      icon: CheckCircle2,
      color: '#29D6A0',
      role: 'Verdict Synthesis & Cryptographic Ledger Commit',
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* 1. Header & Live Pipeline Runner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[rgba(148,163,184,0.08)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-[#8B7CFF] uppercase bg-[#121824] px-2 py-0.5 rounded border border-[#8B7CFF]/20">
              AUTONOMOUS ORCHESTRATION // 4-STAGE PIPELINE
            </span>
            <LiveIndicator label="ZERO-FABRICATION GUARDRAIL ACTIVE" color="bg-[#29D6A0]" />
          </div>
          <DisplayHeading size="lg">Agent Control Room</DisplayHeading>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Real-time execution status, input/output feeds, and handoff telemetry across specialized agents.
          </p>
        </div>

        {/* Task Trigger Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-[#121824] border border-[rgba(148,163,184,0.12)] rounded px-2.5 py-1.5">
            <span className="text-[10px] font-mono text-[#64748B]">TARGET:</span>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer max-w-[220px]"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#121824] text-white">
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="md"
            onClick={handleRunPipeline}
            disabled={running}
            icon={<Play className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />}
          >
            {running ? 'Executing Multi-Agent Pipeline...' : 'Run Pipeline'}
          </Button>
        </div>
      </div>

      {/* 2. Connected Multi-Stage Execution Pipeline */}
      <Surface className="p-6 bg-[#0D111B] border-[rgba(148,163,184,0.12)] space-y-4">
        <div className="flex items-center justify-between text-xs border-b border-[rgba(148,163,184,0.08)] pb-3">
          <span className="text-label text-[#8B7CFF]">Connected Agent Pipeline Architecture</span>
          <span className="text-[10px] font-mono text-[#29D6A0]">ALL 4 ENGINES ONLINE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const matchingExec = executions.find((e) => e.role === stage.id);
            const status = matchingExec?.status || 'COMPLETED';

            return (
              <div
                key={stage.id}
                className="relative p-4 rounded-lg bg-[#121824] border border-[rgba(148,163,184,0.08)] space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-[#64748B]">
                      STAGE 0{idx + 1}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 shrink-0" style={{ color: stage.color }} />
                    <h4 className="font-display font-semibold text-sm text-white">
                      {stage.name}
                    </h4>
                  </div>

                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                    {stage.role}
                  </p>
                </div>

                <div className="pt-3 border-t border-[rgba(148,163,184,0.06)] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#64748B] truncate max-w-[130px]">{stage.model}</span>
                  <StatusBadge status={status} />
                </div>
              </div>
            );
          })}
        </div>
      </Surface>

      {/* 3. Role Filter Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-[#0D111B] border border-[rgba(148,163,184,0.12)] rounded text-xs font-mono overflow-x-auto">
          {[
            { key: 'ALL', label: 'All Agent Executions' },
            { key: 'PLANNING_AGENT', label: 'Planning Agent' },
            { key: 'VISUAL_INTELLIGENCE_AGENT', label: 'Visual Intelligence (SAM 3.1)' },
            { key: 'COMPLIANCE_AGENT', label: 'Compliance Agent' },
            { key: 'VERIFICATION_AGENT', label: 'Verification Agent' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`px-3 py-1 rounded whitespace-nowrap transition-all ${
                roleFilter === tab.key
                  ? 'bg-[#192232] text-white font-semibold shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Button variant="ghost" size="xs" onClick={loadData} icon={<RefreshCw className="w-3 h-3" />}>
          Refresh
        </Button>
      </div>

      {/* 4. Execution Telemetry Feed (Input, Output, Errors, History) */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-[#94A3B8]">
            Loading execution telemetry...
          </div>
        ) : filteredExecutions.length === 0 ? (
          <Surface className="p-12 text-center text-xs font-mono text-[#94A3B8]">
            No executions found for selected filter.
          </Surface>
        ) : (
          filteredExecutions.map((exec) => {
            const hasError = exec.status === 'NEEDS_ATTENTION' || exec.status === 'ERROR';

            return (
              <Surface
                key={exec.id}
                className="p-5 space-y-3 bg-[#121824] border-[rgba(148,163,184,0.1)]"
              >
                {/* Agent Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(148,163,184,0.06)] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#192232] border border-[rgba(148,163,184,0.15)] flex items-center justify-center shrink-0 text-[#8B7CFF]">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-semibold text-sm text-white">
                          {exec.name}
                        </h4>
                        <span className="text-[10px] font-mono text-[#64748B]">
                          {exec.modelIdentifier}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#62DCEB]">
                        Operation: {exec.currentActivity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                    {exec.processingDurationMs && (
                      <span className="text-[#94A3B8]">
                        Latency: {exec.processingDurationMs}ms
                      </span>
                    )}
                    <StatusBadge status={exec.status} />
                  </div>
                </div>

                {/* Input Stream & Output Data Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded bg-[#0D111B] border border-[rgba(148,163,184,0.08)] space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#94A3B8] font-semibold block">
                      Input Telemetry Stream
                    </span>
                    <p className="text-neutral-300 font-mono text-[11px] leading-relaxed">
                      {exec.inputSummary}
                    </p>
                  </div>

                  <div className="p-3 rounded bg-[#0D111B] border border-[rgba(148,163,184,0.08)] space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#62DCEB] font-semibold block">
                      Synthesized Output & Findings
                    </span>
                    <p className="text-neutral-300 font-mono text-[11px] leading-relaxed">
                      {exec.outputSummary}
                    </p>
                  </div>
                </div>

                {/* Error/Uncertainty Callout if present */}
                {hasError && (
                  <div className="p-2.5 rounded bg-[#F2BB5B]/10 border border-[#F2BB5B]/30 text-xs text-[#F2BB5B] flex items-center gap-2 font-mono">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      Zero-Fabrication Guardrail: Ambiguity or unverified dependency flagged for human review.
                    </span>
                  </div>
                )}

                {/* Target Task Link */}
                {exec.targetTaskId && (
                  <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#64748B] border-t border-[rgba(148,163,184,0.06)]">
                    <span>Target Task: {exec.targetTaskTitle || exec.targetTaskId}</span>
                    <button
                      onClick={() => onOpenTask(exec.targetTaskId!)}
                      className="inline-flex items-center gap-1 text-[#8B7CFF] hover:underline"
                    >
                      <span>Inspect Target Task</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </Surface>
            );
          })
        )}
      </div>
    </div>
  );
};
