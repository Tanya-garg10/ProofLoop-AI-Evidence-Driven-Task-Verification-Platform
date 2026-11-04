import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import type { Task } from '../types/index.js';
import { fetchProjectTasks, submitHumanReview } from '../lib/api.js';

interface ReviewQueueViewProps {
  onOpenTaskModal: (task: Task) => void;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  onOpenTaskModal,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const list = await fetchProjectTasks('proj-techfest-2026');
      setTasks(list);
    } catch (err) {
      console.error('Failed to load review queue tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const pendingReviewTasks = tasks.filter(
    (t) => t.status === 'NEEDS_REVIEW' || t.status === 'AWAITING_EVIDENCE'
  );

  const handleQuickApprove = async (task: Task) => {
    if (!task.latestVerification) return;
    try {
      setSubmittingId(task.id);
      await submitHumanReview(
        task.latestVerification.id,
        'APPROVED',
        'Approved by Safety Reviewer via Quick Triage Queue.'
      );
      await loadTasks();
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8B7CFF] mb-1">
            <span>Human-in-the-Loop Oversight</span>
            <span>·</span>
            <span className="text-[#F6BC58]">Triage & Sign-off Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Review Queue
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Tasks flagged by autonomous agents as uncertain, safety-critical, or awaiting final human determination.
          </p>
        </div>

        <button
          onClick={loadTasks}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 bg-[#0D1321] border border-neutral-800 rounded-lg hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Task Queue Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400">Loading review queue...</div>
        ) : pendingReviewTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0D1321] border border-neutral-800 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#28D6A0] mx-auto" />
            <h3 className="text-sm font-bold text-white">Review Queue Clear</h3>
            <p className="text-xs text-neutral-400">All flagged items have received human sign-off.</p>
          </div>
        ) : (
          pendingReviewTasks.map((task) => {
            const ver = task.latestVerification;
            const isUncertain = ver?.uncertainty?.hasUncertainty;

            return (
              <div
                key={task.id}
                className="p-5 rounded-2xl bg-[#0D1321] border border-neutral-800 hover:border-neutral-700 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white">{task.title}</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">{task.description}</p>
                  </div>

                  <span
                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded self-start sm:self-auto ${
                      task.status === 'NEEDS_REVIEW'
                        ? 'text-[#F6BC58] bg-[#F6BC58]/10 border border-[#F6BC58]/20'
                        : 'text-[#8B7CFF] bg-[#8B7CFF]/10 border border-[#8B7CFF]/20'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>

                {isUncertain && (
                  <div className="p-3 rounded-xl bg-[#F6BC58]/10 border border-[#F6BC58]/20 text-xs text-[#F6BC58] space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Zero-Fabrication Flag: Unverified Non-Visual Signal</span>
                    </span>
                    <p className="text-neutral-300 text-[11px] leading-relaxed">
                      {ver?.uncertainty.reason}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-neutral-400 font-mono text-[11px]">
                    {task.acceptanceCriteria.length} Acceptance Criteria · {task.evidenceCount} Photos
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenTaskModal(task)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#141C2D] border border-neutral-800 text-neutral-300 hover:text-white font-medium"
                    >
                      Inspect Evidence & Criteria
                    </button>

                    {ver && (
                      <button
                        onClick={() => handleQuickApprove(task)}
                        disabled={submittingId === task.id}
                        className="px-3.5 py-1.5 rounded-lg bg-[#28D6A0] hover:bg-[#23bd8d] text-black font-bold transition-all shadow-md shadow-[#28D6A0]/20"
                      >
                        {submittingId === task.id ? 'Signing...' : 'Sign Off & Approve'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
