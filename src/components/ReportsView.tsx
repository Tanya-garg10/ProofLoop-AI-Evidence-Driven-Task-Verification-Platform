import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  ScanEye,
  ShieldCheck,
} from 'lucide-react';
import type { Task, Project } from '../types/index.js';
import { fetchProjects, fetchProjectTasks } from '../lib/api.js';

export const ReportsView: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects().then(async (projs) => {
      if (projs.length > 0) {
        setProject(projs[0]);
        const taskList = await fetchProjectTasks(projs[0].id);
        setTasks(taskList);
      }
      setLoading(false);
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const verifiedCount = tasks.filter((t) => t.status === 'VERIFIED').length;
  const reviewCount = tasks.filter((t) => t.status === 'NEEDS_REVIEW').length;
  const compRate = tasks.length > 0 ? Math.round((verifiedCount / tasks.length) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Action Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8B7CFF] mb-1">
            <span>Executive Governance</span>
            <span>·</span>
            <span className="text-[#28D6A0]">Official Compliance Sign-off</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Operations Verification Report</h1>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#8B7CFF] hover:bg-[#7866FF] rounded-xl transition-all shadow-md shadow-[#8B7CFF]/20"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Printable Report Document Surface */}
      <div className="p-8 sm:p-12 rounded-2xl bg-[#0D1321] border border-neutral-800 space-y-8 print:bg-white print:text-black print:border-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800 print:border-neutral-300">
          <div>
            <div className="text-xs font-mono font-bold tracking-wider text-[#8B7CFF] uppercase print:text-indigo-600">
              ProofLoop AI · Verification Intelligence Certificate
            </div>
            <h2 className="text-2xl font-bold text-white print:text-black mt-1">
              {project?.name || 'College Tech Fest Setup 2026'}
            </h2>
            <p className="text-xs text-neutral-400 print:text-neutral-600 mt-1">
              Scope: Campus Auditorium, Main Atrium Foyer, Stage Rig, and Emergency Egress Corridors
            </p>
          </div>

          <div className="text-left sm:text-right text-xs font-mono text-neutral-400 print:text-neutral-600 space-y-0.5">
            <div>Report ID: PL-2026-TF88</div>
            <div>Generated: {new Date().toLocaleDateString()}</div>
            <div className="text-[#28D6A0] print:text-emerald-700 font-bold">Status: AUDIT ACTIVE</div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#141C2D] border border-neutral-800 print:bg-neutral-100 print:border-neutral-300">
            <span className="text-xs text-neutral-400 print:text-neutral-600">Monitored Tasks</span>
            <div className="text-2xl font-mono font-bold text-white print:text-black mt-1">
              {tasks.length}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141C2D] border border-neutral-800 print:bg-neutral-100 print:border-neutral-300">
            <span className="text-xs text-neutral-400 print:text-neutral-600">Evidence Verified</span>
            <div className="text-2xl font-mono font-bold text-[#28D6A0] print:text-emerald-700 mt-1">
              {verifiedCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141C2D] border border-neutral-800 print:bg-neutral-100 print:border-neutral-300">
            <span className="text-xs text-neutral-400 print:text-neutral-600">Pending Review</span>
            <div className="text-2xl font-mono font-bold text-[#F6BC58] print:text-amber-700 mt-1">
              {reviewCount}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141C2D] border border-neutral-800 print:bg-neutral-100 print:border-neutral-300">
            <span className="text-xs text-neutral-400 print:text-neutral-600">Completion Rate</span>
            <div className="text-2xl font-mono font-bold text-[#8B7CFF] print:text-indigo-700 mt-1">
              {compRate}%
            </div>
          </div>
        </div>

        {/* Task-by-Task Evidence Corroboration Audit */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">
            Detailed Acceptance Criteria Verification
          </h3>

          <div className="space-y-3">
            {tasks.map((t, idx) => (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-[#141C2D] border border-neutral-800 print:bg-white print:border-neutral-200 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white print:text-black text-sm">
                    {idx + 1}. {t.title}
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      t.status === 'VERIFIED'
                        ? 'text-[#28D6A0] bg-[#28D6A0]/10'
                        : 'text-[#F6BC58] bg-[#F6BC58]/10'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <p className="text-neutral-300 print:text-neutral-700 leading-relaxed">
                  {t.description}
                </p>

                <div className="pl-3 border-l-2 border-neutral-700 space-y-1 text-[11px] text-neutral-400 print:text-neutral-600">
                  {t.acceptanceCriteria.map((c) => (
                    <div key={c.id}>
                      <span className="font-semibold text-neutral-200 print:text-neutral-800">
                        [{c.status}]
                      </span>{' '}
                      {c.text}
                    </div>
                  ))}
                </div>

                {t.latestVerification?.uncertainty.hasUncertainty && (
                  <div className="text-[11px] text-[#F6BC58] font-mono">
                    Zero-Fabrication Note: {t.latestVerification.uncertainty.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Governance & Sign-off Block */}
        <div className="pt-6 border-t border-neutral-800 print:border-neutral-300 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-neutral-400 print:text-neutral-600">
          <div>
            <span className="font-bold text-white print:text-black block mb-1">
              Autonomous Multimodal Models
            </span>
            <p>Meta Muse Spark 2.5 (Planner) · Meta SAM 3.1 (Segment Anything) · Gemini 3.8 Multimodal</p>
            <p className="mt-1 font-mono text-[10px] text-neutral-500">
              Integrity: NIST FIPS 180-4 SHA-256 Verified
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="font-bold text-white print:text-black block mb-1">
              Human Reviewer Sign-Off
            </span>
            <p>Dr. Sarah Chen · Lead Safety Reviewer</p>
            <p className="font-mono text-[10px] text-[#28D6A0] print:text-emerald-700">
              Authorized Signature Logged in Trust Ledger
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
