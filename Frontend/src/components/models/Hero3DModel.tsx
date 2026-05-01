import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Environment, Sphere, Cylinder, MeshTransmissionMaterial, ContactShadows, Tube, RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = {
  primary: "#0EA5E9",   
  secondary: "#10B981", 
  accent: "#F97316",    
  glass: "#ffffff",
  platform: "#F1F5F9",
  purple: "#8B5CF6",
  yellow: "#EAB308"
};

const Platform = ({ theme }: { theme: 'dark' | 'light' }) => (
  <group position={[0, -2, 0]}>
    <Cylinder args={[5, 5, 0.4, 64]} castShadow receiveShadow>
      <meshStandardMaterial color={theme === 'dark' ? "#1e293b" : COLORS.platform} roughness={0.1} metalness={0.0} />
    </Cylinder>
    {/* Inner ring */}
    <Cylinder args={[4.8, 4.8, 0.41, 64]} position={[0, 0.01, 0]}>
      <meshStandardMaterial color={theme === 'dark' ? "#0f172a" : "#e2e8f0"} roughness={0.4} metalness={0.1} />
    </Cylinder>
  </group>
);

const Flame = () => {
  const flameRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (flameRef.current) {
      const time = clock.getElapsedTime();
      flameRef.current.scale.y = 1 + Math.sin(time * 15) * 0.05 + Math.sin(time * 25) * 0.05;
      flameRef.current.scale.x = 1 + Math.sin(time * 10) * 0.02;
      flameRef.current.scale.z = 1 + Math.cos(time * 12) * 0.02;
    }
  });
  return (
    <group ref={flameRef} position={[0, 1.9, 0]}>
      {/* Outer flame */}
      <mesh position={[0, 0.4, 0]}>
        <coneGeometry args={[0.2, 1.0, 32]} />
        <meshBasicMaterial color={COLORS.accent} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Inner flame */}
      <mesh position={[0, 0.15, 0]}>
        <coneGeometry args={[0.1, 0.5, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight color={COLORS.accent} intensity={2} distance={4} position={[0, 0.2, 0]} />
    </group>
  );
};

const LiquidBubbles = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 20;
  const dummy = new THREE.Object3D();
  const bubbles = useRef(Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 0.8,
      y: -0.8 + Math.random(),
      z: (Math.random() - 0.5) * 0.8,
      s: 0.02 + Math.random() * 0.04,
      v: 0.01 + Math.random() * 0.01
  })));

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      bubbles.current.forEach((b, i) => {
        b.y += b.v;
        if (b.y > 0.2) {
          b.y = -0.8;
          b.x = (Math.random() - 0.5) * 0.8;
          b.z = (Math.random() - 0.5) * 0.8;
        }
        dummy.position.set(b.x + Math.sin(t * 3 + i) * 0.01, b.y, b.z);
        dummy.scale.setScalar(b.s);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0} ior={1.1} clearcoat={1} depthWrite={false} />
    </instancedMesh>
  );
};

const Flask = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Heavy Base Plate */}
      <RoundedBox args={[2.5, 0.1, 1.5]} radius={0.02} position={[-0.8, -2.0, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
      </RoundedBox>
      
      {/* Main Vertical Rod */}
      <Cylinder args={[0.06, 0.06, 6.0, 32]} position={[-1.7, 1.0, 0]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </Cylinder>

      {/* Bosshead & Clamp Assembly */}
      <group position={[0, 3.2, 0]}>
         <RoundedBox args={[0.25, 0.25, 0.25]} radius={0.03} position={[-1.7, 0, 0]}>
           <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
         </RoundedBox>
         <Cylinder args={[0.04, 0.04, 1.4]} position={[-1.0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
           <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
         </Cylinder>
         {/* Clamp Ring */}
         <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
           <torusGeometry args={[0.34, 0.04, 16, 32, Math.PI * 1.4]} />
           <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.4} />
         </mesh>
         {/* Clamp Pads */}
         <Cylinder args={[0.03, 0.03, 0.4, 16]} position={[-0.3, 0, 0.2]} rotation={[0, 0, Math.PI / 2]}>
           <meshStandardMaterial color="#1e293b" />
         </Cylinder>
         <Cylinder args={[0.03, 0.03, 0.4, 16]} position={[-0.3, 0, -0.2]} rotation={[0, 0, Math.PI / 2]}>
           <meshStandardMaterial color="#1e293b" />
         </Cylinder>
      </group>

      {/* Tripod */}
      <group position={[0, 0.25, 0]}>
         <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
           <torusGeometry args={[0.7, 0.04, 16, 64]} />
           <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
         </mesh>
         {/* Wire Gauze Center */}
         <Cylinder args={[0.7, 0.7, 0.01, 32]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#94a3b8" metalness={0.2} roughness={0.8} transparent opacity={0.6} wireframe />
         </Cylinder>
         <Cylinder args={[0.03, 0.03, 2.25, 16]} position={[0.6, -1.125, 0.35]} rotation={[0.15, 0, -0.15]}>
           <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
         </Cylinder>
         <Cylinder args={[0.03, 0.03, 2.25, 16]} position={[-0.6, -1.125, 0.35]} rotation={[0.15, 0, 0.15]}>
           <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
         </Cylinder>
         <Cylinder args={[0.03, 0.03, 2.25, 16]} position={[0, -1.125, -0.7]} rotation={[-0.15, 0, 0]}>
           <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
         </Cylinder>
      </group>

      {/* Bunsen Burner */}
      <group position={[0, -1.95, 0]}>
         {/* Base */}
         <Cylinder args={[0.3, 0.35, 0.1, 32]} position={[0, 0.05, 0]}>
           <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.3} />
         </Cylinder>
         {/* Air Collar */}
         <Cylinder args={[0.12, 0.12, 0.15, 16]} position={[0, 0.15, 0]}>
           <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
         </Cylinder>
         {/* Gas inlet */}
         <Cylinder args={[0.04, 0.04, 0.3, 16]} position={[0.2, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
           <meshStandardMaterial color="#94a3b8" roughness={0.5} />
         </Cylinder>
         {/* Hose */}
         <mesh position={[0.35, 0.12, 0]} rotation={[0, 0, 0]}>
            <tubeGeometry args={[new THREE.CatmullRomCurve3([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0.3, -0.05, 0),
              new THREE.Vector3(0.8, -0.1, 0.3),
              new THREE.Vector3(1.5, -0.15, 1.0),
            ]), 20, 0.04, 8, false]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.9} />
         </mesh>
         {/* Barrel */}
         <Cylinder args={[0.08, 0.08, 1.6, 32]} position={[0, 1.0, 0]}>
           <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
         </Cylinder>
         <Flame />
      </group>

      {/* Circular Flask (Round Bottom) */}
      <group position={[0, 1.8, 0]}>
        
        {/* Flask Liquid Realistic */}
        <group position={[0, -0.1, 0]}>
          {/* Bottom rounded part of liquid */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.05, 64, 32, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5]} />
            <meshPhysicalMaterial color={COLORS.secondary} transmission={0.6} opacity={0.8} transparent roughness={0.0} ior={1.33} clearcoat={1} depthWrite={false} emissive={COLORS.secondary} emissiveIntensity={0.2} />
          </mesh>
          {/* Top flat part (meniscus) */}
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.05, 64]} />
            <meshPhysicalMaterial color={COLORS.secondary} transmission={0.6} opacity={0.8} transparent roughness={0.0} ior={1.33} clearcoat={1} depthWrite={false} emissive={COLORS.secondary} emissiveIntensity={0.1} />
          </mesh>
          
          <LiquidBubbles />
        </group>
        
        {/* Flask Glass */}
        <Sphere args={[1.2, 32, 32]} position={[0, 0, 0]}>
          <meshPhysicalMaterial 
            color="#ffffff" transmission={1} roughness={0.05} ior={1.5} clearcoat={1} transparent opacity={0.6} depthWrite={false}
          />
        </Sphere>
        
        <Cylinder args={[0.3, 0.3, 1.2, 16]} position={[0, 1.4, 0]}>
          <meshPhysicalMaterial color="#ffffff" transmission={1} roughness={0.05} ior={1.5} clearcoat={1} transparent opacity={0.6} depthWrite={false} />
        </Cylinder>
        
        <mesh position={[0, 2.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.06, 12, 24]} />
          <meshPhysicalMaterial color="#ffffff" transmission={1} roughness={0.05} ior={1.5} clearcoat={1} transparent opacity={0.6} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};

const TestTubeSetup = () => {
  const tubes = [
    { pos: -0.6, color: COLORS.accent },
    { pos: -0.2, color: COLORS.primary },
    { pos: 0.2, color: COLORS.secondary },
    { pos: 0.6, color: COLORS.purple },
  ];

  return (
    <group position={[1.0, -0.8, 1.5]} rotation={[0, 0.3, 0]}>
      {/* Rack Base */}
      <RoundedBox args={[2, 0.1, 0.6]} radius={0.05} position={[0, -0.9, 0]}>
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </RoundedBox>
      <RoundedBox args={[2, 0.1, 0.6]} radius={0.05} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
      </RoundedBox>
      
      {/* Pillars */}
      <Cylinder args={[0.05, 0.05, 1.2, 16]} position={[-0.9, -0.35, -0.2]}>
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2}/>
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 1.2, 16]} position={[0.9, -0.35, -0.2]}>
        <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2}/>
      </Cylinder>

      {/* Tubes */}
      {tubes.map((t, i) => (
        <group key={i} position={[t.pos, -0.3, 0]}>
          {/* Glass body (open cylinder) */}
          <mesh position={[0, 0, 0]}>
             <cylinderGeometry args={[0.15, 0.15, 1.4, 16, 1, true]} />
             <meshPhysicalMaterial color="#ffffff" roughness={0.05} transmission={1} ior={1.5} clearcoat={1} transparent opacity={0.6} depthWrite={false} />
          </mesh>
          {/* Glass bottom (half sphere) */}
          <mesh position={[0, -0.7, 0]}>
             <sphereGeometry args={[0.15, 16, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
             <meshPhysicalMaterial color="#ffffff" roughness={0.05} transmission={1} ior={1.5} clearcoat={1} transparent opacity={0.6} depthWrite={false} />
          </mesh>
          {/* Top thick rim */}
          <mesh position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
             <torusGeometry args={[0.15, 0.02, 12, 24]} />
             <meshPhysicalMaterial color="#ffffff" roughness={0.05} transmission={1} ior={1.5} clearcoat={1} transparent opacity={0.6} depthWrite={false} />
          </mesh>
          {/* Liquid realistic meniscus */}
          <group position={[0, -0.7, 0]}>
             <mesh position={[0, 0.45, 0]}>
                <cylinderGeometry args={[0.135, 0.135, 0.9, 32]} />
                <meshPhysicalMaterial color={t.color} transmission={0.5} transparent opacity={0.8} roughness={0.0} ior={1.33} depthWrite={false} emissive={t.color} emissiveIntensity={0.2} />
             </mesh>
             <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.135, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
                <meshPhysicalMaterial color={t.color} transmission={0.5} transparent opacity={0.8} roughness={0.0} ior={1.33} depthWrite={false} emissive={t.color} emissiveIntensity={0.2} />
             </mesh>
             <mesh position={[0, 0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.135, 32]} />
                <meshPhysicalMaterial color={t.color} transmission={0.5} transparent opacity={0.8} roughness={0.0} ior={1.33} depthWrite={false} emissive={t.color} emissiveIntensity={0.1} />
             </mesh>
          </group>
        </group>
      ))}
    </group>
  );
};

const DNAHelix = ({ theme }: { theme: 'dark' | 'light' }) => {
  const ref = useRef<THREE.Group>(null);
  const meshRef1 = useRef<THREE.InstancedMesh>(null);
  const meshRef2 = useRef<THREE.InstancedMesh>(null);
  const points = 20;
  const dummy = new THREE.Object3D();

  useFrame((state, delta) => {
    if (ref.current) ref.current.rotation.y -= delta * 0.3;
    
    if (meshRef1.current && meshRef2.current) {
      for (let i = 0; i < points; i++) {
        const t = i / points;
        const y = (t - 0.5) * 6;
        const angle = t * Math.PI * 4;
        const r = 0.8;

        // Ball 1
        dummy.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
        dummy.updateMatrix();
        meshRef1.current.setMatrixAt(i, dummy.matrix);

        // Ball 2
        dummy.position.set(Math.cos(angle + Math.PI) * r, y, Math.sin(angle + Math.PI) * r);
        dummy.updateMatrix();
        meshRef2.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef1.current.instanceMatrix.needsUpdate = true;
      meshRef2.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group position={[-2.5, 0.5, -1]} ref={ref} scale={0.7}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <instancedMesh ref={meshRef1} args={[undefined, undefined, points]}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color={COLORS.primary} roughness={0.3} />
        </instancedMesh>
        <instancedMesh ref={meshRef2} args={[undefined, undefined, points]}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color={COLORS.secondary} roughness={0.3} />
        </instancedMesh>
        {Array.from({ length: points }).map((_, i) => {
          const t = i / points;
          const y = (t - 0.5) * 6;
          const angle = t * Math.PI * 4;
          const r = 0.8;
          return (
            <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, -angle]}>
              <cylinderGeometry args={[0.02, 0.02, r * 2, 8]} />
              <meshStandardMaterial color={theme === 'dark' ? "#ffffff" : "#475569"} opacity={theme === 'dark' ? 0.8 : 0.4} transparent />
            </mesh>
          );
        })}
      </Float>
    </group>
  );
};



const NewtonsCradle = ({ theme }: { theme: 'dark' | 'light' }) => {
  const leftBallRef = useRef<THREE.Group>(null);
  const rightBallRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 3; 
    const swing = Math.sin(t);
    const angle = 0.5;
    if (leftBallRef.current && rightBallRef.current) {
      if (swing > 0) {
        // Left ball: Needs NEGATIVE rotation to swing LEFT (outward)
        leftBallRef.current.rotation.z = -swing * angle;
        rightBallRef.current.rotation.z = 0;
      } else {
        // Right ball: Needs POSITIVE rotation to swing RIGHT (outward)
        // Since swing is negative here, -swing makes it positive
        leftBallRef.current.rotation.z = 0;
        rightBallRef.current.rotation.z = -swing * angle; 
      }
    }
  });

  const chromeMaterial = {
    metalness: 1,
    roughness: 0.05,
    color: theme === 'dark' ? "#cbd5e1" : "#ffffff",
  };

  return (
    <group position={[2.0, -2.0, 0.4]} rotation={[0, -Math.PI / 4, 0]} scale={0.8}>
      {/* Base */}
      <RoundedBox args={[3.2, 0.2, 2.0]} radius={0.05} position={[0, 0.1, 0]}>
        <meshStandardMaterial color={theme === 'dark' ? "#1e293b" : "#d97706"} />
      </RoundedBox>

      {/* Support Frames */}
      {[0.8, -0.8].map((z, i) => (
        <group key={i} position={[0, 0, z]}>
           <Cylinder args={[0.04, 0.04, 3.2]} position={[1.4, 1.6, 0]}><meshStandardMaterial {...chromeMaterial} /></Cylinder>
           <Cylinder args={[0.04, 0.04, 3.2]} position={[-1.4, 1.6, 0]}><meshStandardMaterial {...chromeMaterial} /></Cylinder>
           <mesh position={[0, 3.2, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 2.8]} />
              <meshStandardMaterial {...chromeMaterial} />
           </mesh>
        </group>
      ))}

      {/* 7 Balls Momentum Assembly */}
      {[...Array(7)].map((_, i) => {
        const xOffset = (i - 3) * 0.402; // Tight spacing for "hitting" effect
        const isLeft = i === 0;
        const isRight = i === 6;
        const ref = isLeft ? leftBallRef : (isRight ? rightBallRef : null);

        return (
          <group key={i} position={[xOffset, 3.2, 0]} ref={ref}>
            {/* V-Strings - Both fixed to 2.6 length */}
            <group rotation={[0.28, 0, 0]} position={[0, -1.3, 0.4]}>
               <mesh>
                 <cylinderGeometry args={[0.005, 0.005, 2.6]} />
                 <meshStandardMaterial color="#94a3b8" opacity={0.5} transparent />
               </mesh>
            </group>
            <group rotation={[-0.28, 0, 0]} position={[0, -1.3, -0.4]}>
               <mesh>
                 <cylinderGeometry args={[0.005, 0.005, 2.6]} />
                 <meshStandardMaterial color="#94a3b8" opacity={0.5} transparent />
               </mesh>
            </group>
            
            <group position={[0, -2.6, 0]}>
              <Sphere args={[0.2, 32, 32]}>
                <meshStandardMaterial {...chromeMaterial} />
              </Sphere>
            </group>
          </group>
        );
      })}
    </group>
  );
};

const LorenzAttractor = () => {
  const count = 3000;
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);
  const geoRef = useRef<THREE.BufferGeometry>(null);
  
  const currentPos = useRef(new THREE.Vector3(0.1, 0.1, 0.1));
  const queue = useRef<THREE.Vector3[]>([]);

  // Constants for Lorenz system
  const sigma = 10;
  const rho = 28;
  const beta = 8/3;
  const dt = 0.0075;

  useFrame(() => {
    // Generate new points
    for(let i = 0; i < 3; i++) {
      const { x, y, z } = currentPos.current;
      const dx = sigma * (y - x) * dt;
      const dy = (x * (rho - z) - y) * dt;
      const dz = (x * y - beta * z) * dt;
      currentPos.current.set(x + dx, y + dy, z + dz);
      queue.current.push(currentPos.current.clone());
      if (queue.current.length > count) queue.current.shift();
    }

    if (geoRef.current) {
      const posAttr = geoRef.current.attributes.position;
      const colorAttr = geoRef.current.attributes.color;
      
      for (let i = 0; i < queue.current.length; i++) {
        const p = queue.current[i];
        posAttr.setXYZ(i, p.x, p.y, p.z);
        
        // Fading tail effect: alpha/brightness based on index
        const alpha = Math.pow(i / queue.current.length, 1.5);
        // Neon Cyan gradient
        colorAttr.setXYZ(i, 0.06 * alpha, 0.9 * alpha, 1.0 * alpha);
      }
      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 4.2, -0.5]} scale={0.16}>
       <points>
         <bufferGeometry ref={geoRef}>
           <bufferAttribute
             attach="attributes-position"
             count={count}
             array={positions}
             itemSize={3}
           />
           <bufferAttribute
             attach="attributes-color"
             count={count}
             array={colors}
             itemSize={3}
           />
         </bufferGeometry>
         <pointsMaterial 
           size={0.18} 
           vertexColors 
           transparent 
           opacity={0.95} 
           blending={THREE.AdditiveBlending}
           sizeAttenuation={true}
           depthWrite={false}
         />
       </points>
       
       <mesh position={currentPos.current}>
         <sphereGeometry args={[0.4, 16, 16]} />
         <meshStandardMaterial 
            color="#22d3ee" 
            emissive="#22d3ee" 
            emissiveIntensity={25} 
            toneMapped={false}
         />
       </mesh>
       <pointLight position={currentPos.current} color="#22d3ee" intensity={3} distance={10} />
    </group>
  );
};

const InteractiveScene = ({ theme }: { theme: 'dark' | 'light' }) => {
  return (
    <group position={[0, 0, 0]}>
      <Platform theme={theme} />
      
      {/* Shifted Chemistry Setup */}
      <group position={[-2.4, 0, 0.2]} rotation={[0, Math.PI / 6, 0]}>
        <Flask />
      </group>

      {/* New Physics Setup */}
      <NewtonsCradle theme={theme} />

      {/* Math Setup: Lorenz Attractor */}
      <LorenzAttractor />

      {/* Balanced Biology & Math */}
      <group position={[0, 0, -2.5]} scale={0.8}>
        <DNAHelix theme={theme} />
      </group>

      <group position={[0, -0.2, 1.8]} rotation={[0, 0, 0]} scale={0.9}>
        <TestTubeSetup />
      </group>

      <ContactShadows 
        position={[0, -2, 0]} 
        opacity={theme === 'dark' ? 0.6 : 0.3} 
        scale={10} 
        blur={2.5} 
        far={4} 
        color={theme === 'dark' ? "#000000" : "#64748b"} 
      />
    </group>
  );
};
const CameraLogger = () => {
  useFrame(({ camera }) => {
    // Only logs when you move the camera manually
    (window as any).cameraPos = [
      camera.position.x.toFixed(2),
      camera.position.y.toFixed(2),
      camera.position.z.toFixed(2)
    ];
  });
  return null;
};


export const Hero3DModel = ({ theme = 'light' }: { theme?: 'dark' | 'light' }) => {
  return (
    <div className="w-full h-full relative">
      <Canvas 
        camera={{ position: [16.93, 3.37, -11.34], fov: 40 }} 
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <CameraLogger />
        <ambientLight intensity={theme === 'dark' ? 0.4 : 0.8} color="#ffffff" />
        <directionalLight position={[10, 15, 10]} intensity={theme === 'dark' ? 1.0 : 1.5} color="#ffffff" castShadow />
        <directionalLight position={[-10, 10, -5]} intensity={theme === 'dark' ? 0.5 : 0.8} color="#f8fafc" />
        <spotLight position={[0, 10, 0]} intensity={theme === 'dark' ? 2 : 1.5} angle={0.5} penumbra={1} color={theme === 'dark' ? "#38bdf8" : "#ffffff"} />
        
        <React.Suspense fallback={null}>
          <InteractiveScene theme={theme} />
          <Environment preset={theme === 'dark' ? "night" : "city"} />
        </React.Suspense>
        <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.3} maxPolarAngle={Math.PI/2 - 0.1} minPolarAngle={Math.PI/4} />
      </Canvas>
    </div>
  );
};
