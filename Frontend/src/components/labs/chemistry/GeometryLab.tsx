import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Text, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Molecule } from '../../../types/types';

// --- Sub-Components ---

const Atom = ({ pos, symbol, color, size }: { pos: [number, number, number], symbol: string, color: string, size: number }) => (
  <group position={pos}>
    <mesh castShadow>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.1} metalness={0.5} />
    </mesh>
    <Text
      position={[0, 0, size * 1.01]} 
      fontSize={size * 0.8}
      color={['H', 'F'].includes(symbol) ? '#0f172a' : 'white'}
      fontWeight="900"
      anchorX="center"
      anchorY="middle"
      depthOffset={-5} 
    >
      {symbol}
    </Text>
  </group>
);

const Bond = ({ from, to }: { from: [number, number, number], to: [number, number, number] }) => {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const distance = start.distanceTo(end);
  const midpoint = start.clone().lerp(end, 0.5);

  return (
    <mesh position={midpoint} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize())}>
      <cylinderGeometry args={[0.15, 0.15, distance, 12]} />
      <meshStandardMaterial color="white" transparent opacity={0.3} />
    </mesh>
  );
};

const LonePair = ({ pos }: { pos: [number, number, number] }) => (
  <group position={pos}>
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="white" transparent opacity={0.1} wireframe />
    </mesh>
    <mesh position={[-0.15, 0, 0]}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" />
    </mesh>
    <mesh position={[0.15, 0, 0]}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" />
    </mesh>
  </group>
);

// --- Main Lab Component ---

interface GeometryLabProps {
  rotation?: { dx: number; dy: number };
  zoom?: number;
  molecules: Molecule[];
}

const GeometryLab: React.FC<GeometryLabProps> = ({ rotation, zoom = 1, molecules }) => {
  const [selectedMolecule, setSelectedMolecule] = useState<Molecule | null>(null);
  const [mode, setMode] = useState<'Real' | 'Model'>('Real');
  const [showLonePairs, setShowLonePairs] = useState(true);
  const [showBondAngles, setShowBondAngles] = useState(true);
  const moleculeGroupRef = useRef<THREE.Group>(null);

  const atomColors: Record<string, string> = {
    O: '#ef4444', H: '#f1f5f9', C: '#334155', N: '#3b82f6',Cl: '#84cc16',P: '#f97316',Be: '#94a3b8',
    Br: '#991b1b',F: '#10b981', Xe: '#a855f7', S: '#facc15', B: '#8b5cf6', central: '#f97316'
  };

  useEffect(() => {
    if (molecules.length > 0) {
      setSelectedMolecule(prev => molecules.find(m => m.formula === prev?.formula) || molecules[0]);
    }
  }, [molecules]);

  useEffect(() => {
    if (!rotation || !moleculeGroupRef.current) return;

    moleculeGroupRef.current.rotation.y += rotation.dx * 0.0035;
    moleculeGroupRef.current.rotation.x += rotation.dy * 0.0035;
  }, [rotation]);

  useEffect(() => {
    if (!moleculeGroupRef.current) return;

    moleculeGroupRef.current.scale.setScalar(zoom);
  }, [zoom]);

  if (!molecules || molecules.length === 0 || !selectedMolecule) {
    return (
      <div className="glass-panel rounded-[40px] p-8 border border-white/10 flex items-center justify-center h-[600px]">
        <div className="text-white text-xl font-mono">Loading Molecule Data...</div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-[40px] p-8 border border-white/10 space-y-10 select-none animate-in fade-in duration-1000 bg-slate-900/50">
      {/* UI Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 bg-slate-950/90 p-2 rounded-2xl border border-white/10 shadow-inner">
            {(['Real', 'Model'] as const).map(m => (
              <label key={m} className="flex items-center gap-3 px-4 cursor-pointer group">
                <input type="radio" name="mode" checked={mode === m} onChange={() => setMode(m)} className="w-4 h-4 accent-indigo-500" />
                <span className={`text-xs font-black uppercase tracking-widest transition-colors ${mode === m ? 'text-white' : 'text-white/20 group-hover:text-white/40'}`}>{m}</span>
              </label>
            ))}
          </div>
          
          <div className="relative group">
            <select 
              value={selectedMolecule.formula}
              onChange={(e) => setSelectedMolecule(molecules.find(m => m.formula === e.target.value)!)}
              className="appearance-none bg-slate-950/90 border border-white/10 rounded-2xl pl-12 pr-14 py-3 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xl min-w-[240px] cursor-pointer"
            >
              {molecules.map(m => <option key={m.formula} value={m.formula}>{m.formula} ({m.name})</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-10 items-center bg-white/5 px-8 py-3 rounded-2xl border border-white/5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={showBondAngles} onChange={() => setShowBondAngles(!showBondAngles)} className="w-5 h-5 rounded accent-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">Bond Angles</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
             <input type="checkbox" checked={showLonePairs} onChange={() => setShowLonePairs(!showLonePairs)} className="w-5 h-5 rounded accent-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">Lone Pairs</span>
          </label>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="relative bg-[#020617] rounded-[32px] border border-white/10 overflow-hidden h-[600px] shadow-2xl">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={40} />
          <OrbitControls enablePan={false} minDistance={4} maxDistance={15} />
          
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <Environment preset="city" />

          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group ref={moleculeGroupRef}>
              {/* Central Atom */}
              <Atom 
                pos={[0, 0, 0]} 
                symbol={selectedMolecule.centralAtom} 
                color={atomColors[selectedMolecule.centralAtom] || atomColors.central} 
                size={0.8} 
              />

              {/* Dynamic Outer Atoms and Bonds */}
              {selectedMolecule.atoms.map((atom, i) => {
                // Logic: Model mode uses a standard spacing (2.5), 
                // Real mode adds a slight offset to simulate electronic distortion
                const multiplier = mode === 'Model' ? 2.5 : 2.7; 
                const pos: [number, number, number] = [atom.pos.x * multiplier, atom.pos.y * multiplier, atom.pos.z * multiplier];
                
                return (
                  <React.Fragment key={i}>
                    <Bond from={[0, 0, 0]} to={pos} />
                    <Atom pos={pos} symbol={atom.symbol} color={atomColors[atom.symbol]} size={0.5} />
                  </React.Fragment>
                );
              })}

              {/* Lone Pairs */}
              {showLonePairs && selectedMolecule.lonePairs.map((lp, i) => (
                <LonePair key={i} pos={[lp.x * 2, lp.y * 2, lp.z * 2]} />
              ))}
            </group>
          </Float>

          <ContactShadows opacity={0.4} scale={15} blur={2.5} far={4.5} />
        </Canvas>

        {/* Profile Card Overlay */}
        <div className="absolute bottom-10 left-10 p-8 glass-panel rounded-[32px] bg-black/60 backdrop-blur-xl min-w-[320px] border-l-4 border-l-indigo-600 pointer-events-none">
           <div className="flex items-center gap-6 mb-6">
             <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg">
               {selectedMolecule.formula}
             </div>
             <div>
               <h4 className="text-2xl font-black text-white">{selectedMolecule.name}</h4>
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Three.js Engine</p>
             </div>
           </div>
           
           <div className="space-y-4 pt-4 border-t border-white/10">
             <div className="flex justify-between items-center text-[10px] font-bold">
               <span className="text-white/30 uppercase">Framework</span>
               <span className="text-indigo-200 uppercase font-black">VSEPR {mode}</span>
             </div>
             <div className="flex justify-between items-end">
               <span className="text-[10px] font-bold text-white/30 uppercase pb-1">Dynamics</span>
               <span className="text-2xl font-black text-white">
                 {mode === 'Real' ? selectedMolecule.realAngle : selectedMolecule.modelAngle}
               </span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GeometryLab;
