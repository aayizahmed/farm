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
  name: string;              // District / County name
  state: string;             // State / Province name
  country: string;           // Country name
  countryFlag: string;
  region: string;            // Continent region
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
  // ==================== INDIA (COMPREHENSIVE COVERAGE) ====================
  // --- PUNJAB ---
  {
    id: 'ind_pb_ldh', name: 'Ludhiana District', state: 'Punjab', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 30.90, lon: 75.85, cropCategory: 'Grains', primaryCrops: ['Basmati Rice', 'PBW-1 Wheat', 'Sugarcane', 'Potato'],
    climateZone: 'Subtropical Alluvial Plain', soilType: 'silt', ph: 7.4, nitrogen: 145, phosphorus: 48, potassium: 55, moisture: 58, temperature: 19, rainfall: 680, soc: 0.9, ec: 0.8
  },
  {
    id: 'ind_pb_asr', name: 'Amritsar District', state: 'Punjab', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 31.63, lon: 74.87, cropCategory: 'Grains', primaryCrops: ['Organic Basmati', 'Rabi Wheat', 'Mustard', 'Maize'],
    climateZone: 'Indo-Gangetic Basin', soilType: 'loamy', ph: 7.3, nitrogen: 140, phosphorus: 45, potassium: 50, moisture: 55, temperature: 18, rainfall: 650, soc: 1.0, ec: 0.7
  },
  {
    id: 'ind_pb_jal', name: 'Jalandhar District', state: 'Punjab', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 31.32, lon: 75.57, cropCategory: 'Vegetables', primaryCrops: ['Seed Potato', 'Wheat', 'Paddy', 'Sunflower'],
    climateZone: 'Doaba Alluvial Plain', soilType: 'loamy', ph: 7.2, nitrogen: 150, phosphorus: 50, potassium: 60, moisture: 56, temperature: 19, rainfall: 700, soc: 1.1, ec: 0.7
  },
  {
    id: 'ind_pb_btd', name: 'Bathinda District', state: 'Punjab', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 30.21, lon: 74.94, cropCategory: 'Commercial', primaryCrops: ['Bt Cotton', 'Wheat', 'Guar', 'Kinnow Citrus'],
    climateZone: 'Semi-Arid Malwa Cotton Belt', soilType: 'sandy', ph: 7.9, nitrogen: 120, phosphorus: 40, potassium: 65, moisture: 42, temperature: 22, rainfall: 420, soc: 0.7, ec: 1.1
  },

  // --- HARYANA ---
  {
    id: 'ind_hr_knl', name: 'Karnal District (Rice Basin)', state: 'Haryana', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 29.68, lon: 76.99, cropCategory: 'Grains', primaryCrops: ['Export Basmati Rice', 'High-Yield Wheat', 'Mustard', 'Sugarcane'],
    climateZone: 'Indo-Gangetic Basin', soilType: 'silt', ph: 7.5, nitrogen: 142, phosphorus: 46, potassium: 52, moisture: 58, temperature: 20, rainfall: 710, soc: 0.95, ec: 0.8
  },
  {
    id: 'ind_hr_hsr', name: 'Hisar District', state: 'Haryana', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 29.15, lon: 75.71, cropCategory: 'Commercial', primaryCrops: ['Cotton', 'Pearl Millet (Bajra)', 'Wheat', 'Gram'],
    climateZone: 'Semi-Arid Western Plains', soilType: 'sandy', ph: 7.8, nitrogen: 115, phosphorus: 38, potassium: 70, moisture: 40, temperature: 23, rainfall: 450, soc: 0.65, ec: 1.0
  },

  // --- UTTAR PRADESH ---
  {
    id: 'ind_up_mrt', name: 'Meerut District (Sugar Belt)', state: 'Uttar Pradesh', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 28.98, lon: 77.70, cropCategory: 'Commercial', primaryCrops: ['Sugarcane', 'High-Yield Wheat', 'Mustard', 'Mango'],
    climateZone: 'Upper Doab Alluvial Basin', soilType: 'silt', ph: 7.2, nitrogen: 155, phosphorus: 52, potassium: 60, moisture: 62, temperature: 21, rainfall: 840, soc: 1.1, ec: 0.7
  },
  {
    id: 'ind_up_vns', name: 'Varanasi District', state: 'Uttar Pradesh', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 25.31, lon: 82.97, cropCategory: 'Vegetables', primaryCrops: ['Paddy Rice', 'Vegetables', 'Wheat', 'Pulses'],
    climateZone: 'Middle Ganges Plain', soilType: 'loamy', ph: 7.1, nitrogen: 130, phosphorus: 44, potassium: 55, moisture: 60, temperature: 24, rainfall: 1020, soc: 1.0, ec: 0.6
  },

  // --- MAHARASHTRA ---
  {
    id: 'ind_mh_nsk', name: 'Nashik District (Grape & Onion Hub)', state: 'Maharashtra', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 19.99, lon: 73.78, cropCategory: 'Spices', primaryCrops: ['Export Table Grapes', 'Red Onions', 'Pomegranate', 'Tomatoes'],
    climateZone: 'Deccan Semi-Arid Basin', soilType: 'black', ph: 7.7, nitrogen: 115, phosphorus: 42, potassium: 185, moisture: 45, temperature: 27, rainfall: 710, soc: 1.2, ec: 1.0
  },
  {
    id: 'ind_mh_pne', name: 'Pune District', state: 'Maharashtra', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 18.52, lon: 73.85, cropCategory: 'Vegetables', primaryCrops: ['Sugarcane', 'Floriculture', 'Polyhouse Peppers', 'Ginger'],
    climateZone: 'Western Ghats Subtropical', soilType: 'black', ph: 7.5, nitrogen: 125, phosphorus: 46, potassium: 160, moisture: 50, temperature: 25, rainfall: 780, soc: 1.4, ec: 0.9
  },
  {
    id: 'ind_mh_jlg', name: 'Jalgaon District (Banana Capital)', state: 'Maharashtra', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 21.00, lon: 75.56, cropCategory: 'Orchard', primaryCrops: ['Grand Naine Banana', 'Cotton', 'Maize', 'Jowar'],
    climateZone: 'Khandesh Alluvial Belt', soilType: 'black', ph: 7.6, nitrogen: 140, phosphorus: 48, potassium: 190, moisture: 55, temperature: 29, rainfall: 750, soc: 1.1, ec: 0.8
  },
  {
    id: 'ind_mh_ngp', name: 'Nagpur District (Citrus Hub)', state: 'Maharashtra', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 21.14, lon: 79.08, cropCategory: 'Orchard', primaryCrops: ['Nagpur Mandarin Orange', 'Soybean', 'Cotton', 'Tur (Arhar)'],
    climateZone: 'Vidarbha Subtropical Plateau', soilType: 'black', ph: 7.4, nitrogen: 120, phosphorus: 40, potassium: 145, moisture: 48, temperature: 28, rainfall: 1100, soc: 1.3, ec: 0.6
  },

  // --- KARNATAKA ---
  {
    id: 'ind_ka_mnd', name: 'Mandya District (Cauvery Delta)', state: 'Karnataka', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 12.52, lon: 76.89, cropCategory: 'Commercial', primaryCrops: ['Sugarcane', 'Paddy Rice', 'Coconut', 'Finger Millet (Ragi)'],
    climateZone: 'Tropical River Basin', soilType: 'red', ph: 6.8, nitrogen: 130, phosphorus: 40, potassium: 140, moisture: 60, temperature: 26, rainfall: 850, soc: 1.5, ec: 0.6
  },
  {
    id: 'ind_ka_ckm', name: 'Chikmagalur District (Coffee Estate)', state: 'Karnataka', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 13.31, lon: 75.77, cropCategory: 'Commercial', primaryCrops: ['Arabica Coffee', 'Black Pepper', 'Cardamom', 'Arecanut'],
    climateZone: 'Malnad Highland Rain Forest', soilType: 'red', ph: 5.9, nitrogen: 145, phosphorus: 52, potassium: 155, moisture: 68, temperature: 21, rainfall: 1900, soc: 2.7, ec: 0.3
  },

  // --- GUJARAT ---
  {
    id: 'ind_gj_and', name: 'Anand District (Milk & Tobacco Belt)', state: 'Gujarat', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 22.56, lon: 72.92, cropCategory: 'Commercial', primaryCrops: ['Tobacco', 'Banana', 'Pasture Fodder', 'Castor'],
    climateZone: 'Charotar Alluvial Zone', soilType: 'loamy', ph: 7.6, nitrogen: 135, phosphorus: 50, potassium: 155, moisture: 52, temperature: 28, rainfall: 800, soc: 1.1, ec: 0.9
  },
  {
    id: 'ind_gj_ktc', name: 'Kutch District (Dates & Pomegranate)', state: 'Gujarat', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 23.24, lon: 69.66, cropCategory: 'Orchard', primaryCrops: ['Fresh Dates', 'Bhagwa Pomegranate', 'Castor', 'Cotton'],
    climateZone: 'Arid Coastal Desert', soilType: 'sandy', ph: 8.1, nitrogen: 95, phosphorus: 35, potassium: 160, moisture: 35, temperature: 30, rainfall: 340, soc: 0.5, ec: 2.2
  },

  // --- TAMIL NADU ---
  {
    id: 'ind_tn_tnj', name: 'Thanjavur District (Rice Granary)', state: 'Tamil Nadu', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 10.78, lon: 79.13, cropCategory: 'Grains', primaryCrops: ['Samba Paddy Rice', 'Black Gram', 'Coconut', 'Sugarcane'],
    climateZone: 'Cauvery Coastal Delta', soilType: 'clay', ph: 6.9, nitrogen: 135, phosphorus: 45, potassium: 130, moisture: 65, temperature: 29, rainfall: 1150, soc: 1.4, ec: 0.8
  },
  {
    id: 'ind_tn_cbe', name: 'Coimbatore District', state: 'Tamil Nadu', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 11.01, lon: 76.95, cropCategory: 'Commercial', primaryCrops: ['Cotton', 'Coconut', 'Turmeric', 'Maize'],
    climateZone: 'Kongu Semi-Arid Plateau', soilType: 'red', ph: 7.4, nitrogen: 125, phosphorus: 42, potassium: 150, moisture: 48, temperature: 27, rainfall: 700, soc: 1.2, ec: 0.9
  },

  // --- RAJASTHAN ---
  {
    id: 'ind_rj_sgn', name: 'Sri Ganganagar District (Canal Oasis)', state: 'Rajasthan', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 29.91, lon: 73.87, cropCategory: 'Grains', primaryCrops: ['Wheat', 'American Cotton', 'Kinnow Citrus', 'Mustard'],
    climateZone: 'Indira Gandhi Canal Arid Basin', soilType: 'sandy', ph: 8.0, nitrogen: 120, phosphorus: 42, potassium: 135, moisture: 45, temperature: 26, rainfall: 280, soc: 0.6, ec: 1.3
  },

  // --- KERALA ---
  {
    id: 'ind_kl_wyd', name: 'Wayanad District (Highland Spices)', state: 'Kerala', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 11.68, lon: 76.13, cropCategory: 'Spices', primaryCrops: ['Malabar Black Pepper', 'Robusta Coffee', 'Cardamom', 'Tea'],
    climateZone: 'Western Ghats Humid Highland', soilType: 'red', ph: 5.6, nitrogen: 150, phosphorus: 55, potassium: 160, moisture: 72, temperature: 22, rainfall: 2800, soc: 3.1, ec: 0.3
  },

  // --- WEST BENGAL ---
  {
    id: 'ind_wb_bdn', name: 'Burdwan District (Bengal Rice Hub)', state: 'West Bengal', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 23.23, lon: 87.86, cropCategory: 'Grains', primaryCrops: ['Aman Paddy Rice', 'Boro Rice', 'Jute', 'Potato'],
    climateZone: 'Gangetic Alluvial Delta', soilType: 'clay', ph: 6.4, nitrogen: 140, phosphorus: 48, potassium: 120, moisture: 70, temperature: 27, rainfall: 1500, soc: 1.8, ec: 0.5
  },

  // --- MADHYA PRADESH ---
  {
    id: 'ind_mp_ind', name: 'Indore District (Malwa Soybean Belt)', state: 'Madhya Pradesh', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 22.71, lon: 75.85, cropCategory: 'Commercial', primaryCrops: ['Yellow Soybean', 'Sharbati Wheat', 'Gram (Chickpea)', 'Garlic'],
    climateZone: 'Malwa Subtropical Plateau', soilType: 'black', ph: 7.6, nitrogen: 130, phosphorus: 44, potassium: 150, moisture: 50, temperature: 24, rainfall: 980, soc: 1.5, ec: 0.6
  },

  // --- ANDHRA PRADESH / TELANGANA ---
  {
    id: 'ind_ap_gtr', name: 'Guntur District (Chilli Capital)', state: 'Andhra Pradesh', country: 'India', countryFlag: '🇮🇳', region: 'Asia',
    lat: 16.30, lon: 80.44, cropCategory: 'Spices', primaryCrops: ['Red Chilli', 'Tobacco', 'Cotton', 'Paddy Rice'],
    climateZone: 'Krishna Delta Alluvial Plain', soilType: 'black', ph: 7.7, nitrogen: 145, phosphorus: 50, potassium: 175, moisture: 55, temperature: 30, rainfall: 950, soc: 1.2, ec: 1.1
  },

  // ==================== INTERNATIONAL HUBS ====================
  {
    id: 'usa_ca_fre', name: 'Fresno County', state: 'California', country: 'United States', countryFlag: '🇺🇸', region: 'North America',
    lat: 36.74, lon: -119.78, cropCategory: 'Orchard', primaryCrops: ['Almonds', 'Pistachios', 'Raisin Grapes', 'Tomatoes'],
    climateZone: 'San Joaquin Valley Mediterranean', soilType: 'loamy', ph: 6.8, nitrogen: 165, phosphorus: 58, potassium: 145, moisture: 45, temperature: 24, rainfall: 540, soc: 1.8, ec: 1.2
  },
  {
    id: 'bra_mt_srr', name: 'Sorriso District', state: 'Mato Grosso', country: 'Brazil', countryFlag: '🇧🇷', region: 'South America',
    lat: -12.54, lon: -55.71, cropCategory: 'Commercial', primaryCrops: ['GMO Soybeans', 'Safrinha Maize', 'Cotton', 'Sunflower'],
    climateZone: 'Tropical Savanna Cerrado', soilType: 'red', ph: 5.8, nitrogen: 135, phosphorus: 52, potassium: 125, moisture: 65, temperature: 27, rainfall: 1750, soc: 2.2, ec: 0.4
  },
  {
    id: 'esp_an_alm', name: 'Almería District', state: 'Andalusia', country: 'Spain', countryFlag: '🇪🇸', region: 'Europe',
    lat: 36.83, lon: -2.46, cropCategory: 'Vegetables', primaryCrops: ['Greenhouse Tomatoes', 'Cucumbers', 'Zucchini', 'Melons'],
    climateZone: 'Mediterranean Subtropical Hydro', soilType: 'chalky', ph: 7.7, nitrogen: 175, phosphorus: 65, potassium: 190, moisture: 40, temperature: 22, rainfall: 320, soc: 1.0, ec: 1.8
  },
  {
    id: 'nld_zh_west', name: 'Westland District', state: 'South Holland', country: 'Netherlands', countryFlag: '🇳🇱', region: 'Europe',
    lat: 51.99, lon: 4.20, cropCategory: 'Vegetables', primaryCrops: ['Automated Tomatoes', 'Paprika', 'Cucumbers', 'Orchids'],
    climateZone: 'Maritime Closed Glasshouse', soilType: 'peat', ph: 6.0, nitrogen: 185, phosphorus: 75, potassium: 210, moisture: 75, temperature: 22, rainfall: 860, soc: 3.4, ec: 1.5
  },
  {
    id: 'ken_rv_ker', name: 'Kericho District', state: 'Rift Valley', country: 'Kenya', countryFlag: '🇰🇪', region: 'Africa',
    lat: -0.36, lon: 35.28, cropCategory: 'Commercial', primaryCrops: ['Highland Black Tea', 'Pyrethrum', 'Maize', 'Dairy Feed'],
    climateZone: 'Equatorial Highland Mist', soilType: 'red', ph: 5.6, nitrogen: 145, phosphorus: 58, potassium: 135, moisture: 60, temperature: 20, rainfall: 1350, soc: 2.8, ec: 0.4
  },
  {
    id: 'aus_nsw_riv', name: 'Griffith District', state: 'New South Wales', country: 'Australia', countryFlag: '🇦🇺', region: 'Oceania',
    lat: -34.28, lon: 146.04, cropCategory: 'Commercial', primaryCrops: ['Wine Grapes', 'Citrus', 'Cotton', 'Rice'],
    climateZone: 'Semi-Arid Irrigated Riverina', soilType: 'red', ph: 7.2, nitrogen: 130, phosphorus: 45, potassium: 155, moisture: 42, temperature: 23, rainfall: 430, soc: 1.4, ec: 1.1
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
    bgGrad.addColorStop(0, '#020617');
    bgGrad.addColorStop(0.5, '#0b192c');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
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

    ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
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

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    for (let x = 300; x < 1850; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 150);
      ctx.lineTo(x + 30, 850);
      ctx.stroke();
    }
    ctx.setLineDash([]);

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
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('ind_pb_ldh');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('India');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('All');
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
        farmArea: 50,
        soilType: selectedDistrict.soilType,
        season: 'rabi',
        waterAvailability: 'irrigated',
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
        farmingType: 'conventional',
        waterSource: 'canal'
      }
    };
    onSelectCountry(spot);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '15s' }} />
            Country → State → District Precision Globe
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Pinpoint Your Country, State & Local District
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Browse state and district outlines across <strong className="text-emerald-400">{DISTRICT_SPOTS.length} Agricultural Districts (Featuring All Major Indian States)</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <label className="text-[10px] text-slate-400 block font-semibold mb-1">Country Filter</label>
            <select
              value={selectedCountryFilter}
              onChange={(e) => {
                setSelectedCountryFilter(e.target.value);
                setSelectedStateFilter('All');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:border-emerald-500"
            >
              {uniqueCountries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block font-semibold mb-1">State / Province</label>
            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold focus:border-emerald-500"
            >
              {uniqueStates.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800/80 rounded-3xl h-[420px] md:h-[480px] relative overflow-hidden shadow-2xl flex items-center justify-center">
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

          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Map className="w-4 h-4 text-emerald-400" />
            <span>State Outlines & District Hotspots Active</span>
          </div>

          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-mono text-emerald-400">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>{selectedDistrict.name} ({selectedDistrict.state}, {selectedDistrict.country})</span>
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
                placeholder="Search Indian state, district, or crop..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="max-h-[170px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredDistricts.map((d) => {
                const isSel = d.id === selectedDistrict.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDistrictId(d.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSel
                        ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base">{d.countryFlag}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{d.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{d.state}, {d.country}</div>
                      </div>
                    </div>
                    {isSel && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <motion.div
              key={selectedDistrict.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{selectedDistrict.countryFlag}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedDistrict.name}</h3>
                    <span className="text-[10px] font-semibold text-emerald-400">{selectedDistrict.state}, {selectedDistrict.country}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  {selectedDistrict.cropCategory} Focus
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Climate & Soil</span>
                  <span className="font-semibold text-slate-200 text-[11px]">{selectedDistrict.soilType.toUpperCase()} Soil · {selectedDistrict.climateZone}</span>
                </div>
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Primary District Crops</span>
                  <span className="font-semibold text-emerald-300 text-[11px] truncate block">{selectedDistrict.primaryCrops.join(', ')}</span>
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
            <span>Confirm & Initialize Location ({selectedDistrict.name}, {selectedDistrict.state})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EarthGlobe3D;
