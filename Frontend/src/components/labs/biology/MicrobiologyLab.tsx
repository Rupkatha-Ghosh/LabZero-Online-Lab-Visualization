import { useEffect, useRef } from "react";
import * as THREE from "three";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrbitControls {
  tick: () => void;
  dispose: () => void;
}

interface PlasmidPos {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
}

interface LabelEntry {
  color: string;
  label: string;
}

interface BacteriumResult {
  group: THREE.Group;
  nucleoid: THREE.Mesh;
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
  let radius = 20;
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
  const onTouchStart = (e: TouchEvent): void => {
    isPointerDown = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  };
  const onTouchMove = (e: TouchEvent): void => {
    if (!isPointerDown) return;
    dampTheta -= (e.touches[0].clientX - lastX) * 0.005;
    dampPhi   -= (e.touches[0].clientY - lastY) * 0.005;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  };

  domElement.addEventListener("pointerdown",  onPointerDown);
  domElement.addEventListener("pointermove",  onPointerMove);
  domElement.addEventListener("pointerup",    onPointerUp);
  domElement.addEventListener("pointerleave", onPointerUp);
  domElement.addEventListener("wheel",        onWheel, { passive: false });
  domElement.addEventListener("touchstart",   onTouchStart, { passive: true });
  domElement.addEventListener("touchmove",    onTouchMove,  { passive: true });
  domElement.addEventListener("touchend",     onPointerUp);

  updateCamera();

  const tick = (): void => {
    const D = 0.08;
    spherical.theta += dampTheta * D;
    spherical.phi    = Math.max(0.15, Math.min(Math.PI - 0.15, spherical.phi + dampPhi * D));
    radius           = Math.max(8, Math.min(40, radius + dampRadius * D));
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
    domElement.removeEventListener("touchstart",   onTouchStart);
    domElement.removeEventListener("touchmove",    onTouchMove);
    domElement.removeEventListener("touchend",     onPointerUp);
  };

  return { tick, dispose };
}

// ─── Build Bacterium ──────────────────────────────────────────────────────────

function buildBacterium(scene: THREE.Scene): BacteriumResult {
  const group = new THREE.Group();
  scene.add(group);

  const BODY_R = 2;
  const BODY_H = 3;

  // Cell body: cylinder + two hemisphere caps (CapsuleGeometry not in r128)
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x10b981,
    roughness: 0.15,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
  });

  const addBodyPart = (geo: THREE.BufferGeometry, pos: THREE.Vector3): void => {
    const m = new THREE.Mesh(geo, bodyMat);
    m.position.copy(pos);
    m.userData = { label: "Cell Membrane & Wall", sub: "Protection & Structure" };
    group.add(m);
  };
  addBodyPart(
    new THREE.CylinderGeometry(BODY_R, BODY_R, BODY_H * 2, 64),
    new THREE.Vector3(0, 0, 0)
  );
  addBodyPart(
    new THREE.SphereGeometry(BODY_R, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.Vector3(0, BODY_H, 0)
  );
  addBodyPart(
    new THREE.SphereGeometry(BODY_R, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    new THREE.Vector3(0, -BODY_H, 0)
  );

  // Nucleoid – torus knot DNA
  const nucleoid = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.75, 0.18, 120, 16),
    new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.3,
      emissive: new THREE.Color(0x7f1d1d),
      emissiveIntensity: 0.2,
    })
  );
  nucleoid.userData = { label: "Nucleoid", sub: "Tangled Bacterial DNA" };
  group.add(nucleoid);

  // Plasmids
  const plasmidMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: new THREE.Color(0x78350f),
    emissiveIntensity: 0.15,
  });
  const plasmidPositions: PlasmidPos[] = [
    { x: 1.2,  y: 0.8,  z: 0.5,  rx: 1,   ry: 2   },
    { x: -1.0, y: -0.8, z: -0.4, rx: 0.5, ry: 1   },
    { x: 1.4,  y: -0.6, z: 0.3,  rx: 2,   ry: 0.5 },
  ];
  plasmidPositions.forEach(({ x, y, z, rx, ry }) => {
    const p = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.08, 16, 32), plasmidMat);
    p.position.set(x, y, z);
    p.rotation.set(rx, ry, 0);
    p.userData = { label: "Plasmid", sub: "Extra-chromosomal DNA" };
    group.add(p);
  });

  // Flagella – wavy tubes
  const flagMat = new THREE.MeshStandardMaterial({ color: 0x34d399 });
  for (let i = 0; i < 3; i++) {
    const t = i - 1;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -BODY_H - 0.2, t * 0.6),
      new THREE.Vector3(0, -BODY_H - 2,   t * 1.2 + Math.sin(i) * 0.5),
      new THREE.Vector3(0, -BODY_H - 4,   t * 0.6 + Math.cos(i) * 1.5),
      new THREE.Vector3(0, -BODY_H - 7,   t * 2   + Math.sin(i) * 2.5),
    ]);
    const flag = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 24, 0.07, 8, false),
      flagMat
    );
    flag.userData = { label: "Flagellum", sub: "Motor for Locomotion" };
    group.add(flag);
  }

  // Pili – surface hairs
  const piliMat = new THREE.MeshStandardMaterial({ color: 0x6ee7b7 });
  const piliGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.55, 4);
  for (let i = 0; i < 120; i++) {
    const theta = Math.random() * Math.PI * 2;
    const yFrac = (Math.random() - 0.5) * 2;
    const yPos  = yFrac * (BODY_H + BODY_R);
    const absY  = Math.abs(yPos);
    let r: number;
    if (absY <= BODY_H) {
      r = BODY_R;
    } else {
      const cap = absY - BODY_H;
      r = Math.sqrt(Math.max(0, BODY_R * BODY_R - cap * cap));
    }
    if (r < 0.2) continue;
    const pili = new THREE.Mesh(piliGeo, piliMat);
    pili.position.set(Math.sin(theta) * r, yPos, Math.cos(theta) * r);
    pili.lookAt(Math.sin(theta) * r * 3, yPos, Math.cos(theta) * r * 3);
    pili.userData = { label: "Pili", sub: "Attachment to surfaces" };
    group.add(pili);
  }

  // Ribosomes – tiny scattered dots
  const riboMat = new THREE.MeshStandardMaterial({
    color: 0xa78bfa,
    emissive: new THREE.Color(0x4c1d95),
    emissiveIntensity: 0.2,
  });
  const riboGeo = new THREE.SphereGeometry(0.12, 8, 8);
  for (let i = 0; i < 30; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.random() * Math.PI;
    const ribo  = new THREE.Mesh(riboGeo, riboMat);
    ribo.position.set(
      Math.sin(phi) * Math.cos(theta) * 1.4,
      (Math.random() - 0.5) * BODY_H * 1.5,
      Math.sin(phi) * Math.sin(theta) * 1.4
    );
    ribo.userData = { label: "Ribosome", sub: "Protein Synthesis" };
    group.add(ribo);
  }

  group.rotation.z = Math.PI / 2;
  return { group, nucleoid };
}

// ─── Legend data ─────────────────────────────────────────────────────────────

const LABELS: LabelEntry[] = [
  { color: "#10b981", label: "Cell Membrane" },
  { color: "#f43f5e", label: "Nucleoid (DNA)" },
  { color: "#f59e0b", label: "Plasmid" },
  { color: "#34d399", label: "Flagellum" },
  { color: "#6ee7b7", label: "Pili" },
  { color: "#a78bfa", label: "Ribosome" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const MicrobiologyLab: React.FC = () => {
  const mountRef   = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    // Scene / Camera
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      el.clientWidth / el.clientHeight,
      0.1,
      1000
    );

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(10, 15, 10);
    scene.add(dir);
    const back = new THREE.DirectionalLight(0x3b82f6, 0.6);
    back.position.set(-10, -10, -10);
    scene.add(back);
    const rim = new THREE.PointLight(0x10b981, 0.8, 30);
    rim.position.set(0, 8, 0);
    scene.add(rim);

    // Bacterium
    const { group, nucleoid } = buildBacterium(scene);

    // Orbit controls
    const controls = createOrbitControls(camera, renderer.domElement);

    // Raycaster for hover labels
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();

    const onMouseMove = (e: MouseEvent): void => {
      const tip = tooltipRef.current;
      if (!tip) return;
      const rect = el.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(group.children, true);

      if (hits.length > 0 && hits[0].object.userData.label) {
        const { label, sub } = hits[0].object.userData as { label: string; sub: string };
        tip.style.opacity = "1";
        tip.style.left    = `${e.clientX - rect.left + 16}px`;
        tip.style.top     = `${e.clientY - rect.top  + 16}px`;
        tip.innerHTML     = `<span style="font-weight:700;letter-spacing:.12em">${label}</span><br/><span style="opacity:.7">${sub}</span>`;
        renderer.domElement.style.cursor = "crosshair";
      } else {
        tip.style.opacity = "0";
        renderer.domElement.style.cursor = "grab";
      }
    };
    el.addEventListener("mousemove", onMouseMove);

    // Animation loop — pure Three.js, no React state mutations
    let rafId: number;
    let t = 0;

    const animate = (): void => {
      rafId = requestAnimationFrame(animate);
      t += 0.01;

      nucleoid.rotation.x += 0.006;
      nucleoid.rotation.y += 0.003;

      const s = 1 + Math.sin(t * 0.8) * 0.012;
      group.scale.set(s, s, s);

      controls.tick();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const onResize = (): void => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      controls.dispose();
      el.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
      renderer.dispose();
      renderer.domElement.style.cursor = "";
    };
  }, []); // empty deps — Three.js owns its own loop

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
      {/* Header */}
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
            background: "#10b981",
            boxShadow: "0 0 10px #10b981",
          }}
        />
        <span
          style={{
            color: "#d1fae5",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Prokaryotic Cell — Interactive 3D Model
        </span>
      </div>

      {/* Viewport */}
      <div style={{ position: "relative", flex: 1 }}>
        <div
          ref={mountRef}
          style={{ width: "100%", height: "100%", cursor: "grab" }}
        />

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          style={{
            position: "absolute",
            pointerEvents: "none",
            opacity: 0,
            transition: "opacity 0.15s",
            background: "rgba(2,6,23,0.92)",
            border: "1px solid rgba(16,185,129,0.35)",
            color: "#d1fae5",
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

        {/* Legend */}
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
              <span
                style={{
                  color: "#94a3b8",
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Controls hint */}
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
          <span
            style={{
              color: "#475569",
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Drag · Scroll to zoom · Hover for labels
          </span>
        </div>
      </div>
    </div>
  );
};

export default MicrobiologyLab;