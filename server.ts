import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { db, DEMO_USERS } from './server/db.js';
import { aiServiceManager } from './server/services/aiServices.js';
import { agentEngine } from './server/services/orchestrator.js';
import { riskEngine } from './server/services/riskEngine.js';
import { trustLedgerService } from './server/services/trustLedger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'proofloop_secret_dev_key_2026';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload directories exist
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure multer for evidence uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `evidence_${Date.now()}_${cleanName}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
});

// Authentication middleware helper
function getUserFromToken(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
      return db.getUserById(decoded.id);
    } catch {
      return null;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// API ROUTES
// ---------------------------------------------------------------------------

// 1. Auth routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    const token = jwt.sign({ id: existing.id, email: existing.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ user: existing, token });
  }

  const newUser = db.createUser({
    id: `user-${Date.now()}`,
    name,
    email,
    role: role || 'FIELD_INSPECTOR',
    createdAt: new Date().toISOString(),
  });

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ user: newUser, token });
});

app.post('/api/auth/login', (req, res) => {
  const { email, userId } = req.body;

  let user = userId ? db.getUserById(userId) : null;
  if (!user && email) {
    user = db.getUserByEmail(email);
  }

  if (!user) {
    // Default to the first demo user if not specified
    user = DEMO_USERS[0];
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ user, token });
});

app.get('/api/auth/me', (req, res) => {
  const user = getUserFromToken(req) || DEMO_USERS[0];
  return res.json({ user, demoUsers: DEMO_USERS });
});

// 2. Dashboard stats
app.get('/api/dashboard/stats', (_req, res) => {
  const stats = db.getDashboardStats();
  return res.json(stats);
});

// 3. Projects
app.get('/api/projects', (_req, res) => {
  const projects = db.getProjects();
  return res.json(projects);
});

app.post('/api/projects', (req, res) => {
  const { name, description } = req.body;
  const currentUser = getUserFromToken(req) || DEMO_USERS[0];

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const newProject = db.createProject({
    id: `proj-${Date.now()}`,
    name: name.trim(),
    description: description ? description.trim() : 'Operational verification project',
    ownerId: currentUser.id,
    ownerName: currentUser.name,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  db.logAudit({
    projectId: newProject.id,
    actorId: currentUser.id,
    actorName: currentUser.name,
    action: 'PROJECT_CREATED',
    details: `Created new project "${newProject.name}"`,
  });

  return res.status(201).json(newProject);
});

app.get('/api/projects/:id', (req, res) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  return res.json(project);
});

app.put('/api/projects/:id', (req, res) => {
  const updated = db.updateProject(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Project not found' });
  return res.json(updated);
});

app.delete('/api/projects/:id', (req, res) => {
  const ok = db.deleteProject(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Project not found' });
  return res.json({ success: true });
});

// 4. Tasks
app.get('/api/projects/:id/tasks', (req, res) => {
  const tasks = db.getTasksByProjectId(req.params.id);
  return res.json(tasks);
});

app.post('/api/projects/:id/tasks', (req, res) => {
  const { title, description, acceptanceCriteria, evidenceRequirements, dependencies, priority, assignedTo } = req.body;
  const currentUser = getUserFromToken(req) || DEMO_USERS[0];
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  if (!title) return res.status(400).json({ error: 'Task title is required' });

  const assignedUser = assignedTo ? db.getUserById(assignedTo) : currentUser;

  const newTask = db.createTask({
    id: `task-${Date.now()}`,
    projectId: req.params.id,
    title: title.trim(),
    description: description ? description.trim() : '',
    acceptanceCriteria: Array.isArray(acceptanceCriteria)
      ? acceptanceCriteria.map((c: any, idx: number) => ({
          id: `crit-${Date.now()}-${idx}`,
          text: typeof c === 'string' ? c : c.text,
          status: 'PENDING',
        }))
      : [
          {
            id: `crit-${Date.now()}-0`,
            text: 'Operational execution completed and verified with photographic evidence',
            status: 'PENDING',
          },
        ],
    evidenceRequirements: Array.isArray(evidenceRequirements) ? evidenceRequirements : ['Photographic evidence of completed work'],
    dependencies: Array.isArray(dependencies) ? dependencies : [],
    assignedTo: assignedUser?.id,
    assignedToName: assignedUser?.name,
    status: 'AWAITING_EVIDENCE',
    priority: priority || 'MEDIUM',
    evidenceCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  db.logAudit({
    projectId: project.id,
    taskId: newTask.id,
    taskTitle: newTask.title,
    actorId: currentUser.id,
    actorName: currentUser.name,
    action: 'TASK_CREATED_MANUALLY',
    details: `Added task "${newTask.title}" with ${newTask.acceptanceCriteria.length} acceptance criteria`,
  });

  return res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const currentUser = getUserFromToken(req) || DEMO_USERS[0];
  const updated = db.updateTask(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Task not found' });

  db.logAudit({
    projectId: updated.projectId,
    taskId: updated.id,
    taskTitle: updated.title,
    actorId: currentUser.id,
    actorName: currentUser.name,
    action: 'TASK_UPDATED',
    details: `Updated task details or criteria for "${updated.title}"`,
  });

  return res.json(updated);
});

app.get('/api/tasks/:id', (req, res) => {
  const task = db.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  return res.json(task);
});

app.get('/api/tasks', (req, res) => {
  const projectId = req.query.projectId as string | undefined;
  if (projectId) {
    return res.json(db.getTasksByProjectId(projectId));
  }
  const allProjects = db.getProjects();
  const allTasks = allProjects.flatMap((p) => db.getTasksByProjectId(p.id));
  return res.json(allTasks);
});

app.delete('/api/tasks/:id', (req, res) => {
  const task = db.getTaskById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const ok = db.deleteTask(req.params.id);
  return res.json({ success: ok });
});

// 5. AI Planning (Meta Muse Spark)
app.post('/api/ai/plan', async (req, res) => {
  try {
    const { instructions, context, projectName } = req.body;
    if (!instructions || !instructions.trim()) {
      return res.status(400).json({ error: 'Instructions are required' });
    }

    const plan = await aiServiceManager.planInstructions(
      instructions.trim(),
      context,
      projectName
    );

    return res.json(plan);
  } catch (err: any) {
    console.error('AI Planning error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate task plan' });
  }
});

// 6. Evidence upload & retrieval
app.get('/api/tasks/:id/evidence', (req, res) => {
  const items = db.getEvidenceByTaskId(req.params.id);
  return res.json(items);
});

app.post('/api/tasks/:id/evidence', upload.single('file'), async (req, res) => {
  try {
    const task = db.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const currentUser = getUserFromToken(req) || DEMO_USERS[1]; // default to field inspector
    let fileUrl = '';
    let fileName = '';
    let fileSize = 0;
    let fileType = 'image/jpeg';

    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileType = req.file.mimetype;
    } else if (req.body.presetUrl) {
      // Allow selecting or reusing generated demo image
      fileUrl = req.body.presetUrl;
      fileName = req.body.fileName || 'inspected_evidence.jpg';
      fileSize = 1500000;
    } else {
      return res.status(400).json({ error: 'No evidence file provided' });
    }

    // Run SAM 3.1 visual segmentation on the evidence
    const detections = await aiServiceManager.segmentImageEvidence(fileName, fileUrl, task.title);

    const evidenceItem = db.addEvidence({
      id: `ev-${Date.now()}`,
      taskId: task.id,
      projectId: task.projectId,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      uploadedBy: currentUser.id,
      uploadedByName: currentUser.name,
      uploadedAt: new Date().toISOString(),
      analysisStatus: 'ANALYZED',
      detections,
      metadata: {
        camera: req.body.camera || 'Field Lens Pro HD',
        resolution: '4K Standard',
        locationNote: req.body.locationNote || 'Inspection Site Primary Zone',
      },
    });

    db.logAudit({
      projectId: task.projectId,
      taskId: task.id,
      taskTitle: task.title,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'EVIDENCE_UPLOADED',
      details: `Uploaded evidence photo "${fileName}" (${(fileSize / (1024 * 1024)).toFixed(2)} MB). SAM 3.1 identified ${detections.length} key visual segments.`,
    });

    return res.status(201).json(evidenceItem);
  } catch (err: any) {
    console.error('Evidence upload error:', err);
    return res.status(500).json({ error: err.message || 'Failed to upload evidence' });
  }
});

app.delete('/api/evidence/:id', (req, res) => {
  const item = db.getEvidenceById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Evidence not found' });
  const currentUser = getUserFromToken(req) || DEMO_USERS[0];

  db.deleteEvidence(req.params.id);

  db.logAudit({
    projectId: item.projectId,
    taskId: item.taskId,
    actorId: currentUser.id,
    actorName: currentUser.name,
    action: 'EVIDENCE_DELETED',
    details: `Deleted evidence item "${item.fileName}"`,
  });

  return res.json({ success: true });
});

// 7. Verification Engine
app.get('/api/tasks/:id/verification', (req, res) => {
  const ver = db.getVerificationByTaskId(req.params.id);
  if (!ver) return res.status(404).json({ error: 'No verification record found' });
  return res.json(ver);
});

app.get('/api/verification/:id', (req, res) => {
  const ver = db.getVerificationById(req.params.id);
  if (!ver) return res.status(404).json({ error: 'Verification record not found' });
  return res.json(ver);
});

app.get('/api/verifications', (_req, res) => {
  const allProjects = db.getProjects();
  const allTasks = allProjects.flatMap((p) => db.getTasksByProjectId(p.id));
  const verifications = allTasks
    .map((t) => t.latestVerification)
    .filter(Boolean);
  return res.json(verifications);
});

app.post('/api/tasks/:id/verify', async (req, res) => {
  try {
    const task = db.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const evidenceItems = db.getEvidenceByTaskId(task.id);
    const currentUser = getUserFromToken(req) || DEMO_USERS[0];

    const verification = await aiServiceManager.verifyTaskEvidence(task, evidenceItems);
    db.addVerification(verification);

    db.logAudit({
      projectId: task.projectId,
      taskId: task.id,
      taskTitle: task.title,
      actorId: 'system-ai',
      actorName: 'Multimodal AI Verification Engine',
      action: 'AI_VERIFICATION_COMPLETED',
      details: `Evaluated ${task.acceptanceCriteria.length} acceptance criteria against ${evidenceItems.length} evidence file(s). Result: ${verification.aiStatus}.`,
    });

    return res.json(verification);
  } catch (err: any) {
    console.error('Verification error:', err);
    return res.status(500).json({ error: err.message || 'Verification execution failed' });
  }
});

// 8. Human Review
app.post('/api/verification/:id/review', (req, res) => {
  const { humanDecision, reviewerNotes } = req.body;
  if (!['APPROVED', 'REJECTED', 'REQUEST_MORE_EVIDENCE'].includes(humanDecision)) {
    return res.status(400).json({ error: 'Invalid human review decision' });
  }

  const currentUser = getUserFromToken(req) || DEMO_USERS[2]; // Default to Dr. Sarah Chen (Reviewer)

  const updated = db.updateVerificationReview(req.params.id, {
    humanDecision,
    reviewerNotes,
    reviewedBy: currentUser.id,
    reviewedByName: currentUser.name,
  });

  if (!updated) return res.status(404).json({ error: 'Verification not found' });

  const actionName =
    humanDecision === 'APPROVED'
      ? 'HUMAN_REVIEW_APPROVED'
      : humanDecision === 'REJECTED'
      ? 'HUMAN_REVIEW_REJECTED'
      : 'HUMAN_REVIEW_REQUESTED_INFO';

  db.logAudit({
    projectId: updated.projectId,
    taskId: updated.taskId,
    actorId: currentUser.id,
    actorName: currentUser.name,
    action: actionName,
    details: `Human reviewer ${currentUser.name} marked decision as ${humanDecision}. Notes: "${reviewerNotes || 'None'}"`,
  });

  return res.json(updated);
});

// 9. Audit Timeline
app.get('/api/projects/:id/audit', (req, res) => {
  const logs = db.getAuditLogsByProjectId(req.params.id);
  return res.json(logs);
});

// 10. AI Provider status
app.get('/api/ai/providers', (_req, res) => {
  return res.json(aiServiceManager.getProviderStatus());
});

// 11. Reset Demo Scenario
app.post('/api/demo/reset', (_req, res) => {
  const pristine = db.resetDemo();
  return res.json({ success: true, message: 'College Tech Fest demo state restored', data: pristine });
});

// 12. Advanced Agent Orchestration
app.get('/api/agents/executions', (_req, res) => {
  return res.json(agentEngine.getExecutions());
});

app.post('/api/agents/orchestrate', async (req, res) => {
  try {
    const { taskId } = req.body;
    const targetTaskId = taskId || db.getTasksByProjectId('proj-techfest-2026')[0]?.id;
    if (!targetTaskId) return res.status(400).json({ error: 'No task available to orchestrate' });

    const result = await agentEngine.orchestrateTaskVerification(targetTaskId);
    return res.json(result);
  } catch (err: any) {
    console.error('Agent orchestration error:', err);
    return res.status(500).json({ error: err.message || 'Agent orchestration failed' });
  }
});

// 13. Predictive Risk Intelligence
app.get('/api/intelligence/risks', (req, res) => {
  const projectId = req.query.projectId as string | undefined;
  const analysis = riskEngine.evaluateProjectRisks(projectId);
  return res.json(analysis);
});

// 14. Trust Ledger & Cryptographic Integrity
app.get('/api/ledger/events', (req, res) => {
  const projectId = req.query.projectId as string | undefined;
  const events = trustLedgerService.getLedgerEvents(projectId);
  return res.json(events);
});

app.post('/api/ledger/verify/:id', (req, res) => {
  const verification = trustLedgerService.verifyEventIntegrity(req.params.id);
  return res.json(verification);
});

// 15. Spatial Operations Twin Zones
app.get('/api/spatial/zones', (_req, res) => {
  const projectId = 'proj-techfest-2026';
  const tasks = db.getTasksByProjectId(projectId);

  const zones = [
    {
      id: 'REGISTRATION_ZONE',
      name: 'Main Atrium Registration Desk',
      description: 'Attendee check-in, badge trays, queue signage, and dual terminals.',
      coordinates: { x: -8, y: 0.5, z: 6 },
      dimensions: { width: 4, height: 1.2, depth: 2.5 },
      color: '#8B7CFF',
      taskId: 'task-reg-desk',
      status: tasks.find(t => t.id === 'task-reg-desk')?.status || 'VERIFIED',
      evidenceUrl: '/src/assets/images/demo_registration_desk_1793784150525.jpg',
      taskTitle: 'Prepare attendee registration desk',
    },
    {
      id: 'SEATING_ZONE',
      name: 'Auditorium Seating Matrix',
      description: '50 conference delegate chairs arranged in 5 symmetrical rows with 2.4m central egress aisle.',
      coordinates: { x: 0, y: 0.5, z: 0 },
      dimensions: { width: 8, height: 1, depth: 6 },
      color: '#28D6A0',
      taskId: 'task-chairs-50',
      status: tasks.find(t => t.id === 'task-chairs-50')?.status || 'VERIFIED',
      evidenceUrl: '/src/assets/images/demo_chairs_arranged_1793784151109.jpg',
      taskTitle: 'Arrange 50 conference chairs',
    },
    {
      id: 'PROJECTOR_STAGE',
      name: 'Stage AV & Laser Projector Rig',
      description: 'Ceiling mounted laser projector aligned to 200" projection screen. Live video feed unverified.',
      coordinates: { x: 0, y: 3.5, z: -7 },
      dimensions: { width: 6, height: 2.5, depth: 2 },
      color: '#F6BC58',
      taskId: 'task-projector',
      status: tasks.find(t => t.id === 'task-projector')?.status || 'NEEDS_REVIEW',
      evidenceUrl: '/src/assets/images/demo_projector_mounted_1793784151441.jpg',
      taskTitle: 'Install and align laser projector',
    },
    {
      id: 'EMERGENCY_EGRESS',
      name: 'South Egress & Fire Exit Doors',
      description: 'Emergency corridor with 3.2m unobstructed clearance and active ISO illuminated luminaire.',
      coordinates: { x: 9, y: 1.5, z: 2 },
      dimensions: { width: 3, height: 3, depth: 6 },
      color: '#28D6A0',
      taskId: 'task-emergency-exits',
      status: tasks.find(t => t.id === 'task-emergency-exits')?.status || 'VERIFIED',
      evidenceUrl: '/src/assets/images/demo_emergency_exit_1793784151652.jpg',
      taskTitle: 'Ensure emergency exits remain unobstructed',
    },
    {
      id: 'WAYFINDING_CORRIDORS',
      name: 'Campus Crossroads Wayfinding',
      description: 'Directional signage posts directing attendees from Gate 2 to East Auditorium.',
      coordinates: { x: -8, y: 1, z: -5 },
      dimensions: { width: 2, height: 2.5, depth: 2 },
      color: '#4DD9E8',
      taskId: 'task-directional-signs',
      status: tasks.find(t => t.id === 'task-directional-signs')?.status || 'AWAITING_EVIDENCE',
      evidenceUrl: '',
      taskTitle: 'Put up directional signs across campus',
    },
  ];

  return res.json({
    venueName: 'College Tech Fest 2026 — Conceptual Spatial Twin',
    label: 'Conceptual Layout (Not a measured BIM CAD model)',
    zones,
  });
});

// ---------------------------------------------------------------------------
// API 404 & ERROR HANDLING (Prevents Vite SPA fallback returning HTML for APIs)
// ---------------------------------------------------------------------------

// Any unmatched /api/* route must return JSON 404, never falling into Vite SPA index.html
app.all('/api/*', (req, res) => {
  return res.status(404).json({
    error: `API route not found: ${req.method} ${req.path}`,
    status: 404,
  });
});

// Express global API error middleware returning clean JSON
app.use('/api', (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  return res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
  });
});

// ---------------------------------------------------------------------------
// VITE MIDDLEWARE (DEV) & STATIC SERVE (PROD)
// ---------------------------------------------------------------------------

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ProofLoop AI server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
