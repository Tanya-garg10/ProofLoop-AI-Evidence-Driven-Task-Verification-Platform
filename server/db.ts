import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  User,
  Project,
  Task,
  EvidenceItem,
  VerificationResult,
  AuditLog,
  AIExecutionRecord,
} from '../src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = process.env.PROOFLOOP_DB_FILE
  ? path.resolve(process.env.PROOFLOOP_DB_FILE)
  : path.join(DATA_DIR, 'proofloop_db.json');

export interface DatabaseSchema {
  users: User[];
  projects: Project[];
  tasks: Task[];
  evidence: EvidenceItem[];
  verifications: VerificationResult[];
  auditLogs: AuditLog[];
  aiExecutions: AIExecutionRecord[];
}

export const DEMO_USERS: User[] = [
  {
    id: 'user-organizer',
    name: 'Elena Rostova',
    email: 'elena@eventloop.org',
    role: 'ORGANIZER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-inspector',
    name: 'Marcus Vance',
    email: 'marcus.v@fieldops.io',
    role: 'FIELD_INSPECTOR',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-reviewer',
    name: 'Dr. Sarah Chen',
    email: 'dr.chen@safetyaudit.org',
    role: 'REVIEWER',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
];

export function getInitialDemoState(): DatabaseSchema {
  const projectId = 'proj-techfest-2026';
  const now = new Date();
  const isoNow = now.toISOString();

  const tasks: Task[] = [
    {
      id: 'task-chairs-50',
      projectId,
      title: 'Arrange 50 conference chairs in main auditorium',
      description:
        'Set up exactly 50 comfortable delegate chairs in neat aligned rows facing the main presentation stage with adequate central aisle space.',
      acceptanceCriteria: [
        {
          id: 'crit-c1',
          text: 'At least 50 chairs are set up in the main presentation room',
          status: 'PASSED',
          finding: 'SAM 3.1 segmented 50 distinct chairs in 5 aligned rows of 10 with clear central walkway.',
          detectedObjects: ['Chairs (50 detected)', 'Central Aisle (2.4m clear)'],
        },
        {
          id: 'crit-c2',
          text: 'Chairs are arranged in symmetrical rows facing the front podium stage',
          status: 'PASSED',
          finding: 'Rows are straight, parallel, and oriented squarely toward the speaker dais.',
        },
        {
          id: 'crit-c3',
          text: 'Aisles are clear of tripping hazards or excess cabling',
          status: 'PASSED',
          finding: 'Polished floor surface is completely unobstructed in center and side aisles.',
        },
      ],
      evidenceRequirements: [
        'Wide-angle photograph of auditorium showing full seating layout from rear entrance',
        'Verification of row count and spacing',
      ],
      dependencies: [],
      assignedTo: 'user-inspector',
      assignedToName: 'Marcus Vance',
      status: 'VERIFIED',
      priority: 'HIGH',
      deadline: '2026-11-04T16:00:00.000Z',
      evidenceCount: 1,
      createdAt: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
      updatedAt: isoNow,
    },
    {
      id: 'task-projector',
      projectId,
      title: 'Install and align main presentation laser projector',
      description:
        'Mount high-definition laser projector to ceiling fixture above audience seating, connect HDMI trunk line, and test display alignment onto the 200" stage screen.',
      acceptanceCriteria: [
        {
          id: 'crit-p1',
          text: 'Laser projector is securely mounted to structural ceiling bracket',
          status: 'PASSED',
          finding: 'Ceiling mount bracket engaged with safety locking pins visible.',
          detectedObjects: ['Ceiling Bracket', 'Laser Projector Unit'],
        },
        {
          id: 'crit-p2',
          text: 'Projector is powered on and displaying operational standby lights',
          status: 'PASSED',
          finding: 'Three green LED status indicators are active on projector top panel.',
        },
        {
          id: 'crit-p3',
          text: 'Video signal feed from stage lectern transmits full 4K signal without flicker',
          status: 'UNCERTAIN',
          finding: 'Visual photo shows projector is powered, but still image cannot verify live signal transmission without test card video or audio feedback.',
          uncertaintyReason: 'Image confirms physical mounting & power LEDs, but cannot verify active signal integrity or audio-visual sync.',
        },
      ],
      evidenceRequirements: [
        'Photo of ceiling mount and power indicators',
        'Photo or video clip of test presentation pattern on stage screen',
      ],
      dependencies: [],
      assignedTo: 'user-inspector',
      assignedToName: 'Marcus Vance',
      status: 'NEEDS_REVIEW',
      priority: 'HIGH',
      deadline: '2026-11-04T14:30:00.000Z',
      evidenceCount: 1,
      createdAt: new Date(now.getTime() - 1000 * 60 * 170).toISOString(),
      updatedAt: isoNow,
    },
    {
      id: 'task-reg-desk',
      projectId,
      title: 'Prepare attendee registration and badge check-in desk',
      description:
        'Position registration counter in main foyer with check-in terminals, printed attendee badges arranged alphabetically, barcode scanner, and welcome banner.',
      acceptanceCriteria: [
        {
          id: 'crit-r1',
          text: 'Registration counter is staffed and ready in main atrium foyer',
          status: 'PASSED',
          finding: 'Dual check-in laptops operational and staff in position.',
          detectedObjects: ['Laptops (2)', 'Barcode Scanner (1)', 'Welcome Banner'],
        },
        {
          id: 'crit-r2',
          text: 'Attendee badges and lanyards are pre-sorted and clearly accessible',
          status: 'PASSED',
          finding: 'Badge trays organized by surname initial (A-L / M-Z) with lanyards ready.',
        },
        {
          id: 'crit-r3',
          text: 'Prominent directional signage points to Check-In and Visitor Badges',
          status: 'PASSED',
          finding: 'Two standing signs with directional arrows confirmed visible.',
        },
      ],
      evidenceRequirements: [
        'Photo of full registration counter with laptops and badge trays',
        'Close-up photo of directional queue signage',
      ],
      dependencies: [],
      assignedTo: 'user-organizer',
      assignedToName: 'Elena Rostova',
      status: 'VERIFIED',
      priority: 'MEDIUM',
      deadline: '2026-11-04T13:00:00.000Z',
      evidenceCount: 1,
      createdAt: new Date(now.getTime() - 1000 * 60 * 160).toISOString(),
      updatedAt: isoNow,
    },
    {
      id: 'task-emergency-exits',
      projectId,
      title: 'Ensure emergency exits and fire safety egress remain unobstructed',
      description:
        'Audit all primary and secondary emergency corridors leading from auditorium to external assembly areas. Verify crash bars operate and path is free of boxes, cables, or furniture.',
      acceptanceCriteria: [
        {
          id: 'crit-e1',
          text: 'Emergency egress corridor has at least 2.0 meters of unobstructed clearance',
          status: 'PASSED',
          finding: 'Polished corridor measured with 3.2m continuous clearance. No debris or equipment detected.',
          detectedObjects: ['Double Fire Doors', 'Illuminated Exit Sign'],
        },
        {
          id: 'crit-e2',
          text: 'Illuminated green emergency exit signage is active and visible from all approach angles',
          status: 'PASSED',
          finding: 'Standard ISO green running-person emergency exit lamp is illuminated directly above double doors.',
        },
        {
          id: 'crit-e3',
          text: 'Emergency push-bar mechanism is clear of padlocks or temporary security ties',
          status: 'PASSED',
          finding: 'Panic hardware crash bars are unencumbered and accessible.',
        },
      ],
      evidenceRequirements: [
        'Corridor wide-angle view showing path to exit doors',
        'Verification of illuminated exit luminaire',
      ],
      dependencies: [],
      assignedTo: 'user-inspector',
      assignedToName: 'Marcus Vance',
      status: 'VERIFIED',
      priority: 'HIGH',
      deadline: '2026-11-04T12:00:00.000Z',
      evidenceCount: 1,
      createdAt: new Date(now.getTime() - 1000 * 60 * 150).toISOString(),
      updatedAt: isoNow,
    },
    {
      id: 'task-directional-signs',
      projectId,
      title: 'Put up directional signs from campus entrance to auditorium',
      description:
        'Install clear wayfinding boards at Campus Gate 2, Parking Lot B, Science Center crossroads, and Elevator Lobby directing attendees to Tech Fest 2026.',
      acceptanceCriteria: [
        {
          id: 'crit-d1',
          text: 'Sign posted at campus main gate indicating Tech Fest entry',
          status: 'PENDING',
        },
        {
          id: 'crit-d2',
          text: 'Directional arrow pointing towards East Hall Auditorium at science crossroads',
          status: 'PENDING',
        },
        {
          id: 'crit-d3',
          text: 'Elevator lobby signage confirming floor 2 event venue',
          status: 'PENDING',
        },
      ],
      evidenceRequirements: [
        'Geotagged photographs of wayfinding signage at all 4 designated waypoints',
      ],
      dependencies: ['task-reg-desk'],
      assignedTo: 'user-inspector',
      assignedToName: 'Marcus Vance',
      status: 'AWAITING_EVIDENCE',
      priority: 'MEDIUM',
      deadline: '2026-11-04T17:00:00.000Z',
      evidenceCount: 0,
      createdAt: new Date(now.getTime() - 1000 * 60 * 140).toISOString(),
      updatedAt: isoNow,
    },
  ];

  const evidence: EvidenceItem[] = [
    {
      id: 'ev-chairs-1',
      taskId: 'task-chairs-50',
      projectId,
      fileUrl: '/src/assets/images/demo_chairs_arranged_1793784151109.jpg',
      fileName: 'auditorium_50_chairs_overview.jpg',
      fileType: 'image/jpeg',
      fileSize: 1420500,
      uploadedBy: 'user-inspector',
      uploadedByName: 'Marcus Vance',
      uploadedAt: new Date(now.getTime() - 1000 * 60 * 95).toISOString(),
      analysisStatus: 'ANALYZED',
      detections: [
        {
          id: 'det-c1',
          label: 'Seating Array (50 chairs)',
          confidence: 0.98,
          bbox: [5, 45, 90, 48],
          color: '#22C58B',
          attributes: { count: 50, rows: 5, cols: 10, alignment: 'Symmetrical' },
        },
        {
          id: 'det-c2',
          label: 'Central Aisle (Clear)',
          confidence: 0.99,
          bbox: [42, 45, 16, 52],
          color: '#7C8CFF',
          attributes: { widthMeters: 2.4, obstruction: 'None' },
        },
        {
          id: 'det-c3',
          label: 'Presentation Stage',
          confidence: 0.96,
          bbox: [38, 28, 25, 20],
          color: '#A78BFA',
        },
      ],
      metadata: {
        camera: 'Field Camera Pro (Sony A7 IV)',
        resolution: '4096x2730',
        locationNote: 'Auditorium East Wing - Entrance Doorway',
      },
    },
    {
      id: 'ev-projector-1',
      taskId: 'task-projector',
      projectId,
      fileUrl: '/src/assets/images/demo_projector_mounted_1793784151441.jpg',
      fileName: 'projector_mount_power_check.jpg',
      fileType: 'image/jpeg',
      fileSize: 1824000,
      uploadedBy: 'user-inspector',
      uploadedByName: 'Marcus Vance',
      uploadedAt: new Date(now.getTime() - 1000 * 60 * 85).toISOString(),
      analysisStatus: 'ANALYZED',
      detections: [
        {
          id: 'det-p1',
          label: 'Laser Projector Unit (Ceiling Mounted)',
          confidence: 0.97,
          bbox: [28, 5, 44, 45],
          color: '#F5B942',
          attributes: { mountType: 'Ceiling bracket', powerLed: 'Active Green' },
        },
        {
          id: 'det-p2',
          label: 'Projection Screen (Distant)',
          confidence: 0.92,
          bbox: [39, 52, 22, 18],
          color: '#7C8CFF',
          attributes: { state: 'Displaying logo standby' },
        },
      ],
      metadata: {
        camera: 'Field Inspection iPhone 15 Pro',
        resolution: '4032x3024',
        locationNote: 'Auditorium Row 4 Overhead',
      },
    },
    {
      id: 'ev-regdesk-1',
      taskId: 'task-reg-desk',
      projectId,
      fileUrl: '/src/assets/images/demo_registration_desk_1793784150525.jpg',
      fileName: 'registration_desk_checkin_prep.jpg',
      fileType: 'image/jpeg',
      fileSize: 1650300,
      uploadedBy: 'user-organizer',
      uploadedByName: 'Elena Rostova',
      uploadedAt: new Date(now.getTime() - 1000 * 60 * 75).toISOString(),
      analysisStatus: 'ANALYZED',
      detections: [
        {
          id: 'det-r1',
          label: 'Badge Trays (Alphabetical A-L & M-Z)',
          confidence: 0.96,
          bbox: [12, 65, 55, 30],
          color: '#22C58B',
          attributes: { preSorted: true, visibleCount: '200+ badges' },
        },
        {
          id: 'det-r2',
          label: 'Check-In Terminals (2 Laptops)',
          confidence: 0.98,
          bbox: [13, 56, 36, 25],
          color: '#7C8CFF',
        },
        {
          id: 'det-r3',
          label: 'Welcome & Directional Signage',
          confidence: 0.95,
          bbox: [56, 12, 38, 48],
          color: '#A78BFA',
        },
      ],
      metadata: {
        camera: 'Samsung Galaxy S24 Ultra',
        resolution: '4000x3000',
        locationNote: 'Main Campus Atrium West Foyer',
      },
    },
    {
      id: 'ev-emergency-1',
      taskId: 'task-emergency-exits',
      projectId,
      fileUrl: '/src/assets/images/demo_emergency_exit_1793784151652.jpg',
      fileName: 'emergency_corridor_audit_clear.jpg',
      fileType: 'image/jpeg',
      fileSize: 1290400,
      uploadedBy: 'user-inspector',
      uploadedByName: 'Marcus Vance',
      uploadedAt: new Date(now.getTime() - 1000 * 60 * 65).toISOString(),
      analysisStatus: 'ANALYZED',
      detections: [
        {
          id: 'det-e1',
          label: 'Illuminated Emergency Exit Sign (ISO)',
          confidence: 0.99,
          bbox: [68, 36, 6, 5],
          color: '#22C58B',
          attributes: { illuminated: true, compliant: 'ISO 7010' },
        },
        {
          id: 'det-e2',
          label: 'Double Emergency Fire Doors',
          confidence: 0.98,
          bbox: [62, 40, 16, 22],
          color: '#7C8CFF',
          attributes: { crashBarFree: true },
        },
        {
          id: 'det-e3',
          label: 'Unobstructed Hallway Egress (3.2m Width)',
          confidence: 0.99,
          bbox: [15, 50, 75, 48],
          color: '#22C58B',
          attributes: { obstacleCount: 0, clearWidthMeters: 3.2 },
        },
      ],
      metadata: {
        camera: 'Field Camera Pro (Sony A7 IV)',
        resolution: '4096x2730',
        locationNote: 'South Hallway Fire Exit 04',
      },
    },
  ];

  const verifications: VerificationResult[] = [
    {
      id: 'ver-chairs-1',
      taskId: 'task-chairs-50',
      projectId,
      evidenceIds: ['ev-chairs-1'],
      aiStatus: 'VERIFIED',
      aiExplanation:
        'Multimodal evidence corroboration confirmed all 3 acceptance criteria. SAM 3.1 segmented 50 distinct chairs arranged in 5 symmetrical rows facing stage. Clear central pathway detected without trip hazards.',
      uncertainty: {
        hasUncertainty: false,
      },
      criteriaResults: tasks[0].acceptanceCriteria,
      modelInformation: {
        plannerModel: 'Meta Muse Spark 1.3 (illustrative)',
        visionModel: 'Illustrative demo / Meta SAM 3.1 not run',
        segmentationModel: 'Meta Segment Anything Model 3.1 (SAM 3.1)',
        isSimulation: true,
        providerNote:
          'Segmentation masks generated by SAM 3.1; high-level logical reasoning synthesized through multimodal inspection engine.',
      },
      humanDecision: 'APPROVED',
      reviewerNotes: 'Verified by Dr. Chen in field walk inspection. Clean layout and fire lane compliance.',
      reviewedBy: 'user-reviewer',
      reviewedByName: 'Dr. Sarah Chen',
      reviewedAt: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
      createdAt: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
    },
    {
      id: 'ver-projector-1',
      taskId: 'task-projector',
      projectId,
      evidenceIds: ['ev-projector-1'],
      aiStatus: 'NEEDS_REVIEW',
      aiExplanation:
        'Physical mounting and power indicators confirmed via visual segmentation. However, acceptance criterion #3 ("Video signal feed from stage lectern transmits 4K signal") cannot be established solely from static photograph without live feed test verification.',
      uncertainty: {
        hasUncertainty: true,
        reason:
          'Photograph establishes projector presence and active standby LEDs, but cannot verify live HDMI signal continuity or test image presentation from presenter laptop.',
        missingInformation: [
          'Presenter laptop screen clone test confirmation',
          'Close-up photo of projection screen showing test graphic or desktop display',
        ],
      },
      criteriaResults: tasks[1].acceptanceCriteria,
      modelInformation: {
        plannerModel: 'Meta Muse Spark 1.3 (illustrative)',
        visionModel: 'Illustrative demo / Meta SAM 3.1 not run',
        segmentationModel: 'Meta Segment Anything Model 3.1 (SAM 3.1)',
        isSimulation: true,
        providerNote:
          'System adheres to zero-fabrication principle: insufficient evidence triggers explicit UNCERTAIN flag rather than false pass.',
      },
      humanDecision: 'PENDING',
      createdAt: new Date(now.getTime() - 1000 * 60 * 80).toISOString(),
    },
    {
      id: 'ver-regdesk-1',
      taskId: 'task-reg-desk',
      projectId,
      evidenceIds: ['ev-regdesk-1'],
      aiStatus: 'VERIFIED',
      aiExplanation:
        'All criteria satisfied. Laptops, badge organizers, and directional check-in signposts detected with high confidence in the front vestibule.',
      uncertainty: {
        hasUncertainty: false,
      },
      criteriaResults: tasks[2].acceptanceCriteria,
      modelInformation: {
        plannerModel: 'Meta Muse Spark 1.3 (illustrative)',
        visionModel: 'Illustrative demo / Meta SAM 3.1 not run',
        segmentationModel: 'Meta Segment Anything Model 3.1 (SAM 3.1)',
        isSimulation: true,
        providerNote: 'High visual confidence across all 3 criteria.',
      },
      humanDecision: 'APPROVED',
      reviewerNotes: 'Organized and ready for 9 AM badge collection.',
      reviewedBy: 'user-reviewer',
      reviewedByName: 'Dr. Sarah Chen',
      reviewedAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      createdAt: new Date(now.getTime() - 1000 * 60 * 70).toISOString(),
    },
    {
      id: 'ver-emergency-1',
      taskId: 'task-emergency-exits',
      projectId,
      evidenceIds: ['ev-emergency-1'],
      aiStatus: 'VERIFIED',
      aiExplanation:
        'Safety egress path completely unobstructed. Illuminated ISO emergency luminaire detected directly above doors. Crash bar mechanisms unobstructed.',
      uncertainty: {
        hasUncertainty: false,
      },
      criteriaResults: tasks[3].acceptanceCriteria,
      modelInformation: {
        plannerModel: 'Meta Muse Spark 1.3 (illustrative)',
        visionModel: 'Illustrative demo / Meta SAM 3.1 not run',
        segmentationModel: 'Meta Segment Anything Model 3.1 (SAM 3.1)',
        isSimulation: true,
        providerNote: 'Safety audit criteria verified with zero perimeter violations.',
      },
      humanDecision: 'APPROVED',
      reviewerNotes: 'Fire safety compliant. Corridor clear.',
      reviewedBy: 'user-reviewer',
      reviewedByName: 'Dr. Sarah Chen',
      reviewedAt: new Date(now.getTime() - 1000 * 60 * 20).toISOString(),
      createdAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'audit-1',
      projectId,
      actorId: 'user-organizer',
      actorName: 'Elena Rostova',
      action: 'PROJECT_CREATED',
      details: 'Created project "College Tech Fest Setup" with 5 core operational requirements.',
      timestamp: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
    },
    {
      id: 'audit-2',
      projectId,
      actorId: 'system-ai',
      actorName: 'Meta Muse Spark Planner',
      action: 'TASK_GENERATED_BY_AI',
      details:
        'Parsed operational instructions into 5 actionable tasks with 15 measurable acceptance criteria and evidence requirements.',
      timestamp: new Date(now.getTime() - 1000 * 60 * 179).toISOString(),
    },
    {
      id: 'audit-3',
      projectId,
      taskId: 'task-chairs-50',
      taskTitle: 'Arrange 50 conference chairs',
      actorId: 'user-inspector',
      actorName: 'Marcus Vance',
      action: 'EVIDENCE_UPLOADED',
      details: 'Uploaded photo evidence "auditorium_50_chairs_overview.jpg" (Sony A7 IV, 1.4 MB).',
      timestamp: new Date(now.getTime() - 1000 * 60 * 95).toISOString(),
    },
    {
      id: 'audit-4',
      projectId,
      taskId: 'task-chairs-50',
      taskTitle: 'Arrange 50 conference chairs',
      actorId: 'system-ai',
      actorName: 'Meta SAM 3.1 & Vision Engine',
      action: 'AI_VERIFICATION_COMPLETED',
      details: 'Evaluated evidence against 3 criteria. Status: VERIFIED. 50 chairs segmented.',
      timestamp: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
    },
    {
      id: 'audit-5',
      projectId,
      taskId: 'task-projector',
      taskTitle: 'Install laser projector',
      actorId: 'user-inspector',
      actorName: 'Marcus Vance',
      action: 'EVIDENCE_UPLOADED',
      details: 'Uploaded photo evidence "projector_mount_power_check.jpg" (iPhone 15 Pro, 1.8 MB).',
      timestamp: new Date(now.getTime() - 1000 * 60 * 85).toISOString(),
    },
    {
      id: 'audit-6',
      projectId,
      taskId: 'task-projector',
      taskTitle: 'Install laser projector',
      actorId: 'system-ai',
      actorName: 'Multimodal Verification Engine',
      action: 'AI_VERIFICATION_COMPLETED',
      details:
        'Evaluated evidence. Flagged UNCERTAIN for Criterion #3 (signal test unverified by static photo). Status: NEEDS_REVIEW.',
      timestamp: new Date(now.getTime() - 1000 * 60 * 80).toISOString(),
    },
    {
      id: 'audit-7',
      projectId,
      taskId: 'task-chairs-50',
      taskTitle: 'Arrange 50 conference chairs',
      actorId: 'user-reviewer',
      actorName: 'Dr. Sarah Chen',
      action: 'HUMAN_REVIEW_APPROVED',
      details: 'Reviewer approved verification result. Notes: "Verified in field walk inspection. Clean layout."',
      timestamp: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
    },
  ];

  const projects: Project[] = [
    {
      id: projectId,
      name: 'College Tech Fest Setup',
      description:
        'Operational preparation and safety verification for the Annual Engineering & Technology Symposium 2026.',
      ownerId: 'user-organizer',
      ownerName: 'Elena Rostova',
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
      updatedAt: isoNow,
      stats: {
        totalTasks: 5,
        verifiedTasks: 3,
        needsReviewTasks: 1,
        awaitingEvidenceTasks: 1,
        incompleteTasks: 0,
        completionPercentage: 60,
      },
    },
    {
      id: 'proj-cleanroom-audit',
      name: 'Bio-Robotics Cleanroom ISO-6 Audit',
      description:
        'Standard operational protocol verification for air handling, gowning compliance, and particulate sensor calibration.',
      ownerId: 'user-organizer',
      ownerName: 'Elena Rostova',
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
      stats: {
        totalTasks: 4,
        verifiedTasks: 4,
        needsReviewTasks: 0,
        awaitingEvidenceTasks: 0,
        incompleteTasks: 0,
        completionPercentage: 100,
      },
    },
  ];

  const demoTasks = tasks.map((task) => ({
    ...task,
    status: 'AWAITING_EVIDENCE' as const,
    evidenceCount: 0,
    latestVerification: undefined,
    acceptanceCriteria: task.acceptanceCriteria.map(({ id, text }) => ({
      id,
      text,
      status: 'PENDING' as const,
    })),
  }));
  const demoVerifications = verifications.map((verification) => ({
    ...verification,
    aiStatus: 'NEEDS_REVIEW' as const,
    aiExplanation: 'Illustrative seeded demo record. Run live evidence analysis for a real verification.',
    uncertainty: {
      hasUncertainty: true,
      reason: 'This seeded record was not produced by a live Meta Model API request.',
    },
    criteriaResults: verification.criteriaResults.map(({ id, text }) => ({
      id,
      text,
      status: 'PENDING' as const,
    })),
    humanDecision: 'PENDING' as const,
    reviewerNotes: undefined,
    reviewedBy: undefined,
    reviewedByName: undefined,
    reviewedAt: undefined,
    modelInformation: {
      ...verification.modelInformation,
      isSimulation: true,
      providerNote: 'Illustrative seeded demo record; not produced by a live Meta Model API request.',
    },
  }));
  const demoProjects = projects.map((project) => {
    const projectTasks = demoTasks.filter((task) => task.projectId === project.id);
    return {
      ...project,
      stats: {
        totalTasks: projectTasks.length,
        verifiedTasks: 0,
        needsReviewTasks: 0,
        awaitingEvidenceTasks: projectTasks.length,
        incompleteTasks: 0,
        completionPercentage: 0,
      },
    };
  });

  return {
    users: DEMO_USERS,
    projects: demoProjects,
    tasks: demoTasks,
    evidence: evidence.map((item) => ({
      ...item,
      analysisStatus: 'PENDING',
      detections: [],
    })),
    verifications: demoVerifications,
    auditLogs,
    aiExecutions: [],
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw) as Partial<DatabaseSchema>;
        const evidence = (data.evidence || []).map((item) => item.metadata?.analysisModel
          ? item
          : { ...item, analysisStatus: 'PENDING' as const, detections: [] });
        const evidenceById = new Map(evidence.map((item) => [item.id, item]));
        const verifications = (data.verifications || []).map((verification) => {
          const isLive = verification.evidenceIds.length > 0 &&
            verification.evidenceIds.every((id) => evidenceById.get(id)?.metadata?.analysisModel);
          return isLive
            ? verification
            : {
              ...verification,
              aiStatus: 'NEEDS_REVIEW' as const,
              aiExplanation: 'Legacy seeded demo record. Run live evidence analysis for a real verification.',
              uncertainty: {
                hasUncertainty: true,
                reason: 'This record was not produced by a live Meta Model API request.',
              },
              criteriaResults: verification.criteriaResults.map(({ id, text }) => ({
                id,
                text,
                status: 'PENDING' as const,
              })),
              humanDecision: 'PENDING' as const,
              reviewerNotes: undefined,
              reviewedBy: undefined,
              reviewedByName: undefined,
              reviewedAt: undefined,
              modelInformation: {
                ...verification.modelInformation,
                isSimulation: true,
                providerNote: 'Legacy seeded or simulated record; not produced by a live Meta Model API request.',
              },
            };
        });
        const tasks = (data.tasks || []).map((task) => {
          const hasLiveEvidence = evidence.some(
            (item) => item.taskId === task.id && Boolean(item.metadata?.analysisModel),
          );
          if (hasLiveEvidence) {
            return {
              ...task,
              latestVerification: verifications.find((item) => item.taskId === task.id),
            };
          }
          return {
            ...task,
            status: 'AWAITING_EVIDENCE' as const,
            evidenceCount: 0,
            latestVerification: undefined,
            acceptanceCriteria: task.acceptanceCriteria.map(({ id, text }) => ({
              id,
              text,
              status: 'PENDING' as const,
            })),
          };
        });
        const projects = (data.projects || []).map((project) => {
          const projectTasks = tasks.filter((task) => task.projectId === project.id);
          const verifiedTasks = projectTasks.filter((task) => task.status === 'VERIFIED').length;
          const needsReviewTasks = projectTasks.filter((task) => task.status === 'NEEDS_REVIEW').length;
          const awaitingEvidenceTasks = projectTasks.filter((task) => task.status === 'AWAITING_EVIDENCE').length;
          const totalTasks = projectTasks.length;
          return {
            ...project,
            stats: {
              totalTasks,
              verifiedTasks,
              needsReviewTasks,
              awaitingEvidenceTasks,
              incompleteTasks: totalTasks - verifiedTasks - needsReviewTasks - awaitingEvidenceTasks,
              completionPercentage: totalTasks ? Math.round((verifiedTasks / totalTasks) * 100) : 0,
            },
          };
        });
        const normalized = {
          ...data,
          evidence,
          verifications,
          tasks,
          projects,
          aiExecutions: data.aiExecutions || [],
        } as DatabaseSchema;
        if (JSON.stringify(data.evidence) !== JSON.stringify(evidence) ||
            JSON.stringify(data.verifications) !== JSON.stringify(verifications) ||
            JSON.stringify(data.tasks) !== JSON.stringify(tasks) ||
            JSON.stringify(data.projects) !== JSON.stringify(projects) ||
            !data.aiExecutions) {
          this.save(normalized);
        }
        return normalized;
      }
    } catch (err) {
      console.warn('Failed to load DB file, initializing fresh demo state:', err);
    }

    const initial = getInitialDemoState();
    this.save(initial);
    return initial;
  }

  private save(data?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public resetDemo(): DatabaseSchema {
    this.data = getInitialDemoState();
    this.save();
    return this.data;
  }

  public addAIExecution(execution: AIExecutionRecord): void {
    this.data.aiExecutions.unshift(execution);
    this.data.aiExecutions = this.data.aiExecutions.slice(0, 500);
    this.save();
  }

  public updateAIExecution(id: string, updates: Partial<AIExecutionRecord>): void {
    const index = this.data.aiExecutions.findIndex((entry) => entry.id === id);
    if (index === -1) return;
    this.data.aiExecutions[index] = { ...this.data.aiExecutions[index], ...updates };
    this.save();
  }

  public getAIExecutions(): AIExecutionRecord[] {
    return this.data.aiExecutions;
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // Projects
  public getProjects(): Project[] {
    // Recompute project stats dynamically
    return this.data.projects.map((proj) => {
      const projTasks = this.data.tasks.filter((t) => t.projectId === proj.id);
      const total = projTasks.length;
      const verified = projTasks.filter((t) => t.status === 'VERIFIED').length;
      const needsReview = projTasks.filter((t) => t.status === 'NEEDS_REVIEW').length;
      const awaiting = projTasks.filter((t) => t.status === 'AWAITING_EVIDENCE').length;
      const incomplete = projTasks.filter((t) => t.status === 'INCOMPLETE').length;

      return {
        ...proj,
        stats: {
          totalTasks: total,
          verifiedTasks: verified,
          needsReviewTasks: needsReview,
          awaitingEvidenceTasks: awaiting,
          incompleteTasks: incomplete,
          completionPercentage: total === 0 ? 0 : Math.round((verified / total) * 100),
        },
      };
    });
  }

  public getProjectById(id: string): Project | undefined {
    const list = this.getProjects();
    return list.find((p) => p.id === id);
  }

  public createProject(project: Project): Project {
    this.data.projects.unshift(project);
    this.save();
    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | null {
    const index = this.data.projects.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.data.projects[index] = {
      ...this.data.projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.projects[index];
  }

  public deleteProject(id: string): boolean {
    const prevLen = this.data.projects.length;
    this.data.projects = this.data.projects.filter((p) => p.id !== id);
    // cascade
    this.data.tasks = this.data.tasks.filter((t) => t.projectId !== id);
    this.data.evidence = this.data.evidence.filter((e) => e.projectId !== id);
    this.data.verifications = this.data.verifications.filter((v) => v.projectId !== id);
    this.data.auditLogs = this.data.auditLogs.filter((a) => a.projectId !== id);
    this.save();
    return this.data.projects.length < prevLen;
  }

  // Tasks
  public getTasksByProjectId(projectId: string): Task[] {
    return this.data.tasks
      .filter((t) => t.projectId === projectId)
      .map((task) => {
        const evCount = this.data.evidence.filter((e) => e.taskId === task.id).length;
        const latestVer = this.data.verifications
          .filter((v) => v.taskId === task.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        return {
          ...task,
          evidenceCount: evCount,
          latestVerification: latestVer || task.latestVerification,
        };
      });
  }

  public getTaskById(id: string): Task | undefined {
    const task = this.data.tasks.find((t) => t.id === id);
    if (!task) return undefined;
    const evCount = this.data.evidence.filter((e) => e.taskId === task.id).length;
    const latestVer = this.data.verifications
      .filter((v) => v.taskId === task.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    return {
      ...task,
      evidenceCount: evCount,
      latestVerification: latestVer || task.latestVerification,
    };
  }

  public createTask(task: Task): Task {
    this.data.tasks.push(task);
    this.save();
    return task;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | null {
    const index = this.data.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    this.data.tasks[index] = {
      ...this.data.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.getTaskById(id)!;
  }

  public deleteTask(id: string): boolean {
    const prevLen = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter((t) => t.id !== id);
    this.data.evidence = this.data.evidence.filter((e) => e.taskId !== id);
    this.data.verifications = this.data.verifications.filter((v) => v.taskId !== id);
    this.save();
    return this.data.tasks.length < prevLen;
  }

  // Evidence
  public getEvidenceByTaskId(taskId: string): EvidenceItem[] {
    return this.data.evidence.filter((e) => e.taskId === taskId);
  }

  public getEvidenceById(id: string): EvidenceItem | undefined {
    return this.data.evidence.find((e) => e.id === id);
  }

  public addEvidence(item: EvidenceItem): EvidenceItem {
    this.data.evidence.push(item);
    // update task status if currently awaiting evidence
    const task = this.data.tasks.find((t) => t.id === item.taskId);
    if (task && task.status === 'AWAITING_EVIDENCE') {
      task.status = 'NEEDS_REVIEW';
      task.updatedAt = new Date().toISOString();
    }
    this.save();
    return item;
  }

  public updateEvidence(id: string, updates: Partial<EvidenceItem>): EvidenceItem | null {
    const idx = this.data.evidence.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.data.evidence[idx] = { ...this.data.evidence[idx], ...updates };
    this.save();
    return this.data.evidence[idx];
  }

  public deleteEvidence(id: string): boolean {
    const prevLen = this.data.evidence.length;
    this.data.evidence = this.data.evidence.filter((e) => e.id !== id);
    this.save();
    return this.data.evidence.length < prevLen;
  }

  // Verifications
  public getVerificationByTaskId(taskId: string): VerificationResult | undefined {
    return this.data.verifications
      .filter((v) => v.taskId === taskId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }

  public getVerificationById(id: string): VerificationResult | undefined {
    return this.data.verifications.find((v) => v.id === id);
  }

  public addVerification(ver: VerificationResult): VerificationResult {
    this.data.verifications.unshift(ver);

    // Update task status and criteria
    const taskIndex = this.data.tasks.findIndex((t) => t.id === ver.taskId);
    if (taskIndex !== -1) {
      this.data.tasks[taskIndex].status = ver.aiStatus;
      this.data.tasks[taskIndex].acceptanceCriteria = ver.criteriaResults;
      this.data.tasks[taskIndex].latestVerification = ver;
      this.data.tasks[taskIndex].updatedAt = new Date().toISOString();
    }

    this.save();
    return ver;
  }

  public updateVerificationReview(
    id: string,
    review: {
      humanDecision: 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_EVIDENCE';
      reviewerNotes?: string;
      reviewedBy: string;
      reviewedByName: string;
    }
  ): VerificationResult | null {
    const idx = this.data.verifications.findIndex((v) => v.id === id);
    if (idx === -1) return null;

    const current = this.data.verifications[idx];
    const updated: VerificationResult = {
      ...current,
      humanDecision: review.humanDecision,
      reviewerNotes: review.reviewerNotes || current.reviewerNotes,
      reviewedBy: review.reviewedBy,
      reviewedByName: review.reviewedByName,
      reviewedAt: new Date().toISOString(),
    };

    this.data.verifications[idx] = updated;

    // Update parent task based on human review
    const taskIdx = this.data.tasks.findIndex((t) => t.id === current.taskId);
    if (taskIdx !== -1) {
      if (review.humanDecision === 'APPROVED') {
        this.data.tasks[taskIdx].status = 'VERIFIED';
      } else if (review.humanDecision === 'REJECTED') {
        this.data.tasks[taskIdx].status = 'INCOMPLETE';
      } else if (review.humanDecision === 'REQUEST_MORE_EVIDENCE') {
        this.data.tasks[taskIdx].status = 'AWAITING_EVIDENCE';
      }
      this.data.tasks[taskIdx].latestVerification = updated;
      this.data.tasks[taskIdx].updatedAt = new Date().toISOString();
    }

    this.save();
    return updated;
  }

  // Audit Logs
  public getAuditLogsByProjectId(projectId: string): AuditLog[] {
    return this.data.auditLogs
      .filter((l) => l.projectId === projectId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const entry: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(entry);
    this.save();
    return entry;
  }

  // Overall Stats
  public getDashboardStats() {
    const projects = this.getProjects();
    const tasks = this.data.tasks;
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const verifiedTasks = tasks.filter((t) => t.status === 'VERIFIED').length;
    const needsReviewTasks = tasks.filter((t) => t.status === 'NEEDS_REVIEW').length;
    const awaitingEvidenceTasks = tasks.filter((t) => t.status === 'AWAITING_EVIDENCE').length;
    const incompleteTasks = tasks.filter((t) => t.status === 'INCOMPLETE').length;

    const overallCompletion =
      totalTasks === 0 ? 0 : Math.round((verifiedTasks / totalTasks) * 100);

    const recentAudit = this.data.auditLogs.slice(0, 8);

    return {
      totalProjects,
      totalTasks,
      verifiedTasks,
      needsReviewTasks,
      awaitingEvidenceTasks,
      incompleteTasks,
      overallCompletion,
      projects,
      recentAudit,
    };
  }
}

export const db = new Database();
