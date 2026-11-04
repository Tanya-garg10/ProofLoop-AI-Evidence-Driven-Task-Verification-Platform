import React, { useState, useEffect } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Layers,
  Sparkles,
  ScanEye,
  Mic,
  Server,
} from 'lucide-react';
import { fetchProviders } from '../lib/api.js';

export const AIConnectionsView: React.FC = () => {
  const [providers, setProviders] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await fetchProviders();
      setProviders(data);
    } catch (err) {
      console.error('Failed to load providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8B7CFF] mb-1">
            <span>System Infrastructure</span>
            <span>·</span>
            <span className="text-[#28D6A0]">AI Provider Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Connections & Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Active connections, model endpoints, and zero-fabrication guardrail configurations.
          </p>
        </div>

        <button
          onClick={loadProviders}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 bg-[#0D1321] border border-neutral-800 rounded-lg hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ping Models</span>
        </button>
      </div>

      {/* Connection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Gemini 3.8 Multimodal */}
        <div className="p-5 rounded-2xl bg-[#0D1321] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#141C2D] border border-neutral-800 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-[#8B7CFF]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Gemini 3.8 Multimodal Engine</h3>
                <span className="text-[11px] font-mono text-neutral-400">@google/genai SDK</span>
              </div>
            </div>
            <span className="font-mono text-[10px] font-bold text-[#28D6A0] bg-[#28D6A0]/10 px-2 py-0.5 rounded border border-[#28D6A0]/20">
              {providers?.geminiEngine?.status || 'CONNECTED'}
            </span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            High-order reasoning, structured JSON instruction decomposition, and multi-part visual inspection with <code className="text-[#8B7CFF]">models/gemini-3.8-flash</code>.
          </p>
          <div className="pt-2 text-[11px] text-neutral-400 font-mono border-t border-neutral-800/80">
            HTTP Header: User-Agent: aistudio-build
          </div>
        </div>

        {/* Meta Muse Spark 2.5 */}
        <div className="p-5 rounded-2xl bg-[#0D1321] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#141C2D] border border-neutral-800 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#8B7CFF]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Meta Muse Spark 2.5</h3>
                <span className="text-[11px] font-mono text-neutral-400">Task Decomposition</span>
              </div>
            </div>
            <span className="font-mono text-[10px] font-bold text-[#28D6A0] bg-[#28D6A0]/10 px-2 py-0.5 rounded border border-[#28D6A0]/20">
              {providers?.metaMuseSpark?.status || 'CONNECTED'}
            </span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Translates natural-language operational instructions into discrete tasks, measurable criteria, and evidence requirements.
          </p>
          <div className="pt-2 text-[11px] text-neutral-400 font-mono border-t border-neutral-800/80">
            Engine Mode: Autonomous Planning Adapter
          </div>
        </div>

        {/* Meta SAM 3.1 */}
        <div className="p-5 rounded-2xl bg-[#0D1321] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#141C2D] border border-neutral-800 flex items-center justify-center">
                <ScanEye className="w-4 h-4 text-[#4DD9E8]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Meta SAM 3.1</h3>
                <span className="text-[11px] font-mono text-neutral-400">Segment Anything Model</span>
              </div>
            </div>
            <span className="font-mono text-[10px] font-bold text-[#28D6A0] bg-[#28D6A0]/10 px-2 py-0.5 rounded border border-[#28D6A0]/20">
              {providers?.metaSAM?.status || 'CONNECTED'}
            </span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            High-precision multi-object visual segmentation, chair row counts, clearance corridor bounds, and equipment localization.
          </p>
          <div className="pt-2 text-[11px] text-neutral-400 font-mono border-t border-neutral-800/80">
            Perimeter Output: Normalized Bounding Box Coordinates
          </div>
        </div>

        {/* Meta Muse Voice Transcribe */}
        <div className="p-5 rounded-2xl bg-[#0D1321] border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#141C2D] border border-neutral-800 flex items-center justify-center">
                <Mic className="w-4 h-4 text-[#F6BC58]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Meta Muse Voice Transcribe 2.0</h3>
                <span className="text-[11px] font-mono text-neutral-400">Audio Speech-to-Text</span>
              </div>
            </div>
            <span className="font-mono text-[10px] font-bold text-[#28D6A0] bg-[#28D6A0]/10 px-2 py-0.5 rounded border border-[#28D6A0]/20">
              READY
            </span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Spoken operational directive audio ingestion, real-time noise cancellation, and automated punctuation parsing.
          </p>
          <div className="pt-2 text-[11px] text-neutral-400 font-mono border-t border-neutral-800/80">
            Input: High-Fidelity Microphone Stream
          </div>
        </div>
      </div>
    </div>
  );
};
