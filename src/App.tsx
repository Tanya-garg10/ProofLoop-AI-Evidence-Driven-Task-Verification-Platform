import React, { useState, useEffect } from 'react';
import { NavigationRail } from './components/NavigationRail.js';
import { LandingPage } from './components/LandingPage.js';
import { CommandCenterView } from './components/CommandCenterView.js';
import { ProjectsListView } from './components/ProjectsListView.js';
import { ProjectWorkspace } from './components/ProjectWorkspace.js';
import { SpatialOperationsTwinView } from './components/SpatialOperationsTwinView.js';
import { AIPlannerView } from './components/AIPlannerView.js';
import { AgentControlRoomView } from './components/AgentControlRoomView.js';
import { VisualProofStudioView } from './components/VisualProofStudioView.js';
import { VerificationCenterView } from './components/VerificationCenterView.js';
import { RiskRadarView } from './components/RiskRadarView.js';
import { TrustLedgerView } from './components/TrustLedgerView.js';
import { ReviewQueueView } from './components/ReviewQueueView.js';
import { ReportsView } from './components/ReportsView.js';
import { AIConnectionsView } from './components/AIConnectionsView.js';
import { TaskDetailModal } from './components/TaskDetailModal.js';
import { CreateProjectModal } from './components/CreateProjectModal.js';
import { SettingsModal } from './components/SettingsModal.js';
import type { User, Task, Project } from './types/index.js';
import { fetchCurrentUser, fetchProjectTasks } from './lib/api.js';

export function App() {
  const [currentView, setCurrentView] = useState<string>('command-center');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-techfest-2026');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [plannerInitialProject, setPlannerInitialProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchCurrentUser()
      .then((data) => {
        setCurrentUser(data.user);
        setDemoUsers(data.demoUsers);
      })
      .catch((err) => console.error('Failed to load user:', err));
  }, []);

  const handleOpenProject = (id: string) => {
    setSelectedProjectId(id);
    setCurrentView('project-detail');
  };

  const handleLaunchTechFestDemo = () => {
    setSelectedProjectId('proj-techfest-2026');
    setCurrentView('command-center');
  };

  const handleOpenPlannerForProject = (project: Project) => {
    setPlannerInitialProject(project);
    setCurrentView('planner');
  };

  const handlePlanCommitted = (newProjectId: string) => {
    setSelectedProjectId(newProjectId);
    setCurrentView('project-detail');
  };

  const handleOpenTaskById = async (taskId: string) => {
    try {
      const allTasks = await fetchProjectTasks('proj-techfest-2026');
      const found = allTasks.find((t) => t.id === taskId);
      if (found) {
        setSelectedTask(found);
      }
    } catch (err) {
      console.error('Failed to open task:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#080A10] text-[#F8FAFC] flex flex-col font-sans">
      {/* If Landing Page is active, display full marketing showcase */}
      {currentView === 'landing' ? (
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-40 bg-[#080A10]/90 backdrop-blur-md border-b border-[rgba(148, 163, 184, 0.1)] px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B7CFF] to-[#62DCEB] flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-[#8B7CFF]/20">
                PL
              </div>
              <span className="font-display font-bold text-base text-white tracking-tight">ProofLoop</span>
            </div>

            <button
              onClick={() => setCurrentView('command-center')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#8B7CFF] hover:bg-[#7866FF] rounded-lg transition-all shadow-lg shadow-[#8B7CFF]/20"
            >
              Enter Command Center
            </button>
          </header>

          <LandingPage
            onStartDemo={() => setCurrentView('command-center')}
            onOpenPlanner={() => setCurrentView('planner')}
            onViewVerification={() => setCurrentView('verification')}
          />
        </div>
      ) : (
        /* Enterprise Multi-Screen App Layout with Compact Navigation Rail */
        <div className="flex flex-1 min-h-screen overflow-hidden">
          <NavigationRail
            currentView={currentView}
            onNavigate={(view) => {
              if (view === 'settings') {
                setShowSettings(true);
              } else {
                setCurrentView(view);
              }
            }}
            currentUser={currentUser}
            onOpenSettings={() => setShowSettings(true)}
          />

          <main className="flex-1 overflow-y-auto min-h-screen">
            {currentView === 'command-center' && (
              <CommandCenterView
                onSelectProject={handleOpenProject}
                onOpenTask={handleOpenTaskById}
                onNavigate={(v) => setCurrentView(v)}
              />
            )}

            {currentView === 'projects' && (
              <ProjectsListView
                onSelectProject={handleOpenProject}
                onCreateProject={() => setShowCreateProject(true)}
                onOpenPlanner={() => setCurrentView('planner')}
              />
            )}

            {currentView === 'project-detail' && (
              <ProjectWorkspace
                projectId={selectedProjectId}
                onBack={() => setCurrentView('projects')}
                onOpenTaskModal={(task) => setSelectedTask(task)}
                onOpenPlannerForProject={handleOpenPlannerForProject}
              />
            )}

            {currentView === 'operations-twin' && (
              <SpatialOperationsTwinView onOpenTask={handleOpenTaskById} />
            )}

            {currentView === 'planner' && (
              <AIPlannerView
                initialProject={plannerInitialProject}
                onPlanCommitted={handlePlanCommitted}
              />
            )}

            {currentView === 'agent-control' && (
              <AgentControlRoomView onOpenTask={handleOpenTaskById} />
            )}

            {currentView === 'visual-studio' && (
              <VisualProofStudioView
                onOpenTaskModal={(task) => setSelectedTask(task)}
              />
            )}

            {currentView === 'verification' && (
              <VerificationCenterView
                onOpenTaskModal={(task) => setSelectedTask(task)}
              />
            )}

            {currentView === 'risk-radar' && (
              <RiskRadarView onOpenTask={handleOpenTaskById} />
            )}

            {currentView === 'trust-ledger' && (
              <TrustLedgerView onOpenTask={handleOpenTaskById} />
            )}

            {currentView === 'review-queue' && (
              <ReviewQueueView
                onOpenTaskModal={(task) => setSelectedTask(task)}
              />
            )}

            {currentView === 'reports' && <ReportsView />}

            {currentView === 'ai-connections' && <AIConnectionsView />}
          </main>
        </div>
      )}

      {/* Task Inspection & Verification Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={async () => {
            const allTasks = await fetchProjectTasks('proj-techfest-2026');
            const found = allTasks.find((t) => t.id === selectedTask.id);
            if (found) setSelectedTask(found);
          }}
        />
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onProjectCreated={(newId) => {
            setShowCreateProject(false);
            handleOpenProject(newId);
          }}
        />
      )}

      {/* Settings & Role Switcher Modal */}
      {showSettings && (
        <SettingsModal
          currentUser={currentUser}
          demoUsers={demoUsers}
          onSelectUser={(u) => {
            setCurrentUser(u);
            setShowSettings(false);
          }}
          onClose={() => setShowSettings(false)}
          onDemoReset={() => {
            setShowSettings(false);
            handleLaunchTechFestDemo();
          }}
        />
      )}
    </div>
  );
}

export default App;
