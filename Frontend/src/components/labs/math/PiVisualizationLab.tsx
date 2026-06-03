import { useLanguage } from '../../../context/LanguageContext';
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MousePointer2, BoxSelect, Plus, Minus, Info } from 'lucide-react';

// ─── Inline Orbit Controls ──────────────────────────────────────────────────
function createOrbitControls(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
  
  let isPointerDown = false;
  let lastX = 0, lastY = 0;
  let spherical = { theta: 0.5, phi: Math.PI / 3 };
  let radius = 30;
  const target = new THREE.Vector3(0, 0, 0);
  let dampTheta = 0, dampPhi = 0, dampRadius = 0;

  const updateCamera = () => {
    const x = target.x + radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    const y = target.y + radius * Math.cos(spherical.phi);
    const z = target.z + radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    camera.position.set(x, y, z);
    camera.lookAt(target);
  };

  const onPointerDown = (e: PointerEvent) => { isPointerDown = true; lastX = e.clientX; lastY = e.clientY; };
  const onPointerMove = (e: PointerEvent) => {
    if (!isPointerDown) return;
    dampTheta -= (e.clientX - lastX) * 0.005;
    dampPhi   -= (e.clientY - lastY) * 0.005;
    lastX = e.clientX; lastY = e.clientY;
  };
  const onPointerUp = () => { isPointerDown = false; };
  const onWheel = (e: WheelEvent) => { e.preventDefault(); dampRadius += e.deltaY * 0.02; };

  domElement.addEventListener("pointerdown", onPointerDown as any);
  domElement.addEventListener("pointermove", onPointerMove as any);
  domElement.addEventListener("pointerup", onPointerUp as any);
  domElement.addEventListener("wheel", onWheel as any, { passive: false });

  updateCamera();
  return { 
    tick: () => {
      const D = 0.08;
      spherical.theta += dampTheta * D;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi + dampPhi * D));
      radius = Math.max(10, Math.min(60, radius + dampRadius * D));
      dampTheta *= (1 - D); dampPhi *= (1 - D); dampRadius *= (1 - D);
      updateCamera();
    },
    dispose: () => {
      domElement.removeEventListener("pointerdown", onPointerDown as any);
      domElement.removeEventListener("pointermove", onPointerMove as any);
      domElement.removeEventListener("wheel", onWheel as any);
    }
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PiApproximationLab() {
 
  const { t } = useLanguage();
  const mountRef = useRef<HTMLDivElement>(null);
  const [sides, setSides] = useState(6);
  const radius = 10;

  // Real-time Pi Approximation calculation
  const polygonPerimeter = sides * Math.sin(Math.PI / sides) * (radius * 2);
  const piApprox = polygonPerimeter / (radius * 2);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 1000);
    
    // 1. Grid & Lighting
    const isLight = document.body.classList.contains('light-mode');
    const gridColor1 = isLight ? 0xcbd5e1 : 0x1e293b;
    const gridColor2 = isLight ? 0x94a3b8 : 0x0f172a;
    const grid = new THREE.GridHelper(40, 40, gridColor1, gridColor2);
    scene.add(grid);
    scene.add(new THREE.AmbientLight(0xffffff, isLight ? 0.8 : 0.4));
    const light = new THREE.PointLight(0x6366f1, 1, 100);
    light.position.set(10, 20, 10);
    scene.add(light);

    const labGroup = new THREE.Group();
    scene.add(labGroup);

    // 2. Reference Circle (The Target)
    const circleGeo = new THREE.TorusGeometry(radius, 0.05, 16, 100);
    const circleMat = new THREE.MeshBasicMaterial({ color: isLight ? 0x64748b : 0x1e293b, transparent: true, opacity: 0.5 });
    const circle = new THREE.Mesh(circleGeo, circleMat);
    circle.rotation.x = Math.PI / 2;
    labGroup.add(circle);
    // 3. The Approximation Polygon
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    const polyGeo = new THREE.BufferGeometry().setFromPoints(points);
    const polyMat = new THREE.LineBasicMaterial({ color: 0x6366f1, linewidth: 2 });
    const polygon = new THREE.Line(polyGeo, polyMat);
    labGroup.add(polygon);

    // 4. Vertex Points (Spheres at each corner)
    const vertexGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const vertexMat = new THREE.MeshStandardMaterial({ color: 0x818cf8, emissive: 0x818cf8, emissiveIntensity: 0.5 });
    points.forEach(p => {
      const v = new THREE.Mesh(vertexGeo, vertexMat);
      v.position.copy(p);
      labGroup.add(v);
    });

    const controls = createOrbitControls(camera, renderer.domElement);

    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.tick();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      controls.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [sides]);

  return (
    <div className="relative w-full h-full bg-[var(--bg-deep)] rounded-[40px] border border-[var(--border-glass)] overflow-hidden font-mono flex flex-col group transition-colors duration-500">
      
      {/* Header HUD */}
      <div className="absolute top-8 right-8 z-10 flex items-center gap-4 bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border-glass)] p-4 rounded-2xl shadow-lg">
        <BoxSelect className="text-[var(--color-primary)]" size={18} />
        <span className="text-[var(--text-primary)] text-[10px] tracking-[0.3em] uppercase font-bold">{t('Limit Theorem Lab')}</span>
      </div>

      <div ref={mountRef} className="flex-1 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* BIG TOP-LEFT LEGEND & CONTROL */}
      <div className="absolute top-8 left-8 z-20 bg-[var(--bg-panel)] backdrop-blur-2xl border border-[var(--border-glass)] rounded-3xl p-8 shadow-2xl space-y-8 w-[340px]">
        
        <div className="flex items-center gap-3 text-[11px] text-[var(--color-primary)] uppercase tracking-[0.3em] font-bold border-b border-[var(--border-glass)] pb-4">
          <Plus size={16} />
          <span>{t('Geometry Scanner')}</span>
        </div>

        {/* Manual Input / Control */}
        <div className="space-y-4">
           <div className="flex justify-between items-center">
             <label className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] font-bold">{t('Polygon Sides (n)')}</label>
             <span className="text-xl text-[var(--text-primary)] font-bold">{sides}</span>
           </div>
           
           <div className="flex gap-2">
             <button 
               onClick={() => setSides(Math.max(3, sides - 1))}
               className="flex-1 bg-[var(--bg-panel)] border border-[var(--border-glass)] py-3 rounded-xl hover:bg-[var(--color-primary)]/10 transition-all flex justify-center"
             >
               <Minus size={16} className="text-[var(--text-muted)]" />
             </button>
             <button 
               onClick={() => setSides(sides + 1)}
               className="flex-1 bg-[var(--color-primary)] border border-[var(--color-primary)]/20 py-3 rounded-xl hover:opacity-90 transition-all flex justify-center shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)]"
             >
               <Plus size={16} className="text-white" />
             </button>
           </div>
           
           <input 
             type="range" min="3" max="100" step="1"
             value={sides}
             onChange={(e) => setSides(parseInt(e.target.value))}
             className="w-full accent-[var(--color-primary)] h-1 mt-4"
           />
        </div>

        {/* Real-time Math Panel */}
        <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-2xl p-6 space-y-4">
          <div>
            <div className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest mb-1">{t('Current Ratio (P / D)')}</div>
            <div className="text-2xl text-[var(--text-primary)] font-bold tracking-tighter">
              {piApprox.toFixed(6)}
            </div>
          </div>
          
          <div className="pt-4 border-t border-[var(--border-glass)] flex items-start gap-3">
            <Info size={14} className="text-[var(--color-primary)] mt-1 shrink-0" />
            <p className="text-[9px] text-[var(--text-muted)] leading-relaxed uppercase tracking-wider">{t('As')}<span className="text-[var(--color-primary)]">n</span>{t('increases, the perimeter of the blue shape approaches the circumference of the circle.')}</p>
          </div>
        </div>

      </div>

      {/* Helper */}
      <div className="absolute bottom-8 right-8 z-10 flex items-center gap-4 bg-[var(--bg-panel)] border border-[var(--border-glass)] px-6 py-3 rounded-full backdrop-blur-sm opacity-80 shadow-sm">
        <MousePointer2 size={14} className="text-[var(--text-muted)]" />
        <span className="text-[var(--text-muted)] text-[9px] tracking-[0.2em] uppercase">{t('Orbit to verify the polygon gap')}</span>
      </div>

    </div>
  );
}