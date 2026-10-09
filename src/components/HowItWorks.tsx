import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const STEPS = [
  {
    num: '01',
    title: 'Input',
    description: 'Enter your farm profile, soil measurements, and environmental conditions.',
    color: '#4a7c59',
  },
  {
    num: '02',
    title: 'Analyze',
    description: 'AGROGEN evaluates pH, nutrients, climate, and water conditions against agronomic benchmarks.',
    color: '#2d4a2d',
  },
  {
    num: '03',
    title: 'Match',
    description: 'The system compares your field conditions against the specific requirements of 10+ crop profiles.',
    color: '#8b7355',
  },
  {
    num: '04',
    title: 'Recommend',
    description: 'Crops are scored and ranked with transparent compatibility percentages and explanations.',
    color: '#4a7c59',
  },
  {
    num: '05',
    title: 'Plan',
    description: 'Generate a personalized cultivation timeline, soil improvements, and multi-season rotation plan.',
    color: '#1a2e1a',
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="how-it-works" ref={ref} className="py-24 lg:py-32 bg-white/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16 lg:mb-20">
          <motion.span
            className="section-label"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            The Process
          </motion.span>
          <motion.h2
            className="text-4xl lg:text-5xl font-display text-[#1a2e1a] mt-3"
            style={{ letterSpacing: '-0.025em' }}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            How AGROGEN Works
          </motion.h2>
          <motion.p
            className="mt-4 text-[#6b7280] text-base leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            A structured analytical pipeline converts raw field data into actionable intelligence.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-14 left-[10%] right-[10%] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #d5d2cb 10%, #d5d2cb 90%, transparent)' }} />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
              >
                {/* Node */}
                <motion.div
                  className="relative w-[60px] h-[60px] rounded-full flex items-center justify-center mb-5 z-10"
                  style={{
                    background: 'white',
                    border: `2px solid ${step.color}`,
                    boxShadow: `0 0 0 6px rgba(74,124,89,0.08)`,
                  }}
                  whileHover={{ scale: 1.08 }}
                >
                  <span className="text-sm font-black" style={{ color: step.color, letterSpacing: '-0.02em' }}>{step.num}</span>
                </motion.div>

                <h3 className="text-base font-bold text-[#1a2e1a] mb-2">{step.title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{step.description}</p>

                {/* Mobile connector */}
                {i < STEPS.length - 1 && (
                  <div className="lg:hidden w-px h-8 my-3" style={{ background: '#d5d2cb' }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Solution statement */}
        <motion.div
          className="mt-20 rounded-2xl p-8 lg:p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 100%)',
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-[#a3e635] mb-4">AGROGEN Intelligence</p>
          <h3 className="text-2xl lg:text-3xl font-display text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
            From raw soil numbers to a complete farm strategy
          </h3>
          <p className="text-[#a8b5a0] text-base max-w-2xl mx-auto leading-relaxed">
            AGROGEN uses a transparent rule-based scoring model calibrated against established agronomic research.
            Each recommendation includes the reasoning behind it — because you deserve to understand your land.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
