import type { RiskItem, Task, Project } from '../../src/types/index.js';
import { db } from '../db.js';

export class PredictiveRiskEngine {
  public evaluateProjectRisks(projectId?: string): {
    overallRiskScore: number;
    riskLevel: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
    summary: string;
    risks: RiskItem[];
  } {
    const targetProject = projectId
      ? db.getProjectById(projectId)
      : db.getProjects()[0];

    const tasks = targetProject
      ? db.getTasksByProjectId(targetProject.id)
      : [];

    const risks: RiskItem[] = [];

    tasks.forEach((task) => {
      const isProjector = task.title.toLowerCase().includes('projector') || task.title.toLowerCase().includes('laser');
      const isExit = task.title.toLowerCase().includes('exit') || task.title.toLowerCase().includes('emergency');
      const isSigns = task.title.toLowerCase().includes('sign') || task.title.toLowerCase().includes('wayfinding');

      // 1. Uncertain Signal / Non-Visual Functionality Gap
      if (isProjector && task.status === 'NEEDS_REVIEW') {
        risks.push({
          id: `risk-signal-${task.id}`,
          category: 'UNCERTAIN_SIGNAL',
          severity: 'HIGH',
          title: 'Unverified Live 4K Video Transmission',
          explanation:
            'Laser projector is physically mounted, but still photography cannot confirm live HDMI signal handshakes or absence of video flicker on stage.',
          recommendedAction:
            'Upload a 5-second video recording of the stage screen showing presenter test pattern or initiate physical reviewer sign-off.',
          relatedTaskId: task.id,
          relatedTaskTitle: task.title,
          impactScore: 78,
        });
      }

      // 2. Evidence Gap
      if (task.status === 'AWAITING_EVIDENCE' || task.evidenceCount === 0) {
        risks.push({
          id: `risk-gap-${task.id}`,
          category: 'EVIDENCE_GAP',
          severity: isExit ? 'CRITICAL' : 'MEDIUM',
          title: `Missing Photographic Proof for "${task.title}"`,
          explanation:
            'Zero field evidence uploaded. Task cannot progress to verification without supporting photographic documentation.',
          recommendedAction:
            'Dispatch field inspector with camera to capture high-resolution photos of designated waypoints.',
          relatedTaskId: task.id,
          relatedTaskTitle: task.title,
          impactScore: isExit ? 95 : 55,
        });
      }

      // 3. Safety Compliance Monitor
      if (isExit && task.status !== 'VERIFIED') {
        risks.push({
          id: `risk-safety-${task.id}`,
          category: 'SAFETY_COMPLIANCE',
          severity: 'CRITICAL',
          title: 'Egress Corridor Safety Sign-Off Incomplete',
          explanation:
            'Life safety regulations mandate verified unobstructed evacuation routes before general attendee admission.',
          recommendedAction:
            'Prioritize immediate field inspection and verify illuminated ISO exit luminaires.',
          relatedTaskId: task.id,
          relatedTaskTitle: task.title,
          impactScore: 92,
        });
      }

      // 4. Dependency Blockers
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach((depId) => {
          const depTask = tasks.find((t) => t.id === depId);
          if (depTask && depTask.status !== 'VERIFIED') {
            risks.push({
              id: `risk-dep-${task.id}-${depId}`,
              category: 'DEPENDENCY_BLOCKER',
              severity: 'HIGH',
              title: `Dependency Blocker on "${task.title}"`,
              explanation: `Prerequisite task "${depTask.title}" has status ${depTask.status} and must be verified before this task can proceed.`,
              recommendedAction: `Expedite evidence submission for "${depTask.title}".`,
              relatedTaskId: task.id,
              relatedTaskTitle: task.title,
              impactScore: 68,
            });
          }
        });
      }
    });

    // Compute composite risk score
    let overallRiskScore = 15;
    if (risks.length > 0) {
      const maxScore = Math.max(...risks.map((r) => r.impactScore));
      const avgScore = risks.reduce((acc, r) => acc + r.impactScore, 0) / risks.length;
      overallRiskScore = Math.min(99, Math.round(maxScore * 0.6 + avgScore * 0.4));
    }

    const riskLevel: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL' =
      overallRiskScore > 75
        ? 'CRITICAL'
        : overallRiskScore > 50
        ? 'HIGH'
        : overallRiskScore > 25
        ? 'ELEVATED'
        : 'LOW';

    const summary = `${risks.length} operational risk factor(s) flagged across monitored tasks. ${
      risks.filter((r) => r.severity === 'CRITICAL' || r.severity === 'HIGH').length
    } require priority field action.`;

    return {
      overallRiskScore,
      riskLevel,
      summary,
      risks: risks.sort((a, b) => b.impactScore - a.impactScore),
    };
  }
}

export const riskEngine = new PredictiveRiskEngine();
