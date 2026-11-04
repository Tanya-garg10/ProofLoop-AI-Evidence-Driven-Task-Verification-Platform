import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Camera,
  Layers,
  Search,
  Filter,
  User as UserIcon,
} from 'lucide-react';
import type { Project, Task, TaskStatus } from '../types/index.js';
import { fetchProject, fetchProjectTasks, createTask } from '../lib/api.js';

interface ProjectWorkspaceProps {
  projectId: string;
  onBack: () => void;
  onOpenTaskModal: (task: Task) => void;
  onOpenPlannerForProject: (project: Project) => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  projectId,
  onBack,
  onOpenTaskModal,
  onOpenPlannerForProject,
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newCriteriaText, setNewCriteriaText] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [proj, taskList] = await Promise.all([
        fetchProject(projectId),
        fetchProjectTasks(projectId),
      ]);
      setProject(proj);
      setTasks(taskList);
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const criteriaList = newCriteriaText
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await createTask(projectId, {
        title: newTitle.trim(),
        description: newDesc.trim(),
        priority: newPriority,
        acceptanceCriteria: criteriaList.length > 0 ? (criteriaList as any) : undefined,
      });

      setNewTitle('');
      setNewDesc('');
      setNewCriteriaText('');
      setShowAddModal(false);
      await loadData();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22C58B]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>VERIFIED</span>
          </span>
        );
      case 'NEEDS_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F5B942]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>NEEDS REVIEW</span>
          </span>
        );
      case 'AWAITING_EVIDENCE':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C8CFF]">
            <Clock className="w-3.5 h-3.5" />
            <span>AWAITING EVIDENCE</span>
          </span>
        );
      case 'INCOMPLETE':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F16C75]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>INCOMPLETE</span>
          </span>
        );
    }
  };

  if (loading && !project) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-neutral-400">Loading project workspace...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center">
        <p className="text-sm text-neutral-400 mb-4">Project not found.</p>
        <button
          onClick={onBack}
          className="text-xs text-[#7C8CFF] hover:underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const comp = project.stats?.completionPercentage ?? 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>Projects</span>
              <span>/</span>
              <span className="text-[#7C8CFF] font-medium">{project.name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
              {project.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenPlannerForProject(project)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Generate Tasks with AI</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#7C8CFF] hover:bg-[#6A7BFF] rounded-lg transition-all shadow-md shadow-[#7C8CFF]/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Project Description & Progress Bar */}
      <div className="p-5 rounded-xl bg-[#111827] border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-sm text-neutral-300 leading-relaxed">
            {project.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-neutral-400 mt-2">
            <span>Owner: {project.ownerName}</span>
            <span>·</span>
            <span>Total Tasks: {tasks.length}</span>
            <span>·</span>
            <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="w-full md:w-64 shrink-0">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
            <span>Evidence Verification Rate</span>
            <span className="font-mono font-bold text-white tabular-nums">{comp}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7C8CFF] to-[#22C58B] rounded-full transition-all duration-500"
              style={{ width: `${comp}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Interactive segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900/80 border border-neutral-800 rounded-lg overflow-x-auto">
          {(['ALL', 'VERIFIED', 'NEEDS_REVIEW', 'AWAITING_EVIDENCE', 'INCOMPLETE'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-[#182235] text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {status === 'ALL'
                  ? `All Tasks (${tasks.length})`
                  : status === 'VERIFIED'
                  ? `Verified (${tasks.filter((t) => t.status === 'VERIFIED').length})`
                  : status === 'NEEDS_REVIEW'
                  ? `Needs Review (${tasks.filter((t) => t.status === 'NEEDS_REVIEW').length})`
                  : status === 'AWAITING_EVIDENCE'
                  ? `Awaiting Photos (${tasks.filter((t) => t.status === 'AWAITING_EVIDENCE').length})`
                  : `Incomplete (${tasks.filter((t) => t.status === 'INCOMPLETE').length})`}
              </button>
            )
          )}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks or criteria..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#7C8CFF]"
          />
        </div>
      </div>

      {/* Task List Grid */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#111827] border border-neutral-800">
          <p className="text-sm text-neutral-400 mb-3">No tasks match your filter criteria.</p>
          <button
            onClick={() => setStatusFilter('ALL')}
            className="text-xs text-[#7C8CFF] hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => {
            const passedCount = task.acceptanceCriteria.filter((c) => c.status === 'PASSED').length;
            const totalCrit = task.acceptanceCriteria.length;

            return (
              <div
                key={task.id}
                onClick={() => onOpenTaskModal(task)}
                className="p-5 rounded-xl bg-[#111827] border border-neutral-800 hover:border-[#7C8CFF]/50 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[11px] font-mono text-neutral-400">
                      Priority: {task.priority}
                    </span>
                    {getStatusBadge(task.status)}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-[#7C8CFF] transition-colors leading-snug">
                    {task.title}
                  </h3>

                  <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-neutral-800/80 space-y-2.5">
                  {/* Criteria fulfillment metric */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Acceptance Criteria</span>
                    <span className="font-mono text-xs font-semibold text-neutral-200">
                      {passedCount} / {totalCrit} verified
                    </span>
                  </div>

                  {/* Footer metadata */}
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-neutral-500" />
                      <span className="font-mono text-[11px]">{task.evidenceCount} Photo(s)</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-neutral-500" />
                      <span className="text-[11px] truncate max-w-[100px]">
                        {task.assignedToName || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Add Operational Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Inspect fire alarm pull stations"
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#7C8CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe operational objectives and setup instructions..."
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#7C8CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Acceptance Criteria (one per line)
                </label>
                <textarea
                  rows={3}
                  value={newCriteriaText}
                  onChange={(e) => setNewCriteriaText(e.target.value)}
                  placeholder="Pull station glass is intact&#10;Inspection tag is current for 2026&#10;Access is unobstructed within 1 meter"
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#7C8CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e: any) => setNewPriority(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-[#7C8CFF]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#7C8CFF] hover:bg-[#6A7BFF] rounded-lg transition-all"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
