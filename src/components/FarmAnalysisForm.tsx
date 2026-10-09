import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Play } from 'lucide-react';
import type { FarmInputs, SoilType, Season, WaterAvailability } from '../types';
import { DEMO_INPUTS } from '../data/crops';

interface FarmAnalysisFormProps {
  onSubmit: (inputs: FarmInputs) => void;
}

const SOIL_TYPES: { value: SoilType; label: string; desc: string }[] = [
  { value: 'loamy', label: 'Loamy', desc: 'Balanced, fertile' },
  { value: 'sandy', label: 'Sandy', desc: 'Light, fast-draining' },
  { value: 'clay', label: 'Clay', desc: 'Heavy, water-retaining' },
  { value: 'silt', label: 'Silt', desc: 'Smooth, moisture-holding' },
  { value: 'peat', label: 'Peat', desc: 'Organic-rich, acidic' },
  { value: 'chalky', label: 'Chalky', desc: 'Alkaline, stony' },
];

const SEASONS: { value: Season; label: string; months: string }[] = [
  { value: 'kharif', label: 'Kharif', months: 'Jun – Nov' },
  { value: 'rabi', label: 'Rabi', months: 'Nov – Apr' },
  { value: 'zaid', label: 'Zaid', months: 'Apr – Jun' },
  { value: 'year-round', label: 'Year-Round', months: 'All seasons' },
];

const WATER_OPTIONS: { value: WaterAvailability; label: string; desc: string }[] = [
  { value: 'low', label: 'Low', desc: 'Minimal / rainfed' },
  { value: 'moderate', label: 'Moderate', desc: 'Seasonal irrigation' },
  { value: 'high', label: 'High', desc: 'Abundant supply' },
  { value: 'irrigated', label: 'Irrigated', desc: 'Controlled irrigation' },
];

const DEFAULT_INPUTS: FarmInputs = {
  location: '',
  farmArea: 2,
  soilType: 'loamy',
  season: 'kharif',
  ph: 6.5,
  nitrogen: 60,
  phosphorus: 40,
  potassium: 50,
  moisture: 40,
  temperature: 25,
  rainfall: 1000,
  waterAvailability: 'moderate',
};

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  hint?: string;
  onChange: (v: number) => void;
  color?: string;
}

function SliderField({ label, value, min, max, step, unit, hint, onChange, color = '#4a7c59' }: SliderFieldProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#1c1c1e]">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(parseFloat(e.target.value) || min)}
            className="w-16 text-center text-sm font-bold border border-[#e5e3de] rounded-lg py-1 px-2 focus:outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c5920] bg-white"
          />
          <span className="text-xs text-[#9ca3af] font-medium">{unit}</span>
        </div>
      </div>
      <div className="relative h-5 flex items-center">
        <div className="absolute w-full h-1 rounded-full bg-[#e5e3de]" />
        <div
          className="absolute h-1 rounded-full transition-all duration-150"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider-custom relative z-10 bg-transparent"
          style={{ background: 'transparent' }}
        />
      </div>
      {hint && <p className="text-xs text-[#9ca3af]">{hint}</p>}
    </div>
  );
}

const STEPS = [
  { id: 1, label: 'Farm Profile', desc: 'Location & soil basics' },
  { id: 2, label: 'Soil Data', desc: 'Nutrient analysis' },
  { id: 3, label: 'Environment', desc: 'Climate & water' },
];

export default function FarmAnalysisForm({ onSubmit }: FarmAnalysisFormProps) {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<FarmInputs>(DEFAULT_INPUTS);

  const set = <K extends keyof FarmInputs>(key: K, val: FarmInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const handleDemo = () => {
    setInputs(DEMO_INPUTS);
    setTimeout(() => onSubmit(DEMO_INPUTS), 300);
  };

  const handleSubmit = () => onSubmit(inputs);

  return (
    <section id="analysis" className="py-24 lg:py-32 bg-white/70 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-label">Farm Analysis</span>
          <h2 className="text-4xl lg:text-5xl font-display text-[#1a2e1a] mt-3" style={{ letterSpacing: '-0.025em' }}>
            Tell us about your farm
          </h2>
          <p className="mt-4 text-[#6b7280] text-base max-w-lg mx-auto">
            Enter your soil and environmental data to receive a personalized crop intelligence report.
          </p>

          {/* Demo button */}
          <motion.button
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(163,230,53,0.15), rgba(74,124,89,0.15))',
              border: '1.5px solid rgba(74,124,89,0.3)',
              color: '#2d4a2d',
            }}
            onClick={handleDemo}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Play size={14} />
            Try Demo Farm — Kozhikode
          </motion.button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <button
                className="flex flex-col items-center gap-1.5 flex-1"
                onClick={() => s.id < step && setStep(s.id)}
                disabled={s.id > step}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                  style={{
                    background: s.id === step ? 'linear-gradient(135deg, #2d4a2d, #4a7c59)' :
                      s.id < step ? '#4a7c59' : '#e5e3de',
                    color: s.id <= step ? 'white' : '#9ca3af',
                  }}
                >
                  {s.id < step ? '✓' : s.id}
                </div>
                <div className="hidden sm:block text-center">
                  <div className="text-xs font-semibold text-[#1c1c1e]">{s.label}</div>
                  <div className="text-[10px] text-[#9ca3af]">{s.desc}</div>
                </div>
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-2" style={{ background: step > s.id ? '#4a7c59' : '#e5e3de' }} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'white', border: '1px solid var(--color-border)', boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                className="p-8 lg:p-10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold text-[#1a2e1a] mb-6 pb-4 border-b border-[#f0ede8]">
                  Farm Profile
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Location */}
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-[#1c1c1e] block mb-2">Farm Location</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Kozhikode, Kerala"
                      value={inputs.location}
                      onChange={(e) => set('location', e.target.value)}
                    />
                  </div>

                  {/* Farm area */}
                  <div>
                    <label className="text-sm font-semibold text-[#1c1c1e] block mb-2">Farm Area</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="input-field pr-14"
                        min={0.1}
                        step={0.1}
                        value={inputs.farmArea}
                        onChange={(e) => set('farmArea', parseFloat(e.target.value) || 0.1)}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#9ca3af] font-medium">acres</span>
                    </div>
                  </div>

                  {/* Growing season */}
                  <div>
                    <label className="text-sm font-semibold text-[#1c1c1e] block mb-2">Growing Season</label>
                    <div className="grid grid-cols-2 gap-2">
                      {SEASONS.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => set('season', s.value)}
                          className="rounded-xl p-2.5 text-left transition-all duration-200 border"
                          style={{
                            background: inputs.season === s.value ? 'rgba(74,124,89,0.08)' : 'white',
                            borderColor: inputs.season === s.value ? '#4a7c59' : '#e5e3de',
                          }}
                        >
                          <div className="text-sm font-semibold text-[#1c1c1e]">{s.label}</div>
                          <div className="text-xs text-[#9ca3af]">{s.months}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Soil type */}
                  <div className="sm:col-span-2">
                    <label className="text-sm font-semibold text-[#1c1c1e] block mb-2">Soil Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {SOIL_TYPES.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => set('soilType', s.value)}
                          className="rounded-xl p-3 text-left transition-all duration-200 border"
                          style={{
                            background: inputs.soilType === s.value ? 'rgba(74,124,89,0.08)' : 'white',
                            borderColor: inputs.soilType === s.value ? '#4a7c59' : '#e5e3de',
                          }}
                        >
                          <div className="text-sm font-semibold text-[#1c1c1e]">{s.label}</div>
                          <div className="text-xs text-[#9ca3af]">{s.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                className="p-8 lg:p-10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold text-[#1a2e1a] mb-6 pb-4 border-b border-[#f0ede8]">
                  Soil Data
                </h3>

                <div className="space-y-7">
                  <SliderField
                    label="Soil pH"
                    value={inputs.ph}
                    min={3.5}
                    max={9}
                    step={0.1}
                    unit=""
                    hint="Most crops prefer 6.0–7.0. Below 6 is acidic, above 7 is alkaline."
                    onChange={(v) => set('ph', v)}
                    color="#4a7c59"
                  />
                  <SliderField
                    label="Nitrogen (N)"
                    value={inputs.nitrogen}
                    min={0}
                    max={200}
                    step={1}
                    unit="kg/ha"
                    hint="Available nitrogen content in soil. Critical for vegetative growth."
                    onChange={(v) => set('nitrogen', v)}
                    color="#2d4a2d"
                  />
                  <SliderField
                    label="Phosphorus (P)"
                    value={inputs.phosphorus}
                    min={0}
                    max={150}
                    step={1}
                    unit="kg/ha"
                    hint="Essential for root development and energy transfer."
                    onChange={(v) => set('phosphorus', v)}
                    color="#8b7355"
                  />
                  <SliderField
                    label="Potassium (K)"
                    value={inputs.potassium}
                    min={0}
                    max={200}
                    step={1}
                    unit="kg/ha"
                    hint="Supports fruit quality, disease resistance, and water regulation."
                    onChange={(v) => set('potassium', v)}
                    color="#6aab7a"
                  />
                  <SliderField
                    label="Soil Moisture"
                    value={inputs.moisture}
                    min={0}
                    max={100}
                    step={1}
                    unit="%"
                    hint="Current volumetric soil moisture content."
                    onChange={(v) => set('moisture', v)}
                    color="#4a7c59"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                className="p-8 lg:p-10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold text-[#1a2e1a] mb-6 pb-4 border-b border-[#f0ede8]">
                  Environmental Conditions
                </h3>

                <div className="space-y-7">
                  <SliderField
                    label="Average Temperature"
                    value={inputs.temperature}
                    min={5}
                    max={45}
                    step={0.5}
                    unit="°C"
                    hint="Mean daytime temperature during growing season."
                    onChange={(v) => set('temperature', v)}
                    color="#8b7355"
                  />
                  <SliderField
                    label="Annual Rainfall"
                    value={inputs.rainfall}
                    min={100}
                    max={3000}
                    step={10}
                    unit="mm"
                    hint="Total annual precipitation for your region."
                    onChange={(v) => set('rainfall', v)}
                    color="#4a7c59"
                  />

                  {/* Water availability */}
                  <div>
                    <label className="text-sm font-semibold text-[#1c1c1e] block mb-3">Water Availability</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {WATER_OPTIONS.map((w) => (
                        <button
                          key={w.value}
                          onClick={() => set('waterAvailability', w.value)}
                          className="rounded-xl p-3 text-center transition-all duration-200 border"
                          style={{
                            background: inputs.waterAvailability === w.value ? 'rgba(74,124,89,0.08)' : 'white',
                            borderColor: inputs.waterAvailability === w.value ? '#4a7c59' : '#e5e3de',
                          }}
                        >
                          <div className="text-sm font-semibold text-[#1c1c1e]">{w.label}</div>
                          <div className="text-xs text-[#9ca3af] mt-0.5">{w.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation footer */}
          <div className="px-8 lg:px-10 py-5 border-t border-[#f0ede8] flex items-center justify-between"
            style={{ background: '#fafaf8' }}>
            <button
              className="btn-ghost flex items-center gap-2 text-sm py-2.5 px-4"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              style={{ opacity: step === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <div className="text-xs text-[#9ca3af] font-medium">Step {step} of 3</div>

            {step < 3 ? (
              <motion.button
                className="btn-primary flex items-center gap-2 text-sm py-2.5 px-6"
                onClick={() => setStep((s) => Math.min(3, s + 1))}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Continue
                <ChevronRight size={16} />
              </motion.button>
            ) : (
              <motion.button
                className="btn-primary flex items-center gap-2 text-sm py-2.5 px-6"
                onClick={handleSubmit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{ background: 'linear-gradient(135deg, #1a2e1a, #4a7c59)' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5L2 6.5v8h12v-8L8 1.5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M6 14.5v-5h4v5" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                Analyze My Farm
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
