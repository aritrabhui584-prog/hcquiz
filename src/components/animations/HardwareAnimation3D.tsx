import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { HardwareAnimationType } from '../../types/quiz';
import { Box, Loader2 } from 'lucide-react';

interface HardwareAnimation3DProps {
  type: HardwareAnimationType;
  customAssetUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  interactive?: boolean;
  autoRotate?: boolean;
  lazy?: boolean;
}

export const HardwareAnimation3D: React.FC<HardwareAnimation3DProps> = ({
  type,
  customAssetUrl,
  size = 'md',
  showLabel = true,
  interactive = true,
  autoRotate = true,
  lazy = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  const heightClasses = {
    sm: 'h-32 sm:h-36 max-w-xs w-full',
    md: 'h-44 sm:h-52 lg:h-60 max-w-md w-full',
    lg: 'h-60 sm:h-72 max-w-lg w-full',
    xl: 'h-72 sm:h-96 w-full',
  }[size];

  const isTinkercad = Boolean(customAssetUrl && customAssetUrl.includes('tinkercad.com'));
  const isVideo = Boolean(
    customAssetUrl && (customAssetUrl.endsWith('.mp4') || customAssetUrl.endsWith('.webm'))
  );
  const isImage = Boolean(
    customAssetUrl && (customAssetUrl.endsWith('.png') || customAssetUrl.endsWith('.jpg') || customAssetUrl.endsWith('.webp') || customAssetUrl.endsWith('.gif'))
  );

  const getTinkercadEmbedUrl = (url: string) => {
    if (url.includes('/embed/')) return url;
    const match = url.match(/\/things\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://www.tinkercad.com/embed/${match[1]}?editHeader=0`;
    }
    return url;
  };

  // 1. Tinkercad 3D Embed
  if (isTinkercad && customAssetUrl) {
    const embedUrl = getTinkercadEmbedUrl(customAssetUrl);
    return (
      <div className={`relative w-full ${heightClasses} flex flex-col items-center justify-center rounded-2xl bg-white p-1.5 overflow-hidden select-none border border-slate-300 shadow-xl`}>
        <iframe
          src={embedUrl}
          title="Tinkercad 3D Hardware Simulation"
          width="100%"
          height="100%"
          className="rounded-xl border-0 w-full h-full bg-white"
          allowFullScreen
        />
        {showLabel && (
          <div className="absolute bottom-2 left-3 right-3 z-20 flex items-center justify-between pointer-events-none font-mono text-[9px] text-slate-300 uppercase tracking-wider bg-slate-900/85 px-3 py-1 rounded-full backdrop-blur-md border border-slate-700/50 shadow-md">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>TINKERCAD 3D // {type}</span>
            </div>
            <span className="text-[8.5px] text-slate-400">INTERACTIVE 3D CAD</span>
          </div>
        )}
      </div>
    );
  }

  // 2. Custom Video Asset
  if (isVideo && customAssetUrl) {
    return (
      <div className={`relative w-full ${heightClasses} flex flex-col items-center justify-center rounded-2xl bg-white p-2 overflow-hidden select-none border border-slate-300 shadow-xl`}>
        <video src={customAssetUrl} autoPlay loop muted playsInline className="h-full object-contain rounded-lg" />
        {showLabel && (
          <div className="absolute bottom-2 left-3 right-3 z-20 flex items-center justify-between pointer-events-none font-mono text-[9px] uppercase tracking-wider bg-slate-900/85 px-3 py-1 rounded-full backdrop-blur-md border border-slate-700/50 shadow-md">
            <span className="font-mono text-[9px] tracking-widest text-[#7EE8A6] uppercase font-bold">
              3D TELEMETRY // {type}
            </span>
          </div>
        )}
      </div>
    );
  }

  // 3. Custom Image Asset
  if (isImage && customAssetUrl) {
    return (
      <div className={`relative w-full ${heightClasses} flex flex-col items-center justify-center rounded-2xl bg-white p-2 overflow-hidden select-none border border-slate-300 shadow-xl`}>
        <img src={customAssetUrl} alt={type} className="h-full object-contain rounded-lg" />
        {showLabel && (
          <div className="absolute bottom-2 left-3 right-3 z-20 flex items-center justify-between pointer-events-none font-mono text-[9px] uppercase tracking-wider bg-slate-900/85 px-3 py-1 rounded-full backdrop-blur-md border border-slate-700/50 shadow-md">
            <span className="font-mono text-[9px] tracking-widest text-[#7EE8A6] uppercase font-bold">
              3D TELEMETRY // {type}
            </span>
          </div>
        )}
      </div>
    );
  }

  // 4. Real Three.js WebGL Canvas Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let controls: OrbitControls | null = null;
    let animationFrameId: number;
    let isDisposed = false;

    try {
      const width = container.clientWidth || 300;
      const height = container.clientHeight || 200;

      scene = new THREE.Scene();
      // Clean, bright high-contrast studio white background
      scene.background = new THREE.Color(0xffffff);

      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 1.8, 4.2);

      renderer = new THREE.WebGLRenderer({
        alpha: false,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 1.5;
      controls.enabled = interactive;
      controls.maxDistance = 10;
      controls.minDistance = 1.5;

      // Studio 3-point lighting setup for sharp visibility on white background
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
      scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
      dirLight1.position.set(4, 7, 5);
      scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.9);
      dirLight2.position.set(-4, 3, -3);
      scene.add(dirLight2);

      const rimLight = new THREE.DirectionalLight(0xfef08a, 0.6);
      rimLight.position.set(0, 5, -4);
      scene.add(rimLight);

      // Subtle light studio grid on white floor
      const gridHelper = new THREE.GridHelper(6, 12, 0x0284c7, 0xdfe5eb);
      gridHelper.position.y = -1.2;
      (gridHelper.material as THREE.Material).opacity = 0.55;
      (gridHelper.material as THREE.Material).transparent = true;
      scene.add(gridHelper);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);

      if (customAssetUrl && (customAssetUrl.endsWith('.gltf') || customAssetUrl.endsWith('.glb'))) {
        setIsLoadingModel(true);
        const loader = new GLTFLoader();
        loader.load(
          customAssetUrl,
          (gltf) => {
            if (isDisposed) return;
            setIsLoadingModel(false);
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const sizeVec = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 1;
            const scale = 2.0 / maxDim;
            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));
            rootGroup.add(model);
          },
          undefined,
          (err) => {
            if (isDisposed) return;
            setIsLoadingModel(false);
            buildProcedural3DHardware(rootGroup, type, wireframe);
          }
        );
      } else {
        buildProcedural3DHardware(rootGroup, type, wireframe);
      }

      const clock = new THREE.Clock();
      const animate = () => {
        if (isDisposed) return;
        animationFrameId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        animateComponentSpecifics(rootGroup, type, elapsedTime);
        if (controls) controls.update();
        if (renderer && scene && camera) renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const newWidth = container.clientWidth || 300;
        const newHeight = container.clientHeight || 200;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };

      window.addEventListener('resize', handleResize);
      const resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(container);

      return () => {
        isDisposed = true;
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        resizeObserver.disconnect();
        if (controls) controls.dispose();
        if (renderer) renderer.dispose();
        if (scene) scene.clear();
        if (container && renderer && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch (e) {
      console.warn('WebGL init fallback:', e);
      setHasWebGL(false);
    }
  }, [type, customAssetUrl, wireframe, autoRotate, interactive]);

  return (
    <div className={`relative w-full ${heightClasses} flex flex-col items-center justify-center rounded-2xl bg-white p-1.5 overflow-hidden select-none group border border-slate-300 shadow-xl ring-1 ring-black/5`}>
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing relative z-10 rounded-xl overflow-hidden" />

      {isLoadingModel && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm font-mono text-xs text-slate-800 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span>STREAMING 3D ASSET...</span>
        </div>
      )}

      <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
        <button
          onClick={() => setWireframe(!wireframe)}
          className={`p-1.5 rounded-lg border font-mono text-[10px] flex items-center gap-1 cursor-pointer transition shadow-sm ${
            wireframe
              ? 'bg-emerald-600 text-white font-bold border-emerald-700'
              : 'bg-slate-900/85 text-slate-200 border-slate-700 hover:bg-slate-900'
          }`}
          title="Toggle 3D Wireframe Inspection Mode"
        >
          <Box className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">MESH</span>
        </button>
      </div>

      {showLabel && (
        <div className="absolute bottom-2 left-3 right-3 z-20 flex items-center justify-between pointer-events-none font-mono text-[9.5px] uppercase tracking-wider bg-slate-900/85 px-3 py-1.5 rounded-full backdrop-blur-md border border-slate-700/50 shadow-md">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>REAL 3D WEBGL // {type.replace('_', ' ')}</span>
          </div>
          <span className="text-[9px] text-slate-400 hidden sm:inline">
            3D ORBIT & DRAG
          </span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// PROCEDURAL 3D HARDWARE MODEL BUILDER
// ==========================================
function buildProcedural3DHardware(
  group: THREE.Group,
  type: HardwareAnimationType,
  wireframe: boolean
) {
  const metalLeadMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.96,
    roughness: 0.08,
    wireframe,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.15,
    wireframe,
  });

  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.82,
    roughness: 0.2,
    wireframe,
  });

  const pcbGreenMat = new THREE.MeshStandardMaterial({
    color: 0x059669,
    metalness: 0.25,
    roughness: 0.35,
    wireframe,
  });

  const icBlackMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.15,
    wireframe,
  });

  switch (type) {
    case 'RESISTOR': {
      const leadGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.4, 16);
      leadGeo.rotateZ(Math.PI / 2);
      group.add(new THREE.Mesh(leadGeo, metalLeadMat));

      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.3, wireframe });
      const bodyGeo = new THREE.CylinderGeometry(0.32, 0.32, 1.4, 32);
      bodyGeo.rotateZ(Math.PI / 2);
      group.add(new THREE.Mesh(bodyGeo, bodyMat));

      const capGeo = new THREE.SphereGeometry(0.33, 24, 16);
      const cap1 = new THREE.Mesh(capGeo, bodyMat);
      cap1.position.x = -0.7;
      cap1.scale.set(0.3, 1, 1);
      const cap2 = new THREE.Mesh(capGeo, bodyMat);
      cap2.position.x = 0.7;
      cap2.scale.set(0.3, 1, 1);
      group.add(cap1, cap2);

      const bandColors = [0xd97706, 0x7c3aed, 0xdc2626, 0xf59e0b];
      const bandPositions = [-0.4, -0.15, 0.1, 0.45];
      bandColors.forEach((col, idx) => {
        const bandMat = new THREE.MeshStandardMaterial({
          color: col,
          roughness: 0.1,
          metalness: col === 0xf59e0b ? 0.9 : 0.1,
          wireframe,
        });
        const bandGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.12, 32);
        bandGeo.rotateZ(Math.PI / 2);
        const bandMesh = new THREE.Mesh(bandGeo, bandMat);
        bandMesh.position.x = bandPositions[idx];
        group.add(bandMesh);
      });
      break;
    }

    case 'CAPACITOR': {
      const canMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.4, roughness: 0.25, wireframe });
      const canGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.5, 32);
      group.add(new THREE.Mesh(canGeo, canMat));

      const ventMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.95, roughness: 0.1, wireframe });
      const ventGeo = new THREE.CylinderGeometry(0.54, 0.54, 0.08, 32);
      ventGeo.translate(0, 0.76, 0);
      group.add(new THREE.Mesh(ventGeo, ventMat));

      const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, wireframe });
      const stripeGeo = new THREE.CylinderGeometry(0.56, 0.56, 1.48, 16, 1, false, 0, Math.PI / 4);
      group.add(new THREE.Mesh(stripeGeo, stripeMat));

      const leadGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.9, 16);
      const lead1 = new THREE.Mesh(leadGeo, metalLeadMat);
      lead1.position.set(-0.22, -1.15, 0);
      const lead2 = new THREE.Mesh(leadGeo, metalLeadMat);
      lead2.position.set(0.22, -1.05, 0);
      group.add(lead1, lead2);
      break;
    }

    case 'LED': {
      const ledMat = new THREE.MeshPhysicalMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.9,
        roughness: 0.1,
        metalness: 0.05,
        transmission: 0.5,
        wireframe,
      });

      const domeGeo = new THREE.SphereGeometry(0.55, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMesh = new THREE.Mesh(domeGeo, ledMat);
      domeMesh.position.y = 0.5;

      const cylGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.6, 32);
      const cylMesh = new THREE.Mesh(cylGeo, ledMat);
      cylMesh.position.y = 0.2;

      const rimGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.12, 32);
      const rimMesh = new THREE.Mesh(rimGeo, ledMat);
      rimMesh.position.y = -0.15;

      group.add(domeMesh, cylMesh, rimMesh);

      const leadGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.2, 16);
      const anode = new THREE.Mesh(leadGeo, metalLeadMat);
      anode.position.set(-0.18, -0.75, 0);
      const cathode = new THREE.Mesh(leadGeo, metalLeadMat);
      cathode.position.set(0.18, -0.65, 0);
      group.add(anode, cathode);
      break;
    }

    case 'TRANSISTOR': {
      const to92Mat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, wireframe });
      const to92Geo = new THREE.CylinderGeometry(0.5, 0.5, 1.0, 32, 1, false, 0, Math.PI);
      group.add(new THREE.Mesh(to92Geo, to92Mat));

      const leadGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.1, 16);
      [-0.25, 0, 0.25].forEach((xPos) => {
        const lead = new THREE.Mesh(leadGeo, metalLeadMat);
        lead.position.set(xPos, -1.0, 0);
        group.add(lead);
      });
      break;
    }

    case 'DIODE': {
      const leadGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.2, 16);
      leadGeo.rotateZ(Math.PI / 2);
      group.add(new THREE.Mesh(leadGeo, metalLeadMat));

      const bodyGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.3, 32);
      bodyGeo.rotateZ(Math.PI / 2);
      group.add(new THREE.Mesh(bodyGeo, icBlackMat));

      const ringMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.9, roughness: 0.1, wireframe });
      const ringGeo = new THREE.CylinderGeometry(0.31, 0.31, 0.22, 32);
      ringGeo.rotateZ(Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.x = 0.35;
      group.add(ringMesh);
      break;
    }

    case 'ARDUINO': {
      const unoMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.1, wireframe });
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.6), unoMat);
      group.add(pcb);

      const mcu = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, 0.35), icBlackMat);
      mcu.position.set(0.1, 0.12, 0.15);
      group.add(mcu);

      const headerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
      const hTop = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.25, 0.18), headerMat);
      hTop.position.set(-0.1, 0.16, -0.65);
      const hBot = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.25, 0.18), headerMat);
      hBot.position.set(-0.1, 0.16, 0.65);
      group.add(hTop, hBot);

      const usb = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.45), metalLeadMat);
      usb.position.set(-1.0, 0.25, -0.4);
      group.add(usb);

      const jack = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.45), icBlackMat);
      jack.position.set(-1.0, 0.25, 0.45);
      group.add(jack);
      break;
    }

    case 'ESP32': {
      const espPcb = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.3), icBlackMat);
      group.add(espPcb);

      const shield = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.16, 1.05), metalLeadMat);
      shield.position.set(0.25, 0.12, 0);
      group.add(shield);

      const ant = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.09, 0.9), goldMat);
      ant.position.set(-0.75, 0.08, 0);
      group.add(ant);
      break;
    }

    case 'IC': {
      // Dual-in-line IC package with crisp contrast
      const icBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.42, 0.85), icBlackMat);
      group.add(icBody);

      // Pin 1 orientation notch
      const notchGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.44, 16, 1, false, 0, Math.PI);
      notchGeo.rotateZ(Math.PI / 2);
      const notch = new THREE.Mesh(notchGeo, new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 }));
      notch.position.set(-0.75, 0.1, 0);
      group.add(notch);

      // Pin 1 dot marker
      const dotGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16);
      const dot = new THREE.Mesh(dotGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2 }));
      dot.position.set(-0.55, 0.22, 0.26);
      group.add(dot);

      // Laser marking accent strip
      const textStripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.01, 0.25),
        new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 })
      );
      textStripe.position.set(0.05, 0.22, 0);
      group.add(textStripe);

      // Shiny silver DIP leads
      const pinGeo = new THREE.BoxGeometry(0.09, 0.38, 0.28);
      [-0.5, -0.18, 0.18, 0.5].forEach((xPos) => {
        const pinTop = new THREE.Mesh(pinGeo, metalLeadMat);
        pinTop.position.set(xPos, -0.22, -0.48);
        const pinBot = new THREE.Mesh(pinGeo, metalLeadMat);
        pinBot.position.set(xPos, -0.22, 0.48);
        group.add(pinTop, pinBot);
      });
      break;
    }

    case 'PCB': {
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 1.8), pcbGreenMat);
      group.add(pcb);

      const trace1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.09, 0.06), goldMat);
      trace1.position.set(0, 0.04, -0.4);
      const trace2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.09, 0.06), copperMat);
      trace2.position.set(0.2, 0.04, 0.3);
      trace2.rotation.y = 0.4;
      group.add(trace1, trace2);

      const smdGeo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
      const smd1 = new THREE.Mesh(smdGeo, goldMat);
      smd1.position.set(-0.6, 0.08, 0.2);
      const smd2 = new THREE.Mesh(smdGeo, icBlackMat);
      smd2.position.set(0.5, 0.08, -0.2);
      group.add(smd1, smd2);
      break;
    }

    case 'OSCILLOSCOPE': {
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 1.4), icBlackMat);
      group.add(chassis);

      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x052e16,
        emissive: 0x10b981,
        emissiveIntensity: 0.4,
        roughness: 0.1,
        wireframe,
      });
      const screen = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.0, 0.05), screenMat);
      screen.position.set(-0.4, 0.1, 0.72);
      group.add(screen);

      const knobGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.18, 16);
      knobGeo.rotateX(Math.PI / 2);
      const knob1 = new THREE.Mesh(knobGeo, metalLeadMat);
      knob1.position.set(0.65, 0.3, 0.75);
      const knob2 = new THREE.Mesh(knobGeo, metalLeadMat);
      knob2.position.set(0.65, -0.2, 0.75);
      group.add(knob1, knob2);
      break;
    }

    case 'SERVO': {
      const servoMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.85,
        roughness: 0.2,
      });
      const servoBody = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.3, 0.7), servoMat);
      group.add(servoBody);

      const hornMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
      const horn = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.3), hornMat);
      horn.position.set(0.2, 0.75, 0);
      horn.name = 'servo_horn';
      group.add(horn);
      break;
    }

    case 'DC_MOTOR': {
      const motorCan = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.4, 32), metalLeadMat);
      motorCan.rotateZ(Math.PI / 2);
      group.add(motorCan);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 16), metalLeadMat);
      shaft.rotateZ(Math.PI / 2);
      shaft.position.x = 1.0;
      shaft.name = 'motor_shaft';
      group.add(shaft);
      break;
    }

    case 'ULTRASONIC_SENSOR': {
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.0, 0.08), pcbGreenMat);
      group.add(pcb);

      const transGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.5, 32);
      transGeo.rotateX(Math.PI / 2);
      const transT = new THREE.Mesh(transGeo, metalLeadMat);
      transT.position.set(-0.55, 0, 0.28);
      const transR = new THREE.Mesh(transGeo, metalLeadMat);
      transR.position.set(0.55, 0, 0.28);
      group.add(transT, transR);
      break;
    }

    default: {
      const genericBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.0), icBlackMat);
      const emblem = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.42, 0.4), goldMat);
      group.add(genericBody, emblem);
      break;
    }
  }
}

function animateComponentSpecifics(group: THREE.Group, type: HardwareAnimationType, time: number) {
  if (type === 'SERVO') {
    const horn = group.getObjectByName('servo_horn');
    if (horn) {
      horn.rotation.y = Math.sin(time * 3) * 0.9;
    }
  } else if (type === 'DC_MOTOR') {
    const shaft = group.getObjectByName('motor_shaft');
    if (shaft) {
      shaft.rotation.x = time * 12;
    }
  }
}
