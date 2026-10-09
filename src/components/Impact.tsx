import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const STATS = [
  { value: '10+', label: 'Crop Profiles', desc: 'Calibrated against agronomic research' },
  { value: '7', label: 'Analysis Factors', desc: 'pH, N, P, K, moisture, climate, water' },
  { value: '100%', label: 'Explainable', desc: 'Every recommendation has a clear reason' },
  { value: '< 1s', label: 'Analysis Time', desc: 'Near-instant results, no API calls' },
];

export default function Impact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="platform" ref={ref} className="py-24 lg:py-32 overflow-hidden bg-white/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <motion.span
              className="section-label"
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
            >
              Platform Overview
            </motion.span>
            <motion.h2
              className="text-4xl lg:text-5xl font-display text-[#1a2e1a] mt-3"
              style={{ letterSpacing: '-0.025em', lineHeight: 1.12 }}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
            >
              Precision intelligence,
              <br />
              grounded in science.
            </motion.h2>
            <motion.p
              className="mt-5 text-[#5a5a5a] text-base leading-relaxed"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
            >
              AGROGEN is built on a transparent, rule-based scoring engine calibrated against established agronomic benchmarks. Every recommendation is traceable — farmers can see exactly why a crop was ranked higher or lower for their specific conditions.
            </motion.p>
            <motion.p
              className="mt-4 text-[#5a5a5a] text-base leading-relaxed"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25 }}
            >
              Unlike black-box AI systems, AGROGEN provides explainable intelligence — combining soil science, climatology, and crop agronomy into a coherent decision framework accessible to any farmer.
            </motion.p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="rounded-2xl p-6"
                style={{
                  background: i === 0 ? 'linear-gradient(135deg, #1a2e1a, #2d4a2d)' : 'white',
                  border: i === 0 ? 'none' : '1px solid var(--color-border)',
                }}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1 }}
                whileHover={{ y: -3 }}
              >
                <div
                  className="text-3xl font-display font-black mb-2"
                  style={{ color: i === 0 ? '#a3e635' : '#1a2e1a', letterSpacing: '-0.03em' }}
                >
                  {stat.value}
                </div>
                <div className="font-bold mb-1" style={{ fontSize: '0.9375rem', color: i === 0 ? 'white' : '#1a2e1a' }}>
                  {stat.label}
                </div>
                <div className="text-xs leading-relaxed" style={{ color: i === 0 ? '#6aab7a' : '#9ca3af' }}>
                  {stat.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
