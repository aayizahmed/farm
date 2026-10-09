import { getMultiUnitMatrix, convertToAcres } from './landUnits';
import type { ResearchDossier } from '../types';

import type {
  CropRequirements,
  FarmInputs,
  CropResult,
  ScoreBreakdown,
  AnalysisResult,
  SoilAnalysis,
  NutrientStatus,
  FarmPlanWeek,
  RotationSuggestion,
} from '../types';

import { CROPS } from '../data/crops';

// --- Scoring helpers ---

function rangeScore(value: number, [min, max]: [number, number], buffer = 0.15): number {
  const range = max - min;
  const buffMin = min - range * buffer;
  const buffMax = max + range * buffer;

  if (value >= min && value <= max) return 100;
  if (value >= buffMin && value < min) {
    return 100 * (1 - (min - value) / (range * buffer));
  }
  if (value > max && value <= buffMax) {
    return 100 * (1 - (value - max) / (range * buffer));
  }
  return 0;
}

function soilTypeScore(input: FarmInputs['soilType'], suitable: FarmInputs['soilType'][]): number {
  return suitable.includes(input) ? 100 : 0;
}

function seasonScore(input: FarmInputs['season'], suitable: FarmInputs['season'][]): number {
  return suitable.includes(input) ? 100 : 0;
}

function waterScore(input: FarmInputs['waterAvailability'], needs: FarmInputs['waterAvailability'][]): number {
  return needs.includes(input) ? 100 : 30;
}

// --- Score weights ---
const WEIGHTS = {
  ph: 0.15,
  nitrogen: 0.10,
  phosphorus: 0.08,
  potassium: 0.08,
  moisture: 0.10,
  temperature: 0.15,
  rainfall: 0.10,
  soilType: 0.12,
  season: 0.07,
  water: 0.05,
};

function scoreCrop(crop: CropRequirements, inputs: FarmInputs): { score: number; breakdown: ScoreBreakdown } {
  const breakdown: ScoreBreakdown = {
    ph: rangeScore(inputs.ph, crop.phRange),
    nitrogen: rangeScore(inputs.nitrogen, crop.nitrogenRange),
    phosphorus: rangeScore(inputs.phosphorus, crop.phosphorusRange),
    potassium: rangeScore(inputs.potassium, crop.potassiumRange),
    moisture: rangeScore(inputs.moisture, crop.moistureRange),
    temperature: rangeScore(inputs.temperature, crop.temperatureRange),
    rainfall: rangeScore(inputs.rainfall, crop.rainfallRange),
    soilType: soilTypeScore(inputs.soilType, crop.suitableSoils),
    season: seasonScore(inputs.season, crop.suitableSeasons),
    water: waterScore(inputs.waterAvailability, crop.waterAvailabilityNeeds),
  };

  const score = Object.entries(breakdown).reduce((acc, [key, val]) => {
    return acc + val * WEIGHTS[key as keyof typeof WEIGHTS];
  }, 0);

  return { score: Math.round(score), breakdown };
}

// --- Reason generation ---

function generateReasons(crop: CropRequirements, inputs: FarmInputs, breakdown: ScoreBreakdown): { reasons: string[]; warnings: string[] } {
  const reasons: string[] = [];
  const warnings: string[] = [];

  // pH
  if (breakdown.ph >= 80) {
    reasons.push(`Soil pH (${inputs.ph}) is within the preferred range (${crop.phRange[0]}–${crop.phRange[1]}) for ${crop.name}.`);
  } else if (breakdown.ph < 40) {
    warnings.push(`Soil pH (${inputs.ph}) is outside the optimal range (${crop.phRange[0]}–${crop.phRange[1]}). Consider lime or sulfur amendment.`);
  }

  // Temperature
  if (breakdown.temperature >= 80) {
    reasons.push(`Current temperature (${inputs.temperature}°C) matches ${crop.name}'s optimal growth range.`);
  } else if (breakdown.temperature < 40) {
    warnings.push(`Temperature (${inputs.temperature}°C) may be suboptimal; ${crop.name} prefers ${crop.temperatureRange[0]}–${crop.temperatureRange[1]}°C.`);
  }

  // Nitrogen
  if (breakdown.nitrogen >= 80) {
    reasons.push(`Nitrogen availability (${inputs.nitrogen} kg/ha) aligns well with ${crop.name}'s requirements.`);
  } else if (inputs.nitrogen < crop.nitrogenRange[0]) {
    warnings.push(`Low nitrogen (${inputs.nitrogen} kg/ha) may limit ${crop.name} growth; target ${crop.nitrogenRange[0]}+ kg/ha.`);
  }

  // Potassium
  if (breakdown.potassium >= 80) {
    reasons.push(`Available potassium (${inputs.potassium} kg/ha) is suitable for ${crop.name} cultivation.`);
  } else if (inputs.potassium < crop.potassiumRange[0]) {
    warnings.push(`Potassium levels are below optimal for ${crop.name}. Consider potassic fertilizer application.`);
  }

  // Rainfall
  if (breakdown.rainfall >= 80) {
    reasons.push(`Annual rainfall (${inputs.rainfall} mm) is well-suited for ${crop.name}.`);
  } else if (inputs.rainfall < crop.rainfallRange[0]) {
    warnings.push(`Rainfall may be insufficient; supplement with irrigation for ${crop.name}.`);
  }

  // Soil type
  if (breakdown.soilType === 100) {
    reasons.push(`${inputs.soilType.charAt(0).toUpperCase() + inputs.soilType.slice(1)} soil is ideal for ${crop.name} root development.`);
  } else {
    warnings.push(`${inputs.soilType} soil is not in the optimal list for ${crop.name}; soil amendment or raised beds may help.`);
  }

  // Season
  if (breakdown.season === 100) {
    reasons.push(`The selected ${inputs.season} season aligns with ${crop.name}'s natural growing cycle.`);
  } else {
    warnings.push(`${crop.name} is not typically grown in the ${inputs.season} season; productivity may be reduced.`);
  }

  // Moisture
  if (breakdown.moisture >= 80) {
    reasons.push(`Soil moisture (${inputs.moisture}%) is within optimal range for ${crop.name}.`);
  } else if (inputs.moisture < crop.moistureRange[0]) {
    warnings.push(`Soil moisture is low; increase irrigation frequency to maintain ${crop.moistureRange[0]}–${crop.moistureRange[1]}% for ${crop.name}.`);
  }

  return { reasons, warnings };
}

// --- Soil Analysis ---

function analyzeSoil(inputs: FarmInputs): SoilAnalysis {
  const phValue = inputs.ph;
  let phStatus: SoilAnalysis['phStatus'];
  let phRecommendation: string;

  if (phValue < 4.5) { phStatus = 'very-acidic'; phRecommendation = 'Apply agricultural lime at 2–4 tonnes/ha to raise pH. Very acidic soil limits most crop options.'; }
  else if (phValue < 5.5) { phStatus = 'acidic'; phRecommendation = 'Apply lime to gradually raise pH. Many vegetable crops prefer slightly acidic to neutral soil.'; }
  else if (phValue < 6.5) { phStatus = 'slightly-acidic'; phRecommendation = 'Slightly acidic soil is suitable for most crops. Minor lime addition may improve pH for alkaline-preferring crops.'; }
  else if (phValue <= 7.0) { phStatus = 'neutral'; phRecommendation = 'Neutral pH is ideal for the widest range of crops. Maintain current soil health practices.'; }
  else if (phValue <= 7.5) { phStatus = 'slightly-alkaline'; phRecommendation = 'Slightly alkaline; consider sulfur amendment if targeting acid-loving crops. Most cereals grow well.'; }
  else if (phValue <= 8.0) { phStatus = 'alkaline'; phRecommendation = 'Apply elemental sulfur or organic matter to reduce alkalinity. Limit crop selection to tolerant varieties.'; }
  else { phStatus = 'very-alkaline'; phRecommendation = 'Very high pH limits nutrient availability. Significant soil amendment is recommended before cultivation.'; }

  const nStatus: NutrientStatus = {
    name: 'Nitrogen',
    value: inputs.nitrogen,
    unit: 'kg/ha',
    status: inputs.nitrogen < 50 ? 'low' : inputs.nitrogen > 130 ? 'high' : 'optimal',
    recommendation: inputs.nitrogen < 50
      ? 'Apply urea or ammonium sulfate to boost nitrogen. Consider split application to improve absorption.'
      : inputs.nitrogen > 130
      ? 'High nitrogen may cause excessive vegetative growth. Reduce or suspend N fertilization.'
      : 'Nitrogen levels are within a productive range. Monitor crop response and top-dress as needed.',
  };

  const pStatus: NutrientStatus = {
    name: 'Phosphorus',
    value: inputs.phosphorus,
    unit: 'kg/ha',
    status: inputs.phosphorus < 25 ? 'low' : inputs.phosphorus > 90 ? 'high' : 'optimal',
    recommendation: inputs.phosphorus < 25
      ? 'Apply DAP or SSP to improve phosphorus availability, especially important during early root development.'
      : inputs.phosphorus > 90
      ? 'Excess phosphorus can inhibit zinc and iron uptake. Avoid additional P fertilization.'
      : 'Phosphorus is adequate. Maintain through compost or balanced NPK fertilization.',
  };

  const kStatus: NutrientStatus = {
    name: 'Potassium',
    value: inputs.potassium,
    unit: 'kg/ha',
    status: inputs.potassium < 40 ? 'low' : inputs.potassium > 120 ? 'high' : 'optimal',
    recommendation: inputs.potassium < 40
      ? 'Apply muriate of potash (MOP) or sulfate of potash to improve K levels. Essential for root and fruit quality.'
      : inputs.potassium > 120
      ? 'Very high potassium may interfere with magnesium uptake. Limit potassic applications.'
      : 'Potassium is within productive range. Root and fruiting crops will benefit from current K levels.',
  };

  const mStatus: NutrientStatus = {
    name: 'Moisture',
    value: inputs.moisture,
    unit: '%',
    status: inputs.moisture < 25 ? 'low' : inputs.moisture > 75 ? 'high' : 'optimal',
    recommendation: inputs.moisture < 25
      ? 'Soil moisture is critically low. Increase irrigation and consider mulching to retain moisture.'
      : inputs.moisture > 75
      ? 'Excess moisture may restrict root aeration. Improve drainage or select water-tolerant crops.'
      : 'Moisture levels are conducive to plant growth. Maintain consistent irrigation schedule.',
  };

  const nutrients = [nStatus, pStatus, kStatus, mStatus];

  // Overall soil score
  const phScore = phValue >= 5.5 && phValue <= 7.5 ? 100 : phValue >= 5.0 && phValue <= 8.0 ? 65 : 30;
  const nScore = nStatus.status === 'optimal' ? 100 : 55;
  const pScore = pStatus.status === 'optimal' ? 100 : 55;
  const kScore = kStatus.status === 'optimal' ? 100 : 55;
  const mScore = mStatus.status === 'optimal' ? 100 : 55;

  const overallSoilScore = Math.round(phScore * 0.25 + nScore * 0.2 + pScore * 0.2 + kScore * 0.2 + mScore * 0.15);
  const soilHealthLabel =
    overallSoilScore >= 85 ? 'Excellent' :
    overallSoilScore >= 70 ? 'Good' :
    overallSoilScore >= 55 ? 'Moderate' :
    overallSoilScore >= 40 ? 'Fair' : 'Poor';

  return { phStatus, phRecommendation, nutrients, overallSoilScore, soilHealthLabel };
}

// --- Farm Plan Generator ---

function generateFarmPlan(topCrop: CropRequirements, inputs: FarmInputs): FarmPlanWeek[] {
    const isAcidic = inputs.ph < 6.2;
  const isAlkaline = inputs.ph > 7.6;
  const nDeficit = inputs.nitrogen < 120;
  const pDeficit = inputs.phosphorus < 45;
  const kDeficit = inputs.potassium < 120;

  return [
    {
      week: 'Week 1',
      label: 'Land Clearing & Soil Tillage',
      activity: 'Deep subsoil tillage & root zone aeration',
      details: `Deep-till farm area (${inputs.farmArea} Acres) to 30 cm depth. Remove weeds and crop residue. Prepare laser-leveled seedbeds for optimal drainage.`,
      icon: 'layers',
    },
    {
      week: 'Week 2',
      label: 'pH Correction & Organic Matter',
      activity: 'Basal pH balancing & bio-char compost incorporation',
      details: isAcidic
        ? `Apply Agricultural Lime (CaCO3 @ 2.5 Tons/ha) to raise soil pH from ${inputs.ph} to optimal range.`
        : isAlkaline
        ? `Apply Elemental Sulfur (@ 500 kg/ha) or Gypsum to correct alkaline pH (${inputs.ph}).`
        : `Soil pH (${inputs.ph}) is balanced. Incorporate 5 Tons/ha of well-decomposed organic compost to boost SOC.`,
      icon: 'test-tube',
    },
    {
      week: 'Week 3',
      label: 'Nutrient Basal Application',
      activity: 'Basal NPK fertilizer blend & drip line installation',
      details: `Incorporate basal nutrient dosage: ${pDeficit ? 'DAP @ 60 kg/ha' : 'SSP @ 40 kg/ha'} and ${kDeficit ? 'MOP @ 40 kg/ha' : 'Potassium Nitrate @ 25 kg/ha'}. Lay drip emitter lines at 40 cm spacing.`,
      icon: 'droplets',
    },
    {
      week: 'Week 4',
      label: 'Precision Sowing & Seed Treatment',
      activity: `Sowing / Transplanting ${topCrop.name} seeds`,
      details: `Treat certified ${topCrop.name} seeds with Trichoderma & Rhizobium bio-fungicide. Sow at recommended seed rate into moist seedbed rows.`,
      icon: 'sprout',
    },
    {
      week: 'Week 5 - 6',
      label: 'Germination & Root Establishment',
      activity: 'Light fertigation & weed control',
      details: `Maintain 60% field moisture capacity with short 20-minute daily drip irrigation cycles. Apply pre-emergence organic herbicide.`,
      icon: 'droplets',
    },
    {
      week: 'Week 7 - 8',
      label: 'Vegetative Canopy Growth',
      activity: 'Nitrogen fertigation top-dressing',
      details: `${nDeficit ? 'Top-dress Urea @ 45 kg/ha' : 'Apply balanced NPK 19-19-19 foliar spray'} to accelerate vegetative canopy branching and leaf chlorophyll.`,
      icon: 'activity',
    },
    {
      week: 'Week 9 - 10',
      label: 'Micronutrient & Soil Health Check',
      activity: 'Zinc, Boron & Iron foliar spray',
      details: 'Spray Zinc Sulfate (0.5%) + Boron (0.2%) to prevent micro-deficiencies. Scout field weekly for stem borers or foliar blight.',
      icon: 'shield-alert',
    },
    {
      week: 'Week 11 - 12',
      label: 'Flowering & Grain/Fruit Initiation',
      activity: 'Potassium boost & moisture stress avoidance',
      details: `Inject Potassium Nitrate (13-0-45 @ 25 kg/ha) through drip fertigation. Ensure steady irrigation during pollination to prevent flower drop.`,
      icon: 'sun',
    },
    {
      week: 'Week 13 - 14',
      label: 'Yield Fill & Pest Shield',
      activity: 'Fruit/Grain density optimization',
      details: 'Maintain regulated deficit irrigation (RDI) to maximize sugar/starch accumulation. Deploy yellow sticky traps for pest control.',
      icon: 'check-circle',
    },
    {
      week: 'Week 15 - 16',
      label: 'Harvest Maturity & Post-Harvest Storage',
      activity: `Harvesting ${topCrop.name} & crop rotation prep`,
      details: `Harvest ${topCrop.name} at peak physiological maturity. Transfer yield to moisture-controlled storage. Prepare soil for next rotation crop.`,
      icon: 'check-circle2',
    }
  ];
}

// --- Rotation Generator ---

function generateRotation(topCrop: CropRequirements): RotationSuggestion[] {
  const rotations: Record<string, RotationSuggestion[]> = {
    solanaceae: [
      { season: 1, label: 'Current Season', crop: topCrop.name, reason: 'Primary recommendation based on your soil and climate profile.', group: 'solanaceae' },
      { season: 2, label: 'Next Season', crop: 'Groundnut', reason: 'Legumes fix atmospheric nitrogen, replenishing soil after heavy Solanaceae feeding.', group: 'legume' },
      { season: 3, label: 'Third Season', crop: 'Maize', reason: 'Cereals benefit from the improved nitrogen content left by legumes. Breaks pest cycles.', group: 'cereal' },
    ],
    cereal: [
      { season: 1, label: 'Current Season', crop: topCrop.name, reason: 'Primary recommendation based on your soil and climate profile.', group: 'cereal' },
      { season: 2, label: 'Next Season', crop: 'Groundnut', reason: 'Nitrogen-fixing legume restores soil nutrients depleted by cereal cultivation.', group: 'legume' },
      { season: 3, label: 'Third Season', crop: 'Onion', reason: 'Alliums have different pest profiles, breaking cereal-specific pest and disease cycles.', group: 'allium' },
    ],
    legume: [
      { season: 1, label: 'Current Season', crop: topCrop.name, reason: 'Primary recommendation based on your soil and climate profile.', group: 'legume' },
      { season: 2, label: 'Next Season', crop: 'Maize', reason: 'Benefits from nitrogen enrichment by legumes. High-value output on improved soil.', group: 'cereal' },
      { season: 3, label: 'Third Season', crop: 'Tomato', reason: 'Vegetable crop completes the rotation cycle with diversified income potential.', group: 'solanaceae' },
    ],
    fiber: [
      { season: 1, label: 'Current Season', crop: topCrop.name, reason: 'Primary recommendation based on your soil and climate profile.', group: 'fiber' },
      { season: 2, label: 'Next Season', crop: 'Wheat', reason: 'Cereal crop that adapts to residual potassium from cotton and breaks cotton pest cycles.', group: 'cereal' },
      { season: 3, label: 'Third Season', crop: 'Groundnut', reason: 'Legume restores nitrogen and improves soil structure for the next cotton cycle.', group: 'legume' },
    ],
    grass: [
      { season: 1, label: 'Current Season', crop: topCrop.name, reason: 'Primary recommendation based on your soil and climate profile.', group: 'grass' },
      { season: 2, label: 'Next Season', crop: 'Potato', reason: 'Root crops break the grass pest cycle and make excellent use of residual nutrients.', group: 'root' },
      { season: 3, label: 'Third Season', crop: 'Groundnut', reason: 'Legume enriches soil nitrogen for subsequent crop cycles.', group: 'legume' },
    ],
    allium: [
      { season: 1, label: 'Current Season', crop: topCrop.name, reason: 'Primary recommendation based on your soil and climate profile.', group: 'allium' },
      { season: 2, label: 'Next Season', crop: 'Tomato', reason: 'Alliums suppress certain soilborne pathogens, improving conditions for Solanaceae.', group: 'solanaceae' },
      { season: 3, label: 'Third Season', crop: 'Maize', reason: 'Cereal crop diversifies income and completes the rotation sequence.', group: 'cereal' },
    ],
  };

  return rotations[topCrop.rotationGroup] || rotations['cereal'];
}

// --- Main Analysis Function ---


function buildResearchDossier(inputs: FarmInputs, topCrop: CropRequirements, suitabilityScore: number): ResearchDossier {
  const acres = inputs.farmAreaAcres || convertToAcres(inputs.farmArea, inputs.inputLandUnit || 'acres');
  const landUnitsMatrix = getMultiUnitMatrix(acres);

  const lat = inputs.latitude ?? 36.7783;
  const lon = inputs.longitude ?? -119.4179;
  const gpsFormatted = `${lat >= 0 ? lat.toFixed(4) + '°N' : Math.abs(lat).toFixed(4) + '°S'}, ${lon >= 0 ? lon.toFixed(4) + '°E' : Math.abs(lon).toFixed(4) + '°W'}`;

  const absLat = Math.abs(lat);
  const solarInsolation = Number((5.8 - absLat * 0.04).toFixed(1));

  const slope = inputs.slopeDegree ?? 2.5;
  const aspect = inputs.aspectOrientation || 'flat';
  const slopeRunoffIndex = slope < 3 
    ? `Gentle Slope (${slope}°) - Minimal Erosion & High Moisture Retention`
    : slope < 10 
    ? `Moderate Slope (${slope}°) - Controlled Contour Runoff Layering Required` 
    : `Steep Elevation (${slope}°) - High Erosion Hazard; Terracing & Cover Crops Mandatory`;

  const aspectImpact = aspect === 'south' || aspect === 'south-west' 
    ? 'South / South-West Aspect (+12% Diurnal Solar Radiation Gain)' 
    : aspect === 'north' 
    ? 'North Aspect (-8% Shaded Radiation Cool Micro-Layer)' 
    : 'East / West Aspect (Balanced Diurnal Sun Exposure Curve)';

  const soilDepth = inputs.soilDepthCm ?? 90;
  const rootZoneCapacitanceMm = Math.round(soilDepth * 1.8);

  const waterTable = inputs.waterTableDepthMeters ?? 18;
  const rechargeScore = waterTable < 10 ? 92 : waterTable < 35 ? 78 : 58;

  const microRelief = inputs.microRelief || 'mid-slope';
  const microTerrainSuitability = `${microRelief.toUpperCase().replace('-', ' ')} micro-elevation - Aerated deep root drainage zone.`;

  const yieldPerAcreTons = topCrop.category === 'Orchard' ? 4.5 : topCrop.category === 'Grains' ? 2.8 : 6.0;
  const totalYieldTons = (yieldPerAcreTons * acres).toFixed(1);

  const capExPerAcre = topCrop.category === 'Orchard' ? 3500 : 1800;
  const opExPerAcre = topCrop.category === 'Orchard' ? 1200 : 750;
  const pricePerTon = topCrop.category === 'Orchard' ? 950 : 380;

  const capExTotal = Math.round(capExPerAcre * acres);
  const opExTotal = Math.round(opExPerAcre * acres);
  const grossRev = Math.round(Number(totalYieldTons) * pricePerTon);
  const netProfit = grossRev - opExTotal;
  const roiPct = Math.round((netProfit / Math.max(1, capExTotal)) * 100);
  const paybackYears = Number((capExTotal / Math.max(1, netProfit)).toFixed(1));
  const cbr = Number((grossRev / Math.max(1, opExTotal)).toFixed(2));

  return {
    spatialAnalysis: {
      gpsCoordinatesFormatted: gpsFormatted,
      solarInsolationKwhPerM2: Math.max(3.2, solarInsolation),
      slopeRunoffIndex,
      aspectSunExposureImpact: aspectImpact,
      rootZoneCapacitanceMm,
      groundwaterRechargeScore: rechargeScore,
      microTerrainSuitability,
    },
    landUnitsMatrix,
    agronomicDeepDive: {
      topSuitableCrop: topCrop.name,
      estimatedYieldPerAcre: `${yieldPerAcreTons} Metric Tons / Acre`,
      totalExpectedYield: `${totalYieldTons} Metric Tons`,
      soilNutrientBalanceIndex: Math.round(suitabilityScore * 0.95),
      criticalDeficiencyWarnings: [
        inputs.ph < 6.0 
          ? 'Acidic Soil Layer: Lime application (CaCO3) recommended.' 
          : inputs.ph > 7.8 
          ? 'Alkaline Soil Layer: Elemental Sulfur application recommended.' 
          : 'Optimal Soil pH Balance.',
        (inputs.soc || 1.5) < 1.0 
          ? 'Low Organic Carbon (SOC < 1.0%): Compost & bio-char enrichment needed.' 
          : 'Healthy Soil Organic Carbon Index.',
      ],
      customNutrientRecommendation: [
        `Nitrogen Dosage: ${inputs.nitrogen < 100 ? 'High supplement (+40 kg/ha N)' : 'Maintenance dosage'}`,
        `Phosphorus Balance: ${inputs.phosphorus < 40 ? 'Band-placed DAP (+30 kg/ha P2O5)' : 'Optimal P levels'}`,
        `Potassium Fertigation: MOP / Potassium Nitrate through drip emitters.`,
      ],
    },
    financialFeasibility: {
      currencySymbol: '$',
      estimatedCapExTotal: capExTotal,
      estimatedOpExPerSeason: opExTotal,
      expectedGrossRevenue: grossRev,
      expectedNetProfit: netProfit,
      roiPercent: Math.max(5, roiPct),
      paybackPeriodYears: Math.max(0.5, paybackYears),
      costBenefitRatio: Math.max(1.1, cbr),
    },
    executiveSummaryText: `Executive Agronomic Research confirms a ${suitabilityScore}% commercial compatibility score for ${acres.toFixed(1)} Acres in ${inputs.location}. Root zone capacity (${soilDepth}cm) and groundwater table (${waterTable}m) support high-density ${topCrop.name} production with an expected seasonal net revenue of $${netProfit.toLocaleString()}.`,
    keyActionPlan: [
      'Implement micro-drip fertigation system with solar Moisture Grid.',
      'Deploy pre-planting organic amendments based on micro-location hydro-geology.',
      'Activate 7-day predictive microclimate pest radar forecast.',
    ],
  };
}

export function analyzeField(inputs: FarmInputs): AnalysisResult {
  // Score all crops
  const scoredCrops = CROPS.map((crop) => {
    const { score, breakdown } = scoreCrop(crop, inputs);
    const { reasons, warnings } = generateReasons(crop, inputs, breakdown);
    return { crop, score, breakdown, reasons, warnings };
  });

  // Sort by score descending
  scoredCrops.sort((a, b) => b.score - a.score);

  const cropResults: CropResult[] = scoredCrops.map((c, i) => ({
    ...c,
    rank: i + 1,
  }));

  // Soil analysis
  const soilAnalysis = analyzeSoil(inputs);

  // High-level scores
  const soilScore = soilAnalysis.overallSoilScore;

  const climateScore = Math.round(
    (rangeScore(inputs.temperature, [15, 35]) * 0.5 +
      rangeScore(inputs.rainfall, [400, 2500]) * 0.5)
  );

  const waterScore =
    inputs.waterAvailability === 'irrigated' ? 95 :
    inputs.waterAvailability === 'high' ? 85 :
    inputs.waterAvailability === 'moderate' ? 70 : 50;

  const nutrientScore = Math.round(
    (soilAnalysis.nutrients[0].status === 'optimal' ? 100 : 55) * 0.3 +
    (soilAnalysis.nutrients[1].status === 'optimal' ? 100 : 55) * 0.3 +
    (soilAnalysis.nutrients[2].status === 'optimal' ? 100 : 55) * 0.4
  );

  const farmSuitabilityScore = Math.round(
    soilScore * 0.3 + climateScore * 0.25 + waterScore * 0.2 + nutrientScore * 0.25
  );

  const topCrop = cropResults[0].crop;
  const farmPlan = generateFarmPlan(topCrop, inputs);
  const rotationSuggestions = generateRotation(topCrop);

  const researchDossier = buildResearchDossier(inputs, topCrop, farmSuitabilityScore);

  return {
    farmSuitabilityScore,
    soilScore,
    climateScore,
    waterScore,
    nutrientScore,
    cropResults,
    soilAnalysis,
    farmPlan,
    rotationSuggestions,
    inputs,
    researchDossier,
  };
}

// --- What-If Engine ---

export function simulateWhatIf(
  baseInputs: FarmInputs,
  modifications: Partial<Pick<FarmInputs, 'ph' | 'moisture' | 'nitrogen' | 'phosphorus' | 'potassium'>>
): { baseScores: Record<string, number>; simScores: Record<string, number> } {
  const simInputs = { ...baseInputs, ...modifications };

  const baseResults = analyzeField(baseInputs);
  const simResults = analyzeField(simInputs);

  const baseScores: Record<string, number> = {};
  const simScores: Record<string, number> = {};

  // Take top 5 crops from either result
  const topIds = baseResults.cropResults.slice(0, 5).map((c) => c.crop.id);

  topIds.forEach((id) => {
    const baseCrop = baseResults.cropResults.find((c) => c.crop.id === id);
    const simCrop = simResults.cropResults.find((c) => c.crop.id === id);
    if (baseCrop) baseScores[id] = baseCrop.score;
    if (simCrop) simScores[id] = simCrop.score;
  });

  return { baseScores, simScores };
}
