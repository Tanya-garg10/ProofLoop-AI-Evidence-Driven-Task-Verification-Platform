import type {
  Project,
  Task,
  EvidenceItem,
  VerificationResult,
  AuditLog,
  User,
  AIPlanResponse,
  AgentExecutionRecord,
  RiskItem,
  TrustLedgerEvent,
  SpatialZone,
} from '../types/index.js';

const API_BASE = '/api';

/**
 * Robust JSON API client helper that prevents SyntaxError when non-JSON (like HTML) is returned.
 */
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
  fallbackErrorMessage: string = 'Request failed'
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = new Headers(options?.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (netErr: any) {
    console.error(`Network fetch failed for ${url}:`, netErr);
    throw new Error(`Network error connecting to backend: ${netErr.message || fallbackErrorMessage}`);
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('application/json');

  if (!res.ok) {
    let errorDetail = '';
    if (isJson) {
      try {
        const errObj = await res.json();
        errorDetail = errObj.error || errObj.message;
      } catch {
        // ignore
      }
    } else {
      try {
        const text = await res.text();
        if (text.includes('<!doctype') || text.includes('<!DOCTYPE') || text.includes('<html')) {
          errorDetail = `Server returned HTML status page (${res.status} ${res.statusText})`;
        } else {
          errorDetail = text.slice(0, 150);
        }
      } catch {
        // ignore
      }
    }
    throw new Error(errorDetail || `${fallbackErrorMessage} (${res.status} ${res.statusText})`);
  }

  if (!isJson) {
    const text = await res.text().catch(() => '');
    console.warn(`Expected JSON from ${url} but received "${contentType}":`, text.slice(0, 200));
    throw new Error(`${fallbackErrorMessage}: Server responded with non-JSON content`);
  }

  try {
    return (await res.json()) as T;
  } catch (parseErr: any) {
    console.error(`JSON parse failed for response from ${url}:`, parseErr);
    throw new Error(`${fallbackErrorMessage}: Invalid JSON response format`);
  }
}

export async function fetchStats() {
  return apiRequest('/dashboard/stats', undefined, 'Failed to load stats');
}

export async function fetchProjects(): Promise<Project[]> {
  return apiRequest<Project[]>('/projects', undefined, 'Failed to load projects');
}

export async function fetchProject(id: string): Promise<Project> {
  return apiRequest<Project>(`/projects/${id}`, undefined, 'Failed to load project');
}

export async function createProject(name: string, description: string): Promise<Project> {
  return apiRequest<Project>(
    '/projects',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    },
    'Failed to create project'
  );
}

export async function deleteProject(id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/projects/${id}`, { method: 'DELETE' }, 'Failed to delete project');
}

export async function fetchProjectTasks(projectId: string): Promise<Task[]> {
  return apiRequest<Task[]>(`/projects/${projectId}/tasks`, undefined, 'Failed to load tasks');
}

export async function fetchTask(taskId: string): Promise<Task> {
  return apiRequest<Task>(`/tasks/${taskId}`, undefined, 'Failed to load task');
}

export async function createTask(projectId: string, taskData: Partial<Task>): Promise<Task> {
  return apiRequest<Task>(
    `/projects/${projectId}/tasks`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    },
    'Failed to create task'
  );
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  return apiRequest<Task>(
    `/tasks/${taskId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    },
    'Failed to update task'
  );
}

export async function deleteTask(taskId: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/tasks/${taskId}`, { method: 'DELETE' }, 'Failed to delete task');
}

export async function fetchTaskEvidence(taskId: string): Promise<EvidenceItem[]> {
  return apiRequest<EvidenceItem[]>(`/tasks/${taskId}/evidence`, undefined, 'Failed to load evidence');
}

export async function uploadEvidence(
  taskId: string,
  formData: FormData
): Promise<EvidenceItem> {
  return apiRequest<EvidenceItem>(
    `/tasks/${taskId}/evidence`,
    {
      method: 'POST',
      body: formData,
    },
    'Failed to upload evidence'
  );
}

export async function uploadPresetEvidence(
  taskId: string,
  presetUrl: string,
  fileName: string,
  locationNote?: string
): Promise<EvidenceItem> {
  return apiRequest<EvidenceItem>(
    `/tasks/${taskId}/evidence`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ presetUrl, fileName, locationNote }),
    },
    'Failed to attach evidence'
  );
}

export async function deleteEvidence(evidenceId: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/evidence/${evidenceId}`, { method: 'DELETE' }, 'Failed to delete evidence');
}

export async function triggerVerification(taskId: string): Promise<VerificationResult> {
  return apiRequest<VerificationResult>(
    `/tasks/${taskId}/verify`,
    { method: 'POST' },
    'Failed to run verification'
  );
}

export async function submitHumanReview(
  verificationId: string,
  decision: 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_EVIDENCE',
  notes: string
): Promise<VerificationResult> {
  return apiRequest<VerificationResult>(
    `/verification/${verificationId}/review`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ humanDecision: decision, reviewerNotes: notes }),
    },
    'Failed to submit review'
  );
}

export async function fetchAuditLogs(projectId: string): Promise<AuditLog[]> {
  return apiRequest<AuditLog[]>(`/projects/${projectId}/audit`, undefined, 'Failed to load audit logs');
}

export async function planInstructionsWithAI(
  instructions: string,
  context?: string,
  projectName?: string
): Promise<AIPlanResponse> {
  return apiRequest<AIPlanResponse>(
    '/ai/plan',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instructions, context, projectName }),
    },
    'AI Planner failed'
  );
}

export async function fetchProviders() {
  return apiRequest('/ai/providers', undefined, 'Failed to load provider status');
}

export async function resetDemoState() {
  return apiRequest('/demo/reset', { method: 'POST' }, 'Failed to reset demo state');
}

export async function fetchCurrentUser(): Promise<{ user: User; demoUsers: User[] }> {
  return apiRequest<{ user: User; demoUsers: User[] }>('/auth/me', undefined, 'Failed to fetch user');
}

export async function fetchAgentExecutions(): Promise<AgentExecutionRecord[]> {
  return apiRequest<AgentExecutionRecord[]>('/agents/executions', undefined, 'Failed to load agent executions');
}

export async function triggerAgentOrchestration(taskId?: string): Promise<{
  task: Task;
  verification: VerificationResult;
  executions: AgentExecutionRecord[];
}> {
  return apiRequest(
    '/agents/orchestrate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    },
    'Failed to run agent orchestration'
  );
}

export async function fetchRiskRadar(projectId?: string): Promise<{
  overallRiskScore: number;
  riskLevel: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  summary: string;
  risks: RiskItem[];
}> {
  const query = projectId ? `?projectId=${projectId}` : '';
  return apiRequest(`/intelligence/risks${query}`, undefined, 'Failed to load risk radar');
}

export async function fetchTrustLedger(projectId?: string): Promise<TrustLedgerEvent[]> {
  const query = projectId ? `?projectId=${projectId}` : '';
  return apiRequest<TrustLedgerEvent[]>(`/ledger/events${query}`, undefined, 'Failed to load trust ledger');
}

export async function verifyLedgerIntegrity(eventId: string): Promise<{
  eventId: string;
  verified: boolean;
  computedHash: string;
  expectedHash: string;
  algorithm: string;
  matches: boolean;
}> {
  return apiRequest(
    `/ledger/verify/${eventId}`,
    { method: 'POST' },
    'Failed to verify cryptographic integrity'
  );
}

export async function fetchSpatialZones(): Promise<{
  venueName: string;
  label: string;
  zones: SpatialZone[];
}> {
  return apiRequest('/spatial/zones', undefined, 'Failed to load spatial zones');
}

