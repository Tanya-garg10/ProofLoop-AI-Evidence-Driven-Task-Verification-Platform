export type TaskStatus = 'AWAITING_EVIDENCE' | 'NEEDS_REVIEW' | 'VERIFIED' | 'INCOMPLETE';

export type CriterionStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'UNCERTAIN' | 'INSUFFICIENT_EVIDENCE';

export interface AcceptanceCriterion {
  id: string;
  text: string;
  status: CriterionStatus;
  finding?: string;
  uncertaintyReason?: string;
  detectedObjects?: string[];
}

export interface SamDetection {
  id: string;
  label: string;
  confidence: number;
  bbox: [number, number, number, number]; // [xPercent, yPercent, widthPercent, heightPercent] (0-100)
  color: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface EvidenceItem {
  id: string;
  taskId: string;
  projectId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  analysisStatus: 'PENDING' | 'ANALYZED' | 'FAILED';
  detections: SamDetection[];
  sha256Hash?: string;
  metadata?: {
    camera?: string;
    resolution?: string;
    locationNote?: string;
    focalLength?: string;
    iso?: number;
  };
}

export interface VerificationResult {
  id: string;
  taskId: string;
  projectId: string;
  evidenceIds: string[];
  aiStatus: TaskStatus;
  aiExplanation: string;
  uncertainty: {
    hasUncertainty: boolean;
    reason?: string;
    missingInformation?: string[];
  };
  criteriaResults: AcceptanceCriterion[];
  modelInformation: {
    plannerModel: string;
    visionModel: string;
    segmentationModel: string;
    isSimulation: boolean;
    providerNote: string;
  };
  humanDecision: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_EVIDENCE';
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  acceptanceCriteria: AcceptanceCriterion[];
  evidenceRequirements: string[];
  dependencies: string[];
  assignedTo?: string;
  assignedToName?: string;
  status: TaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline?: string;
  evidenceCount: number;
  spatialZoneId?: 'REGISTRATION_ZONE' | 'SEATING_ZONE' | 'PROJECTOR_STAGE' | 'WAYFINDING_CORRIDORS' | 'EMERGENCY_EGRESS';
  latestVerification?: VerificationResult;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalTasks: number;
    verifiedTasks: number;
    needsReviewTasks: number;
    awaitingEvidenceTasks: number;
    incompleteTasks: number;
    completionPercentage: number;
    riskScore?: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ORGANIZER' | 'FIELD_INSPECTOR' | 'REVIEWER';
  avatar?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  projectId: string;
  taskId?: string;
  taskTitle?: string;
  actorId: string;
  actorName: string;
  action:
    | 'PROJECT_CREATED'
    | 'TASK_GENERATED_BY_AI'
    | 'TASK_CREATED_MANUALLY'
    | 'TASK_UPDATED'
    | 'EVIDENCE_UPLOADED'
    | 'EVIDENCE_DELETED'
    | 'AI_VERIFICATION_COMPLETED'
    | 'HUMAN_REVIEW_APPROVED'
    | 'HUMAN_REVIEW_REJECTED'
    | 'HUMAN_REVIEW_REQUESTED_INFO'
    | 'REVERIFICATION_TRIGGERED'
    | 'AGENT_ORCHESTRATION_RUN';
  details: string;
  timestamp: string;
  integrityHash?: string;
}

export interface AIPlanGeneratedTask {
  title: string;
  description: string;
  acceptanceCriteria: string[];
  evidenceRequirements: string[];
  dependencies: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  verificationMethod: string;
}

export interface AIPlanResponse {
  projectName: string;
  summary: string;
  tasks: AIPlanGeneratedTask[];
  suggestedDeadline?: string;
  model: string;
  isSimulated: boolean;
}

// ---------------------------------------------------------------------------
// ADVANCED AGENT ORCHESTRATION TYPES
// ---------------------------------------------------------------------------

export type AgentRole =
  | 'PLANNING_AGENT'
  | 'VISUAL_INTELLIGENCE_AGENT'
  | 'COMPLIANCE_AGENT'
  | 'VERIFICATION_AGENT';

export interface AgentExecutionRecord {
  id: string;
  role: AgentRole;
  name: string;
  modelIdentifier: string;
  currentActivity: string;
  inputSummary: string;
  outputSummary: string;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'NEEDS_ATTENTION' | 'ERROR';
  processingDurationMs?: number;
  timestamp: string;
  errorState?: string | null;
  targetTaskId?: string;
  targetTaskTitle?: string;
}

// ---------------------------------------------------------------------------
// PREDICTIVE RISK INTELLIGENCE TYPES
// ---------------------------------------------------------------------------

export type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type RiskCategory =
  | 'SAFETY_COMPLIANCE'
  | 'TEMPORAL_DEADLINE'
  | 'EVIDENCE_GAP'
  | 'DEPENDENCY_BLOCKER'
  | 'UNCERTAIN_SIGNAL';

export interface RiskItem {
  id: string;
  category: RiskCategory;
  severity: RiskSeverity;
  title: string;
  explanation: string;
  recommendedAction: string;
  relatedTaskId?: string;
  relatedTaskTitle?: string;
  impactScore: number; // 0-100
  resolved?: boolean;
}

// ---------------------------------------------------------------------------
// TRUST LEDGER & CRYPTOGRAPHIC EVENT TYPES
// ---------------------------------------------------------------------------

export interface TrustLedgerEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  relatedTaskId?: string;
  relatedTaskTitle?: string;
  evidenceRef?: string;
  modelName?: string;
  result: string;
  integrityHash: string; // SHA-256 hash
  verifiedStatus: boolean;
}

// ---------------------------------------------------------------------------
// SPATIAL OPERATIONS DIGITAL TWIN TYPES
// ---------------------------------------------------------------------------

export interface SpatialZone {
  id: string;
  name: string;
  description: string;
  coordinates: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  color: string;
  taskId: string;
  status: TaskStatus;
  evidenceUrl: string;
  taskTitle: string;
}

