import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Compass,
  RotateCw,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Maximize2
} from 'lucide-react';

export const ThreeDimensionalScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [wireframeMode, setWireframeMode] = useState(false);
  const [cameraView, setCameraView] = useState<'overview' | 'core' | 'ai' | 'dbms'>('overview');
  const [activePreset, setActivePreset] = useState<string>('Neural Core');

  const controlsRef = useRef<OrbitControls | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL as per Three.js skill guidelines
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x090d16);
    scene.fog = new THREE.FogExp2(0x090d16, 0.035);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 600;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 7, 14);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment map via RoomEnvironment & PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Lighting: Warm directional key light + cool HemisphereLight
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    keyLight.position.set(8, 14, 8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xd9e6f2, 0x1e293b, 1.2);
    scene.add(hemiLight);

    const blueRimLight = new THREE.PointLight(0x3b82f6, 3, 25);
    blueRimLight.position.set(-8, 5, -8);
    scene.add(blueRimLight);

    const purpleRimLight = new THREE.PointLight(0x8b5cf6, 3, 25);
    purpleRimLight.position.set(8, 5, -8);
    scene.add(purpleRimLight);

    // OrbitControls with silky exponential damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 4;
    controls.maxDistance = 30;

    // --- PROCEDURAL 3D SUBJECT: COMPOSITE 3-12 PART PROCEDURAL CITADEL ---
    const citadelGroup = new THREE.Group();
    scene.add(citadelGroup);

    // Ground platform with subtle concentric rings
    const groundGeo = new THREE.CylinderGeometry(8.5, 9, 0.4, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.2,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.2;
    groundMesh.receiveShadow = !isSoftwareGl;
    citadelGroup.add(groundMesh);

    // Procedural Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(18, 18);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.01;
    scene.add(shadowPlane);

    // 1. Central Neural Core (Faceted Icosahedron with inner pulsing core)
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 3.2, 0);
    citadelGroup.add(coreGroup);

    const outerCoreGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const outerCoreMat = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      roughness: 0.1,
      metalness: 0.85,
      clearcoat: 1.0,
      transmission: isSoftwareGl ? 0 : 0.6,
      transparent: true,
      opacity: isSoftwareGl ? 0.6 : 0.9,
    });
    const outerCoreMesh = new THREE.Mesh(outerCoreGeo, outerCoreMat);
    outerCoreMesh.castShadow = !isSoftwareGl;
    coreGroup.add(outerCoreMesh);
    materialsRef.current.push(outerCoreMat as any);

    const innerCoreGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.9,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    coreGroup.add(innerCoreMesh);
    materialsRef.current.push(innerCoreMat);

    // Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(2.4, 0.05, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.3,
      metalness: 0.9,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat);
    coreGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.8, 0.04, 16, 100);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat);
    ring2.rotation.x = Math.PI / 3;
    coreGroup.add(ring2);

    // 2. Four Surrounding Course Pillars (3-part composite meshes)
    const pillars = [
      { name: 'CS-401 AI & ML', angle: 0, color: 0x3b82f6, height: 3.2 },
      { name: 'CS-303 DBMS', angle: Math.PI / 2, color: 0x8b5cf6, height: 2.8 },
      { name: 'CS-301 OS', angle: Math.PI, color: 0x10b981, height: 2.5 },
      { name: 'CS-201 DSA', angle: (3 * Math.PI) / 2, color: 0xf59e0b, height: 3.0 },
    ];

    const radius = 5.2;
    const pillarMeshes: THREE.Group[] = [];

    pillars.forEach((p) => {
      const pGroup = new THREE.Group();
      const px = Math.cos(p.angle) * radius;
      const pz = Math.sin(p.angle) * radius;
      pGroup.position.set(px, 0, pz);

      // Base pedestal
      const pBaseGeo = new THREE.BoxGeometry(1.4, 0.4, 1.4);
      const pBaseMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.5,
        metalness: 0.5,
      });
      const pBaseMesh = new THREE.Mesh(pBaseGeo, pBaseMat);
      pBaseMesh.position.y = 0.2;
      pGroup.add(pBaseMesh);

      // Pillar shaft
      const shaftGeo = new THREE.CylinderGeometry(0.45, 0.55, p.height, 16);
      const shaftMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.4,
        metalness: 0.6,
      });
      const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
      shaftMesh.position.y = 0.4 + p.height / 2;
      shaftMesh.castShadow = !isSoftwareGl;
      pGroup.add(shaftMesh);

      // Top Beacon Crystal
      const beaconGeo = new THREE.OctahedronGeometry(0.55);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: p.color,
        emissive: p.color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8,
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.y = 0.4 + p.height + 0.6;
      pGroup.add(beaconMesh);

      citadelGroup.add(pGroup);
      pillarMeshes.push(pGroup);
    });

    // 3. Particle Vector Cloud
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0 + Math.random() * 5.0;
      particlePos[i] = r * Math.sin(phi) * Math.cos(theta);
      particlePos[i + 1] = 1.0 + Math.abs(r * Math.cos(phi));
      particlePos[i + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Animation Loop
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const dt = clock.getDelta();
      const time = clock.getElapsedTime();

      // Rotate neural core
      coreGroup.rotation.y += 0.4 * dt * rotationSpeed;
      coreGroup.rotation.x = Math.sin(time * 0.5) * 0.15;
      ring1.rotation.z += 0.6 * dt * rotationSpeed;
      ring2.rotation.y -= 0.5 * dt * rotationSpeed;

      // Pulse particle cloud
      particleSystem.rotation.y += 0.05 * dt * rotationSpeed;

      // Soft beacon bobbing
      pillarMeshes.forEach((pGroup, idx) => {
        const beacon = pGroup.children[2];
        if (beacon) {
          beacon.rotation.y += (0.8 + idx * 0.2) * dt * rotationSpeed;
          beacon.position.y = 0.4 + pillars[idx].height + 0.6 + Math.sin(time * 2 + idx) * 0.08;
        }
      });

      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 600;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [rotationSpeed]);

  // Wireframe toggle
  useEffect(() => {
    materialsRef.current.forEach((m) => {
      m.wireframe = wireframeMode;
    });
  }, [wireframeMode]);

  // Camera presets
  const handleCameraPreset = (preset: 'overview' | 'core' | 'ai' | 'dbms') => {
    setCameraView(preset);
    const controls = controlsRef.current;
    if (!controls) return;

    if (preset === 'overview') {
      controls.object.position.set(0, 7, 14);
      controls.target.set(0, 2, 0);
      setActivePreset('Neural Citadel Overview');
    } else if (preset === 'core') {
      controls.object.position.set(0, 3.5, 5);
      controls.target.set(0, 3.2, 0);
      setActivePreset('Central Neural Core');
    } else if (preset === 'ai') {
      controls.object.position.set(5.2, 5, 4);
      controls.target.set(5.2, 3, 0);
      setActivePreset('CS-401 AI & ML Pillar');
    } else if (preset === 'dbms') {
      controls.object.position.set(0, 5, 8);
      controls.target.set(0, 2.8, 5.2);
      setActivePreset('CS-303 Relational Pillar');
    }
    controls.update();
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-950">
      
      {/* 3D Canvas Mount Container */}
      <div ref={mountRef} className="h-full w-full cursor-grab active:cursor-grabbing" />

      {/* Minimal Top Specification Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xl bg-slate-900/80 px-3.5 py-2 text-xs text-white border border-slate-800 shadow-lg">
        <Compass className="h-4 w-4 text-indigo-400" />
        <span className="font-bold tracking-tight">3D Neural Knowledge Citadel</span>
        <span className="text-slate-500">·</span>
        <span className="text-slate-300 font-mono text-[11px]">{activePreset}</span>
      </div>

      {/* Collapsible Ergonomic Bottom Control Dock (<= 15% Viewport footprint) */}
      <div className="absolute bottom-5 left-1/2 z-20 w-[94vw] max-w-2xl -translate-x-1/2">
        <div className="flex flex-col items-center">
          
          {/* Collapse / Expand Tab */}
          <button
            onClick={() => setControlsCollapsed(!controlsCollapsed)}
            className="flex items-center gap-1.5 rounded-t-lg bg-slate-900/90 px-3 py-1 text-[11px] font-semibold text-slate-300 border-t border-x border-slate-700 hover:text-white transition-colors"
          >
            <span>{controlsCollapsed ? 'Show 3D Dock' : 'Hide Controls'}</span>
            {controlsCollapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {/* Dock Body */}
          {!controlsCollapsed && (
            <div className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/95 p-4 text-xs text-white shadow-2xl backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-4">
                
                {/* Camera View Presets */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Views:</span>
                  <button
                    onClick={() => handleCameraPreset('overview')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${cameraView === 'overview' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    Citadel
                  </button>
                  <button
                    onClick={() => handleCameraPreset('core')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${cameraView === 'core' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    Neural Core
                  </button>
                  <button
                    onClick={() => handleCameraPreset('ai')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${cameraView === 'ai' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    AI Tower
                  </button>
                  <button
                    onClick={() => handleCameraPreset('dbms')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${cameraView === 'dbms' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    DBMS Pillar
                  </button>
                </div>

                {/* Speed Slider */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-semibold">Speed:</span>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.5"
                    value={rotationSpeed}
                    onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                    className="w-20 accent-indigo-500 cursor-pointer"
                  />
                  <span className="font-mono text-[11px] text-indigo-400">{rotationSpeed}x</span>
                </div>

                {/* Wireframe Toggle */}
                <button
                  onClick={() => setWireframeMode(!wireframeMode)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${wireframeMode ? 'border-indigo-500 bg-indigo-950 text-indigo-300' : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Wireframe</span>
                </button>

              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
