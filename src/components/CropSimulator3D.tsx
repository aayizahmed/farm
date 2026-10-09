import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
import ProceduralPlant from './ProceduralPlant';
import type { CropGrowthProfile } from '../data/cropGrowthProfiles';

interface CropSimulator3DProps {
  crop: CropGrowthProfile;
  day: number;
  vigor: number;
  isMobile: boolean;
  reducedMotion: boolean;
  isPlaying: boolean;
}

function CutawaySoil() {
  // 4 layers: dark topsoil, brown subsoil, sandy clay, pale rock
  const width = 1.5;
  const layers = [
    { color: '#2a1e16', h: 0.3, y: -0.15 }, // topsoil
    { color: '#4a3622', h: 0.4, y: -0.5 },  // subsoil
    { color: '#8c6e51', h: 0.4, y: -0.9 },  // sandy clay
    { color: '#b5a593', h: 0.4, y: -1.3 },  // pale rock
  ];

  return (
    <group>
      {layers.map((l, i) => (
        <mesh key={i} position={[0, l.y, 0]} receiveShadow castShadow>
          <boxGeometry args={[width, l.h, width]} />
          <meshStandardMaterial color={l.color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function HUDCallouts({ crop, progress }: { crop: CropGrowthProfile, progress: number }) {
  if (progress < 0.1) return null;
  
  return (
    <>
      <Html position={[0.8, crop.maxHeight * progress * 0.5, 0]} center className="pointer-events-none transition-opacity duration-300">
        <div className="flex items-center gap-2">
          <div className="w-12 h-px bg-[#4a7c59]" />
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#1a2e1a] shadow-sm whitespace-nowrap border border-[#e5e3de]">
            Height: {(crop.maxHeight * progress * 100).toFixed(0)} cm
          </div>
        </div>
      </Html>
      
      {progress > 0.3 && (
        <Html position={[-0.8, -crop.rootDepth * progress * 0.5, 0]} center className="pointer-events-none transition-opacity duration-300">
          <div className="flex items-center gap-2 flex-row-reverse">
            <div className="w-12 h-px bg-[#8b7355]" />
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#4a3622] shadow-sm whitespace-nowrap border border-[#e5e3de]">
              Root depth: {(crop.rootDepth * progress * 100).toFixed(0)} cm
            </div>
          </div>
        </Html>
      )}
      
      {progress > 0.6 && (
        <Html position={[0.5, crop.maxHeight * progress + 0.2, 0]} center className="pointer-events-none transition-opacity duration-300">
           <div className="bg-[#f0f9f0]/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-[#2d4a2d] shadow-sm whitespace-nowrap border border-[#d4edda] mb-8">
             {crop.reproductive.type === 'tuber' || crop.reproductive.type === 'bulb' ? 'Subterranean development' : 'Reproductive stage'}
           </div>
        </Html>
      )}
    </>
  );
}

export default function CropSimulator3D({ crop, day, vigor, isMobile, reducedMotion, isPlaying }: CropSimulator3DProps) {
  const progress = day / crop.totalDays;

  return (
    <Canvas 
      shadows 
      camera={{ position: [3, 2, 4], fov: 45 }}
      dpr={[1, 2]}
      frameloop={(!isPlaying && !reducedMotion) ? 'demand' : 'always'}
    >
      <color attach="background" args={['#faf8f3']} />
      
      {/* Soft Studio Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.2} 
        castShadow={!isMobile} 
        shadow-mapSize={isMobile ? 512 : 2048}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      <pointLight position={[0, 2, 2]} intensity={0.4} color="#f0ede8" />

      <group position={[0, 0.5, 0]}>
        <ProceduralPlant crop={crop} growthDay={day} vigor={vigor} />
        <CutawaySoil />
        {!isMobile && <HUDCallouts crop={crop} progress={progress} />}
      </group>

      <ContactShadows position={[0, -1.0, 0]} opacity={0.4} scale={5} blur={2} far={2} />
      
      <OrbitControls 
        enableZoom={true} 
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI / 6} 
        maxPolarAngle={Math.PI / 1.8} 
        autoRotate={!isMobile && !reducedMotion && isPlaying}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}
