import React, { useState, useEffect } from 'react';
import { Plus, ArrowRight, Layers, Sparkles } from 'lucide-react';
import type { Project } from '../types/index.js';
import { fetchProjects } from '../lib/api.js';

interface ProjectsListViewProps {
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onOpenPlanner: () => void;
}

export const ProjectsListView: React.FC<ProjectsListViewProps> = ({
  onSelectProject,
  onCreateProject,
  onOpenPlanner,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#7C8CFF] mb-1">
            <span>Workspaces</span>
            <span>·</span>
            <span>Operational Portfolios</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Projects & Operations
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Manage operational execution scopes and track multimodal verification progress.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenPlanner}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>AI Plan Generator</span>
          </button>

          <button
            onClick={onCreateProject}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#7C8CFF] hover:bg-[#6A7BFF] rounded-lg transition-all shadow-md shadow-[#7C8CFF]/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-400">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#111827] border border-neutral-800 space-y-3">
          <p className="text-xs text-neutral-400">No projects found.</p>
          <button
            onClick={onCreateProject}
            className="text-xs font-semibold text-[#7C8CFF] hover:underline"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const comp = proj.stats?.completionPercentage ?? 0;
            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className="p-5 rounded-xl bg-[#111827] border border-neutral-800 hover:border-[#7C8CFF]/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-[#22C58B]">
                      {proj.status}
                    </span>
                    <span className="font-mono text-xs font-bold text-white tabular-nums">
                      {comp}%
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-[#7C8CFF] transition-colors">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-neutral-800/80 space-y-3">
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7C8CFF] to-[#22C58B] rounded-full transition-all duration-500"
                      style={{ width: `${comp}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="font-mono text-[11px]">
                      {proj.stats?.verifiedTasks || 0} / {proj.stats?.totalTasks || 0} verified
                    </span>
                    <div className="flex items-center gap-1 group-hover:text-[#7C8CFF] transition-colors">
                      <span className="text-[11px]">Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
