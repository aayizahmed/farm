import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sprout, Sun, CloudRain, Droplets, Layers, Activity,
  CheckCircle2, ArrowRight, ArrowLeft, Zap, Globe,
  ShieldAlert, Gauge, MapPin, Sparkles, Sliders,
  Info, BarChart3, AlertTriangle
} from 'lucide-react';
import { LAND_UNITS, convertToAcres, getMultiUnitMatrix } from '../engine/landUnits';
import type { LandUnit } from '../engine/landUnits';
import type {
  FarmInputs, SoilType, Season, WaterAvailability, Topography,
  FarmingType, WaterSource, InputForecast
} from '../types';
import { predictFullFarmInputs } from '../engine/weatherPredictor';
import { EarthGlobe3D } from './EarthGlobe3D';
import type { CountrySpot } from './EarthGlobe3D';

export interface FarmAnalysisFormProps {
  onAnalyze?: (inputs: FarmInputs) => void;
  onSubmit?: (inputs: FarmInputs) => void;
  initialInputs?: Partial<FarmInputs>;
}

interface CommercialPreset {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  inputs: FarmInputs;
}

const COMMERCIAL_PRESETS: CommercialPreset[] = [
  {
    id: 'ca_almond',
    name: 'Central Valley Commercial Almond Orchard',
    subtitle: 'High-density micro-drip almond plantation with solar pumping',
    tag: 'Enterprise Ag',
    inputs: {
      location: 'Central Valley, California, USA',
      farmArea: 150,
      soilType: 'loamy',
      season: 'year-round',
      waterAvailability: 'moderate',
      ph: 6.8,
      nitrogen: 160,
      phosphorus: 55,
      potassium: 140,
      moisture: 45,
      temperature: 24,
      rainfall: 550,
      soc: 1.8,
      ec: 1.2,
      topography: 'flat',
      farmingType: 'conventional',
      waterSource: 'borewell',
      cropCategory: 'Orchard'
    }
  },
  {
    id: 'punjab_wheat',
    name: 'Indo-Gangetic Precision Wheat Farm',
    subtitle: 'Canal & borewell irrigated high-yield cereal crop estate',
    tag: 'High Yield',
    inputs: {
      location: 'Punjab, India',
      farmArea: 45,
      soilType: 'silt',
      season: 'rabi',
      waterAvailability: 'high',
      ph: 7.4,
      nitrogen: 140,
      phosphorus: 48,
      potassium: 50,
      moisture: 55,
      temperature: 18,
      rainfall: 650,
      soc: 0.9,
      ec: 0.8,
      topography: 'flat',
      farmingType: 'conventional',
      waterSource: 'canal',
      cropCategory: 'Grains'
    }
  },
  {
    id: 'dutch_greenhouse',
    name: 'Westland Hi-Tech Bell Pepper Greenhouse',
    subtitle: 'Climate-controlled hydroponic automated facility',
    tag: 'Greenhouse Tech',
    inputs: {
      location: 'Westland, Netherlands',
      farmArea: 12,
      soilType: 'peat',
      season: 'year-round',
      waterAvailability: 'high',
      ph: 6.0,
      nitrogen: 180,
      phosphorus: 70,
      potassium: 200,
      moisture: 75,
      temperature: 22,
      rainfall: 850,
      soc: 3.5,
      ec: 2.1,
      topography: 'flat',
      farmingType: 'hydroponic',
      waterSource: 'rainwater',
      cropCategory: 'Vegetables'
    }
  },
  {
    id: 'kenya_maize',
    name: 'Rift Valley Semi-Arid Maize Estate',
    subtitle: 'Climate-resilient rainfed hybrid maize farm',
    tag: 'Semi-Arid',
    inputs: {
      location: 'Nakuru, Rift Valley, Kenya',
      farmArea: 80,
      soilType: 'sandy',
      season: 'kharif',
      waterAvailability: 'low',
      ph: 5.8,
      nitrogen: 90,
      phosphorus: 35,
      potassium: 40,
      moisture: 30,
      temperature: 27,
      rainfall: 420,
      soc: 0.7,
      ec: 0.4,
      topography: 'rolling',
      farmingType: 'conventional',
      waterSource: 'borewell',
      cropCategory: 'Grains'
    }
  },
  {
    id: 'spain_olive',
    name: 'Andalusia Super-Intensive Olive Grove',
    subtitle: 'Terraced precision fertigation Mediterranean plantation',
    tag: 'Export Quality',
    inputs: {
      location: 'Andalusia, Spain',
      farmArea: 60,
      soilType: 'chalky',
      season: 'year-round',
      waterAvailability: 'moderate',
      ph: 7.9,
      nitrogen: 110,
      phosphorus: 40,
      potassium: 90,
      moisture: 35,
      temperature: 25,
      rainfall: 480,
      soc: 1.2,
      ec: 1.5,
      topography: 'terraced',
      farmingType: 'conventional',
      waterSource: 'borewell',
      cropCategory: 'Orchard'
    }
  }
];

const SOIL_TYPES: { id: SoilType; label: string; desc: string; ret: string }[] = [
  { id: 'loamy', label: 'Rich Loam', desc: 'Balanced sand, silt & clay. High nutrient retention.', ret: 'High (85%)' },
  { id: 'clay', label: 'Heavy Clay', desc: 'Dense mineral soil with maximum water holding capacity.', ret: 'Very High (95%)' },
  { id: 'sandy', label: 'Sandy Soil', desc: 'Free-draining porous soil requiring frequent irrigation.', ret: 'Low (40%)' },
  { id: 'silt', label: 'Silty Soil', desc: 'Smooth fertile deposit ideal for grains & cereals.', ret: 'Medium-High (75%)' },
  { id: 'peat', label: 'Peat / Organic', desc: 'High organic carbon matter with high acidity retention.', ret: 'High (90%)' },
  { id: 'chalky', label: 'Chalky / Alkaline', desc: 'Free-draining alkaline soil over chalk or limestone.', ret: 'Medium (60%)' }
];

const CROP_CATEGORIES = ['Grains', 'Orchard', 'Vegetables', 'Spices', 'Commercial'];

const SEASONS: { id: Season; label: string; months: string }[] = [
  { id: 'kharif', label: 'Kharif (Monsoon / Summer)', months: 'June - October' },
  { id: 'rabi', label: 'Rabi (Winter / Dry Season)', months: 'November - April' },
  { id: 'zaid', label: 'Zaid (Summer Short Season)', months: 'March - June' },
  { id: 'year-round', label: 'Year-Round / Perennial', months: '365 Days Continuous' }
];

const WATER_AVAILABILITY: { id: WaterAvailability; label: string; color: string }[] = [
  { id: 'low', label: 'Scarce (< 400mm/yr)', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  { id: 'moderate', label: 'Moderate (400-900mm/yr)', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  { id: 'high', label: 'Abundant (> 900mm/yr)', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
  { id: 'irrigated', label: 'Fully Irrigated Automation', color: 'text-teal-400 border-teal-500/40 bg-teal-500/10' }
];

const TOPOGRAPHY_OPTIONS: { id: Topography; label: string }[] = [
  { id: 'flat', label: 'Flat Plains (< 2% slope)' },
  { id: 'rolling', label: 'Gentle Rolling Hills (2-8%)' },
  { id: 'sloped', label: 'Sloped Contour (8-15%)' },
  { id: 'terraced', label: 'Terraced Mountain Steps' }
];

const FARMING_TYPES: { id: FarmingType; label: string; desc: string }[] = [
  { id: 'conventional', label: 'Open Field / Conventional', desc: 'Traditional & mechanised outdoor cultivation' },
  { id: 'organic', label: 'Certified Organic', desc: 'Natural compost & non-chemical pest management' },
  { id: 'hydroponic', label: 'Hydroponic / Protected', desc: 'Enclosed microclimate recirculating nutrient system' },
  { id: 'regenerative', label: 'Regenerative Agriculture', desc: 'Minimum tillage & carbon sequestration focus' }
];

const WATER_SOURCES: { id: WaterSource; label: string }[] = [
  { id: 'borewell', label: 'Groundwater Borewell' },
  { id: 'canal', label: 'Irrigation Canal System' },
  { id: 'rainwater', label: 'Rainwater Harvesting Reservoir' },
  { id: 'river', label: 'River / Surface Intake' },
  { id: 'municipal', label: 'Utility / Municipal Water' }
];

﻿export const FarmAnalysisForm: React.FC<FarmAnalysisFormProps> = ({ onAnalyze, onSubmit, initialInputs }) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  


  const [inputs, setInputs] = useState<FarmInputs>({
    latitude: initialInputs?.latitude ?? 36.7783,
    longitude: initialInputs?.longitude ?? -119.4179,
    villageOrDistrict: initialInputs?.villageOrDistrict || '',
    parcelId: initialInputs?.parcelId || 'Plot #A-101',
    soilDepthCm: initialInputs?.soilDepthCm || 90,
    waterTableDepthMeters: initialInputs?.waterTableDepthMeters || 18,
    aspectOrientation: initialInputs?.aspectOrientation || 'south-west',
    slopeDegree: initialInputs?.slopeDegree || 2.5,
    microRelief: initialInputs?.microRelief || 'mid-slope',
    inputLandUnit: initialInputs?.inputLandUnit || 'acres',
    farmAreaAcres: initialInputs?.farmAreaAcres || 150,
    location: initialInputs?.location || 'Central Valley, California, USA',
    farmArea: initialInputs?.farmArea || 50,
    soilType: initialInputs?.soilType || 'loamy',
    season: initialInputs?.season || 'year-round',
    waterAvailability: initialInputs?.waterAvailability || 'moderate',
    ph: initialInputs?.ph ?? 6.8,
    nitrogen: initialInputs?.nitrogen ?? 120,
    phosphorus: initialInputs?.phosphorus ?? 45,
    potassium: initialInputs?.potassium ?? 60,
    moisture: initialInputs?.moisture ?? 40,
    temperature: initialInputs?.temperature ?? 24,
    rainfall: initialInputs?.rainfall ?? 650,
    soc: initialInputs?.soc ?? 1.5,
    ec: initialInputs?.ec ?? 1.0,
    topography: initialInputs?.topography || 'flat',
    farmingType: initialInputs?.farmingType || 'conventional',
    waterSource: initialInputs?.waterSource || 'borewell',
    cropCategory: initialInputs?.cropCategory || 'Orchard'
  });

  // Validation checks: ensure analysis only runs after ALL details are filled by user
  const isStep1Valid = Boolean(inputs.location && (inputs.farmArea > 0) && inputs.cropCategory);
  const isStep2Valid = Boolean(inputs.soilType && inputs.season && inputs.ph >= 3.0 && inputs.ph <= 10.5 && inputs.nitrogen > 0 && inputs.phosphorus > 0 && inputs.potassium > 0);
  const isStep3Valid = Boolean(inputs.waterAvailability && inputs.waterSource && inputs.topography && inputs.farmingType);
  const isFormFullyComplete = isStep1Valid && isStep2Valid && isStep3Valid;

  const [validationError, setValidationError] = useState<string | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleNextStep = () => {
    setValidationError(null);
    if (activeStep === 0) {
      setActiveStep(1);
      scrollToTop();
      return;
    }
    if (activeStep === 1) {
      if (!isStep1Valid) {
        setValidationError("Step 1 Incomplete: Please specify farm location, land area, and crop category.");
        return;
      }
      setActiveStep(2);
      scrollToTop();
      return;
    }
    if (activeStep === 2) {
      if (!isStep2Valid) {
        setValidationError("Step 2 Incomplete: Please configure soil type, NPK nutrient values, and pH balance.");
        return;
      }
      setActiveStep(3);
      scrollToTop();
      return;
    }
    if (activeStep === 3) {
      if (!isStep3Valid) {
        setValidationError("Step 3 Incomplete: Please select water source, irrigation model, and land topography.");
        return;
      }
      setActiveStep(4);
      scrollToTop();
      return;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeStep < 4) {
        handleNextStep();
      } else {
        handleSubmit(e as any);
      }
    }
  };


  const inputForecast: InputForecast = useMemo(() => {
    return predictFullFarmInputs(inputs);
  }, [inputs]);

  const handleInputChange = <K extends keyof FarmInputs>(key: K, value: FarmInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: CommercialPreset) => {
    setInputs(preset.inputs);
  };

  const handleGlobeSelect = (spot: CountrySpot) => {
    setInputs(prev => ({
      ...prev,
      ...spot.defaultInputs,
      cropCategory: spot.cropCategory
    }));
    setActiveStep(1); // Proceed smoothly to Step 1
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAnalyze) onAnalyze(inputs);
    if (onSubmit) onSubmit(inputs);
  };

  const { weather, water, amendments, pestRisks, resources } = inputForecast;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner / Title */}
      <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/20 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Commercial Agri-SaaS Platform • Enterprise Engine
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Commercial Farm Profiler & <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Weather Intelligence</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Configure your commercial agricultural operations with precision agronomics, live 7-day micro-climate weather forecasts, natural rainfall water offset credits, and multi-variable resource budgeting.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 text-sm cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Run Full Agro Analysis</span>
            </button>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Load Commercial Enterprise Presets:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {COMMERCIAL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  inputs.location === preset.inputs.location
                    ? 'bg-emerald-500/15 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {preset.tag}
                  </span>
                  {inputs.location === preset.inputs.location && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="text-xs font-bold text-white truncate">{preset.name}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{preset.inputs.cropCategory} • {preset.inputs.farmArea} Acres</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        {[
          { num: 0, title: '3D Earth Selector', icon: Globe, highlight: true },
          { num: 1, title: 'Land & Scale', icon: MapPin },
          { num: 2, title: 'Soil & Crop Agronomy', icon: Sprout },
          { num: 3, title: 'Irrigation & Utilities', icon: Droplets },
          { num: 4, title: '7-Day Weather Forecast', icon: Sun }
        ].map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.num;
          return (
            <button
              key={step.num}
              type="button"
              onClick={() => setActiveStep(step.num)}
              className={`flex-1 min-w-[150px] py-3 px-3 rounded-xl font-medium text-xs md:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : step.highlight
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
              <span>Step {step.num}: {step.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">

        {/* VALIDATION ERROR ALERT BANNER */}
        {validationError && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 flex items-center justify-between text-xs font-semibold shadow-lg">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{validationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-100 text-[10px] font-bold"
            >
              Dismiss
            </button>
          </div>
        )}
        <AnimatePresence mode="wait">
          {/* STEP 0: 3D EARTH GLOBE SELECTOR */}
          {activeStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 md:p-6 backdrop-blur-xl shadow-2xl space-y-6 text-white"
            >
              <EarthGlobe3D onSelectCountry={handleGlobeSelect} />

              <div className="flex justify-end pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center gap-2 text-sm cursor-pointer"
                >
                  <span>Proceed to Land Parameters</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

﻿        {/* Steps 1 to 4 Content Grid */}
        {activeStep > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <AnimatePresence mode="wait">
                                                {/* STEP 1: LAND & LOCATION */}
                {activeStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur-xl shadow-2xl text-white"
                  >
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Geographical Location & Farm Scale</h2>
                        <p className="text-xs text-slate-400">Specify farm location, land area scale, and target crop focus.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Clean Single Location Input */}
                      <div className="sm:col-span-2 space-y-2">
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Farm Location / Region Selected
                        </label>
                        <div className="relative">
                          <MapPin className="w-5 h-5 absolute left-3.5 top-3.5 text-emerald-400" />
                          <input
                            type="text"
                            value={inputs.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            placeholder="Selected via 3D Globe or customized manually..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-medium"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400">Chosen via Step 0 (3D Globe) or entered manually.</span>
                      </div>

                      {/* LAND SIZE INPUT & MULTI-UNIT SYSTEM */}
                      <div className="sm:col-span-2 space-y-4 bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950/20 border border-emerald-500/30 p-5 rounded-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            Land Scale & Multi-Unit Area Converter
                          </label>
                          <span className="text-[11px] text-slate-400">
                            Canonical Area: <strong className="text-emerald-300 font-mono">{(inputs.farmAreaAcres || convertToAcres(inputs.farmArea, inputs.inputLandUnit || 'acres')).toFixed(2)} Acres</strong>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Enter Land Size Value</label>
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={inputs.farmArea}
                              onChange={(e) => {
                                const val = Math.max(0.1, Number(e.target.value));
                                const currentUnit = inputs.inputLandUnit || 'acres';
                                handleInputChange('farmArea', val);
                                handleInputChange('farmAreaAcres', convertToAcres(val, currentUnit));
                              }}
                              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-base font-bold focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Select Land Unit Measurement</label>
                            <select
                              value={inputs.inputLandUnit || 'acres'}
                              onChange={(e) => {
                                const newUnit = e.target.value as LandUnit;
                                handleInputChange('inputLandUnit', newUnit);
                                handleInputChange('farmAreaAcres', convertToAcres(inputs.farmArea, newUnit));
                              }}
                              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:border-emerald-500"
                            >
                              {LAND_UNITS.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                  {unit.label} ({unit.region})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* LIVE MULTI-UNIT CONVERSION MATRIX */}
                        {(() => {
                          const acres = inputs.farmAreaAcres || convertToAcres(inputs.farmArea, inputs.inputLandUnit || 'acres');
                          const matrix = getMultiUnitMatrix(acres);
                          return (
                            <div className="pt-3 border-t border-slate-800/80">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                                Instant Land Conversion Breakdown
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                                  <div className="text-[10px] text-slate-400">Acres</div>
                                  <div className="text-xs font-bold text-emerald-300 font-mono">{matrix.acres} ac</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                                  <div className="text-[10px] text-slate-400">Hectares</div>
                                  <div className="text-xs font-bold text-white font-mono">{matrix.hectares} ha</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                                  <div className="text-[10px] text-slate-400">Sq Meters</div>
                                  <div className="text-xs font-bold text-white font-mono">{matrix.sqMeters.toLocaleString()} m²</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                                  <div className="text-[10px] text-slate-400">Sq Feet</div>
                                  <div className="text-xs font-bold text-white font-mono">{matrix.sqFeet.toLocaleString()} ft²</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                                  <div className="text-[10px] text-slate-400">Std Bigha</div>
                                  <div className="text-xs font-bold text-cyan-300 font-mono">{matrix.bighaStandard}</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                                  <div className="text-[10px] text-slate-400">Guntha</div>
                                  <div className="text-xs font-bold text-yellow-300 font-mono">{matrix.guntha}</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                                  <div className="text-[10px] text-slate-400">Cents</div>
                                  <div className="text-xs font-bold text-teal-300 font-mono">{matrix.cents}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Crop Focus */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Target Crop Category Focus
                        </label>
                        <select
                          value={inputs.cropCategory || 'Orchard'}
                          onChange={(e) => handleInputChange('cropCategory', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500"
                        >
                          {CROP_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Aspect Orientation */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Sun Exposure Aspect Direction
                        </label>
                        <select
                          value={inputs.aspectOrientation || 'south-west'}
                          onChange={(e) => handleInputChange('aspectOrientation', e.target.value as any)}
                          className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500"
                        >
                          <option value="south-west">South-West (+12% Solar Radiation Gain)</option>
                          <option value="south">South Facing (Maximum Solar Thermal)</option>
                          <option value="east">East Facing (Morning Sun Exposure)</option>
                          <option value="west">West Facing (Late Afternoon Sun)</option>
                          <option value="north">North Facing (Shaded Cool Layer)</option>
                          <option value="flat">Flat Horizontal (Neutral Aspect)</option>
                        </select>
                      </div>

                      {/* Topography & Slope */}
                      <div className="sm:col-span-2 space-y-3">
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Land Topography & Elevation Slope ({inputs.slopeDegree || 2.5}°)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {TOPOGRAPHY_OPTIONS.map((topo) => (
                            <button
                              key={topo.id}
                              type="button"
                              onClick={() => handleInputChange('topography', topo.id)}
                              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                                inputs.topography === topo.id
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <div className="text-xs">{topo.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Farming Type */}
                      <div className="sm:col-span-2 space-y-3">
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Operational Farming Model
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {FARMING_TYPES.map((ft) => (
                            <button
                              key={ft.id}
                              type="button"
                              onClick={() => handleInputChange('farmingType', ft.id)}
                              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                inputs.farmingType === ft.id
                                  ? 'bg-emerald-500/20 border-emerald-500 text-white'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <div className="text-xs font-bold text-white mb-1">{ft.label}</div>
                              <div className="text-[11px] text-slate-400">{ft.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setActiveStep(0)}
                        className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>3D Globe</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <span>Proceed to Agronomy</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: SOIL & CROP AGRONOMY */}
                {activeStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur-xl shadow-2xl text-white"
                  >
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <Sprout className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Soil Chemistry & Agronomic Specifications</h2>
                        <p className="text-xs text-slate-400">Configure NPK nutrients, soil organic carbon (SOC), salinity EC, and pH balance.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Season */}
                      <div className="sm:col-span-2 space-y-2">
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Cultivation Cycle / Season
                        </label>
                        <select
                          value={inputs.season}
                          onChange={(e) => handleInputChange('season', e.target.value as Season)}
                          className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        >
                          {SEASONS.map((s) => (
                            <option key={s.id} value={s.id}>{s.label} ({s.months})</option>
                          ))}
                        </select>
                      </div>

                      {/* Soil Type Selection */}
                      <div className="sm:col-span-2 space-y-3">
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Soil Physical Texture & Drainage Class
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {SOIL_TYPES.map((st) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => handleInputChange('soilType', st.id)}
                              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                inputs.soilType === st.id
                                  ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-white">{st.label}</span>
                                <span className="text-[10px] text-emerald-400 font-mono">{st.ret}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-snug">{st.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Soil Organic Carbon (SOC) Slider */}
                      <div className="space-y-3 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            Soil Organic Carbon (SOC)
                          </label>
                          <span className="text-xs font-bold font-mono text-emerald-400">{(inputs.soc || 1.5).toFixed(1)} %</span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="4.5"
                          step="0.1"
                          value={inputs.soc || 1.5}
                          onChange={(e) => handleInputChange('soc', parseFloat(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>Low (&lt; 0.5%)</span>
                          <span>Optimal (1.5 - 2.5%)</span>
                          <span>High (&gt; 3.0%)</span>
                        </div>
                      </div>

                      {/* Electrical Conductivity (EC) Salinity */}
                      <div className="space-y-3 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            Salinity EC Index
                          </label>
                          <span className="text-xs font-bold font-mono text-cyan-400">{(inputs.ec || 1.0).toFixed(1)} dS/m</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="5.0"
                          step="0.1"
                          value={inputs.ec || 1.0}
                          onChange={(e) => handleInputChange('ec', parseFloat(e.target.value))}
                          className="w-full accent-cyan-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>Non-Saline (&lt; 1.0)</span>
                          <span>Moderate (2.0)</span>
                          <span>High Salinity (&gt; 3.5)</span>
                        </div>
                      </div>

                      {/* Soil pH Level */}
                      <div className="sm:col-span-2 space-y-3 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                            Soil pH Balance
                          </label>
                          <span className="text-xs font-bold font-mono text-teal-300">pH {(inputs.ph || 6.8).toFixed(1)}</span>
                        </div>
                        <input
                          type="range"
                          min="4.5"
                          max="9.0"
                          step="0.1"
                          value={inputs.ph || 6.8}
                          onChange={(e) => handleInputChange('ph', parseFloat(e.target.value))}
                          className="w-full accent-teal-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>Acidic (pH &lt; 6.0)</span>
                          <span>Optimal Neutral (6.5 - 7.2)</span>
                          <span>Alkaline (pH &gt; 7.8)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setActiveStep(1)}
                        className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <span>Proceed to Irrigation</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: IRRIGATION & UTILITIES */}
                {activeStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur-xl shadow-2xl text-white"
                  >
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                      <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                        <Droplets className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Irrigation Systems & Hydraulic Utilities</h2>
                        <p className="text-xs text-slate-400">Define primary water sources, baseline availability index, and infrastructure.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Water Availability Index */}
                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Regional Baseline Water Availability
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {WATER_AVAILABILITY.map((wa) => (
                            <button
                              key={wa.id}
                              type="button"
                              onClick={() => handleInputChange('waterAvailability', wa.id)}
                              className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                                inputs.waterAvailability === wa.id
                                  ? `${wa.color} font-bold shadow-md`
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <div className="text-xs">{wa.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Water Source */}
                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          Primary Water Supply Infrastructure
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {WATER_SOURCES.map((ws) => (
                            <button
                              key={ws.id}
                              type="button"
                              onClick={() => handleInputChange('waterSource', ws.id)}
                              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                inputs.waterSource === ws.id
                                  ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <div className="text-xs">{ws.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dynamic Water Requirements Info Box */}
                      <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3 text-cyan-200 text-xs">
                        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">Evapotranspiration (ET₀) & Weather Compensation</p>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            In Step 4, our micro-climate weather model will calculate the exact daily evapotranspiration rate for your specified location ({inputs.location}) and automatically credit natural rainfall absorbed into the root zone.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:from-emerald-400 hover:to-cyan-400 transition-all flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <span>View Weather & Forecast Quantities</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
﻿            {/* STEP 4: 7-DAY WEATHER & QUANTITY VARYING CALCULATOR */}
            {activeStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 backdrop-blur-xl shadow-2xl text-white"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                      <Sun className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">7-Day Weather Radar & Resource Requirements</h2>
                      <p className="text-xs text-slate-400">Micro-climate irrigation calculations and dynamic agricultural inputs.</p>
                    </div>
                  </div>
                  <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    <span>Live Simulation Ready</span>
                  </div>
                </div>

                {/* 7-DAY WEATHER RADAR CARDS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <CloudRain className="w-4 h-4 text-cyan-400" />
                      7-Day Microclimate Weather Outlook ({weather.locationName})
                    </h3>
                    <span className="text-[11px] text-slate-400">Current Temp: <strong className="text-white">{weather.currentTemp}°C</strong></span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {weather.sevenDayForecast.map((day, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          day.rainMm > 5
                            ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-slate-400 mb-1">{day.day}</div>
                        <div className="text-lg font-extrabold text-white">{day.tempHigh}°C</div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-center gap-1">
                          <Droplets className="w-3 h-3 text-cyan-400" />
                          <span>{day.humidity}%</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-semibold text-emerald-400">
                          {day.rainMm > 0 ? `${day.rainMm} mm Rain` : 'Clear Sky'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WATER REQUIRED STATS CARD */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/50 border border-cyan-500/30 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <Droplets className="w-4 h-4" />
                        Irrigation Water Demand Engine
                      </span>
                      <h4 className="text-lg font-bold text-white mt-1">Weather-Adjusted Water Requirement</h4>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                      Rainfall Offset Savings: <strong>{water.efficiencySavingPct}% Offset</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">Standard Daily Requirement</div>
                      <div className="text-xl font-bold text-slate-300 mt-1">
                        {(water.dailyWaterLiters / 1000).toFixed(1)} <span className="text-xs">m³/day</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        {water.dailyWaterLiters.toLocaleString()} Liters
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40">
                      <div className="text-[11px] text-cyan-300 uppercase font-semibold flex items-center gap-1">
                        <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                        Natural Rainfall Credit
                      </div>
                      <div className="text-xl font-bold text-cyan-300 mt-1">
                        -{(water.rainCompensationLiters / 1000).toFixed(1)} <span className="text-xs">m³/day</span>
                      </div>
                      <div className="text-[10px] text-cyan-400/80 mt-1 font-mono">
                        Saved by Absorbed Rainfall
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50">
                      <div className="text-[11px] text-emerald-300 uppercase font-semibold">Net Daily Water to Supply</div>
                      <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                        {(water.weatherAdjustedDailyLiters / 1000).toFixed(1)} <span className="text-xs">m³/day</span>
                      </div>
                      <div className="text-[10px] text-emerald-300/80 mt-1 font-mono">
                        Weekly Total: {(water.weeklyWaterLiters / 1000).toLocaleString()} m³
                      </div>
                    </div>
                  </div>
                </div>

                {/* VARYING OTHER AGRICULTURAL QUANTITIES TABLE */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Varying Agricultural Quantities & Resource Predictions
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Amendments / Fertilizers */}
                    {amendments.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-slate-400 text-xs">
                          <span className="font-semibold flex items-center gap-1.5">
                            <Sprout className="w-4 h-4 text-emerald-400" />
                            {item.name}
                          </span>
                        </div>
                        <div className="text-2xl font-extrabold text-white">
                          {item.amountKg.toLocaleString()} <span className="text-sm font-normal text-slate-400">kg</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{item.purpose} ({item.bags50kg} bags of 50kg).</p>
                      </div>
                    ))}

                    {/* Seeds Required */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-xs">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-cyan-400" />
                          Certified Seed Quantum
                        </span>
                      </div>
                      <div className="text-2xl font-extrabold text-cyan-300">
                        {resources.seedRequirementKg.toLocaleString()} <span className="text-sm font-normal text-slate-400">kg</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Required {resources.seedBags} bags for {inputs.farmArea} Acres.</p>
                    </div>

                    {/* Solar Pumping Energy */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-xs">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          Solar Pumping Power
                        </span>
                      </div>
                      <div className="text-2xl font-extrabold text-yellow-300">
                        {resources.dailySolarPumpEnergyKwh.toLocaleString()} <span className="text-sm font-normal text-slate-400">kWh/day</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Daily solar power needed for irrigation pumps.</p>
                    </div>

                    {/* Labor Force */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-xs">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-teal-400" />
                          Seasonal Field Labor
                        </span>
                      </div>
                      <div className="text-2xl font-extrabold text-teal-300">
                        {resources.estimatedLaborDaysPerSeason.toLocaleString()} <span className="text-sm font-normal text-slate-400">Person-Days</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Total labor required across growing season.</p>
                    </div>
                  </div>
                </div>

                {/* PEST & DISEASE RISK ADVISORIES */}
                {pestRisks.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      Weather-Induced Pest & Crop Disease Risk Advisories
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {pestRisks.map((pest, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-amber-200">{pest.diseaseName}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                {pest.riskLevel.toUpperCase()} RISK
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-1">{pest.triggerReason}</p>
                            <p className="text-[10px] text-emerald-400 mt-2 font-semibold">Preventive Action: {pest.preventiveMeasure}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FINAL SUBMIT BUTTON */}
                <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Irrigation</span>
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 text-base cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5 fill-current" />
                    <span>Generate Full Agro-Economic Report</span>{isFormFullyComplete && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                  </button>
                </div>
              </motion.div>
            )}
              </AnimatePresence>
            </div>
            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 backdrop-blur-xl shadow-xl text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    Live Farm Profile
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                    Active Parameters
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2.5">
                    <span className="text-slate-400">Crop Focus</span>
                    <span className="font-bold text-white">{inputs.cropCategory}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2.5">
                    <span className="text-slate-400">Farm Scale</span>
                    <span className="font-bold text-emerald-400">{inputs.farmArea} Acres ({(inputs.farmArea * 0.404686).toFixed(1)} ha)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2.5">
                    <span className="text-slate-400">Location</span>
                    <span className="font-bold text-white max-w-[180px] truncate">{inputs.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2.5">
                    <span className="text-slate-400">Soil Texture</span>
                    <span className="font-bold text-white capitalize">{inputs.soilType} Soil</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2.5">
                    <span className="text-slate-400">Soil Organic Carbon</span>
                    <span className="font-bold text-emerald-400">{(inputs.soc || 1.5).toFixed(1)} %</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2.5">
                    <span className="text-slate-400">Soil Salinity EC</span>
                    <span className="font-bold text-cyan-400">{(inputs.ec || 1.0).toFixed(1)} dS/m</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2.5">
                    <span className="text-slate-400">Soil pH</span>
                    <span className="font-bold text-teal-300">pH {(inputs.ph || 6.8).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2.5">
                    <span className="text-slate-400">Farming Method</span>
                    <span className="font-bold text-white capitalize">{inputs.farmingType}</span>
                  </div>
                </div>

                {/* Quick 7-Day Water Stat Badge */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-cyan-950/60 border border-emerald-500/30 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Daily Irrigation Water Demand
                  </span>
                  <div className="text-xl font-extrabold text-white">
                    {(water.weatherAdjustedDailyLiters / 1000).toFixed(1)} m³/day
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Weather adjusted for rainfall & evapotranspiration.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Simulate Agronomic Yield</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default FarmAnalysisForm;

