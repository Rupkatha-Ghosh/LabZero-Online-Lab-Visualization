import React, { useRef, useMemo } from 'react';
import { useFrame, Canvas } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Tube, Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = {
  body: "#FBCACA",
  leftHeart: "#FCA5A5",
  rightHeart: "#93C5FD",
  valves: "#F5F5F4",
  redFlow: "#FCA5A5",
  blueFlow: "#93C5FD",
  background: "#F8FAFC"
};

const BloodFlow = ({ curve, color, opacity }: { curve: THREE.Curve<THREE.Vector3>, color: string, opacity: number }) => {
  const points = useMemo(() => curve.getPoints(50), [curve]);
  const particleCount = 15;
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      offset: i / particleCount,
      speed: 0.1 + Math.random() * 0.1
    }));
  }, []);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      particles.forEach((p, i) => {
        const t = (p.offset + time * 0.2) % 1;
        const pos = curve.getPointAt(t);
        dummy.position.copy(pos);
        dummy.scale.setScalar(0.04 * (1 - Math.abs(0.5 - t) * 1.5));
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Path */}
      <Tube args={[curve, 64, 0.015, 8, false]}>
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.3} />
      </Tube>
      {/* Moving particles */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={opacity} />
      </instancedMesh>
    </group>
  );
};

export const HeartModel = ({ isPreview = false }: { isPreview?: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const outerWallRef = useRef<THREE.Mesh>(null);

  // Animation for pulsation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 2) * 0.02;
    if (groupRef.current) {
      groupRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  // Blood flow curves
  const rightFlowCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.5, -0.8, 0.2),
    new THREE.Vector3(-0.4, -0.2, 0.3),
    new THREE.Vector3(-0.6, 0.4, 0.4),
    new THREE.Vector3(-0.2, 1.2, 0.5),
  ]), []);

  const leftFlowCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.5, -0.8, 0.2),
    new THREE.Vector3(0.4, -0.2, 0.3),
    new THREE.Vector3(0.6, 0.4, 0.4),
    new THREE.Vector3(0.2, 1.2, 0.5),
  ]), []);

  return (
    <group ref={groupRef} rotation={[0, -Math.PI / 6, 0]}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        
        {/* RIGHT HEART (Deoxygenated - Blue) */}
        <group position={[-0.4, 0, 0]}>
          <Sphere args={[0.7, 32, 32]} scale={[1, 1.4, 0.8]}>
            <meshStandardMaterial 
              color={COLORS.rightHeart} 
              roughness={0.3} 
              metalness={0.1}
              emissive={COLORS.rightHeart}
              emissiveIntensity={0.1}
            />
          </Sphere>
          <BloodFlow curve={rightFlowCurve} color={COLORS.blueFlow} opacity={0.6} />
        </group>

        {/* LEFT HEART (Oxygenated - Red) */}
        <group position={[0.4, 0, 0]}>
          <Sphere args={[0.8, 32, 32]} scale={[1, 1.5, 0.9]}>
            <meshStandardMaterial 
              color={COLORS.leftHeart} 
              roughness={0.3} 
              metalness={0.1}
              emissive={COLORS.leftHeart}
              emissiveIntensity={0.1}
            />
          </Sphere>
          <BloodFlow curve={leftFlowCurve} color={COLORS.redFlow} opacity={0.7} />
        </group>

        {/* OUTER WALL (Semi-transparent Pink) */}
        <mesh ref={outerWallRef} position={[0, 0, 0]}>
          <sphereGeometry args={[1.3, 64, 64]} />
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={1}
            chromaticAberration={0.02}
            anisotropy={0.1}
            distortion={0.1}
            distortionScale={0.1}
            temporalDistortion={0.1}
            transmission={0.85}
            opacity={0.8}
            transparent
            color={COLORS.body}
            roughness={0.4}
          />
        </mesh>

        {/* Vessels (Detailed) */}
        <group position={[0, 1.2, 0]}>
          {/* Aorta (Main Arch) */}
          <Tube args={[new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.3, 0, 0),
            new THREE.Vector3(0.6, 0.8, -0.4),
            new THREE.Vector3(0, 1.4, -0.6),
            new THREE.Vector3(-0.6, 0.8, -0.8),
          ]), 32, 0.22, 16, false]}>
            <meshStandardMaterial color={COLORS.leftHeart} roughness={0.4} />
          </Tube>
          
          {/* Superior Vena Cava */}
          <Tube args={[new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.4, 0, 0.1),
            new THREE.Vector3(-0.6, 1.2, 0.3),
          ]), 32, 0.18, 16, false]}>
            <meshStandardMaterial color={COLORS.rightHeart} roughness={0.4} />
          </Tube>

          {/* Pulmonary Artery (Splitting) */}
          <group>
            <Tube args={[new THREE.CatmullRomCurve3([
              new THREE.Vector3(-0.2, 0, 0.2),
              new THREE.Vector3(-0.1, 0.6, 0.4),
              new THREE.Vector3(0.5, 0.9, 0.5),
            ]), 32, 0.15, 16, false]}>
              <meshStandardMaterial color={COLORS.rightHeart} roughness={0.4} />
            </Tube>
            <Tube args={[new THREE.CatmullRomCurve3([
              new THREE.Vector3(-0.1, 0.6, 0.4),
              new THREE.Vector3(-0.8, 0.9, 0.5),
            ]), 32, 0.15, 16, false]}>
              <meshStandardMaterial color={COLORS.rightHeart} roughness={0.4} />
            </Tube>
          </group>

          {/* Pulmonary Veins (Multiple small ones) */}
          <group position={[0.6, -0.2, -0.3]}>
            <Tube args={[new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0), new THREE.Vector3(0.4, 0.2, -0.2)]), 16, 0.08, 8, false]}>
              <meshStandardMaterial color={COLORS.leftHeart} roughness={0.4} />
            </Tube>
            <Tube args={[new THREE.CatmullRomCurve3([new THREE.Vector3(0,0.2,0), new THREE.Vector3(0.4, 0.4, -0.1)]), 16, 0.08, 8, false]}>
              <meshStandardMaterial color={COLORS.leftHeart} roughness={0.4} />
            </Tube>
          </group>
        </group>

        {/* Valves (Enhanced with Torus rings) */}
        <group position={[0, 0.1, 0.4]}>
           <group position={[-0.35, 0, 0]} rotation={[Math.PI/2.2, 0, 0]}>
             <mesh>
               <torusGeometry args={[0.22, 0.04, 16, 32]} />
               <meshStandardMaterial color={COLORS.valves} roughness={0.2} metalness={0.1} />
             </mesh>
             <mesh>
               <circleGeometry args={[0.2, 16]} />
               <meshStandardMaterial color={COLORS.valves} transparent opacity={0.4} side={THREE.DoubleSide} />
             </mesh>
           </group>
           <group position={[0.35, 0, 0]} rotation={[Math.PI/2.2, 0, 0]}>
             <mesh>
               <torusGeometry args={[0.22, 0.04, 16, 32]} />
               <meshStandardMaterial color={COLORS.valves} roughness={0.2} metalness={0.1} />
             </mesh>
             <mesh>
               <circleGeometry args={[0.2, 16]} />
               <meshStandardMaterial color={COLORS.valves} transparent opacity={0.4} side={THREE.DoubleSide} />
             </mesh>
           </group>
        </group>

      </Float>
    </group>
  );
};export const HeartModelPreview = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <HeartModel isPreview />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
};
