import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Layers,
  Info,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Camera,
  Maximize2,
  Eye,
  RefreshCw,
  X,
  Compass,
  MapPin,
  ScanEye,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { fetchSpatialZones } from '../lib/api.js';
import {
  DisplayHeading,
  SectionHeading,
  Label,
  Button,
  Surface,
  StatusBadge,
  LiveIndicator,
} from './ui/SharedComponents.js';

interface SpatialZone {
  id: string;
  name: string;
  description: string;
  coordinates: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  color: string;
  taskId: string;
  status: 'VERIFIED' | 'NEEDS_REVIEW' | 'AWAITING_EVIDENCE' | 'INCOMPLETE';
  evidenceUrl: string;
  taskTitle: string;
}

interface SpatialOperationsTwinViewProps {
  onOpenTask: (taskId: string) => void;
}

export const SpatialOperationsTwinView: React.FC<SpatialOperationsTwinViewProps> = ({
  onOpenTask,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [zones, setZones] = useState<SpatialZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<SpatialZone | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayMode, setDisplayMode] = useState<'3D_TWIN' | '2D_SCHEMATIC'>('3D_TWIN');
  const [viewAngle, setViewAngle] = useState<'OVERVIEW' | 'STAGE' | 'ENTRANCE' | 'EXIT'>('OVERVIEW');
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    fetchSpatialZones()
      .then((data) => {
        setZones(data.zones);
        if (data.zones.length > 0) {
          setSelectedZone(data.zones[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Three.js 3D Viewport Setup
  useEffect(() => {
    if (displayMode !== '3D_TWIN') return;
    const container = mountRef.current;
    if (!container) return;

    // Detect software rendering
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#080A10');
    scene.fog = new THREE.FogExp2('#080A10', 0.02);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 16, 22);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 45;
    controls.target.set(0, 1, 0);
    controlsRef.current = controls;

    // Architectural Lighting
    const hemiLight = new THREE.HemisphereLight('#8B7CFF', '#0D111B', 0.85);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#F8FAFC', 1.3);
    dirLight.position.set(12, 20, 10);
    if (!isSoftwareGl) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.bias = -0.0005;
    }
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight('#62DCEB', 0.2);
    scene.add(ambientLight);

    // Floor and Grid
    const floorGeo = new THREE.PlaneGeometry(38, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#0D111B',
      roughness: 0.85,
      metalness: 0.15,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(38, 38, '#8B7CFF', '#192232');
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Interactive Meshes
    const interactiveMeshes: THREE.Mesh[] = [];

    const createZoneMat = (colorHex: string, isSelected: boolean) =>
      new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.35,
        metalness: 0.2,
        emissive: isSelected ? colorHex : '#000000',
        emissiveIntensity: isSelected ? 0.35 : 0.05,
        transparent: true,
        opacity: 0.9,
      });

    // 1. Registration Desk
    const regGroup = new THREE.Group();
    regGroup.position.set(-8, 0, 6);
    const regDesk = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.1, 1.8), createZoneMat('#8B7CFF', false));
    regDesk.position.y = 0.55;
    regDesk.castShadow = true;
    (regDesk as any).zoneId = 'REGISTRATION_ZONE';
    interactiveMeshes.push(regDesk);
    regGroup.add(regDesk);

    const laptop1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.4), new THREE.MeshStandardMaterial({ color: '#F8FAFC' }));
    laptop1.position.set(-1, 1.15, 0);
    const laptop2 = laptop1.clone();
    laptop2.position.set(1, 1.15, 0);
    regGroup.add(laptop1, laptop2);
    scene.add(regGroup);

    // 2. Seating Area (50 Chairs)
    const seatingGroup = new THREE.Group();
    seatingGroup.position.set(0, 0, 0);
    const seatingBound = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.2, 7.5), createZoneMat('#29D6A0', false));
    seatingBound.position.y = 0.1;
    (seatingBound as any).zoneId = 'SEATING_ZONE';
    interactiveMeshes.push(seatingBound);
    seatingGroup.add(seatingBound);

    const chairGeo = new THREE.BoxGeometry(0.45, 0.5, 0.45);
    const chairMat = new THREE.MeshStandardMaterial({ color: '#192232', roughness: 0.7 });
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 10; c++) {
        const xOffset = c < 5 ? c * 0.75 - 3.8 : c * 0.75 - 3.0;
        const zOffset = r * 1.2 - 2.4;
        const chair = new THREE.Mesh(chairGeo, chairMat);
        chair.position.set(xOffset, 0.35, zOffset);
        chair.castShadow = true;
        seatingGroup.add(chair);
      }
    }
    scene.add(seatingGroup);

    // 3. Stage & Laser Projector
    const stageGroup = new THREE.Group();
    stageGroup.position.set(0, 0, -7.5);
    const stagePlatform = new THREE.Mesh(new THREE.BoxGeometry(11, 0.8, 3.5), createZoneMat('#F2BB5B', false));
    stagePlatform.position.y = 0.4;
    (stagePlatform as any).zoneId = 'PROJECTOR_STAGE';
    interactiveMeshes.push(stagePlatform);
    stageGroup.add(stagePlatform);

    const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(7, 3.8, 0.1), new THREE.MeshStandardMaterial({ color: '#E2E8F0', emissive: '#8B7CFF', emissiveIntensity: 0.15 }));
    screenMesh.position.set(0, 2.7, -1.5);
    stageGroup.add(screenMesh);

    const trussBar = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 0.2), new THREE.MeshStandardMaterial({ color: '#64748B' }));
    trussBar.position.set(0, 5.5, 3.5);
    const projectorUnit = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.9), new THREE.MeshStandardMaterial({ color: '#080A10', metalness: 0.8 }));
    projectorUnit.position.set(0, 5.1, 3.5);
    const lensLight = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), new THREE.MeshBasicMaterial({ color: '#62DCEB' }));
    lensLight.position.set(0, 5.0, 3.0);
    stageGroup.add(trussBar, projectorUnit, lensLight);
    scene.add(stageGroup);

    // 4. Emergency Egress Corridor
    const exitGroup = new THREE.Group();
    exitGroup.position.set(9.5, 0, 2);
    const corridorFloor = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 8.5), createZoneMat('#29D6A0', false));
    corridorFloor.position.y = 0.05;
    (corridorFloor as any).zoneId = 'EMERGENCY_EGRESS';
    interactiveMeshes.push(corridorFloor);
    exitGroup.add(corridorFloor);

    const fireDoors = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.8, 0.15), new THREE.MeshStandardMaterial({ color: '#334155' }));
    fireDoors.position.set(0, 1.4, 4);
    const exitSign = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.1), new THREE.MeshBasicMaterial({ color: '#29D6A0' }));
    exitSign.position.set(0, 3.0, 4);
    exitGroup.add(fireDoors, exitSign);
    scene.add(exitGroup);

    // 5. Wayfinding Signpost
    const wayfindingGroup = new THREE.Group();
    wayfindingGroup.position.set(-8.5, 0, -4);
    const wayfindingBase = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.15), createZoneMat('#62DCEB', false));
    wayfindingBase.position.y = 0.08;
    (wayfindingBase as any).zoneId = 'WAYFINDING_CORRIDORS';
    interactiveMeshes.push(wayfindingBase);
    wayfindingGroup.add(wayfindingBase);

    const postPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2), new THREE.MeshStandardMaterial({ color: '#94A3B8' }));
    postPole.position.set(0, 1.6, 0);
    const arrow1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.05), new THREE.MeshStandardMaterial({ color: '#62DCEB' }));
    arrow1.position.set(0.3, 2.6, 0);
    wayfindingGroup.add(postPole, arrow1);
    scene.add(wayfindingGroup);

    // Raycaster selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as any;
        const match = zones.find((z) => z.id === hit.zoneId);
        if (match) setSelectedZone(match);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.dispose();
      controls.dispose();
    };
  }, [zones, displayMode]);

  const handleAngleChange = (angle: 'OVERVIEW' | 'STAGE' | 'ENTRANCE' | 'EXIT') => {
    setViewAngle(angle);
    if (!controlsRef.current || !cameraRef.current) return;
    const ctrl = controlsRef.current;
    const cam = cameraRef.current;

    switch (angle) {
      case 'OVERVIEW':
        cam.position.set(0, 16, 22);
        ctrl.target.set(0, 1, 0);
        break;
      case 'STAGE':
        cam.position.set(0, 6, -1);
        ctrl.target.set(0, 2, -7.5);
        break;
      case 'ENTRANCE':
        cam.position.set(-8, 5, 14);
        ctrl.target.set(-8, 1, 6);
        break;
      case 'EXIT':
        cam.position.set(14, 5, 2);
        ctrl.target.set(9.5, 1, 2);
        break;
    }
    ctrl.update();
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[rgba(148,163,184,0.08)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-[#8B7CFF] uppercase bg-[#121824] px-2 py-0.5 rounded border border-[#8B7CFF]/20">
              SPATIAL OPERATIONS TWIN // 2D & 3D VENUE MODEL
            </span>
            <LiveIndicator label="5 PHYSICAL ZONES LINKED" color="bg-[#29D6A0]" />
          </div>
          <DisplayHeading size="lg">East Auditorium Spatial Operations</DisplayHeading>
        </div>

        {/* 2D / 3D Switcher & Camera Angles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 2D / 3D Toggle */}
          <div className="flex items-center p-0.5 bg-[#0D111B] border border-[rgba(148,163,184,0.12)] rounded text-xs font-mono">
            <button
              onClick={() => setDisplayMode('3D_TWIN')}
              className={`px-3 py-1 rounded transition-all ${
                displayMode === '3D_TWIN'
                  ? 'bg-[#192232] text-white font-semibold text-[#8B7CFF]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              3D Venue Twin
            </button>
            <button
              onClick={() => setDisplayMode('2D_SCHEMATIC')}
              className={`px-3 py-1 rounded transition-all ${
                displayMode === '2D_SCHEMATIC'
                  ? 'bg-[#192232] text-white font-semibold text-[#62DCEB]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              2D Architectural Map
            </button>
          </div>

          {/* Camera Angles (if 3D active) */}
          {displayMode === '3D_TWIN' && (
            <div className="flex items-center gap-1 p-0.5 bg-[#0D111B] border border-[rgba(148,163,184,0.12)] rounded text-xs font-mono">
              {(['OVERVIEW', 'STAGE', 'ENTRANCE', 'EXIT'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => handleAngleChange(a)}
                  className={`px-2.5 py-1 rounded transition-all ${
                    viewAngle === a
                      ? 'bg-[#192232] text-white font-semibold'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Direct Zone Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-[#64748B] text-[10px] uppercase shrink-0">SELECT ZONE:</span>
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => setSelectedZone(z)}
            className={`px-3 py-1.5 rounded transition-all shrink-0 flex items-center gap-2 border ${
              selectedZone?.id === z.id
                ? 'bg-[#192232] text-white border-[#8B7CFF]/50 shadow-[0_0_12px_rgba(139,124,255,0.2)]'
                : 'bg-[#121824] text-[#94A3B8] border-[rgba(148,163,184,0.1)] hover:text-white'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  z.status === 'VERIFIED'
                    ? '#29D6A0'
                    : z.status === 'NEEDS_REVIEW'
                    ? '#F2BB5B'
                    : '#8B7CFF',
              }}
            />
            <span>{z.name}</span>
          </button>
        ))}
      </div>

      {/* 3. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: 2D or 3D Canvas Viewport (8 cols) */}
        <div className="lg:col-span-8 relative rounded-lg overflow-hidden bg-[#080A10] border border-[rgba(148,163,184,0.14)] shadow-2xl h-[540px]">
          {displayMode === '3D_TWIN' ? (
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
          ) : (
            /* 2D Architectural Schematic Blueprint View */
            <div className="w-full h-full bg-[#090C14] p-6 relative flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-grid-subtle pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[#94A3B8]">
                <span className="text-white font-semibold">
                  AUDITORIUM LEVEL 1 // ARCHITECTURAL SCHEMATIC
                </span>
                <span>GRID: 1.0M RESOLUTION</span>
              </div>

              {/* 2D SVG Blueprint */}
              <div className="relative z-10 w-full h-[400px] flex items-center justify-center">
                <svg className="w-full h-full max-w-xl" viewBox="0 0 600 400">
                  {/* Outer Auditorium Walls */}
                  <rect
                    x="20"
                    y="20"
                    width="560"
                    height="360"
                    fill="none"
                    stroke="#192232"
                    strokeWidth="3"
                  />

                  {/* Stage Area */}
                  <g
                    onClick={() => {
                      const match = zones.find((z) => z.id === 'PROJECTOR_STAGE');
                      if (match) setSelectedZone(match);
                    }}
                    className="cursor-pointer group"
                  >
                    <rect
                      x="180"
                      y="40"
                      width="240"
                      height="70"
                      fill="#F2BB5B"
                      fillOpacity={selectedZone?.id === 'PROJECTOR_STAGE' ? '0.35' : '0.15'}
                      stroke="#F2BB5B"
                      strokeWidth="2"
                    />
                    <text
                      x="300"
                      y="80"
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontSize="12"
                      fontFamily="Space Grotesk"
                      fontWeight="bold"
                    >
                      PRESENTATION STAGE & PROJECTOR
                    </text>
                  </g>

                  {/* 50 Chairs Seating Array */}
                  <g
                    onClick={() => {
                      const match = zones.find((z) => z.id === 'SEATING_ZONE');
                      if (match) setSelectedZone(match);
                    }}
                    className="cursor-pointer group"
                  >
                    <rect
                      x="150"
                      y="150"
                      width="300"
                      height="150"
                      fill="#29D6A0"
                      fillOpacity={selectedZone?.id === 'SEATING_ZONE' ? '0.35' : '0.15'}
                      stroke="#29D6A0"
                      strokeWidth="2"
                    />
                    <text
                      x="300"
                      y="230"
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontSize="12"
                      fontFamily="Space Grotesk"
                      fontWeight="bold"
                    >
                      MAIN SEATING (50 DELEGATE CHAIRS)
                    </text>
                  </g>

                  {/* Central Aisle */}
                  <line
                    x1="300"
                    y1="140"
                    x2="300"
                    y2="310"
                    stroke="#8B7CFF"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  <text x="305" y="325" fill="#8B7CFF" fontSize="10" fontFamily="monospace">
                    2.4M CENTRAL AISLE
                  </text>

                  {/* Registration Zone (Left) */}
                  <g
                    onClick={() => {
                      const match = zones.find((z) => z.id === 'REGISTRATION_ZONE');
                      if (match) setSelectedZone(match);
                    }}
                    className="cursor-pointer group"
                  >
                    <rect
                      x="40"
                      y="260"
                      width="80"
                      height="100"
                      fill="#8B7CFF"
                      fillOpacity={selectedZone?.id === 'REGISTRATION_ZONE' ? '0.35' : '0.15'}
                      stroke="#8B7CFF"
                      strokeWidth="2"
                    />
                    <text
                      x="80"
                      y="315"
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontSize="10"
                      fontFamily="Space Grotesk"
                      fontWeight="bold"
                    >
                      REG DESK
                    </text>
                  </g>

                  {/* Directional Signage Waypoint (Left Top) */}
                  <g
                    onClick={() => {
                      const match = zones.find((z) => z.id === 'WAYFINDING_CORRIDORS');
                      if (match) setSelectedZone(match);
                    }}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx="80"
                      cy="100"
                      r="25"
                      fill="#62DCEB"
                      fillOpacity={selectedZone?.id === 'WAYFINDING_CORRIDORS' ? '0.35' : '0.15'}
                      stroke="#62DCEB"
                      strokeWidth="2"
                    />
                    <text
                      x="80"
                      y="104"
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontSize="9"
                      fontFamily="Space Grotesk"
                      fontWeight="bold"
                    >
                      WAYFINDING
                    </text>
                  </g>

                  {/* Emergency Egress Doors (Right) */}
                  <g
                    onClick={() => {
                      const match = zones.find((z) => z.id === 'EMERGENCY_EGRESS');
                      if (match) setSelectedZone(match);
                    }}
                    className="cursor-pointer group"
                  >
                    <rect
                      x="480"
                      y="180"
                      width="80"
                      height="100"
                      fill="#29D6A0"
                      fillOpacity={selectedZone?.id === 'EMERGENCY_EGRESS' ? '0.35' : '0.15'}
                      stroke="#29D6A0"
                      strokeWidth="2"
                    />
                    <text
                      x="520"
                      y="235"
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontSize="10"
                      fontFamily="Space Grotesk"
                      fontWeight="bold"
                    >
                      EMERGENCY EXIT
                    </text>
                  </g>
                </svg>
              </div>

              <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-[#64748B]">
                <span>CLICK ANY ARCHITECTURAL ZONE TO INSPECT</span>
                <span>BLUEPRINT VERSION 2026.4</span>
              </div>
            </div>
          )}

          {/* Floating Canvas Navigation Note */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-[#94A3B8] pointer-events-none">
            <span className="px-2.5 py-1 rounded bg-[#0D111B]/90 border border-[rgba(148,163,184,0.12)] font-mono text-[10px]">
              Conceptual Architectural Twin
            </span>
            <span className="px-2.5 py-1 rounded bg-[#0D111B]/90 border border-[rgba(148,163,184,0.12)] text-[10px] font-mono text-[#29D6A0]">
              Interactive Raycasting Active
            </span>
          </div>
        </div>

        {/* RIGHT: Selected Zone & Linked Task Evidence (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedZone ? (
            <Surface className="p-5 space-y-4 bg-[#121824] border-[rgba(148,163,184,0.14)]">
              <div className="flex items-start justify-between gap-3 border-b border-[rgba(148,163,184,0.08)] pb-3">
                <div>
                  <span className="text-label text-[#8B7CFF] block mb-1">
                    Spatial Zone Inspector
                  </span>
                  <h3 className="font-display font-semibold text-lg text-white">
                    {selectedZone.name}
                  </h3>
                </div>
                <StatusBadge status={selectedZone.status} />
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {selectedZone.description}
              </p>

              {/* Linked Task Row */}
              <div className="space-y-1.5 pt-2 border-t border-[rgba(148,163,184,0.06)]">
                <span className="text-[10px] font-mono text-[#64748B] uppercase">
                  ASSOCIATED OPERATIONAL TASK
                </span>
                <div className="p-3 rounded bg-[#0D111B] border border-[rgba(148,163,184,0.08)] space-y-1 text-xs">
                  <p className="font-semibold text-white">{selectedZone.taskTitle}</p>
                  <p className="font-mono text-[10px] text-[#8B7CFF]">
                    Task Ref: {selectedZone.taskId}
                  </p>
                </div>
              </div>

              {/* Field Photographic Evidence Slot */}
              {selectedZone.evidenceUrl ? (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                    <span>PHOTO EVIDENCE</span>
                    <span className="text-[#29D6A0]">SAM 3.1 SEGMENTED</span>
                  </div>
                  <div className="relative rounded overflow-hidden aspect-[16/10] bg-black border border-[rgba(148,163,184,0.14)]">
                    <img
                      src={selectedZone.evidenceUrl}
                      alt={selectedZone.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center rounded bg-[#0D111B] border border-[rgba(148,163,184,0.08)] text-xs text-[#94A3B8] space-y-1">
                  <Camera className="w-4 h-4 mx-auto text-[#64748B]" />
                  <p>Awaiting photo upload for this zone.</p>
                </div>
              )}

              {/* Open Task Modal Button */}
              <Button
                className="w-full"
                size="md"
                onClick={() => onOpenTask(selectedZone.taskId)}
                icon={<Eye className="w-4 h-4" />}
              >
                Inspect Task Evidence & Criteria
              </Button>
            </Surface>
          ) : (
            <Surface className="p-8 text-center text-xs text-[#94A3B8]">
              Click any zone in the 3D model or 2D blueprint to inspect associated operational details.
            </Surface>
          )}

          {/* Quick list of all 5 physical zones */}
          <Surface className="p-4 space-y-2 bg-[#0D111B]">
            <span className="text-label text-[#94A3B8] block mb-1">
              Venue Physical Zones ({zones.length})
            </span>
            <div className="space-y-1.5">
              {zones.map((z) => (
                <button
                  key={z.id}
                  onClick={() => setSelectedZone(z)}
                  className={`w-full p-2.5 rounded text-left text-xs transition-all flex items-center justify-between font-mono ${
                    selectedZone?.id === z.id
                      ? 'bg-[#192232] text-white font-semibold border border-[#8B7CFF]/40'
                      : 'text-[#94A3B8] hover:text-white bg-[#121824]'
                  }`}
                >
                  <span className="truncate">{z.name}</span>
                  <StatusBadge status={z.status} showDot={false} />
                </button>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
};
