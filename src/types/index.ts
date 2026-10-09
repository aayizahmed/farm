// Types for the AGROGEN Commercial Agritech application
import type { LandUnit, MultiUnitMatrix } from '../engine/landUnits';

export type { LandUnit, MultiUnitMatrix };

export type SoilType = 'loamy' | 'sandy' | 'clay' | 'silt' | 'peat' | 'chalky' | 'black' | 'red';
export type Season = 'kharif' | 'rabi' | 'zaid' | 'year-round';
export type WaterAvailability = 'low' | 'moderate' | 'high' | 'irrigated';
export type RiskLevel = 'low' | 'medium' | 'high';

export type Topography = 'flat' | 'sloped' | 'terraced' | 'rolling';
export type FarmingType = 'conventional' | 'organic' | 'hydroponic' | 'regenerative';
export type WaterSource = 'borewell' | 'canal' | 'river' | 'rainwater' | 'municipal';

export type AspectOrientation = 'north' | 'south' | 'east' | 'west' | 'south-west' | 'south-east' | 'flat';
export type MicroRelief = 'floodplain' | 'mid-slope' | 'summit-ridge' | 'lowland-depression' | 'terraced-bench';

export interface FarmInputs {
  // Farm Profile & Identification
  farmName?: string;
  location: string;

  // Hyper-Specific Micro-Location & Hydro-Geology
  latitude?: number;
  longitude?: number;
  villageOrDistrict?: string;
  parcelId?: string;
  soilDepthCm?: number;            // Root zone depth (10 - 250 cm)
  waterTableDepthMeters?: number;  // Groundwater depth (1 - 200 m)
  aspectOrientation?: AspectOrientation;
  slopeDegree?: number;            // Slope in degrees (0 - 45°)
  microRelief?: MicroRelief;

  // Land Scale & Unit System
  farmArea: number;                // Raw user input value
  inputLandUnit?: LandUnit;        // Land unit entered (e.g. 'bigha_std', 'hectares', 'acres')
  farmAreaAcres?: number;           // Canonical size in Acres for engine calculations

  soilType: SoilType;
  topography?: Topography;
  farmingType?: FarmingType;
  season: Season;

  // Soil Chemistry & Physics
  ph: number;          // 0–14
  nitrogen: number;    // kg/ha
  phosphorus: number;  // kg/ha
  potassium: number;   // kg/ha
  moisture: number;    // % volumetric
  soc?: number;        // Soil Organic Carbon % (0.1 - 3.5%)
  ec?: number;         // Electrical Conductivity dS/m (0.1 - 4.0)

  // Climate & Micro-environment
  temperature: number;    // °C
  rainfall: number;       // mm/year
  waterAvailability: WaterAvailability;
  waterSource?: WaterSource;
  cropCategory?: string;  // Primary crop focus (Grains, Spices, Orchard, Vegetables, Commercial)
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

export interface SpatialHydroGeologyAnalysis {
  gpsCoordinatesFormatted: string;
  solarInsolationKwhPerM2: number;
  slopeRunoffIndex: string;
  aspectSunExposureImpact: string;
  rootZoneCapacitanceMm: number;
  groundwaterRechargeScore: number;
  microTerrainSuitability: string;
}

export interface FinancialFeasibilityResearch {
  currencySymbol: string;
  estimatedCapExTotal: number;
  estimatedOpExPerSeason: number;
  expectedGrossRevenue: number;
  expectedNetProfit: number;
  roiPercent: number;
  paybackPeriodYears: number;
  costBenefitRatio: number;
}

export interface AgronomicDeepDiveResearch {
  topSuitableCrop: string;
  estimatedYieldPerAcre: string;
  totalExpectedYield: string;
  soilNutrientBalanceIndex: number;
  criticalDeficiencyWarnings: string[];
  customNutrientRecommendation: string[];
}

export interface ResearchDossier {
  spatialAnalysis: SpatialHydroGeologyAnalysis;
  landUnitsMatrix: MultiUnitMatrix;
  agronomicDeepDive: AgronomicDeepDiveResearch;
  financialFeasibility: FinancialFeasibilityResearch;
  executiveSummaryText: string;
  keyActionPlan: string[];
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
  researchDossier: ResearchDossier;
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

export interface DayWeatherForecast {
  day: string;
  date: string;
  tempHigh: number;
  tempLow: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Overcast' | 'Light Rain' | 'Heavy Rain' | 'Thunderstorm';
  precipitationProb: number;
  rainMm: number;
  humidity: number;
  windSpeed: number;
  et0: number;
}

export interface WeatherForecastResult {
  locationName: string;
  currentTemp: number;
  currentCondition: string;
  humidity: number;
  uvIndex: number;
  sevenDayForecast: DayWeatherForecast[];
  totalRainfallPredicted7Days: number;
  heatUnits7Days: number;
  weatherRiskAlert?: string;
  forecastConfidence: string;
}

export interface WaterForecast {
  dailyWaterLiters: number;
  dailyWaterGallons: number;
  weatherAdjustedDailyLiters: number;
  rainCompensationLiters: number;
  weeklyWaterLiters: number;
  seasonalWaterM3: number;
  irrigationFrequency: string;
  recommendedMethod: string;
  waterDeficitStatus: 'Optimal' | 'Mild Deficit' | 'Severe Deficit' | 'Surplus';
  efficiencySavingPct: number;
  pumpingEnergyKwhDaily: number;
}

export interface AmendmentItem {
  name: string;
  type: 'Fertilizer' | 'pH Correction' | 'Organic Amendment' | 'Micronutrient';
  amountKg: number;
  bags50kg: number;
  timing: string;
  purpose: string;
}

export interface PestRiskAdvisory {
  diseaseName: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  triggerReason: string;
  preventiveMeasure: string;
  recommendedDosage: string;
}

export interface ResourceQuantities {
  seedRequirementKg: number;
  seedBags: number;
  estimatedLaborDaysPerSeason: number;
  co2SequestrationPotentialTons: number;
  dailySolarPumpEnergyKwh: number;
}

export interface InputForecast {
  water: WaterForecast;
  amendments: AmendmentItem[];
  pestRisks: PestRiskAdvisory[];
  resources: ResourceQuantities;
  totalFertilizerKg: number;
  weather: WeatherForecastResult;
}

export type AppStep = 'landing' | 'analysis' | 'analyzing' | 'results';
