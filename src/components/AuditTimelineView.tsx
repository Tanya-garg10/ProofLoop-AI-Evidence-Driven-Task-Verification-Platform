import React, { useState, useEffect } from 'react';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  Upload,
  User,
  Sparkles,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import type { AuditLog, Project } from '../types/index.js';
import { fetchProjects, fetchAuditLogs } from '../lib/api.js';

export const AuditTimelineView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects()
      .then((projs) => {
        setProjects(projs);
        if (projs.length > 0) {
          setSelectedProjectId(projs[0].id);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    fetchAuditLogs(selectedProjectId)
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedProjectId]);

  const getActionIcon = (action: AuditLog['action']) => {
    switch (action) {
      case 'PROJECT_CREATED':
      case 'TASK_CREATED_MANUALLY':
        return <FileText className="w-4 h-4 text-[#7C8CFF]" />;
      case 'TASK_GENERATED_BY_AI':
        return <Sparkles className="w-4 h-4 text-[#A78BFA]" />;
      case 'EVIDENCE_UPLOADED':
        return <Upload className="w-4 h-4 text-[#7C8CFF]" />;
      case 'AI_VERIFICATION_COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-[#22C58B]" />;
      case 'HUMAN_REVIEW_APPROVED':
        return <ShieldCheck className="w-4 h-4 text-[#22C58B]" />;
      case 'HUMAN_REVIEW_REJECTED':
      case 'HUMAN_REVIEW_REQUESTED_INFO':
        return <AlertTriangle className="w-4 h-4 text-[#F5B942]" />;
      default:
        return <History className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#7C8CFF] mb-1">
            <span>Immutable Trail</span>
            <span>·</span>
            <span>Cryptographic Event Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Audit Timeline
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Chronological records of task generation, evidence uploads, AI verification, and reviewer sign-offs.
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#7C8CFF]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-400">
          Loading audit events...
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#111827] border border-neutral-800 text-xs text-neutral-400">
          No audit entries found for this project.
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
          {logs.map((log) => (
            <div key={log.id} className="relative group">
              {/* Dot Icon Anchor */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-[#111827] border border-neutral-700 flex items-center justify-center shrink-0">
                {getActionIcon(log.action)}
              </div>

              {/* Event Card */}
              <div className="p-4 rounded-xl bg-[#111827] border border-neutral-800 hover:border-neutral-700 transition-all space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{log.actorName}</span>
                    <span className="text-neutral-500">·</span>
                    <span className="font-mono text-[11px] text-[#7C8CFF]">
                      {log.action}
                    </span>
                  </div>

                  <span className="font-mono text-[11px] text-neutral-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                {log.taskTitle && (
                  <div className="text-xs font-semibold text-neutral-300">
                    Task: {log.taskTitle}
                  </div>
                )}

                <p className="text-xs text-neutral-400 leading-relaxed">
                  {log.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
