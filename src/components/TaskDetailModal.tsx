import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ScanEye,
  Camera,
  Upload,
  RefreshCw,
  FileCheck2,
  Check,
  ShieldAlert,
  ChevronRight,
  Info,
  UserCheck,
} from 'lucide-react';
import type { Task, EvidenceItem, VerificationResult } from '../types/index.js';
import {
  fetchTaskEvidence,
  uploadEvidence,
  uploadPresetEvidence,
  triggerVerification,
  submitHumanReview,
} from '../lib/api.js';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onTaskUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'CRITERIA' | 'EVIDENCE' | 'REVIEW'>('CRITERIA');
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [showSamMasks, setShowSamMasks] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState(task.latestVerification?.reviewerNotes || '');
  const [uploading, setUploading] = useState(false);

  const loadEvidence = async () => {
    try {
      const items = await fetchTaskEvidence(task.id);
      setEvidenceList(items);
      if (items.length > 0 && !selectedEvidence) {
        setSelectedEvidence(items[0]);
      }
    } catch (err) {
      console.error('Failed to load evidence:', err);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, [task.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const newEv = await uploadEvidence(task.id, formData);
      setEvidenceList((prev) => [...prev, newEv]);
      setSelectedEvidence(newEv);
      onTaskUpdated();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleAttachDemoEvidence = async (presetUrl: string, name: string) => {
    try {
      setUploading(true);
      const newEv = await uploadPresetEvidence(task.id, presetUrl, name, 'Field Operations Hall');
      setEvidenceList((prev) => [...prev, newEv]);
      setSelectedEvidence(newEv);
      onTaskUpdated();
    } catch (err) {
      console.error('Preset attach failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRunVerification = async () => {
    try {
      setVerifying(true);
      await triggerVerification(task.id);
      onTaskUpdated();
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleHumanReview = async (
    decision: 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_EVIDENCE'
  ) => {
    if (!task.latestVerification) return;
    try {
      setSubmittingReview(true);
      await submitHumanReview(task.latestVerification.id, decision, reviewerNotes);
      onTaskUpdated();
    } catch (err) {
      console.error('Human review submission failed:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const ver = task.latestVerification;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0D1220] border border-neutral-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-800 flex items-start justify-between gap-4 bg-[#111827]">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
              <span>Task Inspection</span>
              <span>·</span>
              <span className="font-mono text-[11px]">Priority: {task.priority}</span>
              <span>·</span>
              <span className="font-mono text-[11px] text-[#7C8CFF]">
                {evidenceList.length} Evidence Photo(s)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {task.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-neutral-800 bg-[#0D1220]">
          <button
            onClick={() => setActiveTab('CRITERIA')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'CRITERIA'
                ? 'border-[#7C8CFF] text-[#7C8CFF]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Acceptance Criteria & AI Verification
          </button>
          <button
            onClick={() => setActiveTab('EVIDENCE')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'EVIDENCE'
                ? 'border-[#7C8CFF] text-[#7C8CFF]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Evidence Studio & SAM 3.1 ({evidenceList.length})
          </button>
          <button
            onClick={() => setActiveTab('REVIEW')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'REVIEW'
                ? 'border-[#7C8CFF] text-[#7C8CFF]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Human Review Sign-off
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Criteria & Verification */}
          {activeTab === 'CRITERIA' && (
            <div className="space-y-6">
              {/* Task Description */}
              <div className="p-4 rounded-xl bg-[#111827] border border-neutral-800">
                <span className="text-xs font-medium text-neutral-400">Operational Directive</span>
                <p className="text-sm text-neutral-200 mt-1 leading-relaxed">
                  {task.description}
                </p>
              </div>

              {/* AI Verification Status Card */}
              {ver ? (
                <div
                  className={`p-5 rounded-xl border ${
                    ver.aiStatus === 'VERIFIED'
                      ? 'bg-[#22C58B]/5 border-[#22C58B]/30'
                      : ver.aiStatus === 'NEEDS_REVIEW'
                      ? 'bg-[#F5B942]/5 border-[#F5B942]/30'
                      : 'bg-neutral-900 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <ScanEye
                        className={`w-4 h-4 ${
                          ver.aiStatus === 'VERIFIED'
                            ? 'text-[#22C58B]'
                            : ver.aiStatus === 'NEEDS_REVIEW'
                            ? 'text-[#F5B942]'
                            : 'text-[#7C8CFF]'
                        }`}
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        AI Verification Outcome: {ver.aiStatus}
                      </span>
                    </div>

                    <button
                      onClick={handleRunVerification}
                      disabled={verifying}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:text-white transition-all"
                    >
                      <RefreshCw className={`w-3 h-3 ${verifying ? 'animate-spin' : ''}`} />
                      <span>Re-analyze</span>
                    </button>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                    {ver.aiExplanation}
                  </p>

                  {/* Uncertainty / Zero-Fabrication Warning */}
                  {ver.uncertainty?.hasUncertainty && (
                    <div className="mt-3 p-3 rounded-lg bg-[#F5B942]/10 border border-[#F5B942]/20 text-xs text-[#F5B942] space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Zero-Fabrication Guardrail Activated</span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">
                        {ver.uncertainty.reason}
                      </p>
                      {ver.uncertainty.missingInformation && (
                        <div className="pt-1 text-[11px] text-neutral-400">
                          <span className="font-semibold text-neutral-300">Required next step:</span>{' '}
                          {ver.uncertainty.missingInformation.join('; ')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Model Meta */}
                  <div className="mt-3 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between text-[11px] text-neutral-400 gap-2">
                    <span>Planner: {ver.modelInformation?.plannerModel}</span>
                    <span>Vision: {ver.modelInformation?.visionModel}</span>
                    <span>Segmentation: {ver.modelInformation?.segmentationModel}</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center rounded-xl bg-[#111827] border border-neutral-800 space-y-3">
                  <p className="text-xs text-neutral-400">
                    No verification result generated yet. Upload evidence or run the evaluation.
                  </p>
                  <button
                    onClick={handleRunVerification}
                    disabled={verifying}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#7C8CFF] rounded-lg"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
                    <span>Run Multimodal Verification</span>
                  </button>
                </div>
              )}

              {/* Acceptance Criteria Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Acceptance Criteria Inspection
                </h4>

                <div className="space-y-2.5">
                  {task.acceptanceCriteria.map((crit, idx) => {
                    const isPassed = crit.status === 'PASSED';
                    const isUncertain = crit.status === 'UNCERTAIN';

                    return (
                      <div
                        key={crit.id}
                        className="p-4 rounded-xl bg-[#111827] border border-neutral-800 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                isPassed
                                  ? 'bg-[#22C58B]/10 text-[#22C58B]'
                                  : isUncertain
                                  ? 'bg-[#F5B942]/10 text-[#F5B942]'
                                  : 'bg-neutral-800 text-neutral-500'
                              }`}
                            >
                              {isPassed ? (
                                <Check className="w-3 h-3 stroke-[2.5]" />
                              ) : isUncertain ? (
                                <AlertTriangle className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-white">
                                {idx + 1}. {crit.text}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded shrink-0 ${
                              isPassed
                                ? 'text-[#22C58B] bg-[#22C58B]/10 border border-[#22C58B]/20'
                                : isUncertain
                                ? 'text-[#F5B942] bg-[#F5B942]/10 border border-[#F5B942]/20'
                                : 'text-neutral-400 bg-neutral-800'
                            }`}
                          >
                            {crit.status}
                          </span>
                        </div>

                        {crit.finding && (
                          <div className="pl-7 text-xs text-neutral-400 leading-relaxed">
                            <span className="font-semibold text-neutral-300">Finding:</span>{' '}
                            {crit.finding}
                          </div>
                        )}

                        {crit.uncertaintyReason && (
                          <div className="pl-7 text-xs text-[#F5B942] leading-relaxed">
                            <span className="font-semibold">Reason:</span> {crit.uncertaintyReason}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Evidence Studio & SAM 3.1 Segmentation */}
          {activeTab === 'EVIDENCE' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Visual Evidence Studio</h3>
                  <p className="text-xs text-neutral-400">
                    High-resolution field photographs analyzed via Meta SAM 3.1 visual segmentation.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSamMasks}
                      onChange={(e) => setShowSamMasks(e.target.checked)}
                      className="rounded border-neutral-700 text-[#7C8CFF] focus:ring-0"
                    />
                    <span>Show SAM 3.1 Overlays</span>
                  </label>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#7C8CFF] hover:bg-[#6A7BFF] rounded-lg cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Processing...' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              {/* Main Evidence Viewer with SAM 3.1 Overlay */}
              {selectedEvidence ? (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow-xl aspect-[16/10] flex items-center justify-center">
                    <img
                      src={selectedEvidence.fileUrl}
                      alt={selectedEvidence.fileName}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />

                    {/* SAM 3.1 Segmentation Bounding Box Overlays */}
                    {showSamMasks &&
                      selectedEvidence.detections.map((det) => {
                        const [x, y, w, h] = det.bbox;
                        return (
                          <div
                            key={det.id}
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              width: `${w}%`,
                              height: `${h}%`,
                              borderColor: det.color || '#7C8CFF',
                            }}
                            className="absolute border-2 border-dashed bg-[#7C8CFF]/10 transition-all hover:bg-[#7C8CFF]/20 group pointer-events-auto"
                          >
                            <span
                              style={{ backgroundColor: det.color || '#7C8CFF' }}
                              className="absolute -top-6 left-0 px-1.5 py-0.5 text-[10px] font-bold font-mono text-black rounded shadow whitespace-nowrap"
                            >
                              {det.label} · {Math.round(det.confidence * 100)}%
                            </span>
                          </div>
                        );
                      })}
                  </div>

                  {/* Evidence Metadata & Detections List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Metadata */}
                    <div className="p-4 rounded-xl bg-[#111827] border border-neutral-800 text-xs space-y-1.5">
                      <span className="font-semibold text-white">File Telemetry</span>
                      <div className="text-neutral-400">Name: {selectedEvidence.fileName}</div>
                      <div className="text-neutral-400">
                        Size: {(selectedEvidence.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </div>
                      <div className="text-neutral-400">
                        Camera: {selectedEvidence.metadata?.camera || 'Field Camera Pro'}
                      </div>
                      <div className="text-neutral-400">
                        Uploaded by: {selectedEvidence.uploadedByName}
                      </div>
                    </div>

                    {/* Detections */}
                    <div className="p-4 rounded-xl bg-[#111827] border border-neutral-800 text-xs space-y-2">
                      <span className="font-semibold text-white">
                        SAM 3.1 Detected Segments ({selectedEvidence.detections.length})
                      </span>
                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                        {selectedEvidence.detections.map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center justify-between p-1.5 rounded bg-neutral-900 border border-neutral-800"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: d.color }}
                              />
                              <span className="text-neutral-200">{d.label}</span>
                            </div>
                            <span className="font-mono text-neutral-400 text-[10px]">
                              {Math.round(d.confidence * 100)}% Conf
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl bg-[#111827] border border-neutral-800">
                  <Camera className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">No photographic evidence attached yet.</p>
                </div>
              )}

              {/* Sample Photo Attacher (1-click for testing) */}
              <div className="pt-3 border-t border-neutral-800">
                <span className="text-xs font-semibold text-neutral-400 block mb-2">
                  Sample Field Photos (Instant Test Attach):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleAttachDemoEvidence(
                        '/src/assets/images/demo_chairs_arranged_1793784151109.jpg',
                        'auditorium_chairs_50.jpg'
                      )
                    }
                    className="px-2.5 py-1 text-[11px] bg-neutral-900 border border-neutral-800 rounded hover:border-[#7C8CFF] text-neutral-300"
                  >
                    + Auditorium Chairs (50)
                  </button>
                  <button
                    onClick={() =>
                      handleAttachDemoEvidence(
                        '/src/assets/images/demo_projector_mounted_1793784151441.jpg',
                        'projector_laser_mount.jpg'
                      )
                    }
                    className="px-2.5 py-1 text-[11px] bg-neutral-900 border border-neutral-800 rounded hover:border-[#7C8CFF] text-neutral-300"
                  >
                    + Laser Projector
                  </button>
                  <button
                    onClick={() =>
                      handleAttachDemoEvidence(
                        '/src/assets/images/demo_registration_desk_1793784150525.jpg',
                        'registration_desk_badges.jpg'
                      )
                    }
                    className="px-2.5 py-1 text-[11px] bg-neutral-900 border border-neutral-800 rounded hover:border-[#7C8CFF] text-neutral-300"
                  >
                    + Registration Desk
                  </button>
                  <button
                    onClick={() =>
                      handleAttachDemoEvidence(
                        '/src/assets/images/demo_emergency_exit_1793784151652.jpg',
                        'emergency_exit_corridor.jpg'
                      )
                    }
                    className="px-2.5 py-1 text-[11px] bg-neutral-900 border border-neutral-800 rounded hover:border-[#7C8CFF] text-neutral-300"
                  >
                    + Emergency Exit Hall
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Human Review Sign-Off */}
          {activeTab === 'REVIEW' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#111827] border border-neutral-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-white mb-2">
                  <UserCheck className="w-4 h-4 text-[#7C8CFF]" />
                  <span>Human Oversight Protocol</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Authorized reviewers verify or challenge the automated multimodal determination. Human decisions are recorded independently with cryptographic timestamps and never overwrite raw AI findings.
                </p>
              </div>

              {/* Current Decision Status */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-400">Current Review Decision</span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded ${
                    ver?.humanDecision === 'APPROVED'
                      ? 'text-[#22C58B] bg-[#22C58B]/10'
                      : ver?.humanDecision === 'REJECTED'
                      ? 'text-[#F16C75] bg-[#F16C75]/10'
                      : ver?.humanDecision === 'REQUEST_MORE_EVIDENCE'
                      ? 'text-[#F5B942] bg-[#F5B942]/10'
                      : 'text-neutral-400 bg-neutral-800'
                  }`}
                >
                  {ver?.humanDecision || 'PENDING'}
                </span>
              </div>

              {/* Reviewer Notes Field */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Reviewer Audit Notes & Observations
                </label>
                <textarea
                  rows={4}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Record physical inspection remarks, safety sign-off conditions, or instructions for additional evidence..."
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#7C8CFF]"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  disabled={submittingReview}
                  onClick={() => handleHumanReview('APPROVED')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#22C58B] hover:bg-[#1eb37d] rounded-lg transition-all shadow-md shadow-[#22C58B]/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Result</span>
                </button>

                <button
                  type="button"
                  disabled={submittingReview}
                  onClick={() => handleHumanReview('REQUEST_MORE_EVIDENCE')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#F5B942] hover:bg-[#e0a735] rounded-lg transition-all text-neutral-950 font-bold"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Request More Evidence</span>
                </button>

                <button
                  type="button"
                  disabled={submittingReview}
                  onClick={() => handleHumanReview('REJECTED')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#F16C75] hover:bg-[#dd5861] rounded-lg transition-all"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Reject Execution</span>
                </button>
              </div>

              {ver?.reviewedBy && (
                <div className="pt-2 text-[11px] text-neutral-400 font-mono">
                  Signed off by {ver.reviewedByName} at{' '}
                  {new Date(ver.reviewedAt || '').toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
