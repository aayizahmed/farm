import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import {
  Globe, MapPin, ArrowRight, Sun, Droplets, Compass,
  Navigation, Search, CheckCircle2
} from 'lucide-react';

export interface CountrySpot {
  id: string;
  name: string;
  region: string;
  flag: string;
  lat: number;
  lon: number;
  cropCategory: string;
  primaryCrops: string[];
  climateZone: string;
  avgMoisture: number; // %
  solarRadiation: number; // kWh/m²/day
  defaultInputs: {
    location: string;
    farmArea: number;
    soilType: 'loamy' | 'sandy' | 'clay' | 'silt' | 'peat' | 'chalky';
    season: 'kharif' | 'rabi' | 'zaid' | 'year-round';
    waterAvailability: 'low' | 'moderate' | 'high' | 'irrigated';
    topography: 'flat' | 'sloped' | 'terraced' | 'rolling';
    farmingType: 'conventional' | 'organic' | 'hydroponic' | 'regenerative';
    waterSource: 'borewell' | 'canal' | 'river' | 'rainwater' | 'municipal';
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    temperature: number;
    rainfall: number;
  };
}

export const COUNTRY_SPOTS: CountrySpot[] = [
  {
    id: 'ca_usa',
    name: 'United States',
    region: 'Central Valley, California',
    flag: '🇺🇸',
    lat: 36.77,
    lon: -119.41,
    cropCategory: 'Orchard',
    primaryCrops: ['Almonds', 'Grapes', 'Citrus', 'Pistachios'],
    climateZone: 'Mediterranean Semi-Arid',
    avgMoisture: 42,
    solarRadiation: 5.8,
    defaultInputs: {
      location: 'Central Valley, California, USA',
      farmArea: 150,
      soilType: 'loamy',
      season: 'year-round',
      waterAvailability: 'moderate',
      topography: 'flat',
      farmingType: 'conventional',
      waterSource: 'borewell',
      ph: 6.8,
      nitrogen: 160,
      phosphorus: 55,
      potassium: 140,
      temperature: 24,
      rainfall: 550
    }
  },
  {
    id: 'punjab_ind',
    name: 'India',
    region: 'Punjab Indo-Gangetic Basin',
    flag: '🇮🇳',
    lat: 31.14,
    lon: 75.34,
    cropCategory: 'Grains',
    primaryCrops: ['Wheat', 'Rice (Paddy)', 'Basmati', 'Sugarcane'],
    climateZone: 'Subtropical Alluvial',
    avgMoisture: 58,
    solarRadiation: 5.2,
    defaultInputs: {
      location: 'Punjab, India',
      farmArea: 45,
      soilType: 'silt',
      season: 'rabi',
      waterAvailability: 'high',
      topography: 'flat',
      farmingType: 'conventional',
      waterSource: 'canal',
      ph: 7.4,
      nitrogen: 140,
      phosphorus: 48,
      potassium: 50,
      temperature: 18,
      rainfall: 650
    }
  },
  {
    id: 'westland_nld',
    name: 'Netherlands',
    region: 'Westland Hi-Tech District',
    flag: '🇳🇱',
    lat: 51.99,
    lon: 4.21,
    cropCategory: 'Vegetables',
    primaryCrops: ['Bell Peppers', 'Tomatoes', 'Cucumbers', 'Tulips'],
    climateZone: 'Temperate Maritime Controlled',
    avgMoisture: 75,
    solarRadiation: 3.4,
    defaultInputs: {
      location: 'Westland, Netherlands',
      farmArea: 12,
      soilType: 'peat',
      season: 'year-round',
      waterAvailability: 'high',
      topography: 'flat',
      farmingType: 'hydroponic',
      waterSource: 'rainwater',
      ph: 6.0,
      nitrogen: 180,
      phosphorus: 70,
      potassium: 200,
      temperature: 22,
      rainfall: 850
    }
  },
  {
    id: 'rift_ken',
    name: 'Kenya',
    region: 'Rift Valley Highlands',
    flag: '🇰🇪',
    lat: -0.30,
    lon: 36.08,
    cropCategory: 'Commercial',
    primaryCrops: ['Maize (Corn)', 'Coffee', 'Tea', 'Roses'],
    climateZone: 'Equatorial Highland',
    avgMoisture: 38,
    solarRadiation: 6.1,
    defaultInputs: {
      location: 'Nakuru, Rift Valley, Kenya',
      farmArea: 80,
      soilType: 'sandy',
      season: 'kharif',
      waterAvailability: 'low',
      topography: 'rolling',
      farmingType: 'conventional',
      waterSource: 'borewell',
      ph: 5.8,
      nitrogen: 90,
      phosphorus: 35,
      potassium: 40,
      temperature: 27,
      rainfall: 420
    }
  },
  {
    id: 'andalusia_esp',
    name: 'Spain',
    region: 'Andalusia Mediterranean Belt',
    flag: '🇪🇸',
    lat: 37.38,
    lon: -5.98,
    cropCategory: 'Orchard',
    primaryCrops: ['Olives', 'Citrus', 'Almonds', 'Tomatoes'],
    climateZone: 'Subtropical Mediterranean',
    avgMoisture: 35,
    solarRadiation: 5.6,
    defaultInputs: {
      location: 'Andalusia, Spain',
      farmArea: 60,
      soilType: 'chalky',
      season: 'year-round',
      waterAvailability: 'moderate',
      topography: 'terraced',
      farmingType: 'conventional',
      waterSource: 'borewell',
      ph: 7.9,
      nitrogen: 110,
      phosphorus: 40,
      potassium: 90,
      temperature: 25,
      rainfall: 480
    }
  },
  {
    id: 'cerrado_bra',
    name: 'Brazil',
    region: 'Cerrado Agricultural Belt',
    flag: '🇧🇷',
    lat: -14.23,
    lon: -51.92,
    cropCategory: 'Commercial',
    primaryCrops: ['Soybeans', 'Maize', 'Cotton', 'Coffee'],
    climateZone: 'Tropical Savanna',
    avgMoisture: 62,
    solarRadiation: 5.4,
    defaultInputs: {
      location: 'Cerrado, Mato Grosso, Brazil',
      farmArea: 250,
      soilType: 'clay',
      season: 'kharif',
      waterAvailability: 'high',
      topography: 'rolling',
      farmingType: 'regenerative',
      waterSource: 'river',
      ph: 6.2,
      nitrogen: 150,
      phosphorus: 60,
      potassium: 120,
      temperature: 28,
      rainfall: 1400
    }
  },
  {
    id: 'hokkaido_jpn',
    name: 'Japan',
    region: 'Hokkaido Precision Plain',
    flag: '🇯🇵',
    lat: 43.06,
    lon: 141.35,
    cropCategory: 'Vegetables',
    primaryCrops: ['Potatoes', 'Onions', 'Rice', 'Sugarbeet'],
    climateZone: 'Subarctic Humid Maritime',
    avgMoisture: 65,
    solarRadiation: 4.2,
    defaultInputs: {
      location: 'Hokkaido, Japan',
      farmArea: 30,
      soilType: 'loamy',
      season: 'zaid',
      waterAvailability: 'high',
      topography: 'flat',
      farmingType: 'organic',
      waterSource: 'river',
      ph: 6.5,
      nitrogen: 130,
      phosphorus: 50,
      potassium: 70,
      temperature: 16,
      rainfall: 950
    }
  },
  {
    id: 'murray_aus',
    name: 'Australia',
    region: 'Murray-Darling Basin',
    flag: '🇦🇺',
    lat: -34.00,
    lon: 142.00,
    cropCategory: 'Grains',
    primaryCrops: ['Wheat', 'Barley', 'Cotton', 'Wine Grapes'],
    climateZone: 'Semi-Arid Basin',
    avgMoisture: 30,
    solarRadiation: 6.5,
    defaultInputs: {
      location: 'Murray-Darling, Australia',
      farmArea: 350,
      soilType: 'sandy',
      season: 'rabi',
      waterAvailability: 'low',
      topography: 'flat',
      farmingType: 'conventional',
      waterSource: 'canal',
      ph: 7.2,
      nitrogen: 100,
      phosphorus: 38,
      potassium: 45,
      temperature: 26,
      rainfall: 380
    }
  }
];

// Helper: Convert Lat/Lon to 3D Sphere Coordinates
function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Procedural Earth Texture Creator
function createEarthCanvasTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep ocean background
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, '#061826');
  oceanGrad.addColorStop(0.5, '#0b2545');
  oceanGrad.addColorStop(1, '#061826');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Draw latitude/longitude grid lines
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 1024; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Draw stylized continent shapes
  ctx.fillStyle = '#064e3b'; // Deep emerald landmass
  ctx.strokeStyle = '#10b981'; // Bright emerald borders
  ctx.lineWidth = 2;

  // North America
  ctx.beginPath();
  ctx.ellipse(250, 150, 130, 80, -0.2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  // South America
  ctx.beginPath();
  ctx.ellipse(320, 320, 70, 110, 0.3, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  // Europe & Asia
  ctx.beginPath();
  ctx.ellipse(600, 140, 200, 90, 0.1, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  // Africa
  ctx.beginPath();
  ctx.ellipse(540, 270, 90, 110, -0.1, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  // Australia
  ctx.beginPath();
  ctx.ellipse(820, 350, 80, 50, -0.2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// 3D Globe Mesh Component
function GlobeMesh({
  selectedSpot,
  onSelectSpot
}: {
  selectedSpot: CountrySpot;
  onSelectSpot: (spot: CountrySpot) => void;
}) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  const earthTexture = useMemo(() => createEarthCanvasTexture(), []);

  // Smooth rotation & target lerp
  useFrame((_, delta) => {
    if (globeGroupRef.current) {
      // Idle slow spin
      globeGroupRef.current.rotation.y += delta * 0.05;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={globeGroupRef}>
      {/* Core Ocean & Land Globe */}
      <mesh>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.6}
          metalness={0.2}
          emissive="#022c22"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Cloud & Atmosphere Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.54, 48, 48]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          wireframe
        />
      </mesh>

      {/* Atmosphere Outer Glow Shell */}
      <mesh>
        <sphereGeometry args={[2.7, 32, 32]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3D Hotspot Pin Beacons for Countries */}
      {COUNTRY_SPOTS.map((spot) => {
        const pos = latLongToVector3(spot.lat, spot.lon, 2.55);
        const isSelected = selectedSpot.id === spot.id;

        return (
          <group key={spot.id} position={pos}>
            {/* Glowing Pin Sphere */}
            <mesh onClick={() => onSelectSpot(spot)}>
              <sphereGeometry args={[isSelected ? 0.09 : 0.06, 16, 16]} />
              <meshBasicMaterial color={isSelected ? '#34d399' : '#38bdf8'} />
            </mesh>

            {/* Pulsating Light Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.08, 0.12, 16]} />
              <meshBasicMaterial
                color={isSelected ? '#10b981' : '#0284c7'}
                transparent
                opacity={isSelected ? 0.8 : 0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export interface EarthGlobe3DProps {
  onSelectCountry: (spot: CountrySpot) => void;
  selectedSpotId?: string;
}

export const EarthGlobe3D: React.FC<EarthGlobe3DProps> = ({ onSelectCountry, selectedSpotId }) => {
  const [selectedSpot, setSelectedSpot] = useState<CountrySpot>(() => {
    return COUNTRY_SPOTS.find(s => s.id === selectedSpotId) || COUNTRY_SPOTS[0];
  });

  const [searchQuery, setSearchQuery] = useState('');

  const filteredSpots = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRY_SPOTS;
    const q = searchQuery.toLowerCase();
    return COUNTRY_SPOTS.filter(
      s => s.name.toLowerCase().includes(q) || s.region.toLowerCase().includes(q) || s.cropCategory.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSpotClick = (spot: CountrySpot) => {
    setSelectedSpot(spot);
  };

  const handleConfirm = () => {
    onSelectCountry(selectedSpot);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Title & Intro Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '12s' }} />
          Step 0 • Interactive Global Agronomic Selector
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Select Your Commercial <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Agricultural Region</span>
        </h2>
        <p className="text-slate-300 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
          Rotate the interactive 3D Earth globe or select a target country from the global agricultural microclimate list to automatically load localized soil, solar radiation, and irrigation parameters.
        </p>
      </div>

      {/* Main 3D Interactive Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Country Selection List & Search (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 backdrop-blur-xl shadow-xl flex flex-col justify-between max-h-[580px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                Select Agricultural Hub
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                {COUNTRY_SPOTS.length} Global Hubs
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country, region or crop..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Country Cards List */}
            <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredSpots.map((spot) => {
                const isSelected = selectedSpot.id === spot.id;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => handleSpotClick(spot)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/10 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{spot.flag}</span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{spot.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {spot.cropCategory}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[170px]">{spot.region}</div>
                      </div>
                    </div>

                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <MapPin className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center / Right: 3D Earth Canvas & Selected Country Info Card (8 Cols) */}
        <div className="lg:col-span-8 relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950/30 border border-slate-800 shadow-2xl min-h-[500px] flex flex-col justify-between p-6">
          {/* 3D Canvas */}
          <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[10, 10, 5]} intensity={1.5} color="#e0f2fe" />
              <pointLight position={[-10, -10, -5]} intensity={0.5} color="#065f46" />
              <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
                <GlobeMesh selectedSpot={selectedSpot} onSelectSpot={handleSpotClick} />
              </Float>
              <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.6} />
            </Canvas>
          </div>

          {/* Top Floating Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-cyan-300 text-xs font-mono backdrop-blur-md">
              <Navigation className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Lat: {selectedSpot.lat}° | Lon: {selectedSpot.lon}°</span>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
              Drag to Rotate 3D Earth
            </span>
          </div>

          {/* Bottom Floating Country Summary Card & Confirm Button */}
          <div className="relative z-10 mt-auto pt-6">
            <motion.div
              key={selectedSpot.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-5 backdrop-blur-xl shadow-2xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedSpot.flag}</span>
                  <div>
                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                      {selectedSpot.name}
                      <span className="text-xs font-normal text-emerald-400">({selectedSpot.region})</span>
                    </h3>
                    <p className="text-xs text-slate-400">Climate: {selectedSpot.climateZone}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Initialize Farm with {selectedSpot.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Primary Commercial Crops</div>
                  <div className="text-xs font-bold text-emerald-300 truncate mt-0.5">
                    {selectedSpot.primaryCrops.join(', ')}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-400" />
                    Solar Irradiance
                  </div>
                  <div className="text-xs font-bold text-amber-300 mt-0.5 font-mono">
                    {selectedSpot.solarRadiation} kWh/m²/day
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-400" />
                    Avg Soil Moisture
                  </div>
                  <div className="text-xs font-bold text-cyan-300 mt-0.5 font-mono">
                    {selectedSpot.avgMoisture}%
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Default Farming Model</div>
                  <div className="text-xs font-bold text-slate-200 capitalize mt-0.5 truncate">
                    {selectedSpot.defaultInputs.farmingType} ({selectedSpot.defaultInputs.waterSource})
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthGlobe3D;
