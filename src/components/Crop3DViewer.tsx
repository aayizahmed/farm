import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

interface Crop3DViewerProps {
  cropName: string;
  suitabilityScore: number;
}

function GrowingPlant({ progress, cropName }: { progress: number; cropName: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const stemMaterial = new THREE.MeshStandardMaterial({ color: '#2d4a2d', roughness: 0.6 });

  // Use progress (0 to 1) to animate scale and rotation
  const currentScale = progress * progress * 1.5; // ease in out scale

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005; // slight idle rotation
      
      // smooth scaling
      groupRef.current.scale.lerp(new THREE.Vector3(currentScale, currentScale, currentScale), 0.1);
    }
  });

  // Procedural plant geometry based on cropName (simplified)
  const isTall = ['Wheat', 'Maize', 'Sugarcane', 'Cotton', 'Jute'].includes(cropName);
  const stemHeight = isTall ? 3 : 1.5;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Stem */}
      <mesh position={[0, stemHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.1, stemHeight, 8]} />
        <primitive object={stemMaterial} />
      </mesh>
      
      {/* Leaves */}
      {[0, 1, 2, 3].map((i) => {
        const heightPhase = (i + 1) * (stemHeight / 5);
        const rotationY = (Math.PI / 2) * i;
        // The higher the leaf, the later it appears
        const leafScale = Math.max(0, (progress - (i * 0.15)) * 1.5);
        
        return (
          <group key={i} position={[0, heightPhase, 0]} rotation={[0, rotationY, Math.PI / 4]}>
            <mesh position={[0.4, 0, 0]} scale={[leafScale, leafScale, leafScale]} castShadow>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshStandardMaterial color="#65a30d" roughness={0.3} />
            </mesh>
          </group>
        );
      })}
      
      {/* Top Bloom / Fruit (Only shows up at > 80% progress) */}
      <mesh position={[0, stemHeight + 0.2, 0]} scale={Math.max(0, (progress - 0.7) * 2)}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={cropName === 'Tomato' || cropName === 'Chili' ? '#ef4444' : '#f59e0b'} />
      </mesh>
    </group>
  );
}

function AnalysisNodes() {
  // Generate a few random nodes around the cube
  const nodes = [
    { pos: [1.2, 0.5, 1], delay: 0 },
    { pos: [-1.2, 0.8, -0.5], delay: 0.2 },
    { pos: [1.1, -0.5, -1.2], delay: 0.4 },
    { pos: [-1.1, -0.6, 1.1], delay: 0.6 },
    { pos: [0.5, 1.2, 1.1], delay: 0.1 },
    { pos: [-0.5, 1.1, -1.1], delay: 0.3 },
  ];

  return (
    <group>
      {nodes.map((node, i) => (
        <group key={i} position={node.pos as [number, number, number]}>
          {/* Connecting thin line */}
          <mesh position={[-Math.sign(node.pos[0]) * 0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.005, 0.005, 0.2]} />
            <meshBasicMaterial color="#a3e635" transparent opacity={0.3} />
          </mesh>
          {/* Glowing dot */}
          <mesh>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#a3e635" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SoilPatch() {
  return (
    <group position={[0, 0, 0]}>
      {/* The main soil block: dark, wet, muddy look */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#2a1e16" roughness={0.3} metalness={0.15} />
      </mesh>
      
      {/* Tech analysis overlay dots */}
      <AnalysisNodes />
    </group>
  );
}

export default function Crop3DViewer({ cropName, suitabilityScore }: Crop3DViewerProps) {
  const [day, setDay] = useState(0);
  const maxDays = 120;
  
  useEffect(() => {
    // Autoplay timeline
    let currentDay = 0;
    const interval = setInterval(() => {
      currentDay += 1;
      if (currentDay > maxDays) {
         currentDay = maxDays;
         clearInterval(interval);
      }
      setDay(currentDay);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const progress = day / maxDays;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] rounded-2xl overflow-hidden shadow-inner relative border border-[#cbd5e1]">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-lg font-bold text-[#1e293b]">{cropName} Growth Simulation</h3>
        <p className="text-sm text-[#475569] font-medium mt-1">Suitability: {suitabilityScore}% • Environment matched</p>
      </div>

      <div className="flex-1 relative cursor-grab active:cursor-grabbing">
        <Canvas shadows camera={{ position: [4, 3, 5], fov: 40 }}>
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={1024}
          />
          <Environment preset="city" />
          
          <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
            <group position={[0, -0.5, 0]}>
              <group position={[0, 1, 0]}>
                <GrowingPlant progress={progress} cropName={cropName} />
              </group>
              <SoilPatch />
            </group>
          </Float>
          
          <ContactShadows position={[0, -1.1, 0]} opacity={0.6} scale={10} blur={2.5} far={4} />
          <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 2.1} 
          />
        </Canvas>
      </div>

      {/* Timeline Controls */}
      <div className="p-6 bg-white border-t border-[#e2e8f0]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-[#334155]">Day {day}</span>
          <span className="text-sm font-medium text-[#64748b]">Harvest (120 Days)</span>
        </div>
        <div className="relative h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-[#84cc16] transition-all duration-75"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <input 
          type="range" 
          min="0" 
          max={maxDays} 
          value={day} 
          onChange={(e) => setDay(parseInt(e.target.value))}
          className="absolute bottom-10 left-6 right-6 opacity-0 cursor-pointer w-[calc(100%-48px)] h-8 z-20"
        />
        <div className="flex justify-between mt-3 text-[10px] uppercase tracking-wider text-[#94a3b8] font-bold">
          <span>Seedling</span>
          <span>Vegetative</span>
          <span>Flowering</span>
          <span>Fruiting</span>
        </div>
      </div>
    </div>
  );
}
