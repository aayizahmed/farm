// Types for the AGROGEN application

export type SoilType = 'loamy' | 'sandy' | 'clay' | 'silt' | 'peat' | 'chalky';
export type Season = 'kharif' | 'rabi' | 'zaid' | 'year-round';
export type WaterAvailability = 'low' | 'moderate' | 'high' | 'irrigated';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface FarmInputs {
  // Farm Profile
  location: string;
  farmArea: number; // in acres
  soilType: SoilType;
  season: Season;

  // Soil Data
  ph: number;          // 0–14
  nitrogen: number;    // kg/ha
  phosphorus: number;  // kg/ha
  potassium: number;   // kg/ha
  moisture: number;    // %

  // Environment
  temperature: number;    // °C
  rainfall: number;       // mm/year
  waterAvailability: WaterAvailability;
}

export interface CropRequirements {
  id: string;
  name: string;
  icon: string;
  category: string;
  phRange: [number, number];
  nitrogenRange: [number, number];
  phosphorusRange: [number, number];
  potassiumRange: [number, number];
  moistureRange: [number, number];
  temperatureRange: [number, number];
  rainfallRange: [number, number];
  suitableSoils: SoilType[];
  suitableSeasons: Season[];
  waterRequirement: 'low' | 'medium' | 'high';
  waterAvailabilityNeeds: WaterAvailability[];
  growingPeriodDays: [number, number];
  riskLevel: RiskLevel;
  description: string;
  rotationGroup: string;
  nutrients: { N: 'low' | 'medium' | 'high'; P: 'low' | 'medium' | 'high'; K: 'low' | 'medium' | 'high' };
}

export interface ScoreBreakdown {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  moisture: number;
  temperature: number;
  rainfall: number;
  soilType: number;
  season: number;
  water: number;
}

export interface CropResult {
  crop: CropRequirements;
  score: number;
  breakdown: ScoreBreakdown;
  reasons: string[];
  warnings: string[];
  rank: number;
}

export interface NutrientStatus {
  name: string;
  value: number;
  unit: string;
  status: 'low' | 'optimal' | 'high';
  recommendation: string;
}

export interface SoilAnalysis {
  phStatus: 'very-acidic' | 'acidic' | 'slightly-acidic' | 'neutral' | 'slightly-alkaline' | 'alkaline' | 'very-alkaline';
  phRecommendation: string;
  nutrients: NutrientStatus[];
  overallSoilScore: number;
  soilHealthLabel: string;
}

export interface AnalysisResult {
  farmSuitabilityScore: number;
  soilScore: number;
  climateScore: number;
  waterScore: number;
  nutrientScore: number;
  cropResults: CropResult[];
  soilAnalysis: SoilAnalysis;
  farmPlan: FarmPlanWeek[];
  rotationSuggestions: RotationSuggestion[];
  inputs: FarmInputs;
}

export interface FarmPlanWeek {
  week: string;
  label: string;
  activity: string;
  details: string;
  icon: string;
}

export interface RotationSuggestion {
  season: number;
  label: string;
  crop: string;
  reason: string;
  group: string;
}

export type AppStep = 'landing' | 'analysis' | 'analyzing' | 'results';
