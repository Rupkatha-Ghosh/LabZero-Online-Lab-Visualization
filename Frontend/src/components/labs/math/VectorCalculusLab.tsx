import { useLanguage } from '../../../context/LanguageContext';
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MousePointer2, Move3d, Terminal } from "lucide-react";

// ─── TYPES ─────────────────────────────────────────────────────────────
type Vec3 = { x: number; y: number; z: number };

// ─── ORBIT CONTROLS (fixed cleanup) ────────────────────────────────────
function createOrbitControls(camera: THREE.PerspectiveCamera, dom: HTMLElement) {
  
  let isDown = false;
  let lastX = 0, lastY = 0;
  let theta = 0.8, phi = Math.PI / 3, radius = 30;

  const target = new THREE.Vector3();

  const update = () => {
    camera.position.set(
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.cos(theta)
    );
    camera.lookAt(target);
  };

  const onDown = (e: PointerEvent) => {
    isDown = true;
    lastX = e.clientX;
    lastY = e.clientY;
  };

  const onMove = (e: PointerEvent) => {
    if (!isDown) return;
    theta -= (e.clientX - lastX) * 0.005;
    phi -= (e.clientY - lastY) * 0.005;
    phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
    lastX = e.clientX;
    lastY = e.clientY;
  };

  const onUp = () => (isDown = false);
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    radius = Math.max(10, Math.min(60, radius + e.deltaY * 0.02));
  };

  dom.addEventListener("pointerdown", onDown);
  dom.addEventListener("pointermove", onMove);
  dom.addEventListener("pointerup", onUp);
  dom.addEventListener("wheel", onWheel, { passive: false });

  update();

  return {
    tick: update,
    dispose: () => {
      dom.removeEventListener("pointerdown", onDown);
      dom.removeEventListener("pointermove", onMove);
      dom.removeEventListener("pointerup", onUp);
      dom.removeEventListener("wheel", onWheel);
    }
  };
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────
export default function VectorCalculusLab() {
 
  const { t } = useLanguage();
  const mountRef = useRef<HTMLDivElement>(null);

  const [vecA, setVecA] = useState<Vec3>({ x: 5, y: 0, z: 0 });
  const [vecB, setVecB] = useState<Vec3>({ x: 0, y: 0, z: 5 });

  const cross: Vec3 = {
    x: vecA.y * vecB.z - vecA.z * vecB.y,
    y: vecA.z * vecB.x - vecA.x * vecB.z,
    z: vecA.x * vecB.y - vecA.y * vecB.x
  };

  const arrowsRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      el.clientWidth / el.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    // lights + grid
    const isLight = document.body.classList.contains('light-mode');
    const gridColor1 = isLight ? 0xcbd5e1 : 0x1e293b;
    const gridColor2 = isLight ? 0x94a3b8 : 0x0f172a;
    scene.add(new THREE.GridHelper(30, 30, gridColor1, gridColor2));
    scene.add(new THREE.AmbientLight(0xffffff, isLight ? 0.8 : 0.6));

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);
    // vector group
    const group = new THREE.Group();
    arrowsRef.current = group;
    scene.add(group);
    const controls = createOrbitControls(camera, renderer.domElement);

    let raf: number;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      controls.tick();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      controls.dispose();
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  // ─── UPDATE ARROWS ONLY (no full re-init) ────────────────────────────
  useEffect(() => {
    const group = arrowsRef.current;
    if (!group) return;

    group.clear();

    const makeArrow = (v: Vec3, color: number) => {
      const vec = new THREE.Vector3(v.x, v.y, v.z);
      if (vec.length() === 0) return;
      return new THREE.ArrowHelper(
        vec.clone().normalize(),
        new THREE.Vector3(),
        vec.length(),
        color
      );
    };

    const a = makeArrow(vecA, 0x3b82f6);
    const b = makeArrow(vecB, 0x10b981);
    const c = makeArrow(cross, 0xf43f5e);

    a && group.add(a);
    b && group.add(b);
    c && group.add(c);

  }, [vecA, vecB]);

  // ─── INPUT COMPONENT (typed) ─────────────────────────────────────────
  const InputField = ({
    label,
    value,
    onChange,
    color
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    color: string;
  }) => (
    <div className="flex flex-col gap-1">
      <span className={`text-[9px] font-bold uppercase ${color}`}>{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="bg-[var(--bg-deep)] border border-[var(--border-glass)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--color-primary)] font-mono"
      />
    </div>
  );

  // ─── UI ─────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full bg-[var(--bg-deep)] rounded-3xl overflow-hidden flex transition-colors duration-500">

      <div ref={mountRef} className="flex-1" />

      {/* Control Panel */}
      <div className="absolute top-6 left-6 bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border-glass)] p-6 rounded-2xl w-[300px] space-y-6 shadow-2xl">
        <div className="flex items-center gap-2 text-[var(--color-primary)] text-xs uppercase font-bold tracking-widest">
          <Move3d size={14} />{t('Coordinates')}</div>

        {/* Vector A */}
        <div className="space-y-2">
          <p className="text-blue-500 text-xs font-bold uppercase tracking-wider">{t('Vector A')}</p>
          <div className="grid grid-cols-3 gap-2">
            <InputField label="X" value={vecA.x} onChange={(v) => setVecA({ ...vecA, x: v })} color="text-blue-500"/>
            <InputField label="Y" value={vecA.y} onChange={(v) => setVecA({ ...vecA, y: v })} color="text-blue-500"/>
            <InputField label="Z" value={vecA.z} onChange={(v) => setVecA({ ...vecA, z: v })} color="text-blue-500"/>
          </div>
        </div>

        {/* Vector B */}
        <div className="space-y-2">
          <p className="text-emerald-500 text-xs font-bold uppercase tracking-wider">{t('Vector B')}</p>
          <div className="grid grid-cols-3 gap-2">
            <InputField label="X" value={vecB.x} onChange={(v) => setVecB({ ...vecB, x: v })} color="text-emerald-500"/>
            <InputField label="Y" value={vecB.y} onChange={(v) => setVecB({ ...vecB, y: v })} color="text-emerald-500"/>
            <InputField label="Z" value={vecB.z} onChange={(v) => setVecB({ ...vecB, z: v })} color="text-emerald-500"/>
          </div>
        </div>

        {/* Result */}
        <div className="text-rose-500 text-[11px] font-mono font-bold border-t border-[var(--border-glass)] pt-4 tracking-tight">
          C (A × B) = [{cross.x.toFixed(1)}, {cross.y.toFixed(1)}, {cross.z.toFixed(1)}]
        </div>
      </div>

      {/* Helper */}
      <div className="absolute bottom-6 right-6 text-[10px] text-[var(--text-muted)] flex items-center gap-2 font-bold uppercase tracking-widest bg-[var(--bg-panel)]/50 backdrop-blur-sm px-4 py-2 rounded-full border border-[var(--border-glass)]">
        <MousePointer2 size={12}/>{t('Drag to rotate')}</div>

    </div>
  );
}