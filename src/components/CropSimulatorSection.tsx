import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useInView } from 'framer-motion';
import { Play, Pause, FastForward, Info, AlertCircle } from 'lucide-react';
import { CROP_PROFILES, getCropProfile, getGrowthStage } from '../data/cropGrowthProfiles';
import type { FarmInputs, AnalysisResult } from '../types';

const CropSimulator3D = React.lazy(() => import('./CropSimulator3D'));

interface CropSimulatorSectionProps {
  lastInputs?: FarmInputs | null;
  analysisResult?: AnalysisResult | null;
}

export default function CropSimulatorSection({ analysisResult }: CropSimulatorSectionProps) {
  const [selectedCropId, setSelectedCropId] = useState(CROP_PROFILES[0].id);
  const [day, setDay] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [hasWebGL, setHasWebGL] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: '200px' });
  
  const crop = getCropProfile(selectedCropId);
  
  // Calculate vigor
  let vigor = 0.85;
  let isPersonalized = false;
  let compatibilityScore = 85;
  
  if (analysisResult) {
    const cropResult = analysisResult.cropResults.find(c => c.crop.name.toLowerCase() === crop.name.toLowerCase());
    if (cropResult) {
      vigor = cropResult.score / 100;
      compatibilityScore = cropResult.score;
      isPersonalized = true;
    }
  }

  // Accessibility: prefers-reduced-motion
  const reducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  // Detect mobile for performance
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  // WebGL support check
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }
    
    if (reducedMotion) {
      setDay(Math.floor(crop.totalDays * 0.5)); // Start at mid-growth
      setIsPlaying(false);
    }
  }, [reducedMotion, crop.totalDays]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || reducedMotion || !isInView) return;

    const interval = setInterval(() => {
      setDay(d => {
        if (d >= crop.totalDays) {
          setIsPlaying(false);
          return crop.totalDays;
        }
        return d + 1;
      });
    }, 100 / speedMultiplier);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, crop.totalDays, reducedMotion, isInView]);

  const progress = day / crop.totalDays;
  const stage = getGrowthStage(day, crop.totalDays);
  
  const toggleSpeed = () => {
    if (speedMultiplier === 1) setSpeedMultiplier(2);
    else if (speedMultiplier === 2) setSpeedMultiplier(4);
    else setSpeedMultiplier(1);
  };

  return (
    <section id="simulator" className="py-24 lg:py-32 bg-[#faf8f3]" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="section-label">Crop Simulation</span>
          <h2 className="text-4xl lg:text-5xl font-display text-[#1a2e1a] mt-3" style={{ letterSpacing: '-0.02em' }}>
            Watch Your Crop Grow
          </h2>
          <p className="mt-4 text-[#6b7280] text-base">
            Experience a full cycle growth simulation. Observe how different crops root and develop over time based on specific field conditions.
          </p>
        </div>

        {/* UI Layout */}
        <div className="bg-white rounded-3xl border border-[#e5e3de] overflow-hidden flex flex-col lg:flex-row shadow-sm">
          
          {/* Sidebar controls */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#e5e3de] flex flex-col bg-[#fafaf8]">
            <div className="p-6 border-b border-[#e5e3de]">
              <h3 className="text-sm font-bold text-[#1a2e1a] uppercase tracking-wider mb-4">Select Crop</h3>
              <div className="flex flex-wrap gap-2">
                {CROP_PROFILES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedCropId(p.id); setDay(0); setIsPlaying(true); }}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border"
                    style={{
                      background: selectedCropId === p.id ? '#4a7c59' : 'white',
                      color: selectedCropId === p.id ? 'white' : '#6b7280',
                      borderColor: selectedCropId === p.id ? '#4a7c59' : '#e5e3de',
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-center">
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-1">Current Stage</div>
                  <div className="text-2xl font-black text-[#1a2e1a]">{stage}</div>
                  <div className="text-sm text-[#4a7c59] font-medium mt-1">Day {Math.floor(day)} / {crop.totalDays}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-1">Est. Height</div>
                  <div className="text-lg font-bold text-[#3d3d3d]">{(crop.maxHeight * progress * 100).toFixed(0)} cm</div>
                </div>

                <div className="p-4 rounded-xl border border-[#e5e3de] bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={16} className={isPersonalized ? "text-[#4a7c59]" : "text-[#8b7355]"} />
                    <span className="text-sm font-bold text-[#1a2e1a]">Compatibility {compatibilityScore}%</span>
                  </div>
                  <p className="text-xs text-[#6b7280] leading-relaxed">
                    {isPersonalized 
                      ? "Vigor is dynamically scaled based on your farm's soil and climate analysis." 
                      : "Run an analysis to personalize this simulation."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Canvas Area */}
          <div className="flex-1 relative h-[500px] lg:h-[700px] flex flex-col">
            
            {/* Accessibility ARIA description for screen readers */}
            <div className="sr-only" aria-live="polite">
              3D simulation of {crop.name} at day {day}, stage {stage}. Estimated height {(crop.maxHeight * progress * 100).toFixed(0)} centimeters.
            </div>

            {!hasWebGL ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#6b7280]">
                <AlertCircle size={48} className="mb-4 text-[#e5e3de]" />
                <h3 className="text-lg font-bold text-[#1a2e1a] mb-2">WebGL Not Available</h3>
                <p>Your browser or device does not support WebGL, which is required for the 3D crop simulation.</p>
              </div>
            ) : (
              <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing" aria-hidden="true">
                {isInView && (
                  <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-[#9ca3af]">Loading 3D Engine...</div>}>
                    <CropSimulator3D 
                      crop={crop}
                      day={day}
                      vigor={vigor}
                      isMobile={isMobile}
                      reducedMotion={reducedMotion}
                      isPlaying={isPlaying}
                    />
                  </Suspense>
                )}
              </div>
            )}

            {/* Playback controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white/90 to-transparent pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md border border-[#e5e3de] rounded-2xl p-4 flex items-center gap-4 shadow-lg pointer-events-auto max-w-2xl mx-auto">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-[#1a2e1a] text-white hover:bg-[#2d4a2d] transition-colors flex-shrink-0"
                  aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
                  disabled={reducedMotion}
                >
                  {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>

                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-bold text-[#6b7280]">
                    <span>Day 0</span>
                    <span>Harvest</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max={crop.totalDays} 
                    value={day} 
                    onChange={(e) => {
                      setDay(parseInt(e.target.value));
                      setIsPlaying(false);
                    }}
                    className="w-full h-2 bg-[#e5e3de] rounded-full appearance-none outline-none accent-[#4a7c59] cursor-pointer"
                    aria-label="Simulation day timeline"
                  />
                </div>

                <button 
                  onClick={toggleSpeed}
                  className="px-3 py-1.5 rounded-lg border border-[#e5e3de] text-xs font-bold text-[#4a7c59] hover:bg-[#f5f4f0] transition-colors flex items-center gap-1"
                  aria-label={`Current speed ${speedMultiplier}x. Click to change.`}
                >
                  {speedMultiplier}x <FastForward size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
