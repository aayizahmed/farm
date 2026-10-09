import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CropGrowthProfile } from '../data/cropGrowthProfiles';

interface ProceduralPlantProps {
  crop: CropGrowthProfile;
  growthDay: number;
  vigor: number;
}

export default function ProceduralPlant({ crop, growthDay, vigor }: ProceduralPlantProps) {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  // Normalize progress from 0 to 1
  const progress = Math.min(1, Math.max(0, growthDay / crop.totalDays));
  
  // Vigor effects
  const actualHeight = crop.maxHeight * (0.5 + 0.5 * vigor) * progress;
  const leafCount = Math.floor(crop.leafCount * (0.3 + 0.7 * vigor) * progress);
  const rootDepth = crop.rootDepth * progress * (0.8 + 0.2 * vigor);
  
  // Easing function for smooth growth (ease out quad)
  const easedProgress = progress * (2 - progress);

  useFrame((_state, delta) => {
    time.current += delta;
    if (groupRef.current) {
      // Gentle wind sway based on height and vigor
      const swayAmount = actualHeight * 0.05 * (1.1 - vigor);
      groupRef.current.rotation.z = Math.sin(time.current * 1.5) * swayAmount;
      groupRef.current.rotation.x = Math.cos(time.current * 1.2) * swayAmount * 0.5;
    }
  });

  // Materials
  const stemMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: new THREE.Color(crop.leafColor).lerp(new THREE.Color('#8b7355'), (1 - vigor) * 0.5), 
    roughness: 0.7 
  }), [crop.leafColor, vigor]);
  
  const leafMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: new THREE.Color(crop.leafColor).lerp(new THREE.Color('#d4d4aa'), (1 - vigor) * 0.6), 
    roughness: 0.4, 
    side: THREE.DoubleSide 
  }), [crop.leafColor, vigor]);

  const rootMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f5f5dc', roughness: 0.9 }), []);
  const reproMat = useMemo(() => new THREE.MeshStandardMaterial({ color: crop.reproductive.color, roughness: 0.5 }), [crop.reproductive.color]);

  // Leaf geometry selection
  const leafGeom = useMemo(() => {
    if (crop.leafShape === 'blade') return new THREE.PlaneGeometry(0.1, 0.6);
    if (crop.leafShape === 'broad') return new THREE.PlaneGeometry(0.3, 0.4);
    // compound: simple representation using multiple small planes is tricky in single geom, we'll use a diamond shape
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.15, 0.2);
    shape.lineTo(0, 0.4);
    shape.lineTo(-0.15, 0.2);
    shape.lineTo(0, 0);
    return new THREE.ShapeGeometry(shape);
  }, [crop.leafShape]);

  // Generate roots (branching downward)
  const roots = useMemo(() => {
    const arr = [];
    const mainRoots = 4;
    for (let i = 0; i < mainRoots; i++) {
      arr.push(
        <mesh key={`root-${i}`} position={[0, -rootDepth / 2, 0]} rotation={[0, (Math.PI * 2 / mainRoots) * i, Math.PI / 8]}>
          <cylinderGeometry args={[0.015, 0.005, rootDepth, 5]} />
          <primitive object={rootMat} />
        </mesh>
      );
    }
    return arr;
  }, [rootDepth, rootMat]);

  // Generate stems & leaves
  const stemsAndLeaves = useMemo(() => {
    const arr = [];
    for (let s = 0; s < crop.stemCount; s++) {
      const stemHeight = actualHeight * (1 - s * 0.1);
      if (stemHeight <= 0.01) continue;
      
      const angle = (Math.PI * 2 / crop.stemCount) * s;
      const offset = s === 0 ? 0 : 0.05;

      arr.push(
        <group key={`stem-group-${s}`} position={[Math.cos(angle) * offset, 0, Math.sin(angle) * offset]} rotation={[0, angle, s === 0 ? 0 : 0.1]}>
          {/* Stem */}
          <mesh position={[0, stemHeight / 2, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.04, stemHeight, 7]} />
            <primitive object={stemMat} />
          </mesh>
          
          {/* Leaves */}
          {Array.from({ length: Math.ceil(leafCount / crop.stemCount) }).map((_, i, array) => {
            const h = (i / array.length) * stemHeight;
            const leafAngle = i * 2.4; // golden ratio spiral
            const leafScale = Math.max(0, Math.min(1, (stemHeight - h) * 2)) * easedProgress;
            if (leafScale <= 0) return null;
            
            return (
              <mesh 
                key={`leaf-${s}-${i}`} 
                position={[0, h, 0]} 
                rotation={[0, leafAngle, 1.2]} 
                scale={[leafScale, leafScale, leafScale]}
                castShadow
              >
                <primitive object={leafGeom} attach="geometry" />
                <primitive object={leafMat} />
              </mesh>
            );
          })}

          {/* Reproductive parts (appear > 60% progress) */}
          {progress > 0.6 && (
            <group position={[0, stemHeight, 0]}>
              {crop.reproductive.type === 'tuber' || crop.reproductive.type === 'bulb' || crop.reproductive.type === 'pod' ? (
                 <mesh position={[0, -stemHeight - (crop.reproductive.type === 'pod' ? 0.1 : 0.3), 0]} scale={(progress - 0.6) * 2.5 * crop.reproductive.size}>
                   <sphereGeometry args={[1, 16, 16]} />
                   <primitive object={reproMat} />
                 </mesh>
              ) : (
                 <mesh position={[0, 0, 0]} scale={(progress - 0.6) * 2.5 * crop.reproductive.size}>
                   {crop.reproductive.type === 'grain head' ? (
                     <cylinderGeometry args={[0.3, 0.3, 2, 8]} />
                   ) : crop.reproductive.type === 'boll' ? (
                     <dodecahedronGeometry args={[1, 0]} />
                   ) : (
                     <sphereGeometry args={[1, 16, 16]} />
                   )}
                   <primitive object={reproMat} />
                 </mesh>
              )}
            </group>
          )}
        </group>
      );
    }
    return arr;
  }, [crop, actualHeight, leafCount, easedProgress, progress, stemMat, leafMat, leafGeom, reproMat]);

  return (
    <group ref={groupRef}>
      {roots}
      {stemsAndLeaves}
    </group>
  );
}
