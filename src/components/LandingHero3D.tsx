import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'motion';
import { ScanEye, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export const LandingHero3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeNode, setActiveNode] = useState<number>(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
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
    const width = container.clientWidth || 540;
    const height = container.clientHeight || 560;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSoftwareGl ? 1 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group for mouse parallax
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Core: Dual Geodesic Intelligence Sphere
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x8b7cff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // Inner glowing sphere
    const innerGeo = new THREE.IcosahedronGeometry(1.0, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x62dceb,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // 2. Verification Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(2.7, 0.015, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x8b7cff,
      transparent: true,
      opacity: 0.4,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(3.2, 0.012, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x62dceb,
      transparent: true,
      opacity: 0.35,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 3.5;
    ring2.rotation.x = -Math.PI / 6;
    mainGroup.add(ring2);

    // 3. Floating Satellite Marker Nodes (Representing Evidence Nodes)
    const nodeCoords = [
      { x: 2.4, y: 1.2, z: 0.8 },
      { x: -2.2, y: 1.8, z: -0.5 },
      { x: 1.8, y: -2.0, z: 0.4 },
      { x: -2.4, y: -1.3, z: 0.6 },
    ];

    const nodeMeshes: THREE.Mesh[] = [];
    nodeCoords.forEach((coord, i) => {
      const nodeGeo = new THREE.OctahedronGeometry(0.18, 0);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0x29d6a0 : i === 1 ? 0x8b7cff : i === 2 ? 0xf2bb5b : 0x62dceb,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.set(coord.x, coord.y, coord.z);
      mainGroup.add(mesh);
      nodeMeshes.push(mesh);

      // Connecting line from center to node
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(coord.x, coord.y, coord.z),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x192232,
        transparent: true,
        opacity: 0.5,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      mainGroup.add(line);
    });

    // 4. Verification Scan Plane (Scanning sweep line)
    const scanPlaneGeo = new THREE.PlaneGeometry(5.5, 0.04);
    const scanPlaneMat = new THREE.MeshBasicMaterial({
      color: 0x62dceb,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const scanPlane = new THREE.Mesh(scanPlaneGeo, scanPlaneMat);
    mainGroup.add(scanPlane);

    // 5. Point Cloud / Coordinate Dust
    const particleCount = 180;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 10;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x8b7cff,
      size: 0.04,
      transparent: true,
      opacity: 0.4,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particles);

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.4;
      targetY = y * 0.3;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);

    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse follow
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      mainGroup.rotation.y = elapsed * 0.12 + mouseX;
      mainGroup.rotation.x = -mouseY;

      // Rotating core elements
      coreMesh.rotation.y = elapsed * 0.2;
      coreMesh.rotation.z = elapsed * 0.1;
      innerMesh.rotation.y = -elapsed * 0.35;
      innerMesh.rotation.x = elapsed * 0.2;

      // Orbit rings
      ring1.rotation.z = elapsed * 0.15;
      ring2.rotation.z = -elapsed * 0.18;

      // Scan plane sweep
      scanPlane.position.y = Math.sin(elapsed * 1.5) * 2.2;
      scanPlane.rotation.z = Math.sin(elapsed * 0.5) * 0.2;

      // Satellite nodes oscillate
      nodeMeshes.forEach((mesh, idx) => {
        mesh.rotation.x = elapsed + idx;
        mesh.rotation.y = elapsed * 1.5;
      });

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
      cancelAnimationFrame(reqId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[480px] lg:h-[580px] flex items-center justify-center select-none">
      {/* Subtle ambient lighting */}
      <div className="absolute w-[380px] h-[380px] rounded-full bg-[#8B7CFF]/10 blur-[90px] pointer-events-none" />
      <div className="absolute w-[280px] h-[280px] rounded-full bg-[#62DCEB]/8 blur-[80px] pointer-events-none translate-x-20 translate-y-16" />

      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Floating Evidence Thumbnail HUD 1 (Top Right) */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="absolute top-4 right-2 sm:right-6 z-10 p-3 rounded-lg bg-[#0D111B]/85 backdrop-blur-md border border-[rgba(148,163,184,0.12)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-60"
      >
        <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8] mb-1.5">
          <span className="flex items-center gap-1.5 text-[#29D6A0]">
            <CheckCircle2 className="w-3 h-3" /> SAM 3.1 VERIFIED
          </span>
          <span className="text-white font-semibold">98.2%</span>
        </div>
        <div className="relative rounded overflow-hidden h-20 mb-1.5 border border-[#192232]">
          <img
            src="/src/assets/images/demo_chairs_arranged_1793784151109.jpg"
            alt="Auditorium seating verification"
            className="w-full h-full object-cover"
          />
          {/* Bounding box simulation overlay */}
          <div className="absolute inset-x-2 inset-y-2 border border-[#29D6A0] rounded bg-[#29D6A0]/10 flex items-end p-1">
            <span className="text-[9px] font-mono font-bold text-[#29D6A0] bg-[#080A10]/90 px-1 rounded">
              50 CHAIRS DETECTED
            </span>
          </div>
        </div>
        <div className="text-[11px] font-medium text-white truncate">Auditorium Main Seating Array</div>
        <div className="text-[10px] text-[#94A3B8] font-mono">Row alignment · 2.4m central egress</div>
      </motion.div>

      {/* Floating Evidence Thumbnail HUD 2 (Bottom Left) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute bottom-4 left-2 sm:left-4 z-10 p-3 rounded-lg bg-[#0D111B]/85 backdrop-blur-md border border-[rgba(148,163,184,0.12)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-64"
      >
        <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8] mb-1.5">
          <span className="flex items-center gap-1.5 text-[#F2BB5B]">
            <ShieldAlert className="w-3 h-3" /> UNCERTAINTY FLAGGED
          </span>
          <span className="text-[#F2BB5B] font-semibold">REVIEW</span>
        </div>
        <div className="relative rounded overflow-hidden h-20 mb-1.5 border border-[#192232]">
          <img
            src="/src/assets/images/demo_projector_mounted_1793784151441.jpg"
            alt="Stage Projector mount check"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-4 inset-y-1 border border-[#F2BB5B] rounded bg-[#F2BB5B]/10 flex items-start p-1">
            <span className="text-[9px] font-mono font-bold text-[#F2BB5B] bg-[#080A10]/90 px-1 rounded">
              MOUNT VERIFIED · HDMI PENDING
            </span>
          </div>
        </div>
        <div className="text-[11px] font-medium text-white truncate">Auditorium Laser Projector</div>
        <div className="text-[10px] text-[#94A3B8] font-mono">Physical mount secure · Signal unverified</div>
      </motion.div>

      {/* Central HUD status tag */}
      <div className="absolute bottom-6 right-6 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121824]/90 backdrop-blur-md border border-[rgba(148,163,184,0.12)] text-[10px] font-mono text-[#94A3B8]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#62DCEB] animate-pulse" />
        <span>EVIDENCE OS ENGINE ACTIVE</span>
      </div>
    </div>
  );
};

