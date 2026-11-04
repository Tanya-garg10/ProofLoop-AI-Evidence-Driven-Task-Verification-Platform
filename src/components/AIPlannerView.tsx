import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Plus,
  Trash2,
  ArrowRight,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import type { Project, AIPlanGeneratedTask, AIPlanResponse } from '../types/index.js';
import { fetchProjects, createProject, createTask, planInstructionsWithAI } from '../lib/api.js';

interface AIPlannerViewProps {
  initialProject?: Project | null;
  onPlanCommitted: (projectId: string) => void;
}

export const AIPlannerView: React.FC<AIPlannerViewProps> = ({
  initialProject,
  onPlanCommitted,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProject?.id || 'new');
  const [newProjectName, setNewProjectName] = useState('College Tech Fest 2026');
  const [context, setContext] = useState('Campus auditorium and atrium venue setup for 500 delegates');
  const [instructions, setInstructions] = useState(
    'Prepare the registration desk, arrange 50 chairs, install the projector, put up directional signs, and ensure emergency exits remain unobstructed.'
  );

  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [planning, setPlanning] = useState(false);
  const [planResult, setPlanResult] = useState<AIPlanResponse | null>(null);
  const [editableTasks, setEditableTasks] = useState<AIPlanGeneratedTask[]>([]);
  const [committing, setCommitting] = useState(false);

  useEffect(() => {
    fetchProjects().then(setProjects).catch(console.error);
  }, []);

  const handleVoiceToggle = () => {
    if (!isListening) {
      setIsListening(true);
      setVoiceNotice('Meta Muse Voice Transcribe listening...');
      setTimeout(() => {
        setIsListening(false);
        setVoiceNotice('Voice transcribed: "Conduct campus hall audit, configure projector & exits"');
        setInstructions(
          'Prepare the registration desk, arrange 50 chairs, install the projector, put up directional signs, and ensure emergency exits remain unobstructed.'
        );
      }, 2000);
    } else {
      setIsListening(false);
      setVoiceNotice(null);
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructions.trim()) return;

    try {
      setPlanning(true);
      const res = await planInstructionsWithAI(
        instructions.trim(),
        context,
        selectedProjectId === 'new' ? newProjectName : undefined
      );
      setPlanResult(res);
      setEditableTasks(res.tasks);
    } catch (err) {
      console.error('Planning failed:', err);
    } finally {
      setPlanning(false);
    }
  };

  const handleCommitPlan = async () => {
    try {
      setCommitting(true);
      let targetId = selectedProjectId;

      if (targetId === 'new') {
        const created = await createProject(
          newProjectName.trim() || 'New Operational Project',
          context
        );
        targetId = created.id;
      }

      for (const t of editableTasks) {
        await createTask(targetId, {
          title: t.title,
          description: t.description,
          acceptanceCriteria: t.acceptanceCriteria as any,
          evidenceRequirements: t.evidenceRequirements,
          dependencies: t.dependencies,
          priority: t.priority,
        });
      }

      onPlanCommitted(targetId);
    } catch (err) {
      console.error('Commit plan error:', err);
    } finally {
      setCommitting(false);
    }
  };

  const handleRemoveTask = (index: number) => {
    setEditableTasks((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#7C8CFF] mb-1">
          <span>AI Task Decomposition</span>
          <span>·</span>
          <span>Meta Muse Spark 2.5</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Operational Planner
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Convert natural language instructions into verifiable tasks with strict acceptance criteria and evidence requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Instructions & Presets */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleGeneratePlan} className="p-6 rounded-2xl bg-[#111827] border border-neutral-800 space-y-4">
            {/* Project Selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Target Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#7C8CFF]"
              >
                <option value="new">+ Create New Project from Plan</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedProjectId === 'new' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. College Tech Fest 2026"
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#7C8CFF]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Operational Context & Venue
              </label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. Campus auditorium and atrium foyer"
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#7C8CFF]"
              />
            </div>

            {/* Natural-Language Instructions */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Operational Instructions *
                </label>
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded transition-colors ${
                    isListening
                      ? 'bg-red-500/20 text-red-400 animate-pulse'
                      : 'text-neutral-400 hover:text-[#7C8CFF]'
                  }`}
                  title="Meta Muse Voice Transcribe"
                >
                  {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
                </button>
              </div>

              <textarea
                rows={5}
                required
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter instructions (e.g. Prepare registration desk, arrange 50 chairs, install projector, ensure emergency exits remain unobstructed)..."
                className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#7C8CFF] leading-relaxed"
              />

              {voiceNotice && (
                <div className="mt-1 text-[11px] text-[#A78BFA] font-mono">{voiceNotice}</div>
              )}
            </div>

            {/* Presets row */}
            <div>
              <span className="text-[11px] font-semibold text-neutral-400 block mb-1.5">
                Quick Preset Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setInstructions(
                      'Prepare the registration desk, arrange 50 chairs, install the projector, put up directional signs, and ensure emergency exits remain unobstructed.'
                    )
                  }
                  className="px-2.5 py-1 text-[11px] bg-neutral-900 border border-neutral-800 rounded hover:border-[#7C8CFF] text-neutral-300"
                >
                  College Tech Fest
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setInstructions(
                      'Sterilize bio-safety cabinet, calibrate particulate sensor to ISO Class 6, verify HEPA positive pressure cascade, and inspect cleanroom gowning rack.'
                    )
                  }
                  className="px-2.5 py-1 text-[11px] bg-neutral-900 border border-neutral-800 rounded hover:border-[#7C8CFF] text-neutral-300"
                >
                  Cleanroom ISO-6
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setInstructions(
                      'Rack 4 servers in cabinet B12, route redundant dual power supplies, label top-of-rack fiber uplinks, and verify hot aisle containment seals.'
                    )
                  }
                  className="px-2.5 py-1 text-[11px] bg-neutral-900 border border-neutral-800 rounded hover:border-[#7C8CFF] text-neutral-300"
                >
                  Data Center Rack
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={planning}
              className="w-full py-3 text-xs font-semibold text-white bg-[#7C8CFF] hover:bg-[#6A7BFF] rounded-lg transition-all shadow-md shadow-[#7C8CFF]/20 flex items-center justify-center gap-2"
            >
              <Sparkles className={`w-3.5 h-3.5 ${planning ? 'animate-spin' : ''}`} />
              <span>{planning ? 'Synthesizing Actionable Tasks...' : 'Generate Actionable Tasks'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Editable Generated Tasks */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">
              Actionable Tasks Output ({editableTasks.length})
            </h2>

            {editableTasks.length > 0 && (
              <button
                type="button"
                disabled={committing}
                onClick={handleCommitPlan}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#22C58B] hover:bg-[#1eb37d] rounded-lg shadow-md shadow-[#22C58B]/20 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{committing ? 'Saving Tasks...' : 'Commit Tasks to Project'}</span>
              </button>
            )}
          </div>

          {planResult && (
            <div className="p-4 rounded-xl bg-[#0D1220] border border-neutral-800 text-xs text-neutral-300">
              <span className="font-semibold text-white">Decomposition Summary:</span>{' '}
              {planResult.summary}
              <div className="mt-1 font-mono text-[11px] text-neutral-400">
                Engine: {planResult.model}
              </div>
            </div>
          )}

          {editableTasks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#111827] border border-neutral-800 space-y-3">
              <FileText className="w-8 h-8 text-neutral-500 mx-auto" />
              <h3 className="text-sm font-semibold text-white">No tasks generated yet</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Enter your operational instructions on the left and click "Generate Actionable Tasks" to trigger Meta Muse Spark decomposition.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {editableTasks.map((task, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-[#111827] border border-neutral-800 space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white">{task.title}</h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveTask(idx)}
                      className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                      title="Remove task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {task.description}
                  </p>

                  {/* Criteria */}
                  <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                    <span className="text-[11px] font-semibold text-[#7C8CFF] uppercase tracking-wider block">
                      Acceptance Criteria (Measurable)
                    </span>
                    <ul className="space-y-1">
                      {task.acceptanceCriteria.map((c, cIdx) => (
                        <li key={cIdx} className="text-xs text-neutral-400 flex items-start gap-2">
                          <span className="text-neutral-600">·</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Required Evidence */}
                  <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400">
                    <span className="font-semibold text-neutral-300">Required Evidence:</span>{' '}
                    {task.evidenceRequirements.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
