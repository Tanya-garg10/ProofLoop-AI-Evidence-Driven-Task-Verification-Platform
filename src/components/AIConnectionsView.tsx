import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Cpu, Mic, RefreshCw, ScanEye, Sparkles } from 'lucide-react';
import type { AIExecutionRecord } from '../types/index.js';
import { fetchAIExecutions, fetchProviders, testAIConnection } from '../lib/api.js';

type ProviderStatus = {
  model: string;
  configured: boolean;
  status: string;
  lastSuccessfulRequest?: string;
  enabled?: boolean;
  optional?: boolean;
};

const connectionCards = [
  { key: 'metaMuseSpark', name: 'Muse Spark', operation: 'Task planning and evidence reasoning', icon: Sparkles, testable: 'muse-spark' as const },
  { key: 'metaSAM', name: 'SAM 3.1', operation: 'Image object segmentation with masks', icon: ScanEye, testable: 'sam' as const },
  { key: 'metaMuseVoice', name: 'Muse Voice Transcribe', operation: 'WAV speech-to-text transcription', icon: Mic },
  { key: 'metaMuseImage', name: 'Muse Image', operation: 'Optional illustration generation; never evidence', icon: Cpu },
];

export const AIConnectionsView: React.FC = () => {
  const [providers, setProviders] = useState<Record<string, ProviderStatus>>({});
  const [executions, setExecutions] = useState<AIExecutionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [status, history] = await Promise.all([fetchProviders(), fetchAIExecutions()]);
      setProviders(status);
      setExecutions(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Meta API status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const runConnectionTest = async (model: 'muse-spark' | 'sam') => {
    try {
      setTesting(model);
      setError(null);
      setMessage(null);
      const result = await testAIConnection(model);
      setMessage(model === 'sam'
        ? `Live SAM request completed using ${result.model}; ${result.segmentCount ?? 0} object segment(s) returned.`
        : `Live Muse Spark request completed using ${result.model}.`);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed.');
      await loadData();
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8B7CFF] mb-1">
            <span>Meta Model API</span><span>·</span><span className="text-neutral-400">Live service status</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">AI Connections & Execution History</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Status changes to connected only after a real API operation succeeds. API keys stay on the server.
          </p>
        </div>
        <button
          onClick={() => void loadData()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 bg-[#0D1321] border border-neutral-800 rounded-lg hover:text-white disabled:opacity-50"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {error && <div role="alert" className="p-3 text-xs text-red-300 bg-red-950/30 border border-red-900/50 rounded-lg">{error}</div>}
      {message && <div role="status" className="p-3 text-xs text-emerald-300 bg-emerald-950/20 border border-emerald-900/50 rounded-lg">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {connectionCards.map(({ key, name, operation, icon: Icon, testable }) => {
          const provider = providers[key];
          const configured = provider?.configured ?? false;
          const state = provider?.status || (loading ? 'CHECKING' : 'UNAVAILABLE');
          return (
            <section key={key} className="p-5 rounded-2xl bg-[#0D1321] border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#141C2D] border border-neutral-800 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#8B7CFF]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">{name}</h2>
                    <span className="text-[11px] font-mono text-neutral-400">{provider?.model || 'Loading model identifier'}</span>
                  </div>
                </div>
                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                  state === 'CONNECTED'
                    ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                    : configured
                      ? 'text-amber-300 bg-amber-500/10 border-amber-500/20'
                      : 'text-neutral-400 bg-neutral-800/50 border-neutral-700'
                }`}>{state}</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">{operation}</p>
              <p className="text-[11px] text-neutral-500">
                {provider?.lastSuccessfulRequest
                  ? `Last successful request: ${new Date(provider.lastSuccessfulRequest).toLocaleString()}`
                  : configured
                    ? 'No successful live request recorded yet.'
                    : 'Set MODEL_API_KEY in the server environment to enable this model.'}
              </p>
              {testable && (
                <button
                  onClick={() => void runConnectionTest(testable)}
                  disabled={!configured || testing !== null}
                  className="px-3 py-1.5 text-[11px] text-white bg-[#192232] border border-neutral-700 rounded-lg disabled:opacity-50"
                >
                  {testing === testable ? 'Calling API...' : 'Run live connection test'}
                </button>
              )}
              {key === 'metaMuseVoice' && configured && (
                <p className="text-[11px] text-neutral-500">Test by recording a voice instruction in AI Planner or uploading WAV audio.</p>
              )}
            </section>
          );
        })}
      </div>

      <section className="rounded-2xl bg-[#0D1321] border border-neutral-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Real API execution history</h2>
            <p className="text-[11px] text-neutral-500 mt-1">Input prompts and API secrets are not stored in these records.</p>
          </div>
          <span className="text-[10px] font-mono text-neutral-500">{executions.length} records</span>
        </div>
        {executions.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            <AlertCircle className="w-4 h-4 mx-auto mb-2" />
            No Meta Model API calls recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-neutral-500 bg-[#0A0F1A]">
                <tr>
                  <th className="px-4 py-3">Model / Operation</th><th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Duration</th><th className="px-4 py-3">Timestamp</th><th className="px-4 py-3">Result</th>
                </tr>
              </thead>
              <tbody>
                {executions.map((entry) => (
                  <tr key={entry.id} className="border-t border-neutral-800/70 text-neutral-300">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{entry.modelName}</div>
                      <div className="text-[10px] font-mono text-neutral-500">{entry.modelIdentifier} · {entry.operation}</div>
                      {entry.requestId && <div className="text-[10px] text-neutral-600">Request {entry.requestId}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={entry.status === 'COMPLETED' ? 'text-emerald-300' : entry.status === 'FAILED' ? 'text-red-300' : 'text-amber-300'}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{entry.durationMs === undefined ? '—' : `${entry.durationMs} ms`}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(entry.startedAt).toLocaleString()}</td>
                    <td className="px-4 py-3 min-w-48">
                      {entry.error ? <span className="text-red-300">{entry.error}</span> : entry.outputPreview || 'In progress'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <div className="flex items-center gap-2 text-[10px] text-neutral-500">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#29D6A0]" />
        Model IDs and statuses come from server configuration and recorded API responses, not static UI labels.
      </div>
    </div>
  );
};
