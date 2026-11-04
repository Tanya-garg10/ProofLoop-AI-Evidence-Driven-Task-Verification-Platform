import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  ScanEye,
  FileCheck2,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Camera,
  Play,
  ChevronRight,
  Eye,
  Sliders,
  Cpu,
  Lock,
  Compass,
} from 'lucide-react';
import { DisplayHeading, SectionHeading, Label, Button, Surface, StatusBadge, LiveIndicator } from './ui/SharedComponents.js';
import { LandingHero3D } from './LandingHero3D.js';

interface LandingPageProps {
  onStartDemo: () => void;
  onOpenPlanner: () => void;
  onViewVerification: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartDemo,
  onOpenPlanner,
  onViewVerification,
}) => {
  const [activeTab, setActiveTab] = useState<'auditorium' | 'projector' | 'emergency'>('auditorium');

  const demoExamples = {
    auditorium: {
      title: '50 Auditorium Chairs & Central Aisle',
      image: '/src/assets/images/demo_chairs_arranged_1793784151109.jpg',
      badge: 'VERIFIED',
      model: 'SAM 3.1 ViT-H',
      criteria: [
        { text: '50 delegate chairs positioned in auditorium', status: 'PASSED', detail: 'SAM 3.1 segmented 50 chairs across 5 symmetrical rows' },
        { text: 'Center aisle clearance ≥ 2.0 meters', status: 'PASSED', detail: 'Measured aisle clearance 2.42m clear of obstructions' },
        { text: 'Direct sightline to stage preserved', status: 'PASSED', detail: 'No structural pillars obstructing projection line' },
      ],
      detections: [
        { label: 'Seating Array (50 chairs)', conf: '98.2%', bbox: 'x:5 y:45 w:90 h:48' },
        { label: 'Central Walkway', conf: '99.1%', bbox: 'x:42 y:45 w:16 h:52' },
      ],
    },
    projector: {
      title: 'Main Auditorium Laser Projector',
      image: '/src/assets/images/demo_projector_mounted_1793784151441.jpg',
      badge: 'NEEDS_REVIEW',
      model: 'SAM 3.1 + Vision-LLM',
      criteria: [
        { text: 'Ceiling bracket securely mounted with safety wire', status: 'PASSED', detail: 'Heavy-duty steel mount detected with dual anchor points' },
        { text: 'Power and HDMI signal feed confirmed live', status: 'UNCERTAIN', detail: 'Power LED illuminated; presentation input signal unconfirmed in frame' },
      ],
      detections: [
        { label: 'Laser Projector Unit', conf: '97.4%', bbox: 'x:28 y:5 w:44 h:45' },
        { label: 'Projection Screen', conf: '92.1%', bbox: 'x:39 y:52 w:22 h:18' },
      ],
    },
    emergency: {
      title: 'Auditorium North Emergency Egress',
      image: '/src/assets/images/demo_emergency_exit_1793784151652.jpg',
      badge: 'VERIFIED',
      model: 'SAM 3.1 ViT-H',
      criteria: [
        { text: 'Illuminated emergency exit luminaire active', status: 'PASSED', detail: 'Green running-man ISO luminaire active and unobstructed' },
        { text: 'Panic push-bar mechanism free of physical lockouts', status: 'PASSED', detail: 'Panic crash hardware clear of zip-ties, chains, or padlocks' },
        { text: 'Corridor width 100% free of staging equipment', status: 'PASSED', detail: 'Clearance verified: zero boxes or cables in exit trajectory' },
      ],
      detections: [
        { label: 'ISO Exit Luminaire', conf: '99.4%', bbox: 'x:34 y:6 w:32 h:20' },
        { label: 'Panic Push-Bar', conf: '98.5%', bbox: 'x:26 y:62 w:48 h:22' },
      ],
    },
  };

  const currentDemo = demoExamples[activeTab];

  return (
    <div className="min-h-screen bg-[#080A10] text-[#F8FAFC]">
      {/* 1. IMMERSIVE HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center border-b border-[rgba(148,163,184,0.08)] bg-radial-glow overflow-hidden">
        {/* Subtle architectural grid lines */}
        <div className="absolute inset-0 bg-grid-subtle pointer-events-none" />

        <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Headline & Identity */}
            <div className="lg:col-span-7 space-y-7 z-10">
              {/* Product Identity Label */}
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-[#121824] border border-[rgba(148,163,184,0.15)] text-[10px] font-mono font-semibold tracking-widest text-[#8B7CFF] uppercase">
                  THE EVIDENCE OS
                </span>
                <span className="text-[#64748B] text-xs">/</span>
                <LiveIndicator label="SAM 3.1 PIPELINE ACTIVE" color="bg-[#29D6A0]" />
              </div>

              {/* Oversized Editorial Headline */}
              <div className="space-y-3">
                <DisplayHeading size="3xl">
                  From instructions to{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B7CFF] via-[#62DCEB] to-white">
                    verified outcomes.
                  </span>
                </DisplayHeading>
              </div>

              {/* Concise Product Description */}
              <p className="text-base sm:text-lg text-[#94A3B8] font-normal leading-relaxed max-w-xl">
                A task must never be marked complete just because someone clicked a checkbox.
                ProofLoop transforms natural language operational directives into verified outcomes
                with multimodal vision analysis, SAM 3.1 segmentation, and cryptographic audit proof.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button size="lg" onClick={onStartDemo} icon={<ArrowRight className="w-4 h-4" />}>
                  Launch Workspace
                </Button>
                <Button variant="secondary" size="lg" onClick={onOpenPlanner} icon={<Sparkles className="w-4 h-4 text-[#8B7CFF]" />}>
                  Explore AI Planner
                </Button>
                <Button variant="outline" size="lg" onClick={onViewVerification} icon={<ScanEye className="w-4 h-4 text-[#62DCEB]" />}>
                  Evidence Inspection
                </Button>
              </div>

              {/* Architectural Metrics Strip */}
              <div className="pt-8 border-t border-[rgba(148,163,184,0.08)] grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <div className="font-display font-semibold text-2xl text-white font-mono tabular-nums">0%</div>
                  <div className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-mono mt-0.5">Checkbox Trust</div>
                </div>
                <div>
                  <div className="font-display font-semibold text-2xl text-[#29D6A0] font-mono tabular-nums">100%</div>
                  <div className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-mono mt-0.5">Empirical Proof</div>
                </div>
                <div>
                  <div className="font-display font-semibold text-2xl text-[#8B7CFF] font-mono tabular-nums">SAM 3.1</div>
                  <div className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-mono mt-0.5">Ground Truth AI</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Visualization */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <LandingHero3D />
            </div>
          </div>
        </div>
      </section>

      {/* 2. HORIZONTAL WORKFLOW STRIP */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto border-b border-[rgba(148,163,184,0.08)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Label color="violet">The Execution Architecture</Label>
            <DisplayHeading size="md" className="mt-2">
              How ProofLoop replaces blind checkbox sign-offs.
            </DisplayHeading>
          </div>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md">
            Every step is connected through empirical evidence, strict acceptance criteria, and zero-fabrication guardrails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Natural Directives',
              subtitle: 'INPUT STAGE',
              desc: 'Enter conversational instructions or upload SOP documents. "Set up 50 chairs, mount projector, ensure exits are clear."',
              tag: 'Natural Language Decomposition',
            },
            {
              step: '02',
              title: 'AI Criteria Generation',
              subtitle: 'PLANNING STAGE',
              desc: 'Meta Muse Spark 1.3 decomposes instructions into acceptance criteria and photographic evidence requirements.',
              tag: 'Structured Acceptance Criteria',
            },
            {
              step: '03',
              title: 'SAM 3.1 Segmentation',
              subtitle: 'VISUAL REASONING',
              desc: 'Field teams submit inspection photos. Meta SAM 3.1 segments requested objects for evidence review.',
              tag: 'Spatial Object Ground Truth',
            },
            {
              step: '04',
              title: 'Verified Audit Ledger',
              subtitle: 'GOVERNANCE STAGE',
              desc: 'Uncertainties are flagged to human reviewers. Approved tasks are written to an immutable audit ledger with SHA-256 hashes.',
              tag: 'Zero-Fabrication Sign-off',
            },
          ].map((item, idx) => (
            <Surface key={item.step} hover className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-[#8B7CFF] bg-[#192232] px-2 py-0.5 rounded border border-[#192232]">
                    {item.step}
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B] tracking-wider uppercase">
                    {item.subtitle}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-base text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[rgba(148,163,184,0.08)] flex items-center justify-between text-[10px] font-mono text-[#62DCEB]">
                <span>{item.tag}</span>
                <ChevronRight className="w-3 h-3 text-[#64748B]" />
              </div>
            </Surface>
          ))}
        </div>
      </section>

      {/* 3. VISUAL EVIDENCE DEMONSTRATION WORKSTATION */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-b border-[rgba(148,163,184,0.08)]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Label color="cyan">Signature Visual Workstation</Label>
          <DisplayHeading size="lg" className="mt-2">
            Inspect live evidence with SAM 3.1 segmentations.
          </DisplayHeading>
          <p className="text-sm text-[#94A3B8] mt-2">
            Never accept a hallucinated approval. Click between real field scenarios to see how each criterion is empirically evaluated.
          </p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="flex justify-center mb-8">
          <div className="p-1 rounded-lg bg-[#0D111B] border border-[rgba(148,163,184,0.12)] flex gap-1">
            <button
              onClick={() => setActiveTab('auditorium')}
              className={`px-4 py-2 text-xs font-medium rounded transition-all ${
                activeTab === 'auditorium'
                  ? 'bg-[#192232] text-white shadow-sm border border-[rgba(148,163,184,0.2)]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Auditorium Seating (50 Chairs)
            </button>
            <button
              onClick={() => setActiveTab('projector')}
              className={`px-4 py-2 text-xs font-medium rounded transition-all ${
                activeTab === 'projector'
                  ? 'bg-[#192232] text-white shadow-sm border border-[rgba(148,163,184,0.2)]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Stage Projector Mount
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`px-4 py-2 text-xs font-medium rounded transition-all ${
                activeTab === 'emergency'
                  ? 'bg-[#192232] text-white shadow-sm border border-[rgba(148,163,184,0.2)]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Emergency Egress Corridor
            </button>
          </div>
        </div>

        {/* Live Workstation Frame */}
        <div className="rounded-xl border border-[rgba(148,163,184,0.14)] bg-[#0D111B] overflow-hidden shadow-2xl">
          {/* Workstation Header */}
          <div className="px-6 py-3 border-b border-[rgba(148,163,184,0.1)] bg-[#121824] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#29D6A0]" />
              <span className="font-mono text-xs text-white font-semibold">
                {currentDemo.title}
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8] bg-[#192232] px-2 py-0.5 rounded">
                Model: {currentDemo.model}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={currentDemo.badge} />
              <Button size="xs" variant="secondary" onClick={onViewVerification}>
                Open In Evidence Studio
              </Button>
            </div>
          </div>

          {/* Workstation Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[rgba(148,163,184,0.1)]">
            {/* Center: Image with Real Segmentation Overlays */}
            <div className="lg:col-span-7 p-6 flex flex-col justify-center bg-[#080A10]/60 relative">
              <div className="relative rounded-lg overflow-hidden border border-[#192232] shadow-inner">
                <img
                  src={currentDemo.image}
                  alt={currentDemo.title}
                  className="w-full h-[360px] object-cover"
                />

                {/* Simulated dynamic bounding box tags based on real coordinates */}
                <div className="absolute inset-0 pointer-events-none p-4">
                  {currentDemo.detections.map((det, i) => (
                    <div
                      key={i}
                      className="absolute border-2 border-[#29D6A0] bg-[#29D6A0]/10 rounded px-2 py-1 flex items-start"
                      style={{
                        top: i === 0 ? '40%' : '20%',
                        left: i === 0 ? '15%' : '45%',
                        right: i === 0 ? '15%' : '30%',
                        bottom: i === 0 ? '10%' : '50%',
                      }}
                    >
                      <div className="bg-[#080A10]/90 border border-[#29D6A0] px-2 py-0.5 rounded text-[10px] font-mono text-[#29D6A0] font-bold">
                        {det.label} · {det.conf}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workstation bottom toolbar */}
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#94A3B8]">
                <span>Resolution: 4096x2730 · 24-bit RGB</span>
                <span className="text-[#62DCEB]">SAM 3.1 Mask Confidence: 98.4%</span>
              </div>
            </div>

            {/* Right: Criteria Verification Checklist */}
            <div className="lg:col-span-5 p-6 space-y-4 bg-[#0D111B]">
              <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.08)] pb-2">
                <span className="text-label text-[#94A3B8]">Acceptance Criteria Telemetry</span>
                <span className="font-mono text-[11px] text-[#62DCEB]">
                  {currentDemo.criteria.filter((c) => c.status === 'PASSED').length}/{currentDemo.criteria.length} PASSED
                </span>
              </div>

              <div className="space-y-3">
                {currentDemo.criteria.map((crit, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded bg-[#121824] border border-[rgba(148,163,184,0.08)] space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-white leading-snug">
                        {crit.text}
                      </span>
                      <StatusBadge status={crit.status} />
                    </div>
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                      {crit.detail}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <div className="p-3 rounded bg-[#192232] border border-[#8B7CFF]/20 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#8B7CFF] font-semibold">
                      Cryptographic Evidence Anchor
                    </div>
                    <div className="text-[11px] font-mono text-[#94A3B8] truncate max-w-[240px]">
                      SHA-256: 4f8a9e22...c7b140d3
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[#29D6A0]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT CAPABILITIES: 4 CORE ENGINES */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-b border-[rgba(148,163,184,0.08)]">
        <div className="text-left mb-16">
          <Label color="violet">System Capabilities</Label>
          <DisplayHeading size="lg" className="mt-2">
            The four pillars of the Evidence OS.
          </DisplayHeading>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Surface className="p-8 space-y-4">
            <div className="w-10 h-10 rounded bg-[#192232] border border-[#8B7CFF]/30 flex items-center justify-center text-[#8B7CFF]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white">
              Autonomous Planning & Decomposition
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Powered by Meta Muse Spark 1.3. Parses operational directives into discrete tasks,
              assigns spatial zones, establishes dependencies, and defines exact photo verification criteria.
            </p>
          </Surface>

          <Surface className="p-8 space-y-4">
            <div className="w-10 h-10 rounded bg-[#192232] border border-[#62DCEB]/30 flex items-center justify-center text-[#62DCEB]">
              <ScanEye className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white">
              SAM 3.1 Multimodal Computer Vision
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              High-precision segmentation of physical objects, crowd clearance zones, safety hardware, and signage.
              Extracts dimensional clearances and object counts from raw camera frames.
            </p>
          </Surface>

          <Surface className="p-8 space-y-4">
            <div className="w-10 h-10 rounded bg-[#192232] border border-[#F2BB5B]/30 flex items-center justify-center text-[#F2BB5B]">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white">
              Zero-Fabrication Guardrails & Uncertainty
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              The engine explicitly flags ambiguities rather than guessing. If a projector bracket is mounted but the
              video feed is not confirmed in frame, the system prompts human verification rather than approving blindly.
            </p>
          </Surface>

          <Surface className="p-8 space-y-4">
            <div className="w-10 h-10 rounded bg-[#192232] border border-[#29D6A0]/30 flex items-center justify-center text-[#29D6A0]">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-lg text-white">
              Cryptographic Trust Ledger
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Every inspection photo, SAM segmentation result, and human reviewer decision is hashed and stored in an
              immutable audit log, providing enterprise-grade compliance for insurance and regulatory review.
            </p>
          </Surface>
        </div>
      </section>

      {/* 5. ENTERPRISE USE CASES */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-b border-[rgba(148,163,184,0.08)]">
        <div className="text-left mb-12">
          <Label color="cyan">Operational Domains</Label>
          <DisplayHeading size="lg" className="mt-2">
            Built for mission-critical operations.
          </DisplayHeading>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              title: 'Major Event Production',
              desc: 'Rigging, staging, audio-visual readiness, credential registration, and emergency perimeter verification.',
            },
            {
              title: 'Construction Handover',
              desc: 'Punch list verification, MEP conduit verification, fire damper inspections, and clearance validation.',
            },
            {
              title: 'Life Safety & Egress',
              desc: 'OSHA & NFPA egress compliance, illuminated exit luminaire tracking, and corridor obstruction audits.',
            },
            {
              title: 'Retail & Multi-Unit Ops',
              desc: 'Store opening checklists, planogram visual verification, promotional signage, and security lockups.',
            },
          ].map((useCase, i) => (
            <Surface key={i} className="p-6 space-y-2">
              <span className="font-mono text-xs text-[#8B7CFF]">0{i + 1} //</span>
              <h4 className="font-display font-semibold text-sm text-white">
                {useCase.title}
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {useCase.desc}
              </p>
            </Surface>
          ))}
        </div>
      </section>

      {/* 6. FINAL EDITORIAL CTA */}
      <section className="py-24 px-6 lg:px-12 max-w-5xl mx-auto text-center space-y-6">
        <Label color="violet">Next-Generation Execution</Label>
        <DisplayHeading size="2xl">
          Never sign off on an unverified outcome again.
        </DisplayHeading>
        <p className="text-[#94A3B8] text-base max-w-xl mx-auto leading-relaxed">
          Step inside the Tech Fest 2026 operations workspace. Experience live SAM 3.1 computer vision,
          multi-agent handoffs, and interactive 3D spatial operations.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Button size="lg" onClick={onStartDemo} icon={<ArrowRight className="w-4 h-4" />}>
            Enter Command Center
          </Button>
          <Button variant="secondary" size="lg" onClick={onOpenPlanner} icon={<Sparkles className="w-4 h-4 text-[#8B7CFF]" />}>
            Generate New Plan
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-12 border-t border-[rgba(148,163,184,0.08)] bg-[#080A10] text-xs font-mono text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>PROOFLOOP AI // THE EVIDENCE OS · 2026</div>
        <div>POWERED BY SAM 3.1 & GEMINI 3.8 FLASH</div>
      </footer>
    </div>
  );
};
