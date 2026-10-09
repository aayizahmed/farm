// Types for the AGROGEN Commercial Agritech application

export type SoilType = 'loamy' | 'sandy' | 'clay' | 'silt' | 'peat' | 'chalky' | 'black' | 'red';
export type Season = 'kharif' | 'rabi' | 'zaid' | 'year-round';
export type WaterAvailability = 'low' | 'moderate' | 'high' | 'irrigated';
export type RiskLevel = 'low' | 'medium' | 'high';

export type Topography = 'flat' | 'sloped' | 'terraced' | 'rolling';
export type FarmingType = 'conventional' | 'organic' | 'hydroponic' | 'regenerative';
export type WaterSource = 'borewell' | 'canal' | 'river' | 'rainwater' | 'municipal';

export interface FarmInputs {
  // Farm Profile & Details
  farmName?: string;
  location: string;
  farmArea: number; // in acres
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

export interface DayWeatherForecast {
  day: string;
  date: string;
  tempHigh: number;
  tempLow: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Overcast' | 'Light Rain' | 'Heavy Rain' | 'Thunderstorm';
  precipitationProb: number; // %
  rainMm: number;            // predicted daily rainfall in mm
  humidity: number;          // %
  windSpeed: number;         // km/h
  et0: number;               // mm/day (evapotranspiration)
}

export interface WeatherForecastResult {
  locationName: string;
  currentTemp: number;
  currentCondition: string;
  humidity: number;
  uvIndex: number;
  sevenDayForecast: DayWeatherForecast[];
  totalRainfallPredicted7Days: number; // mm
  heatUnits7Days: number;
  weatherRiskAlert?: string;
  forecastConfidence: string;
}

export interface WaterForecast {
  dailyWaterLiters: number;
  dailyWaterGallons: number;
  weatherAdjustedDailyLiters: number; // liters/day accounting for rain & temp
  rainCompensationLiters: number;    // liters offset by natural rainfall
  weeklyWaterLiters: number;
  seasonalWaterM3: number;
  irrigationFrequency: string;
  recommendedMethod: string;
  waterDeficitStatus: 'Optimal' | 'Mild Deficit' | 'Severe Deficit' | 'Surplus';
  efficiencySavingPct: number;
  pumpingEnergyKwhDaily: number;     // Energy required for irrigation pumps
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
