import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Sphere, MeshTransmissionMaterial, TorusKnot, Environment, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = {
    physics: "#0EA5E9",
    chemistry: "#10B981",
    math: "#F97316",
    biology: "#8B5CF6",
};

// --- PROCEDURAL MODELS (Fallback) ---

const PhysicsModel = () => {
    const meshRef = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
        }
    });

    return (
        <group ref={meshRef}>
            <Sphere args={[1, 32, 32]}>
                <MeshTransmissionMaterial
                    thickness={0.5}
                    roughness={0.1}
                    transmission={1}
                    ior={1.2}
                    color={COLORS.physics}
                    backside
                />
            </Sphere>
            {[...Array(3)].map((_, i) => (
                <group key={i} rotation={[Math.PI * i / 3, 0, 0]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[1.5, 0.02, 16, 100]} />
                        <meshStandardMaterial color={COLORS.physics} emissive={COLORS.physics} emissiveIntensity={0.5} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

const ChemistryModelProcedural = () => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <group ref={groupRef}>
            <Sphere args={[0.8, 32, 32]}>
                <meshStandardMaterial color={COLORS.chemistry} roughness={0.1} metalness={0.8} />
            </Sphere>
            <TorusKnot args={[1.2, 0.05, 128, 32]}>
                <meshStandardMaterial color={COLORS.chemistry} emissive={COLORS.chemistry} emissiveIntensity={0.5} />
            </TorusKnot>
        </group>
    );
};

const MathModel = () => {
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <TorusKnot args={[0.8, 0.3, 128, 32]}>
                <MeshTransmissionMaterial
                    thickness={1}
                    roughness={0}
                    transmission={1}
                    ior={1.5}
                    color={COLORS.math}
                    backside
                />
            </TorusKnot>
        </Float>
    );
};

// --- DYNAMIC GLB MODEL LOADER ---

const DynamicGLBModel = ({ url }: { url: string }) => {
    const { scene } = useGLTF(url, 'https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
    const groupRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <group ref={groupRef}>
            <primitive object={scene} scale={1.0} position={[0, -0.5, 0]} />
        </group>
    );
};

// --- MAIN COMPONENT ---

interface Subject3DCardModelProps {
    subject: string;
    modelUrl?: string;
    imageUrl?: string; // New prop for fallback
    theme?: 'dark' | 'light';
}

export const Subject3DCardModel: React.FC<Subject3DCardModelProps> = ({ subject, modelUrl, imageUrl, theme = 'light' }) => {
    const isBiology = subject.toLowerCase().includes('biology');
    const name = subject.toLowerCase();

    // 1. If we have a custom URL from the backend, show the 3D loader
    if (modelUrl) {
        return (
            <div className="w-full h-full">
                <Canvas camera={{ position: [0, 0, 4], fov: 40 }} gl={{ alpha: true }}>
                    <ambientLight intensity={theme === 'dark' ? 0.5 : 1} />
                    <pointLight position={[10, 10, 10]} intensity={theme === 'dark' ? 1.5 : 1} />
                    <Suspense fallback={<Html center><div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></Html>}>
                        <DynamicGLBModel url={modelUrl} />
                    </Suspense>
                    <Environment preset="city" />
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
                </Canvas>
            </div>
        );
    }

    // 2. Special case for Biology iframe fallback
    if (isBiology) {
        return (
            <div className="w-full h-full relative overflow-hidden rounded-[24px] bg-white">
                <div className="absolute top-[-45px] bottom-[-45px] left-[-45px] right-[-45px] pointer-events-auto">
                    <iframe
                        title="Heart"
                        className="w-full h-full border-0"
                        src="https://sketchfab.com/models/a70c0c47fe4b4bbfabfc8f445365d5a4/embed?autostart=1&transparent=1&ui_controls=0"
                    />
                </div>
            </div>
        );
    }

    // 3. Procedural Fallbacks for core subjects
    const isCoreSubject = name.includes('physics') || name.includes('chemistry') || name.includes('math');
    if (isCoreSubject) {
        return (
            <div className="w-full h-full">
                <Canvas camera={{ position: [0, 0, 4], fov: 40 }} gl={{ alpha: true }}>
                    <ambientLight intensity={theme === 'dark' ? 0.5 : 1} />
                    <pointLight position={[10, 10, 10]} intensity={theme === 'dark' ? 1.5 : 1} />
                    {name.includes('physics') && <PhysicsModel />}
                    {name.includes('chemistry') && <ChemistryModelProcedural />}
                    {name.includes('math') && <MathModel />}
                    <Environment preset="city" />
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
                </Canvas>
            </div>
        );
    }

    // 4. Final Fallback: If no model URL and not a core subject, show the image URL
    if (imageUrl) {
        return (
            <div className="w-full h-full relative overflow-hidden rounded-[24px]">
                <img
                    src={imageUrl}
                    alt={subject}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
        );
    }

    // 5. Ultimate Fallback (Physics Model)
    return (
        <div className="w-full h-full">
            <Canvas camera={{ position: [0, 0, 4], fov: 40 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.5} />
                <PhysicsModel />
            </Canvas>
        </div>
    );
};
