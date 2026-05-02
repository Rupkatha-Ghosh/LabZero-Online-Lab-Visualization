import React, { useRef, Suspense, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Sphere, MeshTransmissionMaterial, TorusKnot, Environment, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = {
    physics: "#0EA5E9",
    chemistry: "#10B981",
    math: "#F97316",
    biology: "#8B5CF6",
};

// --- AUTO-SCALING WRAPPER ---
// This component ensures every model fills the same amount of space regardless of its original size
const AutoScaledModel = ({ scene }: { scene: THREE.Group }) => {
    const groupRef = useRef<THREE.Group>(null);

    useLayoutEffect(() => {
        if (groupRef.current) {
            // 1. Compute the bounding box of the model
            const box = new THREE.Box3().setFromObject(scene);
            const size = new THREE.Vector3();
            box.getSize(size);

            // 2. Calculate the scale factor to fit it into a standard volume (approx 4 units)
            const maxDim = Math.max(size.x, size.y, size.z);
            const scaleFactor = 4.5 / maxDim;
            scene.scale.setScalar(scaleFactor);

            // 3. Center the model
            const center = new THREE.Vector3();
            box.getCenter(center);
            scene.position.x += (scene.position.x - center.x) * scaleFactor;
            scene.position.y += (scene.position.y - center.y) * scaleFactor;
            scene.position.z += (scene.position.z - center.z) * scaleFactor;
        }
    }, [scene]);

    useFrame(({ clock }) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = clock.getElapsedTime() * 0.15;
        }
    });

    return (
        <group ref={groupRef}>
            <primitive object={scene} />
        </group>
    );
};

// --- PROCEDURAL MODELS (Fallback) ---

const PhysicsModel = () => {
    const meshRef = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
        }
    });

    return (
        <group ref={meshRef}>
            <Sphere args={[1.5, 32, 32]}>
                <MeshTransmissionMaterial
                    thickness={0.5}
                    roughness={0.2}
                    transmission={1}
                    ior={1.2}
                    color={COLORS.physics}
                    backside
                />
            </Sphere>
            {[...Array(3)].map((_, i) => (
                <group key={i} rotation={[Math.PI * i / 1.5, 0, 0]}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[3, 0.015, 16, 100]} />
                        <meshStandardMaterial color={COLORS.physics} emissive={COLORS.physics} emissiveIntensity={0.5} transparent opacity={0.2} />
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
            groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            <Sphere args={[1.2, 32, 32]}>
                <meshStandardMaterial color={COLORS.chemistry} roughness={0.1} metalness={0.8} />
            </Sphere>
            <TorusKnot args={[2, 0.05, 128, 32]}>
                <meshStandardMaterial color={COLORS.chemistry} emissive={COLORS.chemistry} emissiveIntensity={0.4} transparent opacity={0.4} />
            </TorusKnot>
        </group>
    );
};

const MathModel = () => {
    return (
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
            <TorusKnot args={[1.2, 0.4, 128, 32]}>
                <MeshTransmissionMaterial
                    thickness={1.5}
                    roughness={0.1}
                    transmission={1}
                    ior={1.3}
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
    return <AutoScaledModel scene={scene} />;
};

// --- MAIN COMPONENT ---

interface Subject3DCardModelProps {
    subject: string;
    modelUrl?: string; 
    imageUrl?: string; 
    theme?: 'dark' | 'light';
}

export const Subject3DCardModel: React.FC<Subject3DCardModelProps> = ({ subject, modelUrl, imageUrl, theme = 'light' }) => {
    const name = subject.toLowerCase();

    const SceneContent = () => {
        if (modelUrl) {
            return (
                <Suspense fallback={<Html center><div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div></Html>}>
                    <DynamicGLBModel url={modelUrl} />
                </Suspense>
            );
        }

        if (name.includes('physics')) return <PhysicsModel />;
        if (name.includes('chemistry')) return <ChemistryModelProcedural />;
        if (name.includes('math')) return <MathModel />;
        
        if (imageUrl) {
            return (
                <Html center>
                    <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
                        <img 
                            src={imageUrl} 
                            alt={subject} 
                            className={`w-full h-full object-cover blur-3xl scale-125 transition-opacity duration-1000 ${
                                theme === 'dark' ? 'opacity-20' : 'opacity-40'
                            }`} 
                        />
                    </div>
                </Html>
            );
        }

        return <PhysicsModel />;
    };

    return (
        <div className="w-full h-full bg-transparent">
            <Canvas 
                camera={{ position: [0, 0, 10], fov: 45 }} 
                gl={{ 
                    alpha: true, 
                    antialias: true,
                    powerPreference: "high-performance"
                }}
            >
                <ambientLight intensity={theme === 'dark' ? 0.6 : 1} />
                <pointLight position={[10, 10, 10]} intensity={theme === 'dark' ? 2 : 3} />
                <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={theme === 'dark' ? 1 : 1.5} />
                
                <SceneContent />
                
                <Environment preset="city" />
                <OrbitControls 
                    enableZoom={false} 
                    autoRotate 
                    autoRotateSpeed={0.5}
                    enablePan={false}
                />
            </Canvas>
        </div>
    );
};
