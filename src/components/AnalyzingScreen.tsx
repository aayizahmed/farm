import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { label: 'Collecting Soil Data', icon: '⛏️' },
  { label: 'Analyzing Nutrients', icon: '🔬' },
  { label: 'Evaluating Climate', icon: '🌡️' },
  { label: 'Matching Crops', icon: '🌱' },
  { label: 'Generating Farm Plan', icon: '📋' },
];

interface AnalyzingScreenProps {
  onComplete: () => void;
}

export default function AnalyzingScreen({ onComplete }: AnalyzingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setDone] = useState(false);

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= STEPS.length) {
        clearInterval(interval);
        setDone(true);
        setTimeout(onComplete, 600);
        return;
      }
      setCurrentStep(step);
    }, 700);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(160deg, #0f1f0f 0%, #1a2e1a 50%, #0d1a0d 100%)' }}
    >
      {/* Central orb */}
      <div className="relative mb-12">
        <motion.div
          className="w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle, rgba(163,230,53,0.2) 0%, rgba(74,124,89,0.1) 60%, transparent 100%)',
            border: '1px solid rgba(163,230,53,0.3)',
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            style={{ background: 'linear-gradient(135deg, rgba(74,124,89,0.4), rgba(163,230,53,0.2))' }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          >
            🌿
          </motion.div>
        </motion.div>

        {/* Ripples */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{ border: '1px solid rgba(163,230,53,0.15)' }}
            animate={{ scale: [1, 1.8 + i * 0.3], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.5, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* Title */}
      <motion.h2
        className="text-2xl font-display font-bold text-white mb-2 text-center"
        style={{ letterSpacing: '-0.02em' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Analyzing Your Farm
      </motion.h2>
      <p className="text-[#6aab7a] text-sm mb-10 text-center">Processing soil and environmental parameters</p>

      {/* Steps */}
      <div className="w-full max-w-sm space-y-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.label}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: i === currentStep
                ? 'rgba(163,230,53,0.12)'
                : i < currentStep
                ? 'rgba(74,124,89,0.1)'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${
                i === currentStep ? 'rgba(163,230,53,0.3)' :
                i < currentStep ? 'rgba(74,124,89,0.2)' :
                'rgba(255,255,255,0.05)'
              }`,
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            {/* Status */}
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
              <AnimatePresence mode="wait">
                {i < currentStep ? (
                  <motion.span
                    key="done"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-[#a3e635] text-xs font-bold"
                  >
                    ✓
                  </motion.span>
                ) : i === currentStep ? (
                  <motion.div
                    key="active"
                    className="w-3 h-3 rounded-full bg-[#a3e635]"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  />
                ) : (
                  <div key="pending" className="w-2 h-2 rounded-full bg-[#2d4a2d]" />
                )}
              </AnimatePresence>
            </div>

            <span className="text-sm font-medium"
              style={{
                color: i === currentStep ? '#a3e635' :
                  i < currentStep ? '#6aab7a' : '#4a7c59'
              }}>
              {step.label}
            </span>

            {i === currentStep && (
              <motion.span
                className="ml-auto text-base"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {step.icon}
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm mt-8">
        <div className="h-1 rounded-full bg-[#1a3a1a] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #4a7c59, #a3e635)' }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-[#4a7c59]">Processing</span>
          <span className="text-xs text-[#4a7c59] font-mono">
            {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
