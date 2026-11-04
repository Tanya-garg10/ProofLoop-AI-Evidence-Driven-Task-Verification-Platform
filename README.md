<div align="center">

<br />

```
 ██████╗ ██████╗  ██████╗  ██████╗ ███████╗██╗      ██████╗  ██████╗ ██████╗
 ██╔══██╗██╔══██╗██╔═══██╗██╔═══██╗██╔════╝██║     ██╔═══██╗██╔═══██╗██╔══██╗
 ██████╔╝██████╔╝██║   ██║██║   ██║█████╗  ██║     ██║   ██║██║   ██║██████╔╝
 ██╔═══╝ ██╔══██╗██║   ██║██║   ██║██╔══╝  ██║     ██║   ██║██║   ██║██╔═══╝
 ██║     ██║  ██║╚██████╔╝╚██████╔╝██║     ███████╗╚██████╔╝╚██████╔╝██║
 ╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝     ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝
```

**THE EVIDENCE OS**

*From instructions to verified outcomes.*

---

![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-r187-000?style=flat-square&logo=three.js)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-Private-8B7CFF?style=flat-square)

</div>

---

## What is ProofLoop AI?

ProofLoop AI is an evidence-driven AI execution and verification platform. It transforms natural-language operational directives into measurable acceptance criteria, gathers real-world photographic evidence from field teams, and applies multi-agent AI inspection (SAM 3.1 segmentation + Gemini 3.8 Flash reasoning) to verify that required physical work has actually been completed — before anyone can mark it done.

> **Core Principle:** A task must never be marked verified just because someone clicked a checkbox.
> Verification requires empirical, photographic, cryptographically anchored evidence.

---

## Architecture

```
                       ┌──────────────────────────────┐
                       │    NATURAL LANGUAGE INPUT     │
                       │  "Arrange 50 chairs, mount    │
                       │   projector, clear exits..."  │
                       └──────────────┬───────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
   │  STAGE 01        │  │  STAGE 02        │  │  STAGE 03        │
   │  Planning Agent  │  │  Visual Intel    │  │  Compliance      │
   │                  │──│                  │──│  Agent           │
   │  Gemini 3.8      │  │  SAM 3.1 ViT-H  │  │                  │
   │  Flash           │  │  Segmentation    │  │  Zero-Fabrication│
   │                  │  │                  │  │  Guardrail       │
   └──────────────────┘  └──────────────────┘  └────────┬─────────┘
                                                        │
                                               ┌────────▼─────────┐
                                               │  STAGE 04        │
                                               │  Verification    │
                                               │  Agent           │
                                               │                  │
                                               │  SHA-256 Ledger  │
                                               │  Human Review    │
                                               └──────────────────┘
```

### The 4-Agent Pipeline

| Stage | Agent | Model | Responsibility |
|-------|-------|-------|----------------|
| 01 | **Planning Agent** | Gemini 3.8 Flash | Decomposes directives into discrete tasks with binary acceptance criteria and photographic evidence requirements |
| 02 | **Visual Intelligence Agent** | Meta SAM 3.1 ViT-H | Multi-object segmentation, bounding-box extraction, spatial coordinate computation, confidence scoring |
| 03 | **Compliance Agent** | Rule Engine v2.6 | Requirement-to-evidence corroboration, non-visual gap discovery, zero-fabrication guardrail enforcement |
| 04 | **Verification Agent** | Synthesis Protocol v3.1 | Verdict synthesis (VERIFIED / NEEDS_REVIEW), SHA-256 cryptographic ledger commit, human review routing |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript 7, Tailwind CSS 4, Framer Motion |
| **3D Engine** | Three.js r187 with OrbitControls |
| **Build** | Vite 8 with HMR |
| **Backend** | Express 4, Node.js with tsx runtime |
| **AI** | Google Gemini 3.8 Flash (`@google/genai`), Meta SAM 3.1 |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Upload** | Multer (multipart photo evidence) |
| **Fonts** | Space Grotesk (display), Inter (interface), JetBrains Mono (code/data) |

---

## Modules

### Command Center
Real-time operational intelligence dashboard. Project readiness index, multi-segment verification progress bar, attention-required task feed, AI engine telemetry, risk radar signals, and a rich audit timeline — all in an asymmetric editorial layout.

### Evidence Studio ★
The signature interface. A professional image-inspection workstation with a large central image viewer, SAM 3.1 bounding-box overlays with corner crosshairs, original/analyzed/side-by-side view switching, adjustable confidence threshold, right-side criteria inspector with pass/fail telemetry, uncertainty callouts, and a bottom evidence history strip.

### Agent Control Room
Connected 4-stage execution pipeline visualization. Each agent card shows model, status, and role. Below: filterable execution telemetry feed with input/output data boxes, latency metrics, and target task links.

### Spatial Operations Twin
Interactive 3D venue model (Three.js) with 5 physical zones — Registration, Seating, Stage, Emergency Egress, Wayfinding. Supports raycaster zone selection, camera angle presets (Overview / Stage / Entrance / Exit), and a 2D architectural blueprint fallback. Selecting a zone opens its linked task, evidence photo, and verification status.

### AI Planner
Natural-language directive input. Gemini 3.8 Flash decomposes instructions into structured task plans with acceptance criteria, evidence requirements, dependencies, and priority levels.

### Verification Center
Review queue for flagged tasks. Human reviewers (e.g. Dr. Sarah Chen, REVIEWER role) can approve, reject, or request more evidence. Every decision is stored alongside the AI result.

### Risk Radar
Deterministic risk scoring engine. Categorizes risks as `SAFETY_COMPLIANCE`, `UNCERTAIN_SIGNAL`, `EVIDENCE_GAP`, or `DEPENDENCY_BLOCKER`. Computes a composite risk index (0–100) and prescribes field actions.

### Trust Ledger
Tamper-evident audit trail. Every event (task creation, evidence upload, AI analysis, human review) is sealed with a SHA-256 hash. On-demand checksum verification. Filterable by actor, role, and action type.

### Reports
Printable executive operations compliance report with verification status breakdowns, risk summaries, and audit chain of custody.

### AI Connections
Engine status dashboard showing Gemini and SAM 3.1 connectivity, model versions, and provider health.

---

## Demo Scenario: College Tech Fest 2026

The application ships with a pre-loaded operational scenario:

| # | Task | Zone | Status | AI Finding |
|---|------|------|--------|------------|
| 1 | Arrange 50 conference chairs in main auditorium | `SEATING_ZONE` | ✅ VERIFIED | SAM 3.1 segmented 50 chairs in 5 rows of 10. Central aisle 2.4m clear. |
| 2 | Install main laser projector on ceiling mount | `PROJECTOR_STAGE` | ⚠️ NEEDS_REVIEW | Mount bracket detected with power LED active. HDMI signal transmission unverifiable from static photo. *Zero-fabrication guardrail triggered.* |
| 3 | Prepare registration desk with badge check-in | `REGISTRATION_ZONE` | ✅ VERIFIED | 200+ alphabetical badges detected, dual check-in laptops in position. |
| 4 | Ensure emergency exits remain unobstructed | `EMERGENCY_EGRESS` | ✅ VERIFIED | 3.2m corridor clear, illuminated ISO exit sign active, panic push-bars unencumbered. |
| 5 | Put up directional signs from campus entrance | `WAYFINDING_CORRIDORS` | 🟣 AWAITING_EVIDENCE | No field photographs uploaded yet. |

### Demo Users

| Name | Role | Purpose |
|------|------|---------|
| Elena Rostova | `ORGANIZER` | Creates projects, enters directives, reviews reports |
| Marcus Vance | `FIELD_INSPECTOR` | Uploads photographic evidence from the field |
| Dr. Sarah Chen | `REVIEWER` | Final human sign-off on AI-flagged verifications |

---

## API Reference

### Auth
```
POST /api/auth/register     — Register / auto-login
POST /api/auth/login         — Login by email or userId
GET  /api/auth/me            — Current user + demo user list
```

### Dashboard
```
GET  /api/dashboard/stats    — Aggregate verification metrics
```

### Projects
```
GET    /api/projects          — List all projects
POST   /api/projects          — Create project
GET    /api/projects/:id      — Get project details
PUT    /api/projects/:id      — Update project
DELETE /api/projects/:id      — Delete project
```

### Tasks & Evidence
```
GET  /api/projects/:id/tasks           — List tasks for project
POST /api/projects/:id/tasks           — Create task with criteria
PUT  /api/tasks/:id                     — Update task
POST /api/tasks/:id/evidence            — Upload photo evidence (multipart)
GET  /api/tasks/:id/evidence            — Get evidence items
POST /api/tasks/:id/verify              — Trigger AI verification pipeline
POST /api/tasks/:id/evidence/preset     — Upload preset demo evidence
```

### Multi-Agent Orchestration
```
GET  /api/agents/executions             — Agent execution telemetry
POST /api/agents/orchestrate            — Run 4-agent pipeline on task
```

### Risk Intelligence
```
GET  /api/intelligence/risks            — Deterministic risk scoring
```

### Trust Ledger
```
GET  /api/ledger/events                 — SHA-256 sealed audit events
POST /api/ledger/verify/:id             — Verify checksum integrity
```

### Spatial Twin
```
GET  /api/spatial/zones                 — 3D venue zone coordinates & linked tasks
```

### Human Review
```
POST /api/verification/:id/review      — Approve / Reject / Request More Evidence
```

### System
```
GET  /api/ai/status                     — AI engine connectivity status
POST /api/demo/reset                    — Reset to baseline demo state
```

---

## Getting Started

### Prerequisites
- **Node.js** ≥ 20
- **npm** or **pnpm**

### Environment Variables

Create a `.env` file in the project root:

```env
# Required for AI features (planning, verification, vision analysis)
GEMINI_API_KEY=your_gemini_api_key

# Optional
META_API_KEY=your_meta_api_key
JWT_SECRET=your_jwt_secret
```

> Without `GEMINI_API_KEY`, the platform runs in simulation mode using pre-seeded demo data.

### Install & Run

```bash
# Install dependencies
npm install

# Start development server (frontend + backend on port 3000)
npm run dev

# Production build
npm run build
npm start
```

Open **http://localhost:3000** in your browser.

---

## Project Structure

```
proofloop-ai/
├── server.ts                    # Express API server + Vite dev middleware
├── server/
│   ├── db.ts                    # In-memory JSON database with demo seed data
│   └── services/
│       ├── aiServices.ts        # Gemini 3.8 Flash + SAM 3.1 integration
│       ├── orchestrator.ts      # 4-agent pipeline orchestration engine
│       ├── riskEngine.ts        # Deterministic risk scoring engine
│       └── trustLedger.ts       # SHA-256 cryptographic audit ledger
├── src/
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # Root router + view state management
│   ├── index.css                # Design tokens, typography, grid utilities
│   ├── types/index.ts           # TypeScript type definitions
│   ├── lib/api.ts               # Frontend API client with error handling
│   ├── assets/images/           # Demo evidence photographs
│   └── components/
│       ├── ui/SharedComponents.tsx  # Design system primitives
│       ├── LandingPage.tsx          # Immersive editorial landing
│       ├── LandingHero3D.tsx        # Three.js 3D hero visualization
│       ├── NavigationRail.tsx       # Compact grouped nav rail
│       ├── CommandCenterView.tsx    # Operations dashboard
│       ├── VisualProofStudioView.tsx # ★ Evidence Studio workstation
│       ├── AgentControlRoomView.tsx  # 4-stage pipeline monitor
│       ├── SpatialOperationsTwinView.tsx # 3D/2D venue twin
│       ├── AIPlannerView.tsx         # Natural language planner
│       ├── VerificationCenterView.tsx # Verification results
│       ├── RiskRadarView.tsx         # Risk intelligence
│       ├── TrustLedgerView.tsx       # Cryptographic audit log
│       ├── ReviewQueueView.tsx       # Human review queue
│       ├── ReportsView.tsx           # Executive reports
│       ├── AIConnectionsView.tsx     # AI engine status
│       ├── ProjectsListView.tsx      # Workspace list
│       ├── ProjectWorkspace.tsx      # Single project detail
│       ├── TaskDetailModal.tsx       # Full task inspection modal
│       ├── CreateProjectModal.tsx    # New project modal
│       └── SettingsModal.tsx         # User / role switcher
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

---

## Design System

### Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#080A10` | Primary app background |
| Secondary | `#0D111B` | Card and panel backgrounds |
| Surface | `#121824` | Elevated surface elements |
| Elevated | `#192232` | Active states, higher elevation |
| Violet | `#8B7CFF` | Primary brand accent |
| Cyan | `#62DCEB` | Secondary accent, SAM 3.1 |
| Success | `#29D6A0` | Verified, passed, active |
| Warning | `#F2BB5B` | Needs review, uncertain |
| Danger | `#F16D7A` | Failed, critical risk |

### Typography

| Font | Weight | Usage |
|------|--------|-------|
| **Space Grotesk** | 400–700 | Display headings, section titles |
| **Inter** | 300–700 | Interface text, labels, body |
| **JetBrains Mono** | 400–600 | Data readouts, IDs, status badges, code |

---

## License

Private. All rights reserved.

---

<div align="center">

**ProofLoop AI** · The Evidence OS · 2026

*Powered by SAM 3.1 & Gemini 3.8 Flash*

</div>
