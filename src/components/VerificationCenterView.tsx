import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ScanEye,
  Camera,
  Layers,
  ArrowRight,
  ShieldAlert,
  Search,
} from 'lucide-react';
import type { Task, Project } from '../types/index.js';
import { fetchProjects, fetchProjectTasks } from '../lib/api.js';

interface VerificationCenterViewProps {
  onOpenTaskModal: (task: Task) => void;
}

export const VerificationCenterView: React.FC<VerificationCenterViewProps> = ({
  onOpenTaskModal,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadAll = async () => {
    try {
      setLoading(true);
      const projList = await fetchProjects();
      setProjects(projList);

      const allTasksNested = await Promise.all(
        projList.map((p) => fetchProjectTasks(p.id))
      );
      setTasks(allTasksNested.flat());
    } catch (err) {
      console.error('Error loading verification center tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredTasks = tasks.filter((t) => {
    const matchesProject = selectedProjectId === 'all' || t.projectId === selectedProjectId;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesProject && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#7C8CFF] mb-1">
            <span>Multimodal Audit Bureau</span>
            <span>·</span>
            <span>SAM 3.1 & Zero-Fabrication Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Verification Center
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Cross-project verification audit queue, uncertainty flags, and human sign-off status.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#111827] border border-neutral-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-neutral-400">Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#7C8CFF]"
          >
            <option value="all">All Active Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {(['all', 'VERIFIED', 'NEEDS_REVIEW', 'AWAITING_EVIDENCE', 'INCOMPLETE'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-[#182235] text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {status === 'all'
                  ? 'All Statuses'
                  : status === 'VERIFIED'
                  ? 'Verified'
                  : status === 'NEEDS_REVIEW'
                  ? 'Needs Review'
                  : status === 'AWAITING_EVIDENCE'
                  ? 'Awaiting Evidence'
                  : 'Incomplete'}
              </button>
            )
          )}
        </div>
      </div>

      {/* Verification Queue List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-400">
          Loading verification audit queue...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#111827] border border-neutral-800 text-xs text-neutral-400">
          No tasks match the selected verification criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const ver = task.latestVerification;
            const isUncertain = ver?.uncertainty?.hasUncertainty;

            return (
              <div
                key={task.id}
                onClick={() => onOpenTaskModal(task)}
                className="p-5 rounded-xl bg-[#111827] border border-neutral-800 hover:border-[#7C8CFF]/50 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                        task.status === 'VERIFIED'
                          ? 'text-[#22C58B] bg-[#22C58B]/10 border border-[#22C58B]/20'
                          : task.status === 'NEEDS_REVIEW'
                          ? 'text-[#F5B942] bg-[#F5B942]/10 border border-[#F5B942]/20'
                          : task.status === 'AWAITING_EVIDENCE'
                          ? 'text-[#7C8CFF] bg-[#7C8CFF]/10 border border-[#7C8CFF]/20'
                          : 'text-[#F16C75] bg-[#F16C75]/10 border border-[#F16C75]/20'
                      }`}
                    >
                      {task.status}
                    </span>

                    {ver?.humanDecision === 'APPROVED' && (
                      <span className="text-[11px] font-mono text-[#22C58B] bg-[#22C58B]/5 px-1.5 py-0.5 rounded border border-[#22C58B]/20">
                        Human Signed
                      </span>
                    )}

                    <span className="text-xs text-neutral-400 font-mono">
                      {task.evidenceCount} Photo(s)
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-[#7C8CFF] transition-colors truncate">
                    {task.title}
                  </h3>

                  {ver?.aiExplanation && (
                    <p className="text-xs text-neutral-400 line-clamp-1">
                      {ver.aiExplanation}
                    </p>
                  )}

                  {isUncertain && (
                    <div className="text-[11px] text-[#F5B942] flex items-center gap-1 font-mono">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{ver.uncertainty?.reason}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right text-xs">
                    <div className="text-neutral-300 font-medium">
                      {task.acceptanceCriteria.filter((c) => c.status === 'PASSED').length} of{' '}
                      {task.acceptanceCriteria.length} Criteria Passed
                    </div>
                    <div className="text-neutral-400 text-[11px] font-mono mt-0.5">
                      Assignee: {task.assignedToName || 'Unassigned'}
                    </div>
                  </div>

                  <button className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 group-hover:text-white group-hover:border-[#7C8CFF] transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
