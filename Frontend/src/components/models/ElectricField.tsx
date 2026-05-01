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
    const geometry = useMemo(() => {
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
        return geo;
    }, [points]);

    return (
        <primitive object={useMemo(() => new THREE.Line(geometry), [geometry])}>
            <lineBasicMaterial vertexColors={true} transparent opacity={0.25} />
        </primitive>
    );
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

export const ElectricFieldSimulation = () => {
    const lines = useMemo(() => generateDipoleLines(), []);

    return (
        <div className="w-full h-full relative p-0 overflow-hidden bg-[#F8FAFC] rounded-[24px]">
            <Canvas camera={{ position: [0, 4, 8], fov: 40 }} dpr={[1, 2]}>
                <color attach="background" args={["#F8FAFC"]} />
                <ambientLight intensity={1.5} />
                <spotLight position={[10, 10, 10]} intensity={1.5} />

                <group position={[0, 0, 0]}>
                    {lines.map((pts, i) => <FieldLine key={i} points={pts} />)}
                    <LightParticles lines={lines} />
                    <GlossyCharges />
                </group>

                {/* Ground grid */}
                <gridHelper args={[10, 20, "#CBD5E1", "#F1F5F9"]} position={[0, -2, 0]} material-transparent material-opacity={0.4} />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    maxPolarAngle={Math.PI / 2.1}
                    minPolarAngle={Math.PI / 4}
                />
            </Canvas>

            {/* Legend */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center z-10 p-4 bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 shadow-sm">
                <span className="text-[12px] text-[#0F172A] font-bold mb-3 tracking-wide">|E|</span>
                <span className="text-[10px] text-[#64748B] mb-1">High</span>
                <div className="w-2.5 h-36 rounded-full bg-gradient-to-b from-[#EF4444] via-[#FDE047] to-[#3B82F6] my-1" />
                <span className="text-[10px] text-[#64748B] mt-1">Low</span>
            </div>
        </div>
    );
};

export const InverseSquareGraph = () => {
    const generatePath = () => {
        let path = "";
        for (let i = 0; i <= 100; i++) {
            const r = 0.8 + (i / 100) * 4.3;
            const E = 1 / (r * r);
            const px = 35 + ((r - 0.7) / 4.3) * 185;
            const py = 160 - (E / 2.2) * 140;
            if (i === 0) path += `M ${px} ${py} `;
            else path += `L ${px} ${py} `;
        }
        return path;
    };

    return (
        <svg viewBox="0 0 250 190" className="w-full h-full overflow-visible">
            <line x1="35" y1="96" x2="48" y2="96" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="48" y1="160" x2="48" y2="96" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="35" y1="15" x2="35" y2="160" stroke="#0F172A" strokeWidth="1.5" />
            <polygon points="32,20 38,20 35,10" fill="#0F172A" />
            <text x="12" y="24" fontSize="13" fill="#0F172A" fontFamily="serif" fontWeight="600">|E|</text>
            <line x1="35" y1="160" x2="235" y2="160" stroke="#0F172A" strokeWidth="1.5" />
            <polygon points="230,157 230,163 240,160" fill="#0F172A" />
            <text x="238" y="172" fontSize="14" fill="#0F172A" fontStyle="italic" fontFamily="serif" fontWeight="600">r</text>
            {[1, 2, 3, 4].map(val => {
                const tickX = 35 + ((val - 0.7) / 4.3) * 185;
                return (
                    <g key={val}>
                        <line x1={tickX} y1="160" x2={tickX} y2="166" stroke="#0F172A" strokeWidth="1.5" />
                        <text x={tickX} y="180" fontSize="12" fill="#64748B" textAnchor="middle" fontWeight="500">{val}</text>
                    </g>
                );
            })}
            <path d={generatePath()} fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};
