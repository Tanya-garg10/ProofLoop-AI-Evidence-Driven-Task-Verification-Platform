import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileQuestion,
  Layers,
  ArrowRight,
  Plus,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { Project, AuditLog } from '../types/index.js';
import { fetchStats, resetDemoState } from '../lib/api.js';

interface DashboardViewProps {
  onSelectProject: (projectId: string) => void;
  onOpenPlanner: () => void;
  onCreateProjectModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectProject,
  onOpenPlanner,
  onCreateProjectModal,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
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

  if (loading && !stats) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#7C8CFF]" />
          <p className="text-sm text-neutral-400">Loading operations telemetry...</p>
        </div>
      </div>
    );
  }

  const {
    totalProjects = 0,
    totalTasks = 0,
    verifiedTasks = 0,
    needsReviewTasks = 0,
    awaitingEvidenceTasks = 0,
    overallCompletion = 0,
    projects = [],
    recentAudit = [],
  } = stats || {};

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Verification Operations
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Real-time status of physical task execution and multimodal evidence corroboration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-all"
            title="Reset to College Tech Fest baseline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo State</span>
          </button>

          <button
            onClick={onOpenPlanner}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#7C8CFF] hover:bg-[#6A7BFF] rounded-lg transition-all shadow-md shadow-[#7C8CFF]/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Task Planner</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (6 metrics, strict tabular-nums, single elevation) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Projects */}
        <div className="p-4 rounded-xl bg-[#111827] border border-neutral-800/90 flex flex-col justify-between">
          <span className="text-xs text-neutral-400 font-medium">Active Projects</span>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-white">
            {totalProjects}
          </div>
        </div>

        {/* Total Tasks */}
        <div className="p-4 rounded-xl bg-[#111827] border border-neutral-800/90 flex flex-col justify-between">
          <span className="text-xs text-neutral-400 font-medium">Monitored Tasks</span>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-white">
            {totalTasks}
          </div>
        </div>

        {/* Verified Tasks */}
        <div className="p-4 rounded-xl bg-[#111827] border border-neutral-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Verified</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22C58B]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#22C58B]">
            {verifiedTasks}
          </div>
        </div>

        {/* Needs Review */}
        <div className="p-4 rounded-xl bg-[#111827] border border-neutral-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Needs Review</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#F5B942]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-[#F5B942]">
            {needsReviewTasks}
          </div>
        </div>

        {/* Awaiting Evidence */}
        <div className="p-4 rounded-xl bg-[#111827] border border-neutral-800/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Awaiting Photos</span>
            <FileQuestion className="w-3.5 h-3.5 text-[#7C8CFF]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-300">
            {awaitingEvidenceTasks}
          </div>
        </div>

        {/* Completion % */}
        <div className="p-4 rounded-xl bg-[#111827] border border-neutral-800/90 flex flex-col justify-between">
          <span className="text-xs text-neutral-400 font-medium">Verification Rate</span>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-white">
            {overallCompletion}%
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Active Projects */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Active Projects</h2>
            <button
              onClick={onCreateProjectModal}
              className="inline-flex items-center gap-1.5 text-xs text-[#7C8CFF] hover:text-[#94A3B8] font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
          </div>

          <div className="space-y-3">
            {projects.map((proj: Project) => {
              const comp = proj.stats?.completionPercentage ?? 0;
              return (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  className="p-5 rounded-xl bg-[#111827] border border-neutral-800/80 hover:border-[#7C8CFF]/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-white group-hover:text-[#7C8CFF] transition-colors">
                        {proj.name}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                        {proj.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-[#7C8CFF] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                      <span className="font-mono text-[11px]">
                        {proj.stats?.verifiedTasks || 0} of {proj.stats?.totalTasks || 0} verified
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-white">
                        {comp}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#7C8CFF] to-[#22C58B] rounded-full transition-all duration-500"
                        style={{ width: `${comp}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom Metadata row */}
                  <div className="mt-3.5 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span>Owner: {proj.ownerName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{proj.stats?.needsReviewTasks || 0} Need Review</span>
                    </div>
                    <span className="font-mono text-[11px]">
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recent Verification Activity */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Audit Activity</h2>
            <span className="text-xs text-neutral-400">Latest actions</span>
          </div>

          <div className="rounded-xl bg-[#111827] border border-neutral-800/80 divide-y divide-neutral-800/60">
            {recentAudit.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500">
                No audit activity recorded yet.
              </div>
            ) : (
              recentAudit.map((log: AuditLog) => (
                <div key={log.id} className="p-4 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#7C8CFF] mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-white truncate">
                        {log.actorName}
                      </p>
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
