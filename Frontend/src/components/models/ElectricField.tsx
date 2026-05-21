import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

const D = 1.6;
const Q_POS = new THREE.Vector3(-D, 0, 0);
const Q_NEG = new THREE.Vector3(D, 0, 0);

// Dipole physics field calculation
const getEField = (p: THREE.Vector3) => {
    const r1 = new THREE.Vector3().subVectors(p, Q_POS);
    const d1 = r1.length();
    const e1 = d1 < 0.1 ? new THREE.Vector3() : r1.normalize().multiplyScalar(1 / (d1 * d1));

    const r2 = new THREE.Vector3().subVectors(p, Q_NEG);
    const d2 = r2.length();
    const e2 = d2 < 0.1 ? new THREE.Vector3() : r2.normalize().multiplyScalar(-1 / (d2 * d2));

    return new THREE.Vector3().addVectors(e1, e2);
};

const traceDipoleLine = (startP: THREE.Vector3) => {
    const pts = [startP.clone()];
    let curr = startP.clone();
    const step = 0.06;
    for (let i = 0; i < 300; i++) {
        const E = getEField(curr);
        if (E.length() < 0.001) break;
        curr.add(E.normalize().multiplyScalar(step));
        pts.push(curr.clone());
        if (curr.distanceTo(Q_NEG) < 0.25) {
            pts.push(Q_NEG.clone());
            break;
        }
        if (curr.length() > 8) break;
    }
    return pts.length > 3 ? pts : null;
};

const generateDipoleLines = () => {
    const lines: THREE.Vector3[][] = [];
    const numPhi = 8;
    const numTheta = 10;

    for (let i = 0; i < numPhi; i++) {
        const phi = (i / numPhi) * Math.PI * 2;
        for (let j = 1; j < numTheta; j++) {
            const theta = (j / numTheta) * Math.PI;
            const r = 0.3;
            const startP = new THREE.Vector3(
                -D + r * Math.sin(theta) * Math.cos(phi),
                r * Math.sin(theta) * Math.sin(phi),
                r * Math.cos(theta)
            );
            const line = traceDipoleLine(startP);
            if (line) lines.push(line);
        }
    }
    return lines;
};

const FieldLine = ({ points }: { points: THREE.Vector3[] }) => {
    const line = useMemo(() => {
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const colors = [];
        const cRed = new THREE.Color('#EF4444');
        const cNeut = new THREE.Color('#CBD5E1');
        const cBlue = new THREE.Color('#3B82F6');

        for (let i = 0; i < points.length; i++) {
            const t = (points[i].x + D) / (2 * D);
            const ct = Math.max(0, Math.min(1, t));
            let color;
            if (ct < 0.4) color = new THREE.Color().lerpColors(cRed, cNeut, ct / 0.4);
            else if (ct > 0.6) color = new THREE.Color().lerpColors(cNeut, cBlue, (ct - 0.6) / 0.4);
            else color = cNeut;
            colors.push(color.r, color.g, color.b);
        }
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.25 });
        return new THREE.Line(geo, material);
    }, [points]);

    return <primitive object={line} />;
}

const LightParticles = ({ lines }: { lines: THREE.Vector3[][] }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const tempMatrix = new THREE.Matrix4();
    const tempPos = new THREE.Vector3();

    const curves = useMemo(() => {
        return lines.map(pts => new THREE.CatmullRomCurve3(pts));
    }, [lines]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.elapsedTime;
        curves.forEach((curve, i) => {
            const speed = 0.1 + (i % 3) * 0.05;
            const pt = (t * speed + (i * 0.77)) % 1.0;
            curve.getPointAt(pt, tempPos);
            tempMatrix.setPosition(tempPos);
            const pulse = 0.5 + 0.5 * Math.sin(t * 3 + i);
            tempMatrix.scale(new THREE.Vector3(pulse, pulse, pulse));
            meshRef.current!.setMatrixAt(i, tempMatrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, curves.length]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
        </instancedMesh>
    );
};

const GlossyCharges = () => {
    const posRef = useRef<THREE.Mesh>(null);
    const negRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        const pulse = 1.0 + 0.015 * Math.sin(t * 2);
        if (posRef.current) posRef.current.scale.set(pulse, pulse, pulse);
        if (negRef.current) negRef.current.scale.set(pulse, pulse, pulse);
    });

    return (
        <>
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
                <mesh ref={posRef} position={Q_POS}>
                    <sphereGeometry args={[0.25, 32, 32]} />
                    <meshPhongMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.4} shininess={100} />
                    <pointLight color="#EF4444" intensity={5} distance={5} />
                    <Text position={[0, 0, 0.26]} fontSize={0.25} color="white" anchorX="center" anchorY="middle">+</Text>
                    <Text position={[0, 0, -0.26]} rotation={[0, Math.PI, 0]} fontSize={0.25} color="white" anchorX="center" anchorY="middle">+</Text>
                </mesh>
            </Float>

            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
                <mesh ref={negRef} position={Q_NEG}>
                    <sphereGeometry args={[0.25, 32, 32]} />
                    <meshPhongMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.4} shininess={100} />
                    <pointLight color="#3B82F6" intensity={5} distance={5} />
                    <Text position={[0, 0, 0.26]} fontSize={0.25} color="white" anchorX="center" anchorY="middle">−</Text>
                    <Text position={[0, 0, -0.26]} fontSize={0.25} color="white" anchorX="center" anchorY="middle">−</Text>
                </mesh>
            </Float>
        </>
    );
};

export const ElectricFieldSimulation = ({ theme = 'light' }: { theme?: 'light' | 'dark' }) => {
    const lines = useMemo(() => generateDipoleLines(), []);
    const bgColor = theme === 'dark' ? "#0f172a" : "#F8FAFC";
    const textColor = theme === 'dark' ? "#f8fafc" : "#0F172A";
    const mutedColor = theme === 'dark' ? "#94a3b8" : "#64748B";
    const gridColor1 = theme === 'dark' ? "#334155" : "#CBD5E1";
    const gridColor2 = theme === 'dark' ? "#1e293b" : "#F1F5F9";

    return (
        <div className={`w-full h-full relative p-0 overflow-hidden rounded-[24px] transition-colors duration-500`} style={{ backgroundColor: bgColor }}>
            <Canvas camera={{ position: [0, 4, 8], fov: 40 }} dpr={[1, 2]}>
                <color attach="background" args={[bgColor]} />
                <ambientLight intensity={theme === 'dark' ? 1 : 1.5} />
                <spotLight position={[10, 10, 10]} intensity={theme === 'dark' ? 1 : 1.5} />

                <React.Suspense fallback={null}>
                    <group position={[0, 0, 0]}>
                        {lines.map((pts, i) => <FieldLine key={i} points={pts} />)}
                        <LightParticles lines={lines} />
                        <GlossyCharges />
                    </group>
                </React.Suspense>

                {/* Ground grid */}
                <gridHelper args={[10, 20, gridColor1, gridColor2]} position={[0, -2, 0]} material-transparent material-opacity={0.4} />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    maxPolarAngle={Math.PI / 2.1}
                    minPolarAngle={Math.PI / 4}
                />
            </Canvas>

            {/* Legend - Responsive (Vertical on Desktop, Horizontal on Mobile) */}
            <div className={`absolute z-10 p-3 sm:p-4 backdrop-blur-md rounded-2xl sm:rounded-3xl border shadow-sm transition-all duration-500 
                ${theme === 'dark' ? 'bg-slate-900/60 border-white/10' : 'bg-white/40 border-white/50'}
                bottom-4 right-4 sm:right-4 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 flex flex-row sm:flex-col items-center gap-3`}
            >
                <span className={`text-[11px] sm:text-[12px] font-bold sm:mb-2 tracking-wide transition-colors duration-500`} style={{ color: textColor }}>|E|</span>
                
                <div className="flex flex-row sm:flex-col items-center gap-2">
                    <span className={`text-[9px] sm:mb-1 transition-colors duration-500`} style={{ color: mutedColor }}>
                        {/* High at top on desktop, Right on mobile */}
                        <span className="hidden sm:inline">High</span>
                        <span className="sm:hidden">Low</span>
                    </span>
                    
                    <div className="h-1.5 w-24 sm:w-2.5 sm:h-32 rounded-full bg-gradient-to-r sm:bg-gradient-to-b from-[#3B82F6] via-[#FDE047] to-[#EF4444] sm:from-[#EF4444] sm:via-[#FDE047] sm:to-[#3B82F6] my-1" />
                    
                    <span className={`text-[9px] sm:mt-1 transition-colors duration-500`} style={{ color: mutedColor }}>
                        <span className="hidden sm:inline">Low</span>
                        <span className="sm:hidden">High</span>
                    </span>
                </div>
            </div>
        </div>
    );

};

