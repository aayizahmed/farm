import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import {
  Globe, MapPin,
  Navigation, Search, CheckCircle2, Map
} from 'lucide-react';

export interface DistrictSpot {
  id: string;
  name: string;              // District name
  state: string;             // State name
  country: string;           // Country name
  countryFlag: string;
  region: string;            // Region
  lat: number;
  lon: number;
  cropCategory: string;
  primaryCrops: string[];
  climateZone: string;
  soilType: 'loamy' | 'sandy' | 'clay' | 'silt' | 'peat' | 'chalky' | 'black' | 'red';
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  moisture: number;
  temperature: number;
  rainfall: number;
  soc: number;
  ec: number;
}

export const DISTRICT_SPOTS: DistrictSpot[] = [
  // ==================== ALL 14 DISTRICTS OF KERALA, INDIA ====================
  {
    id: 'ind_kl_wyd', name: 'Wayanad District', state: 'Kerala', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 11.68, lon: 76.13, cropCategory: 'Spices', primaryCrops: ['Malabar Black Pepper', 'Robusta Coffee', 'Cardamom', 'Highland Tea'],
    climateZone: 'Western Ghats Humid Highland', soilType: 'red', ph: 5.6, nitrogen: 150, phosphorus: 55, potassium: 160, moisture: 72, temperature: 22, rainfall: 2800, soc: 3.1, ec: 0.3
  },
  {
    id: 'ind_kl_pkd', name: 'Palakkad District (Granary of Kerala)', state: 'Kerala', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 10.78, lon: 76.65, cropCategory: 'Grains', primaryCrops: ['Jyothi Paddy Rice', 'Coconut', 'Sugarcane', 'Groundnut'],
    climateZone: 'Palakkad Gap Tropical Plain', soilType: 'loamy', ph: 6.5, nitrogen: 140, phosphorus: 45, potassium: 135, moisture: 60, temperature: 29, rainfall: 2100, soc: 1.8, ec: 0.6
  },
  {
    id: 'ind_kl_idk', name: 'Idukki District (Spice Garden)', state: 'Kerala', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 9.85, lon: 76.97, cropCategory: 'Spices', primaryCrops: ['Green Cardamom', 'Highland Tea', 'Cocoa', 'Nutmeg'],
    climateZone: 'High Range Evergreen Mist', soilType: 'red', ph: 5.4, nitrogen: 155, phosphorus: 60, potassium: 170, moisture: 75, temperature: 20, rainfall: 3200, soc: 3.5, ec: 0.2
  },
  {
    id: 'ind_kl_kzk', name: 'Kozhikode District', state: 'Kerala', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 11.25, lon: 75.78, cropCategory: 'Commercial', primaryCrops: ['Coconut', 'Black Pepper', 'Cassava (Tapioca)', 'Banana'],
    climateZone: 'Malabar Coastal Belt', soilType: 'loamy', ph: 6.1, nitrogen: 130, phosphorus: 42, potassium: 140, moisture: 65, temperature: 27, rainfall: 3100, soc: 1.9, ec: 0.5
  },
  {
    id: 'ind_kl_mlp', name: 'Malappuram District', state: 'Kerala', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 11.07, lon: 76.07, cropCategory: 'Commercial', primaryCrops: ['Arecanut', 'Coconut', 'Natural Rubber', 'Paddy'],
    climateZone: 'Midland Coastal Humid', soilType: 'loamy', ph: 6.0, nitrogen: 135, phosphorus: 40, potassium: 130, moisture: 62, temperature: 28, rainfall: 2900, soc: 1.7, ec: 0.5
  },
  {
    id: 'ind_kl_knr', name: 'Kannur District', state: 'Kerala', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 11.87, lon: 75.37, cropCategory: 'Commercial', primaryCrops: ['Cashew Nut', 'Black Pepper', 'Coconut', 'Rubber'],
    climateZone: 'North Malabar Coast', soilType: 'red', ph: 5.8, nitrogen: 130, phosphorus: 45, potassium: 145, moisture: 64, temperature: 27, rainfall: 3300, soc: 2.1, ec: 0.4
  },
  {
    id: 'ind_kl_ksr', name: 'Kasaragod District', state: 'Kerala', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 12.50, lon: 74.99, cropCategory: 'Commercial', primaryCrops: ['West Coast Coconut', 'Arecanut', 'Tobacco', 'Spices'],
    climateZone: 'Northern Coastal Terraced', soilType: 'sandy', ph: 5.9, nitrogen: 125, phosphorus: 38, potassium: 150, moisture: 60, temperature: 28, rainfall: 3400, soc: 1.6, ec: 0.6
  },
  {
    id: 'ind_kl_tcr', name: 'Thrissur District (Cole Lands)', state: 'Kerala', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 10.52, lon: 76.21, cropCategory: 'Grains', primaryCrops: ['Cole Wetlands Paddy', 'Nendran Banana', 'Coconut', 'Nutmeg'],
    climateZone: 'Central Wetland Plain', soilType: 'clay', ph: 6.2, nitrogen: 140, phosphorus: 48, potassium: 135, moisture: 70, temperature: 28, rainfall: 2600, soc: 2.2, ec: 0.7
  },
  {
    id: 'ind_kl_ekm', name: 'Ernakulam District', state: 'Kerala', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 9.98, lon: 76.30, cropCategory: 'Commercial', primaryCrops: ['Vazhakulam Pineapple', 'Natural Rubber', 'Vegetables', 'Pokkali Rice'],
    climateZone: 'Coastal Hydro Basin', soilType: 'loamy', ph: 6.1, nitrogen: 145, phosphorus: 50, potassium: 140, moisture: 68, temperature: 28, rainfall: 2950, soc: 2.0, ec: 0.8
  },
  {
    id: 'ind_kl_ktm', name: 'Kottayam District (Rubber Capital)', state: 'Kerala', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 9.59, lon: 76.52, cropCategory: 'Commercial', primaryCrops: ['Natural Rubber (RRII 105)', 'Cardamom', 'Tapioca', 'Paddy'],
    climateZone: 'Midland Rolling Hills', soilType: 'red', ph: 5.7, nitrogen: 150, phosphorus: 52, potassium: 160, moisture: 66, temperature: 27, rainfall: 3100, soc: 2.4, ec: 0.4
  },
  {
    id: 'ind_kl_alp', name: 'Alappuzha District (Kuttanad Below-Sea)', state: 'Kerala', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 9.49, lon: 76.33, cropCategory: 'Grains', primaryCrops: ['Kuttanad Below-Sea Paddy', 'Coconut', 'Tubers', 'Duck Pasture'],
    climateZone: 'Backwater Wetland Delta', soilType: 'clay', ph: 5.5, nitrogen: 135, phosphorus: 40, potassium: 120, moisture: 80, temperature: 28, rainfall: 2500, soc: 2.6, ec: 1.1
  },
  {
    id: 'ind_kl_pta', name: 'Pathanamthitta District', state: 'Kerala', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 9.26, lon: 76.78, cropCategory: 'Commercial', primaryCrops: ['Rubber Plantations', 'Tapioca', 'Black Pepper', 'Sugarcane'],
    climateZone: 'Hilly Midland Forest', soilType: 'red', ph: 5.8, nitrogen: 140, phosphorus: 44, potassium: 150, moisture: 65, temperature: 26, rainfall: 2900, soc: 2.3, ec: 0.3
  },
  {
    id: 'ind_kl_klm', name: 'Kollam District (Cashew Hub)', state: 'Kerala', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 8.89, lon: 76.60, cropCategory: 'Commercial', primaryCrops: ['Cashew Processing', 'Tapioca', 'Coconut', 'Rubber'],
    climateZone: 'Southern Coastal Plain', soilType: 'sandy', ph: 6.0, nitrogen: 130, phosphorus: 40, potassium: 140, moisture: 62, temperature: 28, rainfall: 2700, soc: 1.8, ec: 0.6
  },
  {
    id: 'ind_kl_tvm', name: 'Thiruvananthapuram District', state: 'Kerala', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 8.52, lon: 76.93, cropCategory: 'Vegetables', primaryCrops: ['Tapioca (Cassava)', 'Coconut', 'Plantain Banana', 'Vegetables'],
    climateZone: 'Southern Peninsula Coastal', soilType: 'loamy', ph: 6.2, nitrogen: 135, phosphorus: 42, potassium: 145, moisture: 60, temperature: 28, rainfall: 1800, soc: 1.6, ec: 0.7
  },

  // --- OTHER INDIAN STATES ---
  {
    id: 'ind_pb_ldh', name: 'Ludhiana District', state: 'Punjab', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 30.90, lon: 75.85, cropCategory: 'Grains', primaryCrops: ['Basmati Rice', 'PBW-1 Wheat', 'Sugarcane', 'Potato'],
    climateZone: 'Subtropical Alluvial Plain', soilType: 'silt', ph: 7.4, nitrogen: 145, phosphorus: 48, potassium: 55, moisture: 58, temperature: 19, rainfall: 680, soc: 0.9, ec: 0.8
  },
  {
    id: 'ind_mh_nsk', name: 'Nashik District', state: 'Maharashtra', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 19.99, lon: 73.78, cropCategory: 'Spices', primaryCrops: ['Table Grapes', 'Red Onions', 'Pomegranate', 'Tomatoes'],
    climateZone: 'Deccan Semi-Arid Basin', soilType: 'black', ph: 7.7, nitrogen: 115, phosphorus: 42, potassium: 185, moisture: 45, temperature: 27, rainfall: 710, soc: 1.2, ec: 1.0
  },
  {
    id: 'usa_ca_fre', name: 'Fresno County', state: 'California', country: 'United States', countryFlag: '🇺🇸', region: 'North America',
    lat: 36.74, lon: -119.78, cropCategory: 'Orchard', primaryCrops: ['Almonds', 'Pistachios', 'Raisin Grapes', 'Tomatoes'],
    climateZone: 'San Joaquin Valley Mediterranean', soilType: 'loamy', ph: 6.8, nitrogen: 165, phosphorus: 58, potassium: 145, moisture: 45, temperature: 24, rainfall: 540, soc: 1.8, ec: 1.2
  },
  {
    id: 'nld_zh_west', name: 'Westland District', state: 'South Holland', country: 'Netherlands', countryFlag: '🇳🇱', region: 'Europe',
    lat: 51.99, lon: 4.20, cropCategory: 'Vegetables', primaryCrops: ['Automated Tomatoes', 'Paprika', 'Cucumbers', 'Orchids'],
    climateZone: 'Maritime Closed Glasshouse', soilType: 'peat', ph: 6.0, nitrogen: 185, phosphorus: 75, potassium: 210, moisture: 75, temperature: 22, rainfall: 860, soc: 3.4, ec: 1.5
  }
];

function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

function vector3ToLatLong(point: THREE.Vector3, _radius: number = 2.5): { lat: number; lon: number } {
  const normalized = point.clone().normalize();
  const lat = Math.asin(normalized.y) * (180 / Math.PI);
  let lon = Math.atan2(normalized.z, -normalized.x) * (180 / Math.PI) - 180;
  if (lon < -180) lon += 360;
  if (lon > 180) lon -= 360;
  return { lat: Number(lat.toFixed(2)), lon: Number(lon.toFixed(2)) };
}

function HighDetailEarthMesh({
  selectedDistrict,
  onSelectDistrict,
  onSphereClick
}: {
  selectedDistrict: DistrictSpot;
  onSelectDistrict: (district: DistrictSpot) => void;
  onSphereClick: (lat: number, lon: number) => void;
}) {
  const earthRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.04;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.06;
    }
  });

  const detailedEarthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e293b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 1024; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(2048, y);
      ctx.stroke();
    }
    for (let x = 0; x < 2048; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.8)';
    ctx.lineWidth = 2;

    const landmasses = [
      [[300, 150], [550, 180], [600, 320], [520, 450], [400, 480], [320, 350], [250, 220]],
      [[550, 520], [680, 560], [700, 750], [620, 920], [540, 800], [520, 620]],
      [[1050, 120], [1750, 150], [1850, 380], [1600, 480], [1300, 450], [1150, 320], [1000, 220]],
      [[950, 380], [1200, 420], [1250, 680], [1150, 850], [1000, 750], [920, 520]],
      [[1600, 680], [1850, 700], [1880, 850], [1650, 880], [1580, 760]]
    ];

    landmasses.forEach((poly) => {
      ctx.beginPath();
      ctx.moveTo(poly[0][0], poly[0][1]);
      for (let i = 1; i < poly.length; i++) {
        ctx.lineTo(poly[i][0], poly[i][1]);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <group ref={earthRef}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          const point = e.point;
          const { lat, lon } = vector3ToLatLong(point, 2.5);
          onSphereClick(lat, lon);
        }}
      >
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshStandardMaterial map={detailedEarthTexture} roughness={0.35} metalness={0.2} />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.54, 48, 48]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.12} blending={THREE.AdditiveBlending} />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.65, 32, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>

      {DISTRICT_SPOTS.map((district) => {
        const pos = latLongToVector3(district.lat, district.lon, 2.55);
        const isSelected = selectedDistrict.id === district.id;

        return (
          <group key={district.id} position={pos}>
            <mesh onClick={() => onSelectDistrict(district)}>
              <sphereGeometry args={[isSelected ? 0.08 : 0.05, 16, 16]} />
              <meshBasicMaterial color={isSelected ? '#34d399' : '#10b981'} />
            </mesh>
            {isSelected && (
              <mesh>
                <ringGeometry args={[0.09, 0.14, 32]} />
                <meshBasicMaterial color="#34d399" side={THREE.DoubleSide} transparent opacity={0.6} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

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
  defaultInputs: {
    farmArea: number;
    soilType: 'loamy' | 'sandy' | 'clay' | 'silt' | 'peat' | 'chalky' | 'black' | 'red';
    season: 'kharif' | 'rabi' | 'zaid' | 'year-round';
    waterAvailability: 'low' | 'moderate' | 'high' | 'irrigated';
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    moisture: number;
    temperature: number;
    rainfall: number;
    soc: number;
    ec: number;
    topography: 'flat' | 'sloped' | 'terraced' | 'rolling';
    farmingType: 'conventional' | 'organic' | 'hydroponic' | 'regenerative';
    waterSource: 'borewell' | 'canal' | 'river' | 'rainwater' | 'municipal';
  };
}

interface EarthGlobe3DProps {
  onSelectCountry: (spot: CountrySpot) => void;
}

export const EarthGlobe3D: React.FC<EarthGlobe3DProps> = ({ onSelectCountry }) => {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('ind_kl_wyd');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('India');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('Kerala');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedDistrict = useMemo(() => {
    return DISTRICT_SPOTS.find((d) => d.id === selectedDistrictId) || DISTRICT_SPOTS[0];
  }, [selectedDistrictId]);

  const uniqueCountries = useMemo(() => {
    return ['All', ...Array.from(new Set(DISTRICT_SPOTS.map((d) => d.country)))];
  }, []);

  const uniqueStates = useMemo(() => {
    const list = DISTRICT_SPOTS.filter((d) => selectedCountryFilter === 'All' || d.country === selectedCountryFilter).map((d) => d.state);
    return ['All', ...Array.from(new Set(list))];
  }, [selectedCountryFilter]);

  const filteredDistricts = useMemo(() => {
    return DISTRICT_SPOTS.filter((d) => {
      const matchCountry = selectedCountryFilter === 'All' || d.country === selectedCountryFilter;
      const matchState = selectedStateFilter === 'All' || d.state === selectedStateFilter;
      const matchSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.primaryCrops.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCountry && matchState && matchSearch;
    });
  }, [selectedCountryFilter, selectedStateFilter, searchQuery]);

  const handleSphereClick = (lat: number, lon: number) => {
    let closest = DISTRICT_SPOTS[0];
    let minDistance = Infinity;

    DISTRICT_SPOTS.forEach((d) => {
      const dist = Math.hypot(d.lat - lat, d.lon - lon);
      if (dist < minDistance) {
        minDistance = dist;
        closest = d;
      }
    });

    setSelectedDistrictId(closest.id);
  };

  const handleConfirm = () => {
    const spot: CountrySpot = {
      id: selectedDistrict.id,
      name: `${selectedDistrict.name}, ${selectedDistrict.state}, ${selectedDistrict.country}`,
      region: selectedDistrict.region,
      flag: selectedDistrict.countryFlag,
      lat: selectedDistrict.lat,
      lon: selectedDistrict.lon,
      cropCategory: selectedDistrict.cropCategory,
      primaryCrops: selectedDistrict.primaryCrops,
      climateZone: selectedDistrict.climateZone,
      defaultInputs: {
        farmArea: 5,
        soilType: selectedDistrict.soilType,
        season: 'kharif',
        waterAvailability: 'high',
        ph: selectedDistrict.ph,
        nitrogen: selectedDistrict.nitrogen,
        phosphorus: selectedDistrict.phosphorus,
        potassium: selectedDistrict.potassium,
        moisture: selectedDistrict.moisture,
        temperature: selectedDistrict.temperature,
        rainfall: selectedDistrict.rainfall,
        soc: selectedDistrict.soc,
        ec: selectedDistrict.ec,
        topography: 'flat',
        farmingType: 'organic',
        waterSource: 'rainwater'
      }
    };
    onSelectCountry(spot);
  };

  return (
    <div className="space-y-6">
      {/* Light Theme Globe Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5 animate-spin text-emerald-700" style={{ animationDuration: '15s' }} />
            Kerala 14 Districts & Worldwide Globe
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Select Your District in Kerala or Worldwide
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Featuring <strong className="text-emerald-700 font-bold">All 14 Districts of Kerala</strong> (Wayanad, Palakkad, Idukki, Kozhikode, Thrissur, etc.).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <label className="text-[10px] text-slate-500 block font-semibold mb-1">Country</label>
            <select
              value={selectedCountryFilter}
              onChange={(e) => {
                setSelectedCountryFilter(e.target.value);
                setSelectedStateFilter('All');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold focus:border-emerald-600"
            >
              {uniqueCountries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 block font-semibold mb-1">State / District Filter</label>
            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold focus:border-emerald-600"
            >
              {uniqueStates.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-slate-900 border border-slate-300 rounded-3xl h-[420px] md:h-[480px] relative overflow-hidden shadow-xl flex items-center justify-center">
          <Canvas camera={{ position: [0, 0, 6.2], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            <pointLight position={[-10, -10, -5]} intensity={0.5} color="#0284c7" />

            <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
              <HighDetailEarthMesh
                selectedDistrict={selectedDistrict}
                onSelectDistrict={(dist) => setSelectedDistrictId(dist.id)}
                onSphereClick={handleSphereClick}
              />
            </Float>

            <OrbitControls enablePan={false} enableZoom={true} minDistance={4.2} maxDistance={9.0} rotateSpeed={0.6} />
          </Canvas>

          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-slate-200 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-800 shadow-md">
            <Map className="w-4 h-4 text-emerald-600" />
            <span>Interactive District Map View</span>
          </div>

          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-mono text-emerald-400">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>{selectedDistrict.name} ({selectedDistrict.state}, {selectedDistrict.country})</span>
          </div>
        </div>

        {/* Light Selection Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-md">
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Kerala district (e.g. Wayanad, Idukki, Thrissur)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="max-h-[170px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-300">
              {filteredDistricts.map((d) => {
                const isSel = d.id === selectedDistrict.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDistrictId(d.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSel
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base">{d.countryFlag}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">{d.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{d.state}, {d.country}</div>
                      </div>
                    </div>
                    {isSel && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <motion.div
              key={selectedDistrict.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{selectedDistrict.countryFlag}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedDistrict.name}</h3>
                    <span className="text-[10px] font-semibold text-emerald-700">{selectedDistrict.state}, {selectedDistrict.country}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                  {selectedDistrict.cropCategory} Focus
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">Soil & Climate</span>
                  <span className="font-semibold text-slate-800 text-[11px]">{selectedDistrict.soilType.toUpperCase()} Soil · {selectedDistrict.climateZone}</span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block">District Crops</span>
                  <span className="font-semibold text-emerald-800 text-[11px] truncate block">{selectedDistrict.primaryCrops.join(', ')}</span>
                </div>
              </div>
            </motion.div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4 fill-current" />
            <span>Select District & Proceed ({selectedDistrict.name})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EarthGlobe3D;
