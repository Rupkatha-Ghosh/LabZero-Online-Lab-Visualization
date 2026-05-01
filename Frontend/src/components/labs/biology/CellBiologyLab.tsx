import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrbitControls {
  tick: () => void;
  dispose: () => void;
}

interface LabelEntry {
  color: string;
  label: string;
}

interface CellResult {
  group: THREE.Group;
  nucleus: THREE.Group;
}

// ─── Inline Orbit Controls (no addon import needed) ──────────────────────────

function createOrbitControls(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement
): OrbitControls {
  let isPointerDown = false;
  let lastX = 0;
  let lastY = 0;
  const spherical = { theta: 0, phi: Math.PI / 2.5 };
  let radius = 25;
  const target = new THREE.Vector3(0, 0, 0);
  let dampTheta = 0;
  let dampPhi = 0;
  let dampRadius = 0;

  const updateCamera = (): void => {
    const x = target.x + radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    const y = target.y + radius * Math.cos(spherical.phi);
    const z = target.z + radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    camera.position.set(x, y, z);
    camera.lookAt(target);
  };

  const onPointerDown = (e: PointerEvent): void => {
    isPointerDown = true;
    lastX = e.clientX;
    lastY = e.clientY;
  };
  const onPointerMove = (e: PointerEvent): void => {
    if (!isPointerDown) return;
    dampTheta -= (e.clientX - lastX) * 0.005;
    dampPhi   -= (e.clientY - lastY) * 0.005;
    lastX = e.clientX;
    lastY = e.clientY;
  };
  const onPointerUp = (): void => { isPointerDown = false; };
  const onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    dampRadius += e.deltaY * 0.02;
  };

  domElement.addEventListener("pointerdown",  onPointerDown);
  domElement.addEventListener("pointermove",  onPointerMove);
  domElement.addEventListener("pointerup",    onPointerUp);
  domElement.addEventListener("pointerleave", onPointerUp);
  domElement.addEventListener("wheel",        onWheel, { passive: false });

  updateCamera();

  const tick = (): void => {
    const D = 0.08;
    spherical.theta += dampTheta * D;
    spherical.phi    = Math.max(0.15, Math.min(Math.PI - 0.15, spherical.phi + dampPhi * D));
    radius           = Math.max(10, Math.min(50, radius + dampRadius * D));
    dampTheta  *= (1 - D);
    dampPhi    *= (1 - D);
    dampRadius *= (1 - D);
    updateCamera();
  };

  const dispose = (): void => {
    domElement.removeEventListener("pointerdown",  onPointerDown);
    domElement.removeEventListener("pointermove",  onPointerMove);
    domElement.removeEventListener("pointerup",    onPointerUp);
    domElement.removeEventListener("pointerleave", onPointerUp);
    domElement.removeEventListener("wheel",        onWheel);
  };

  return { tick, dispose };
}

// ─── Build Cell Anatomy ───────────────────────────────────────────────────────

function buildCell(scene: THREE.Scene): CellResult {
  const group = new THREE.Group();
  scene.add(group);

  // 1. Cell Membrane (Semi-transparent Bowl)
  const membraneMat = new THREE.MeshPhysicalMaterial({
    color: 0x3b82f6,
    roughness: 0.1,
    transmission: 0.5,
    thickness: 0.5,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4
  });
  const membrane = new THREE.Mesh(
    new THREE.SphereGeometry(12, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2),
    membraneMat
  );
  membrane.rotation.x = Math.PI / 2;
  membrane.userData = { label: "Cell Membrane", sub: "Selectively permeable barrier" };
  group.add(membrane);

  // 2. Cytoplasm (Surface Disc)
  const fluid = new THREE.Mesh(
    new THREE.CircleGeometry(11.9, 64),
    new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.5 })
  );
  fluid.userData = { label: "Cytoplasm", sub: "Metabolic fluid matrix" };
  group.add(fluid);

  // 3. Nucleus Group
  const nucleusGroup = new THREE.Group();
  const nucleus = new THREE.Mesh(
    new THREE.SphereGeometry(3.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xa855f7, side: THREE.DoubleSide })
  );
  nucleus.rotation.x = -Math.PI / 2;
  nucleus.userData = { label: "Nucleus", sub: "Genetic control center" };
  nucleusGroup.add(nucleus);

  const nucleolus = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0x701a75, emissiveIntensity: 0.2 })
  );
  nucleolus.userData = { label: "Nucleolus", sub: "Ribosome production site" };
  nucleusGroup.add(nucleolus);
  group.add(nucleusGroup);

  // 4. Mitochondria
  const mitoMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 });
  const mitoPositions = [
    { x: 6, y: 5, r: 1 }, { x: -7, y: 3, r: 2.5 }, { x: 5, y: -6, r: -1 }
  ];
  mitoPositions.forEach(pos => {
    const mito = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 1.2, 8, 16), mitoMat);
    mito.position.set(pos.x, pos.y, 0.5);
    mito.rotation.z = pos.r;
    mito.userData = { label: "Mitochondrion", sub: "ATP Energy production" };
    group.add(mito);
  });

  // 5. Golgi Apparatus (Stacked Torus segments)
  const golgiMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
  for (let i = 0; i < 4; i++) {
    const golgi = new THREE.Mesh(new THREE.TorusGeometry(2, 0.2, 16, 32, Math.PI * 0.8), golgiMat);
    golgi.position.set(-6, -3 + (i * 0.5), 0.5);
    golgi.rotation.z = 1.5;
    golgi.userData = { label: "Golgi Body", sub: "Protein packaging & sorting" };
    group.add(golgi);
  }

  // 6. Endoplasmic Reticulum (Teal Rings)
  const erMat = new THREE.MeshStandardMaterial({ color: 0x0d9488, side: THREE.DoubleSide });
  for (let i = 0; i < 3; i++) {
    const er = new THREE.Mesh(new THREE.TorusGeometry(4.5 + (i * 0.7), 0.25, 16, 64, Math.PI * 1.1), erMat);
    er.userData = { label: "Endoplasmic Reticulum", sub: "Protein & Lipid synthesis" };
    group.add(er);
  }

  return { group, nucleus: nucleusGroup };
}

// ─── Legend data ─────────────────────────────────────────────────────────────

const LABELS: LabelEntry[] = [
  { color: "#3b82f6", label: "Cell Membrane" },
  { color: "#a855f7", label: "Nucleus" },
  { color: "#f43f5e", label: "Mitochondria" },
  { color: "#f59e0b", label: "Golgi Body" },
  { color: "#0d9488", label: "ER" },
  { color: "#f472b6", label: "Nucleolus" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const CellBiologyLab: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 1000);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(10, 15, 10);
    scene.add(dir);
    const rim = new THREE.PointLight(0x3b82f6, 0.8, 40);
    rim.position.set(0, 10, 0);
    scene.add(rim);

    const { group, nucleus } = buildCell(scene);
    const controls = createOrbitControls(camera, renderer.domElement);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (e: MouseEvent): void => {
      const tip = tooltipRef.current;
      if (!tip) return;
      const rect = el.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(group.children, true);

      if (hits.length > 0 && hits[0].object.userData.label) {
        const { label, sub } = hits[0].object.userData as { label: string; sub: string };
        tip.style.opacity = "1";
        tip.style.left = `${e.clientX - rect.left + 16}px`;
        tip.style.top = `${e.clientY - rect.top + 16}px`;
        tip.innerHTML = `<span style="font-weight:700;letter-spacing:.12em">${label}</span><br/><span style="opacity:.7">${sub}</span>`;
        renderer.domElement.style.cursor = "crosshair";
      } else {
        tip.style.opacity = "0";
        renderer.domElement.style.cursor = "grab";
      }
    };
    el.addEventListener("mousemove", onMouseMove);

    let rafId: number;
    let t = 0;

    const animate = (): void => {
      rafId = requestAnimationFrame(animate);
      t += 0.01;

      nucleus.rotation.y += 0.002;
      const s = 1 + Math.sin(t * 0.5) * 0.008;
      group.scale.set(s, s, s);

      controls.tick();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = (): void => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      controls.dispose();
      el.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#030712",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Mono', monospace",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#3b82f6",
            boxShadow: "0 0 10px #3b82f6",
          }}
        />
        <span style={{ color: "#dbeafe", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Eukaryotic Cell — Interactive 3D Anatomy
        </span>
      </div>

      <div style={{ position: "relative", flex: 1 }}>
        <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab" }} />

        <div
          ref={tooltipRef}
          style={{
            position: "absolute",
            pointerEvents: "none",
            opacity: 0,
            transition: "opacity 0.15s",
            background: "rgba(2,6,23,0.92)",
            border: "1px solid rgba(59,130,246,0.35)",
            color: "#dbeafe",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            padding: "8px 14px",
            borderRadius: 10,
            backdropFilter: "blur(8px)",
            lineHeight: 1.8,
            whiteSpace: "nowrap",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            background: "rgba(2,6,23,0.75)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "12px 16px",
            backdropFilter: "blur(10px)",
          }}
        >
          {LABELS.map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: color,
                  boxShadow: `0 0 6px ${color}`,
                }}
              />
              <span style={{ color: "#94a3b8", fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            background: "rgba(2,6,23,0.75)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: "8px 14px",
            backdropFilter: "blur(10px)",
          }}
        >
          <span style={{ color: "#475569", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Drag to Rotate · Scroll to Zoom · Hover for Organelles
          </span>
        </div>
      </div>
    </div>
  );
};

export default CellBiologyLab;