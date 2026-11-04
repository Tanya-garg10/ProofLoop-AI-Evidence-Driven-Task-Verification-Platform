import React, { useState, useEffect } from 'react';
import {
  ScanEye,
  Camera,
  Upload,
  Split,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Sliders,
  FileCheck2,
  Maximize2,
  Lock,
  ChevronRight,
  Info,
} from 'lucide-react';
import type { Task, EvidenceItem, SamDetection } from '../types/index.js';
import { fetchProjectTasks, fetchTaskEvidence, uploadEvidence, segmentEvidence } from '../lib/api.js';
import {
  DisplayHeading,
  SectionHeading,
  Label,
  Button,
  Surface,
  StatusBadge,
  LiveIndicator,
} from './ui/SharedComponents.js';

interface VisualProofStudioViewProps {
  onOpenTaskModal: (task: Task) => void;
}

export const VisualProofStudioView: React.FC<VisualProofStudioViewProps> = ({
  onOpenTaskModal,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [activeEvidence, setActiveEvidence] = useState<EvidenceItem | null>(null);
  const [viewMode, setViewMode] = useState<'ANALYZED' | 'ORIGINAL' | 'SIDE_BY_SIDE'>('ANALYZED');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(80);
  const [selectedDetection, setSelectedDetection] = useState<SamDetection | null>(null);
  const [uploading, setUploading] = useState(false);
  const [segmenting, setSegmenting] = useState(false);
  const [segmentationPrompt, setSegmentationPrompt] = useState('chair');
  const [operationError, setOperationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const list = await fetchProjectTasks('proj-techfest-2026');
      setTasks(list);
      if (list.length > 0) {
        setSelectedTask(list[0]);
      }
    } catch (err) {
      console.error('Failed to load tasks for Visual Studio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (!selectedTask) return;
    fetchTaskEvidence(selectedTask.id)
      .then((items) => {
        setEvidenceList(items);
        if (items.length > 0) {
          setActiveEvidence(items[0]);
          if (items[0].metadata?.analysisModel && items[0].detections.length > 0) {
            setSelectedDetection(items[0].detections[0]);
          } else {
            setSelectedDetection(null);
          }
        } else {
          setActiveEvidence(null);
          setSelectedDetection(null);
        }
      })
      .catch(console.error);
  }, [selectedTask]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedTask) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      setOperationError(null);
      setUploading(true);
      const newEv = await uploadEvidence(selectedTask.id, formData);
      setEvidenceList((prev) => [...prev, newEv]);
      setActiveEvidence(newEv);
    } catch (err) {
      setOperationError(err instanceof Error ? err.message : 'Evidence upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSegment = async () => {
    if (!activeEvidence || !segmentationPrompt.trim()) return;
    try {
      setOperationError(null);
      setSegmenting(true);
      const updated = await segmentEvidence(activeEvidence.id, [segmentationPrompt.trim()]);
      setEvidenceList((items) => items.map((item) => item.id === updated.id ? updated : item));
      setActiveEvidence(updated);
      setSelectedDetection(updated.detections[0] || null);
    } catch (err) {
      setOperationError(err instanceof Error ? err.message : 'SAM segmentation failed.');
    } finally {
      setSegmenting(false);
    }
  };

  const actualDetections = activeEvidence?.metadata?.analysisModel
    ? activeEvidence.detections
    : [];
  const filteredDetections = actualDetections.filter(
    (d) => d.confidence === undefined || Math.round(d.confidence * 100) >= confidenceThreshold
  );
  const [imageWidth, imageHeight] = (activeEvidence?.metadata?.resolution || '').split('x').map(Number);

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 select-none">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[rgba(148,163,184,0.08)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-[#8B7CFF] uppercase bg-[#121824] px-2 py-0.5 rounded border border-[#8B7CFF]/20">
              EVIDENCE STUDIO // SAM 3.1 WORKSTATION
            </span>
            <LiveIndicator label="GROUND TRUTH ACTIVE" color="bg-[#29D6A0]" />
          </div>
          <DisplayHeading size="lg">Multimodal Evidence Inspection</DisplayHeading>
        </div>

        {/* View Controls & Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Target Task Selector */}
          <div className="flex items-center gap-2 bg-[#121824] border border-[rgba(148,163,184,0.12)] rounded px-2.5 py-1">
            <span className="text-[10px] font-mono text-[#64748B] uppercase">TASK:</span>
            <select
              value={selectedTask?.id || ''}
              onChange={(e) => {
                const match = tasks.find((t) => t.id === e.target.value);
                if (match) setSelectedTask(match);
              }}
              className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#121824] text-white">
                  {t.title} ({t.evidenceCount} photos)
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 bg-[#0D111B] border border-[rgba(148,163,184,0.12)] rounded text-xs font-mono">
            <button
              onClick={() => setViewMode('ANALYZED')}
              className={`px-3 py-1 rounded transition-all ${
                viewMode === 'ANALYZED'
                  ? 'bg-[#192232] text-white font-semibold shadow-sm text-[#62DCEB]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              SAM 3.1 Annotated
            </button>
            <button
              onClick={() => setViewMode('ORIGINAL')}
              className={`px-3 py-1 rounded transition-all ${
                viewMode === 'ORIGINAL'
                  ? 'bg-[#192232] text-white font-semibold shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Raw Image
            </button>
            <button
              onClick={() => setViewMode('SIDE_BY_SIDE')}
              className={`px-3 py-1 rounded transition-all ${
                viewMode === 'SIDE_BY_SIDE'
                  ? 'bg-[#192232] text-white font-semibold shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Side-by-Side
            </button>
          </div>

          {/* Confidence Slider */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-[#121824] border border-[rgba(148,163,184,0.12)] text-xs text-[#94A3B8]">
            <Sliders className="w-3.5 h-3.5 text-[#8B7CFF]" />
            <span className="font-mono text-[10px]">Min Conf:</span>
            <input
              type="range"
              min="50"
              max="99"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-16 accent-[#8B7CFF] cursor-pointer"
            />
            <span className="font-mono text-white text-[11px] font-semibold">{confidenceThreshold}%</span>
          </div>

          {/* Upload Button */}
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#080A10] bg-[#8B7CFF] hover:bg-[#9D90FF] rounded cursor-pointer transition-all shadow-[0_0_15px_rgba(139,124,255,0.25)]">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Processing SAM...' : 'Upload Evidence'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <div className="flex items-center gap-1.5">
            <input
              value={segmentationPrompt}
              onChange={(event) => setSegmentationPrompt(event.target.value)}
              aria-label="SAM object prompt"
              placeholder="One object concept"
              className="w-32 px-2 py-1.5 text-[11px] bg-[#121824] border border-neutral-800 rounded text-white"
            />
            <button
              type="button"
              onClick={() => void handleSegment()}
              disabled={!activeEvidence || segmenting || !segmentationPrompt.trim()}
              className="px-2.5 py-1.5 text-[11px] font-semibold text-[#62DCEB] bg-[#121824] border border-neutral-800 rounded disabled:opacity-50"
            >
              {segmenting ? 'Segmenting...' : 'Segment prompt'}
            </button>
          </div>
        </div>
      </div>

      {operationError && (
        <div role="alert" className="p-3 text-xs text-red-300 bg-red-950/30 border border-red-900/50 rounded-lg">
          {operationError}
        </div>
      )}

      {/* 2. Main Workstation Experience */}
      {activeEvidence ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Central High-Definition Image Viewer & Bottom History (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* The Main Image Canvas */}
            <div className="rounded-lg overflow-hidden bg-[#000000] border border-[rgba(148,163,184,0.12)] shadow-2xl relative">
              {/* Viewer Top Sub-bar */}
              <div className="px-4 py-2 bg-[#0D111B] border-b border-[rgba(148,163,184,0.08)] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-white font-medium">
                  <ScanEye className="w-3.5 h-3.5 text-[#62DCEB]" />
                  <span>{activeEvidence.fileName}</span>
                  <span className="text-[#64748B]">·</span>
                  <span className={activeEvidence.metadata?.analysisModel ? 'text-[#29D6A0]' : 'text-[#F2BB5B]'}>
                    {activeEvidence.metadata?.analysisModel
                      ? `${filteredDetections.length} Objects Segmented`
                      : `No live segmentation (${activeEvidence.analysisStatus})`}
                  </span>
                </div>
                <div className="text-[10px] text-[#94A3B8] flex items-center gap-3">
                  <span>{activeEvidence.metadata?.camera || 'Sony A7 IV'}</span>
                  <span>{activeEvidence.metadata?.resolution || '4096x2730'}</span>
                </div>
              </div>

              {/* Viewer Display Frame */}
              <div
                className={`relative bg-[#05070B] flex items-center justify-center p-2 min-h-[440px] max-h-[620px] overflow-hidden ${
                  viewMode === 'SIDE_BY_SIDE' ? 'grid grid-cols-2 gap-2' : ''
                }`}
              >
                {/* View A: Raw Original Photo */}
                {(viewMode === 'ORIGINAL' || viewMode === 'SIDE_BY_SIDE') && (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <img
                      src={activeEvidence.fileUrl}
                      alt={activeEvidence.fileName}
                      className="max-h-[560px] w-auto max-w-full object-contain select-none"
                    />
                    <div className="absolute top-2 left-2 bg-[#080A10]/90 px-2 py-0.5 rounded text-[10px] font-mono text-[#94A3B8] border border-[rgba(148,163,184,0.15)]">
                      RAW UNANNOTATED
                    </div>
                  </div>
                )}

                {/* View B: SAM 3.1 Real Segmentation Overlays */}
                {(viewMode === 'ANALYZED' || viewMode === 'SIDE_BY_SIDE') && (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <div className="relative inline-block max-w-full">
                      <img
                        src={activeEvidence.fileUrl}
                        alt={activeEvidence.fileName}
                        className="block max-h-[560px] w-auto max-w-full object-contain select-none"
                      />
                      {imageWidth > 0 && imageHeight > 0 && (
                        <svg
                          viewBox={`0 0 ${imageWidth} ${imageHeight}`}
                          preserveAspectRatio="none"
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          aria-label="SAM segmentation masks"
                        >
                          {filteredDetections.map((detection) => detection.mask && (
                            <path
                              key={`${detection.id}-mask`}
                              d={detection.mask.path}
                              transform={`translate(${detection.mask.bounds.left} ${detection.mask.bounds.top}) scale(${(detection.mask.bounds.right - detection.mask.bounds.left) / detection.mask.width} ${(detection.mask.bounds.bottom - detection.mask.bounds.top) / detection.mask.height})`}
                              fill={detection.color}
                              fillOpacity={selectedDetection?.id === detection.id ? 0.45 : 0.27}
                              stroke={detection.color}
                              strokeWidth={Math.max(imageWidth / 500, 1)}
                            />
                          ))}
                        </svg>
                      )}

                    {/* Exact SVG and absolute BBoxes from actual database results */}
                    {filteredDetections.map((det) => {
                      const [x, y, w, h] = det.bbox;
                      const isSelected = selectedDetection?.id === det.id;

                      return (
                        <div
                          key={det.id}
                          onClick={() => setSelectedDetection(det)}
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            width: `${w}%`,
                            height: `${h}%`,
                            borderColor: det.color || '#62DCEB',
                          }}
                          className={`absolute border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-solid bg-[#62DCEB]/25 shadow-[0_0_20px_rgba(98,220,235,0.4)] z-20'
                              : 'border-dashed bg-[#62DCEB]/10 hover:bg-[#62DCEB]/20 z-10'
                          }`}
                        >
                          {/* Corner alignment crosshairs */}
                          <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
                          <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
                          <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
                          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />

                          {/* Tag Label */}
                          <span
                            style={{ backgroundColor: det.color || '#62DCEB' }}
                            className="absolute -top-5 left-0 px-1.5 py-0.5 text-[9px] font-bold font-mono text-[#080A10] rounded shadow whitespace-nowrap"
                          >
                            {det.label}{det.confidence === undefined ? '' : ` · ${Math.round(det.confidence * 100)}%`}
                          </span>
                        </div>
                      );
                    })}
                      <div className={`absolute top-2 left-2 bg-[#080A10]/90 px-2 py-0.5 rounded text-[10px] font-mono border ${
                        activeEvidence.metadata?.analysisModel
                          ? 'text-[#29D6A0] border-[#29D6A0]/30'
                          : 'text-[#F2BB5B] border-[#F2BB5B]/30'
                      }`}>
                        {activeEvidence.metadata?.analysisModel ? 'SAM 3.1 ANALYSIS' : `NOT ANALYZED · ${activeEvidence.analysisStatus}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Viewer HUD Status Footnote */}
              <div className="px-4 py-2 bg-[#0D111B] border-t border-[rgba(148,163,184,0.08)] flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                <span>
                  SHA-256: {activeEvidence.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </span>
                <span className="text-[#94A3B8]">
                  Uploaded by: {activeEvidence.uploadedByName}
                </span>
              </div>
            </div>

            {/* Bottom Evidence History Strip */}
            <Surface className="p-3 bg-[#0D111B]">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8] mb-2 px-1">
                <span>EVIDENCE TIMELINE FOR CURRENT TASK ({evidenceList.length} CAPTURES)</span>
                <span>CLICK TO INSPECT</span>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {evidenceList.map((ev) => {
                  const isActive = activeEvidence.id === ev.id;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => {
                        setActiveEvidence(ev);
                        setSelectedDetection(ev.metadata?.analysisModel ? ev.detections[0] || null : null);
                      }}
                      className={`relative rounded overflow-hidden shrink-0 w-32 h-20 border cursor-pointer transition-all ${
                        isActive
                          ? 'border-[#8B7CFF] shadow-[0_0_12px_rgba(139,124,255,0.3)] ring-1 ring-[#8B7CFF]'
                          : 'border-[rgba(148,163,184,0.12)] hover:border-[rgba(148,163,184,0.3)] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={ev.fileUrl}
                        alt={ev.fileName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-[#080A10]/80 px-1.5 py-0.5 text-[9px] font-mono text-white truncate">
                        {ev.fileName}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Surface>
          </div>

          {/* RIGHT: Criteria Inspector & Telemetry HUD (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Criteria Verification Inspector */}
            <Surface className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.08)] pb-2.5">
                <span className="text-label text-[#8B7CFF]">Criteria Inspector</span>
                <StatusBadge status={selectedTask?.status || 'PENDING'} />
              </div>

              {selectedTask && (
                <div className="space-y-3">
                  {selectedTask.acceptanceCriteria.map((crit, idx) => (
                    <div
                      key={crit.id}
                      className="p-3 rounded bg-[#0D111B] border border-[rgba(148,163,184,0.08)] space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-white leading-snug">
                          {idx + 1}. {crit.text}
                        </span>
                        <StatusBadge status={crit.status} />
                      </div>

                      {crit.finding && (
                        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                          {crit.finding}
                        </p>
                      )}

                      {crit.detectedObjects && crit.detectedObjects.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {crit.detectedObjects.map((obj, i) => (
                            <span
                              key={i}
                              className="text-[9px] font-mono text-[#62DCEB] bg-[#121824] px-1.5 py-0.5 rounded border border-[#62DCEB]/20"
                            >
                              {obj}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* AI Findings & Uncertainty Block */}
              {selectedTask?.latestVerification?.uncertainty?.hasUncertainty && (
                <div className="p-3 rounded bg-[#F2BB5B]/10 border border-[#F2BB5B]/30 space-y-1 text-xs text-[#F2BB5B]">
                  <div className="flex items-center gap-1.5 font-semibold font-mono">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Uncertainty Telemetry</span>
                  </div>
                  <p className="text-[11px] text-[#F2BB5B] leading-relaxed">
                    {selectedTask.latestVerification.uncertainty.reason}
                  </p>
                </div>
              )}
            </Surface>

            {/* Selected Segment Inspector Details */}
            <Surface className="p-4 space-y-3 bg-[#0D111B]">
              <span className="text-label text-[#62DCEB] block">
                SAM 3.1 Object Detection Telemetry
              </span>

              {selectedDetection ? (
                <div className="p-3 rounded bg-[#121824] border border-[rgba(148,163,184,0.1)] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">
                      {selectedDetection.label}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#29D6A0]">
                      {selectedDetection.confidence === undefined
                        ? 'Confidence not reported'
                        : `${Math.round(selectedDetection.confidence * 100)}% Confidence`}
                    </span>
                  </div>

                  <div className="font-mono text-[10px] text-[#94A3B8] space-y-1 pt-1">
                    <div>
                      Bounding Box: [X: {selectedDetection.bbox[0]}%, Y: {selectedDetection.bbox[1]}%, W: {selectedDetection.bbox[2]}%, H: {selectedDetection.bbox[3]}%]
                    </div>
                    {selectedDetection.attributes && (
                      <div className="text-white">
                        Attributes: {JSON.stringify(selectedDetection.attributes)}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#64748B]">Click an overlay box to inspect object telemetry.</p>
              )}

              {/* All Detections for Current Image */}
              <div className="space-y-1 pt-1 max-h-36 overflow-y-auto">
                {actualDetections.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDetection(d)}
                    className={`w-full p-2 rounded text-left text-xs transition-all flex items-center justify-between ${
                      selectedDetection?.id === d.id
                        ? 'bg-[#192232] text-white font-semibold border border-[#62DCEB]/40'
                        : 'text-[#94A3B8] hover:text-white bg-[#121824]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="truncate">{d.label}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#29D6A0]">
                      {d.confidence === undefined ? '—' : `${Math.round(d.confidence * 100)}%`}
                    </span>
                  </button>
                ))}
              </div>
            </Surface>

            {/* Launch Human Review Modal Button */}
            <Button
              className="w-full"
              size="md"
              onClick={() => selectedTask && onOpenTaskModal(selectedTask)}
              icon={<FileCheck2 className="w-4 h-4" />}
            >
              Open Full Audit & Human Review
            </Button>
          </div>
        </div>
      ) : (
        <Surface className="p-16 text-center space-y-3">
          <Camera className="w-8 h-8 text-[#64748B] mx-auto" />
          <h3 className="text-sm font-semibold text-white">No photographic evidence attached</h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
            Upload field photographs or select a task with attached evidence to begin visual segmentation analysis.
          </p>
        </Surface>
      )}
    </div>
  );
};
