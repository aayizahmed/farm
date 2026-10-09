import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import {
  Globe, MapPin, Compass,
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

export const COUNTRY_SPOTS: CountrySpot[] = [
  // --- NORTH AMERICA ---
  {
    id: 'ca_usa',
    name: 'United States (California)',
    region: 'North America',
    flag: '🇺🇸',
    lat: 36.77,
    lon: -119.41,
    cropCategory: 'Orchard',
    primaryCrops: ['Almonds', 'Walnuts', 'Citrus', 'Grapes'],
    climateZone: 'Mediterranean / Semi-Arid',
    defaultInputs: {
      farmArea: 150, soilType: 'loamy', season: 'year-round', waterAvailability: 'moderate',
      ph: 6.8, nitrogen: 160, phosphorus: 55, potassium: 140, moisture: 45, temperature: 24,
      rainfall: 550, soc: 1.8, ec: 1.2, topography: 'flat', farmingType: 'conventional', waterSource: 'borewell'
    }
  },
  {
    id: 'sask_can',
    name: 'Canada (Saskatchewan)',
    region: 'North America',
    flag: '🇨🇦',
    lat: 52.13,
    lon: -106.67,
    cropCategory: 'Grains',
    primaryCrops: ['Canola', 'Spring Wheat', 'Pulses', 'Barley'],
    climateZone: 'Cool Continental Prairie',
    defaultInputs: {
      farmArea: 500, soilType: 'black', season: 'rabi', waterAvailability: 'moderate',
      ph: 7.0, nitrogen: 120, phosphorus: 45, potassium: 130, moisture: 50, temperature: 16,
      rainfall: 480, soc: 2.5, ec: 0.7, topography: 'flat', farmingType: 'conventional', waterSource: 'rainwater'
    }
  },
  {
    id: 'sin_mex',
    name: 'Mexico (Sinaloa)',
    region: 'North America',
    flag: '🇲🇽',
    lat: 24.80,
    lon: -107.39,
    cropCategory: 'Vegetables',
    primaryCrops: ['Tomatoes', 'Bell Peppers', 'Maize', 'Mangos'],
    climateZone: 'Subtropical Irrigated',
    defaultInputs: {
      farmArea: 80, soilType: 'silt', season: 'year-round', waterAvailability: 'irrigated',
      ph: 7.2, nitrogen: 150, phosphorus: 60, potassium: 160, moisture: 60, temperature: 28,
      rainfall: 620, soc: 1.4, ec: 1.1, topography: 'flat', farmingType: 'conventional', waterSource: 'canal'
    }
  },

  // --- SOUTH AMERICA ---
  {
    id: 'cerrado_bra',
    name: 'Brazil (Cerrado, Mato Grosso)',
    region: 'South America',
    flag: '🇧🇷',
    lat: -14.23,
    lon: -51.92,
    cropCategory: 'Commercial',
    primaryCrops: ['Soybeans', 'Maize', 'Cotton', 'Coffee'],
    climateZone: 'Tropical Savanna',
    defaultInputs: {
      farmArea: 600, soilType: 'red', season: 'kharif', waterAvailability: 'high',
      ph: 5.8, nitrogen: 130, phosphorus: 50, potassium: 120, moisture: 65, temperature: 26,
      rainfall: 1600, soc: 2.1, ec: 0.5, topography: 'flat', farmingType: 'regenerative', waterSource: 'rainwater'
    }
  },
  {
    id: 'pampas_arg',
    name: 'Argentina (Pampas Grain Belt)',
    region: 'South America',
    flag: '🇦🇷',
    lat: -34.60,
    lon: -58.38,
    cropCategory: 'Grains',
    primaryCrops: ['Wheat', 'Corn', 'Sunflower', 'Soybeans'],
    climateZone: 'Humid Pampean Subtropical',
    defaultInputs: {
      farmArea: 350, soilType: 'loamy', season: 'rabi', waterAvailability: 'moderate',
      ph: 6.6, nitrogen: 140, phosphorus: 40, potassium: 150, moisture: 55, temperature: 20,
      rainfall: 950, soc: 2.3, ec: 0.6, topography: 'flat', farmingType: 'conventional', waterSource: 'rainwater'
    }
  },
  {
    id: 'val_chl',
    name: 'Chile (Central Fruit Valley)',
    region: 'South America',
    flag: '🇨🇱',
    lat: -33.45,
    lon: -70.66,
    cropCategory: 'Orchard',
    primaryCrops: ['Cherries', 'Table Grapes', 'Avocados', 'Wine Grapes'],
    climateZone: 'Mediterranean Andean Valley',
    defaultInputs: {
      farmArea: 65, soilType: 'loamy', season: 'year-round', waterAvailability: 'irrigated',
      ph: 6.9, nitrogen: 150, phosphorus: 50, potassium: 170, moisture: 50, temperature: 21,
      rainfall: 420, soc: 1.7, ec: 0.9, topography: 'sloped', farmingType: 'conventional', waterSource: 'river'
    }
  },

  // --- EUROPE ---
  {
    id: 'westland_nld',
    name: 'Netherlands (Westland)',
    region: 'Europe',
    flag: '🇳🇱',
    lat: 51.99,
    lon: 4.20,
    cropCategory: 'Vegetables',
    primaryCrops: ['Greenhouse Tomatoes', 'Bell Peppers', 'Cucumbers', 'Flowers'],
    climateZone: 'Maritime Glasshouse Precision',
    defaultInputs: {
      farmArea: 12, soilType: 'peat', season: 'year-round', waterAvailability: 'high',
      ph: 6.0, nitrogen: 180, phosphorus: 70, potassium: 200, moisture: 75, temperature: 22,
      rainfall: 850, soc: 3.2, ec: 1.5, topography: 'flat', farmingType: 'hydroponic', waterSource: 'municipal'
    }
  },
  {
    id: 'andalusia_esp',
    name: 'Spain (Andalusia)',
    region: 'Europe',
    flag: '🇪🇸',
    lat: 37.38,
    lon: -5.98,
    cropCategory: 'Orchard',
    primaryCrops: ['Olives', 'Strawberries', 'Almonds', 'Citrus'],
    climateZone: 'Mediterranean Subtropical',
    defaultInputs: {
      farmArea: 75, soilType: 'chalky', season: 'year-round', waterAvailability: 'moderate',
      ph: 7.6, nitrogen: 110, phosphorus: 40, potassium: 160, moisture: 40, temperature: 23,
      rainfall: 520, soc: 1.2, ec: 1.4, topography: 'rolling', farmingType: 'organic', waterSource: 'borewell'
    }
  },
  {
    id: 'bordeaux_fra',
    name: 'France (Bordeaux & Loire)',
    region: 'Europe',
    flag: '🇫🇷',
    lat: 44.83,
    lon: -0.57,
    cropCategory: 'Orchard',
    primaryCrops: ['Wine Grapes', 'Wheat', 'Sugar Beets', 'Apples'],
    climateZone: 'Oceanic Temperate',
    defaultInputs: {
      farmArea: 45, soilType: 'loamy', season: 'year-round', waterAvailability: 'high',
      ph: 6.7, nitrogen: 110, phosphorus: 45, potassium: 150, moisture: 55, temperature: 19,
      rainfall: 820, soc: 2.2, ec: 0.6, topography: 'rolling', farmingType: 'organic', waterSource: 'rainwater'
    }
  },
  {
    id: 'bavaria_deu',
    name: 'Germany (Bavaria)',
    region: 'Europe',
    flag: '🇩🇪',
    lat: 48.13,
    lon: 11.58,
    cropCategory: 'Grains',
    primaryCrops: ['Hops', 'Barley', 'Wheat', 'Rapeseed'],
    climateZone: 'Central European Temperate',
    defaultInputs: {
      farmArea: 90, soilType: 'loamy', season: 'rabi', waterAvailability: 'high',
      ph: 6.8, nitrogen: 140, phosphorus: 50, potassium: 140, moisture: 60, temperature: 17,
      rainfall: 880, soc: 2.4, ec: 0.5, topography: 'rolling', farmingType: 'conventional', waterSource: 'rainwater'
    }
  },
  {
    id: 'po_ita',
    name: 'Italy (Po Valley)',
    region: 'Europe',
    flag: '🇮🇹',
    lat: 45.46,
    lon: 9.19,
    cropCategory: 'Grains',
    primaryCrops: ['Arborio Rice', 'Maize', 'Tomatoes', 'Grapes'],
    climateZone: 'Humid Subtropical Valley',
    defaultInputs: {
      farmArea: 60, soilType: 'clay', season: 'kharif', waterAvailability: 'irrigated',
      ph: 6.9, nitrogen: 150, phosphorus: 55, potassium: 150, moisture: 65, temperature: 22,
      rainfall: 920, soc: 2.0, ec: 0.8, topography: 'flat', farmingType: 'conventional', waterSource: 'river'
    }
  },
  {
    id: 'uuk_ukr',
    name: 'Ukraine (Chernozem Belt)',
    region: 'Europe',
    flag: '🇺🇦',
    lat: 49.00,
    lon: 32.00,
    cropCategory: 'Grains',
    primaryCrops: ['Sunflower', 'Wheat', 'Corn', 'Barley'],
    climateZone: 'Temperate Continental Black Soil',
    defaultInputs: {
      farmArea: 400, soilType: 'black', season: 'rabi', waterAvailability: 'moderate',
      ph: 7.1, nitrogen: 150, phosphorus: 50, potassium: 160, moisture: 55, temperature: 17,
      rainfall: 580, soc: 3.8, ec: 0.5, topography: 'flat', farmingType: 'conventional', waterSource: 'rainwater'
    }
  },

  // --- ASIA ---
  {
    id: 'punjab_ind',
    name: 'India (Punjab Indo-Gangetic)',
    region: 'Asia',
    flag: '🇮🇳',
    lat: 31.14,
    lon: 75.34,
    cropCategory: 'Grains',
    primaryCrops: ['Basmati Rice', 'Wheat', 'Sugarcane', 'Mustard'],
    climateZone: 'Subtropical Alluvial Plain',
    defaultInputs: {
      farmArea: 45, soilType: 'silt', season: 'rabi', waterAvailability: 'high',
      ph: 7.4, nitrogen: 140, phosphorus: 48, potassium: 50, moisture: 55, temperature: 18,
      rainfall: 650, soc: 0.9, ec: 0.8, topography: 'flat', farmingType: 'conventional', waterSource: 'canal'
    }
  },
  {
    id: 'mh_ind',
    name: 'India (Maharashtra Deccan)',
    region: 'Asia',
    flag: '🇮🇳',
    lat: 19.75,
    lon: 75.71,
    cropCategory: 'Spices',
    primaryCrops: ['Onions', 'Pomegranates', 'Cotton', 'Turmeric'],
    climateZone: 'Semi-Arid Black Cotton Soil',
    defaultInputs: {
      farmArea: 30, soilType: 'black', season: 'kharif', waterAvailability: 'moderate',
      ph: 7.8, nitrogen: 110, phosphorus: 42, potassium: 180, moisture: 45, temperature: 27,
      rainfall: 720, soc: 1.1, ec: 1.0, topography: 'flat', farmingType: 'regenerative', waterSource: 'borewell'
    }
  },
  {
    id: 'shandong_chn',
    name: 'China (Shandong Agri Hub)',
    region: 'Asia',
    flag: '🇨🇳',
    lat: 36.65,
    lon: 117.12,
    cropCategory: 'Vegetables',
    primaryCrops: ['Garlic', 'Ginger', 'Apples', 'Greenhouse Vegetables'],
    climateZone: 'Warm Temperate Monsoon',
    defaultInputs: {
      farmArea: 25, soilType: 'loamy', season: 'year-round', waterAvailability: 'irrigated',
      ph: 7.0, nitrogen: 160, phosphorus: 60, potassium: 170, moisture: 60, temperature: 20,
      rainfall: 680, soc: 1.8, ec: 0.9, topography: 'flat', farmingType: 'conventional', waterSource: 'borewell'
    }
  },
  {
    id: 'hokkaido_jpn',
    name: 'Japan (Hokkaido)',
    region: 'Asia',
    flag: '🇯🇵',
    lat: 43.06,
    lon: 141.35,
    cropCategory: 'Commercial',
    primaryCrops: ['Rice', 'Potatoes', 'Dairy Feed', 'Sugar Beets'],
    climateZone: 'Subarctic Cold Maritime',
    defaultInputs: {
      farmArea: 35, soilType: 'loamy', season: 'rabi', waterAvailability: 'high',
      ph: 6.2, nitrogen: 130, phosphorus: 65, potassium: 120, moisture: 60, temperature: 15,
      rainfall: 1100, soc: 2.8, ec: 0.6, topography: 'rolling', farmingType: 'organic', waterSource: 'river'
    }
  },
  {
    id: 'mekong_vnm',
    name: 'Vietnam (Mekong Delta)',
    region: 'Asia',
    flag: '🇻🇳',
    lat: 10.04,
    lon: 105.78,
    cropCategory: 'Grains',
    primaryCrops: ['Jasmine Rice', 'Dragon Fruit', 'Mangoes', 'Shrimp-Rice'],
    climateZone: 'Tropical Monsoon Delta',
    defaultInputs: {
      farmArea: 20, soilType: 'clay', season: 'year-round', waterAvailability: 'high',
      ph: 5.5, nitrogen: 140, phosphorus: 50, potassium: 110, moisture: 75, temperature: 28,
      rainfall: 1800, soc: 2.4, ec: 1.3, topography: 'flat', farmingType: 'conventional', waterSource: 'river'
    }
  },

  // --- AFRICA ---
  {
    id: 'rift_ken',
    name: 'Kenya (Rift Valley)',
    region: 'Africa',
    flag: '🇰🇪',
    lat: -0.30,
    lon: 36.08,
    cropCategory: 'Commercial',
    primaryCrops: ['Tea', 'Coffee', 'Roses', 'Maize'],
    climateZone: 'Equatorial Highland',
    defaultInputs: {
      farmArea: 40, soilType: 'red', season: 'year-round', waterAvailability: 'moderate',
      ph: 5.8, nitrogen: 140, phosphorus: 55, potassium: 130, moisture: 55, temperature: 21,
      rainfall: 1250, soc: 2.6, ec: 0.4, topography: 'terraced', farmingType: 'organic', waterSource: 'rainwater'
    }
  },
  {
    id: 'nile_egy',
    name: 'Egypt (Nile Delta)',
    region: 'Africa',
    flag: '🇪🇬',
    lat: 30.04,
    lon: 31.23,
    cropCategory: 'Commercial',
    primaryCrops: ['Long Staple Cotton', 'Citrus', 'Wheat', 'Dates'],
    climateZone: 'Arid Alluvial Delta',
    defaultInputs: {
      farmArea: 35, soilType: 'silt', season: 'year-round', waterAvailability: 'irrigated',
      ph: 8.0, nitrogen: 160, phosphorus: 50, potassium: 150, moisture: 60, temperature: 27,
      rainfall: 120, soc: 1.0, ec: 1.6, topography: 'flat', farmingType: 'conventional', waterSource: 'river'
    }
  },
  {
    id: 'cape_zaf',
    name: 'South Africa (Western Cape)',
    region: 'Africa',
    flag: '🇿🇦',
    lat: -33.92,
    lon: 18.42,
    cropCategory: 'Orchard',
    primaryCrops: ['Wine Grapes', 'Apples', 'Rooibos', 'Citrus'],
    climateZone: 'Mediterranean Coastal',
    defaultInputs: {
      farmArea: 85, soilType: 'sandy', season: 'year-round', waterAvailability: 'moderate',
      ph: 6.3, nitrogen: 120, phosphorus: 45, potassium: 160, moisture: 45, temperature: 20,
      rainfall: 600, soc: 1.5, ec: 0.7, topography: 'rolling', farmingType: 'conventional', waterSource: 'borewell'
    }
  },

  // --- MIDDLE EAST ---
  {
    id: 'aljauf_sau',
    name: 'Saudi Arabia (Al-Jauf)',
    region: 'Middle East',
    flag: '🇸🇦',
    lat: 29.96,
    lon: 40.20,
    cropCategory: 'Orchard',
    primaryCrops: ['Olives', 'Dates', 'Wheat Pivot', 'Alfalfa'],
    climateZone: 'Hyper-Arid Circular Pivot Drip',
    defaultInputs: {
      farmArea: 120, soilType: 'sandy', season: 'year-round', waterAvailability: 'irrigated',
      ph: 8.1, nitrogen: 150, phosphorus: 55, potassium: 180, moisture: 35, temperature: 32,
      rainfall: 80, soc: 0.5, ec: 2.1, topography: 'flat', farmingType: 'conventional', waterSource: 'borewell'
    }
  },

  // --- OCEANIA ---
  {
    id: 'murray_aus',
    name: 'Australia (Murray-Darling)',
    region: 'Oceania',
    flag: '🇦🇺',
    lat: -34.00,
    lon: 142.00,
    cropCategory: 'Commercial',
    primaryCrops: ['Cotton', 'Wine Grapes', 'Macadamias', 'Wheat'],
    climateZone: 'Semi-Arid Basin Drip',
    defaultInputs: {
      farmArea: 400, soilType: 'red', season: 'year-round', waterAvailability: 'moderate',
      ph: 7.1, nitrogen: 130, phosphorus: 45, potassium: 150, moisture: 40, temperature: 23,
      rainfall: 450, soc: 1.3, ec: 1.1, topography: 'flat', farmingType: 'conventional', waterSource: 'river'
    }
  },
  {
    id: 'cant_nzl',
    name: 'New Zealand (Canterbury Plains)',
    region: 'Oceania',
    flag: '🇳🇿',
    lat: -43.53,
    lon: 172.63,
    cropCategory: 'Commercial',
    primaryCrops: ['Pasture Dairy', 'Clover Seed', 'Kiwi Fruit', 'Barley'],
    climateZone: 'Temperate Maritime Pasture',
    defaultInputs: {
      farmArea: 200, soilType: 'loamy', season: 'year-round', waterAvailability: 'high',
      ph: 6.2, nitrogen: 140, phosphorus: 60, potassium: 140, moisture: 65, temperature: 16,
      rainfall: 950, soc: 3.5, ec: 0.4, topography: 'flat', farmingType: 'regenerative', waterSource: 'river'
    }
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

function EarthGlobeMesh({
  selectedSpot,
  onSelectSpot,
  onSphereClick
}: {
  selectedSpot: CountrySpot;
  onSelectSpot: (spot: CountrySpot) => void;
  onSphereClick: (lat: number, lon: number) => void;
}) {
  const earthRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.07;
    }
  });

  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 512; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }
    for (let x = 0; x < 1024; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
    for (let i = 0; i < 90; i++) {
      const cx = Math.random() * 1024;
      const cy = Math.random() * 512;
      const rx = 20 + Math.random() * 60;
      const ry = 10 + Math.random() * 30;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, 2 * Math.PI);
      ctx.fill();
    }

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
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.54, 48, 48]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.65, 32, 32]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {COUNTRY_SPOTS.map((spot) => {
        const pos = latLongToVector3(spot.lat, spot.lon, 2.55);
        const isSelected = selectedSpot.id === spot.id;

        return (
          <group key={spot.id} position={pos}>
            <mesh onClick={() => onSelectSpot(spot)}>
              <sphereGeometry args={[isSelected ? 0.08 : 0.05, 16, 16]} />
              <meshBasicMaterial
                color={isSelected ? '#34d399' : '#10b981'}
              />
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

interface EarthGlobe3DProps {
  onSelectCountry: (spot: CountrySpot) => void;
}

export const EarthGlobe3D: React.FC<EarthGlobe3DProps> = ({ onSelectCountry }) => {
  const [selectedSpotId, setSelectedSpotId] = useState<string>('ca_usa');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  const selectedSpot = useMemo(() => {
    return COUNTRY_SPOTS.find((s) => s.id === selectedSpotId) || COUNTRY_SPOTS[0];
  }, [selectedSpotId]);

  const filteredSpots = useMemo(() => {
    return COUNTRY_SPOTS.filter((spot) => {
      const matchesRegion = selectedRegion === 'All' || spot.region === selectedRegion;
      const matchesSearch =
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.cropCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.primaryCrops.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesRegion && matchesSearch;
    });
  }, [searchQuery, selectedRegion]);

  const handleSphereClick = (lat: number, lon: number) => {
    let closest = COUNTRY_SPOTS[0];
    let minDistance = Infinity;

    COUNTRY_SPOTS.forEach((spot) => {
      const dist = Math.hypot(spot.lat - lat, spot.lon - lon);
      if (dist < minDistance) {
        minDistance = dist;
        closest = spot;
      }
    });

    setSelectedSpotId(closest.id);
  };

  const handleConfirm = () => {
    onSelectCountry(selectedSpot);
  };

  const regions = ['All', 'North America', 'South America', 'Europe', 'Asia', 'Africa', 'Middle East', 'Oceania'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '15s' }} />
            Worldwide Interactive Agronomic Globe
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Select Your Precise Agricultural Region
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Choose from <strong className="text-emerald-400">{COUNTRY_SPOTS.length} Global Agricultural Hubs</strong> or click directly on the 3D globe.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
          {regions.map((reg) => (
            <button
              key={reg}
              type="button"
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedRegion === reg
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800/80 rounded-3xl h-[420px] md:h-[480px] relative overflow-hidden shadow-2xl flex items-center justify-center">
          <Canvas camera={{ position: [0, 0, 6.2], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            <pointLight position={[-10, -10, -5]} intensity={0.5} color="#0284c7" />

            <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
              <EarthGlobeMesh
                selectedSpot={selectedSpot}
                onSelectSpot={(spot) => setSelectedSpotId(spot.id)}
                onSphereClick={handleSphereClick}
              />
            </Float>

            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={4.2}
              maxDistance={9.0}
              rotateSpeed={0.6}
            />
          </Canvas>

          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Interactive 3D Orbit: Drag to Rotate & Click Pins</span>
          </div>

          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-mono text-emerald-400">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>{selectedSpot.lat >= 0 ? `${selectedSpot.lat}°N` : `${Math.abs(selectedSpot.lat)}°S`}, {selectedSpot.lon >= 0 ? `${selectedSpot.lon}°E` : `${Math.abs(selectedSpot.lon)}°W`}</span>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-950/80 border border-slate-800 rounded-3xl p-5 md:p-6 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country, crop, or climate zone..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredSpots.map((spot) => {
                const isSel = spot.id === selectedSpot.id;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => setSelectedSpotId(spot.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSel
                        ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base">{spot.flag}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{spot.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{spot.climateZone}</div>
                      </div>
                    </div>
                    {isSel && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <motion.div
              key={selectedSpot.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{selectedSpot.flag}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedSpot.name}</h3>
                    <span className="text-[10px] font-semibold text-emerald-400">{selectedSpot.region}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {selectedSpot.cropCategory} Focus
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Climate Profile</span>
                  <span className="font-semibold text-slate-200 text-[11px]">{selectedSpot.climateZone}</span>
                </div>
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Primary Crops</span>
                  <span className="font-semibold text-emerald-300 text-[11px] truncate block">{selectedSpot.primaryCrops.join(', ')}</span>
                </div>
              </div>
            </motion.div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4 fill-current" />
            <span>Confirm & Initialize Location ({selectedSpot.name})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EarthGlobe3D;
