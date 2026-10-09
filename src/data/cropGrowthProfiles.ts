export type LeafShape = 'broad' | 'blade' | 'compound';
export type ReproductiveType = 'fruit' | 'tuber' | 'grain head' | 'pod' | 'boll' | 'bulb';

export interface CropGrowthProfile {
  id: string;
  name: string;
  totalDays: number;
  maxHeight: number; // in meters (relative units in 3D)
  stemCount: number;
  leafCount: number;
  leafShape: LeafShape;
  leafColor: string;
  rootDepth: number; // in meters (downward)
  reproductive: {
    type: ReproductiveType;
    color: string;
    size: number;
  };
}

export const CROP_PROFILES: CropGrowthProfile[] = [
  {
    id: 'rice',
    name: 'Rice',
    totalDays: 120,
    maxHeight: 1.2,
    stemCount: 4,
    leafCount: 20,
    leafShape: 'blade',
    leafColor: '#4a7c59',
    rootDepth: 0.6,
    reproductive: { type: 'grain head', color: '#d4c06e', size: 0.2 },
  },
  {
    id: 'wheat',
    name: 'Wheat',
    totalDays: 120,
    maxHeight: 1.0,
    stemCount: 3,
    leafCount: 15,
    leafShape: 'blade',
    leafColor: '#5c8a6a',
    rootDepth: 1.0,
    reproductive: { type: 'grain head', color: '#d2b48c', size: 0.25 },
  },
  {
    id: 'tomato',
    name: 'Tomato',
    totalDays: 100,
    maxHeight: 1.5,
    stemCount: 1,
    leafCount: 30,
    leafShape: 'compound',
    leafColor: '#3a5a3a',
    rootDepth: 0.8,
    reproductive: { type: 'fruit', color: '#ef4444', size: 0.15 },
  },
  {
    id: 'potato',
    name: 'Potato',
    totalDays: 90,
    maxHeight: 0.6,
    stemCount: 2,
    leafCount: 24,
    leafShape: 'compound',
    leafColor: '#4d7a4d',
    rootDepth: 0.6, // tubers form in this zone
    reproductive: { type: 'tuber', color: '#c2b280', size: 0.2 },
  },
  {
    id: 'chili',
    name: 'Chili',
    totalDays: 110,
    maxHeight: 0.8,
    stemCount: 1,
    leafCount: 40,
    leafShape: 'broad',
    leafColor: '#2d4a2d',
    rootDepth: 0.7,
    reproductive: { type: 'fruit', color: '#dc2626', size: 0.1 },
  },
  {
    id: 'groundnut',
    name: 'Groundnut',
    totalDays: 105,
    maxHeight: 0.4,
    stemCount: 4,
    leafCount: 35,
    leafShape: 'compound',
    leafColor: '#5b8a5b',
    rootDepth: 0.5, // pods underground
    reproductive: { type: 'pod', color: '#d2b48c', size: 0.08 },
  },
  {
    id: 'maize',
    name: 'Maize',
    totalDays: 110,
    maxHeight: 2.2,
    stemCount: 1,
    leafCount: 14,
    leafShape: 'blade',
    leafColor: '#4a7c59',
    rootDepth: 1.2,
    reproductive: { type: 'fruit', color: '#fcd34d', size: 0.3 },
  },
  {
    id: 'cotton',
    name: 'Cotton',
    totalDays: 150,
    maxHeight: 1.4,
    stemCount: 1,
    leafCount: 30,
    leafShape: 'broad',
    leafColor: '#5c8a6a',
    rootDepth: 1.5,
    reproductive: { type: 'boll', color: '#ffffff', size: 0.15 },
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    totalDays: 300, // simplified for simulation scaling
    maxHeight: 3.0,
    stemCount: 2,
    leafCount: 16,
    leafShape: 'blade',
    leafColor: '#6aab7a',
    rootDepth: 1.0,
    reproductive: { type: 'grain head', color: '#d1d5db', size: 0.1 },
  },
  {
    id: 'onion',
    name: 'Onion',
    totalDays: 120,
    maxHeight: 0.5,
    stemCount: 1, // pseudo-stem
    leafCount: 8,
    leafShape: 'blade', // tubular blades
    leafColor: '#5b8c6a',
    rootDepth: 0.4,
    reproductive: { type: 'bulb', color: '#c08497', size: 0.25 },
  }
];

export function getCropProfile(id: string): CropGrowthProfile {
  return CROP_PROFILES.find(p => p.id === id) || CROP_PROFILES[0];
}

export function getGrowthStage(day: number, totalDays: number): string {
  const p = day / totalDays;
  if (p < 0.1) return 'Germination';
  if (p < 0.3) return 'Seedling';
  if (p < 0.5) return 'Vegetative';
  if (p < 0.7) return 'Flowering';
  if (p < 0.9) return 'Fruiting/Grain-fill';
  return 'Harvest-ready';
}
