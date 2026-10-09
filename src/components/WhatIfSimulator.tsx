import { useState, useCallback, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { FarmInputs } from '../types';
import { simulateWhatIf } from '../engine/analyzer';
import { CROPS, DEMO_INPUTS } from '../data/crops';


interface WhatIfSimulatorProps {
  baseInputs?: FarmInputs;
}

const PARAM_CONFIG = [
  { key: 'ph' as const, label: 'Soil pH', min: 3.5, max: 9, step: 0.1, unit: '', color: '#4a7c59' },
  { key: 'nitrogen' as const, label: 'Nitrogen', min: 0, max: 200, step: 1, unit: 'kg/ha', color: '#2d4a2d' },
  { key: 'phosphorus' as const, label: 'Phosphorus', min: 0, max: 150, step: 1, unit: 'kg/ha', color: '#8b7355' },
  { key: 'potassium' as const, label: 'Potassium', min: 0, max: 200, step: 1, unit: 'kg/ha', color: '#6aab7a' },
  { key: 'moisture' as const, label: 'Moisture', min: 0, max: 100, step: 1, unit: '%', color: '#4a7c59' },
];

type SimKey = 'ph' | 'nitrogen' | 'phosphorus' | 'potassium' | 'moisture';

function DeltaBadge({ base, sim }: { base: number; sim: number }) {
  const delta = sim - base;
  if (Math.abs(delta) < 1) return <span className="text-xs text-[#9ca3af] font-medium">—</span>;

  return (
    <span
      className="text-xs font-bold px-1.5 py-0.5 rounded-md"
      style={{
        background: delta > 0 ? 'rgba(74,124,89,0.12)' : 'rgba(239,68,68,0.1)',
        color: delta > 0 ? '#4a7c59' : '#ef4444',
      }}
    >
      {delta > 0 ? '+' : ''}{delta.toFixed(0)}%
    </span>
  );
}

export default function WhatIfSimulator({ baseInputs }: WhatIfSimulatorProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const base = baseInputs ?? DEMO_INPUTS;
  const [mods, setMods] = useState<Partial<Record<SimKey, number>>>({});

  const currentInputs = { ...base, ...mods };

  const { baseScores, simScores } = simulateWhatIf(base, mods);

  const topCropIds = Object.keys(baseScores);
  const cropMap = Object.fromEntries(CROPS.map((c) => [c.id, c]));

  const setMod = useCallback((key: SimKey, value: number) => {
    setMods((prev) => ({ ...prev, [key]: value }));
  }, []);

  const hasChanges = Object.keys(mods).length > 0;

  return (
    <section id="whatif" ref={ref} className="py-24 lg:py-32 bg-white/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="section-label">What-If Simulator</span>
          </motion.div>
          <motion.h2
            className="text-4xl lg:text-5xl font-display text-[#1a2e1a] mt-3"
            style={{ letterSpacing: '-0.025em' }}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            What happens if you
            <br />
            <span className="text-gradient-green">change the conditions?</span>
          </motion.h2>
          <motion.p
            className="mt-4 text-[#6b7280] text-base max-w-lg"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Adjust soil parameters and watch how crop compatibility scores change in real time. Explore how improvements can expand your cultivation options.
          </motion.p>
          <motion.div
            className="mt-3 text-xs text-[#9ca3af]"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            {baseInputs
              ? `Simulating changes from your analyzed farm: ${base.location}`
              : `Using demo farm data (${base.location}) — run an analysis to use your own data`}
          </motion.div>
        </div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Controls */}
          <div className="rounded-2xl bg-white border border-[#e5e3de] p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#1a2e1a]">Adjust Parameters</h3>
              {hasChanges && (
                <button
                  className="text-xs font-semibold text-[#9ca3af] hover:text-[#ef4444] transition-colors"
                  onClick={() => setMods({})}
                >
                  Reset all
                </button>
              )}
            </div>

            <div className="space-y-7">
              {PARAM_CONFIG.map((param) => {
                const baseVal = base[param.key] as number;
                const currentVal = currentInputs[param.key] as number;
                const changed = mods[param.key] !== undefined;
                const pct = ((currentVal - param.min) / (param.max - param.min)) * 100;

                return (
                  <div key={param.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-[#1c1c1e] flex items-center gap-2">
                        {param.label}
                        {changed && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4a7c59] inline-block" />
                        )}
                      </label>
                      <div className="flex items-center gap-2">
                        {changed && (
                          <span className="text-xs text-[#9ca3af] line-through">{baseVal}{param.unit}</span>
                        )}
                        <span className="text-sm font-bold text-[#1a2e1a]">{currentVal}{param.unit}</span>
                      </div>
                    </div>

                    <div className="relative h-5 flex items-center">
                      <div className="absolute w-full h-1 rounded-full bg-[#f0ede8]" />
                      <div
                        className="absolute h-1 rounded-full transition-all duration-150"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${param.color}60, ${param.color})` }}
                      />
                      {/* Base position marker */}
                      {changed && (
                        <div
                          className="absolute h-3 w-0.5 rounded-full bg-[#9ca3af]"
                          style={{ left: `${((baseVal - param.min) / (param.max - param.min)) * 100}%` }}
                        />
                      )}
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={currentVal}
                        onChange={(e) => setMod(param.key, parseFloat(e.target.value))}
                        className="slider-custom relative z-10 bg-transparent"
                        style={{ background: 'transparent' }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#c4bfb8]">
                      <span>{param.min}{param.unit}</span>
                      <span>{param.max}{param.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results */}
          <div className="rounded-2xl bg-white border border-[#e5e3de] p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#1a2e1a]">Crop Compatibility Impact</h3>
              {hasChanges && (
                <span className="tag tag-green text-[10px]">Simulating</span>
              )}
            </div>

            <div className="space-y-4">
              {topCropIds.map((id, i) => {
                const crop = cropMap[id];
                if (!crop) return null;
                const base = baseScores[id] ?? 0;
                const sim = simScores[id] ?? 0;

                const barColor = i === 0 ? '#4a7c59' : '#8b7355';

                return (
                  <div key={id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{crop.icon}</span>
                        <span className="text-sm font-semibold text-[#1a2e1a]">{crop.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DeltaBadge base={base} sim={sim} />
                        <span className="text-sm font-bold" style={{ color: barColor, minWidth: '3ch', textAlign: 'right' }}>
                          {sim}%
                        </span>
                      </div>
                    </div>

                    {/* Dual bar */}
                    <div className="relative h-2 rounded-full bg-[#f0ede8] overflow-hidden">
                      {/* Base bar (ghost) */}
                      <div
                        className="absolute h-full rounded-full opacity-20"
                        style={{ width: `${base}%`, background: barColor }}
                      />
                      {/* Simulated bar */}
                      <motion.div
                        className="absolute h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${barColor}80, ${barColor})` }}
                        animate={{ width: `${sim}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                    {hasChanges && (
                      <div className="flex justify-between text-[10px] text-[#9ca3af]">
                        <span>Base: {base}%</span>
                        <span>Simulated: {sim}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!hasChanges && (
              <p className="text-xs text-[#c4bfb8] text-center mt-8 italic">
                Adjust any parameter on the left to see how crop compatibility changes.
              </p>
            )}

            {hasChanges && (
              <motion.div
                className="mt-6 p-4 rounded-xl border border-[#d4edda] bg-[#f0f9f0]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs text-[#3a5a3a] leading-relaxed">
                  <span className="font-bold">Simulation note:</span> These changes illustrate how adjustments to soil parameters would affect crop compatibility scores based on agronomic benchmarks. Actual results depend on field conditions and local agricultural context.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
