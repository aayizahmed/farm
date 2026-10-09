import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { motion } from 'framer-motion';

const PROBLEMS = [
  {
    number: '01',
    title: 'Soil Uncertainty',
    description:
      'Understanding whether your soil profile is genuinely suitable for a specific crop requires interpreting multiple parameters simultaneously — pH, nutrients, texture, and moisture — a task farmers often navigate without structured guidance.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#4a7c59]">
        <path d="M12 2L3 9v13h18V9L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="12" cy="7" r="1.5" fill="currentColor" opacity="0.5"/>
      </svg>
    ),
    stat: '68%',
    statLabel: 'of smallholder farmers rely on intuition alone',
  },
  {
    number: '02',
    title: 'Crop Selection',
    description:
      'Selecting the right crop requires balancing soil chemistry, climate conditions, water availability, and market timing. Missing even one factor can significantly impact yield and resource efficiency.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#8b7355]">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 12c0-2.2 1.8-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
    stat: '4.2×',
    statLabel: 'more factors than most farmers can track manually',
  },
  {
    number: '03',
    title: 'Resource Efficiency',
    description:
      'Water and nutrient inputs are often applied based on general schedules rather than actual soil conditions. Precision matching between crop needs and available resources can reduce input costs significantly.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#2d4a2d]">
        <path d="M12 2C8 7 5 10 5 14a7 7 0 0014 0c0-4-3-7-7-12z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M12 17v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    stat: '30%',
    statLabel: 'potential reduction in unnecessary input costs',
  },
];

export default function Problem() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="overview" ref={ref} className="py-24 lg:py-32 bg-white/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label">The Challenge</span>
          </motion.div>
          <motion.h2
            className="text-4xl lg:text-5xl font-display text-[#1a2e1a] mt-3"
            style={{ letterSpacing: '-0.025em', lineHeight: 1.15 }}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Every field tells a story.
            <br />
            <span className="text-gradient-earth">The data is already there.</span>
          </motion.h2>
          <motion.p
            className="mt-5 text-lg text-[#5a5a5a] leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Farmers have access to soil measurements and environmental data. The challenge is converting those numbers into actionable cultivation decisions without specialized expertise.
          </motion.p>
        </div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROBLEMS.map((problem, i) => (
            <motion.div
              key={problem.number}
              className="relative rounded-2xl p-8 overflow-hidden group cursor-default"
              style={{
                background: 'white',
                border: '1px solid var(--color-border)',
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.12 }}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.10)' }}
            >
              {/* Number */}
              <div
                className="text-6xl font-display font-black absolute -top-2 -right-1 select-none"
                style={{ color: 'rgba(26,46,26,0.04)', letterSpacing: '-0.04em' }}
              >
                {problem.number}
              </div>

              {/* Icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(74,124,89,0.08)' }}>
                {problem.icon}
              </div>

              <h3 className="text-lg font-bold text-[#1a2e1a] mb-3">{problem.title}</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed mb-6">{problem.description}</p>

              {/* Stat */}
              <div className="flex items-end gap-2 pt-4 border-t border-[#f0ede8]">
                <span className="text-2xl font-display font-black text-[#4a7c59]">{problem.stat}</span>
                <span className="text-xs text-[#9ca3af] leading-snug pb-0.5">{problem.statLabel}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
