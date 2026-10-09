import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface FinalCTAProps {
  onAnalyzeClick: () => void;
}

export default function FinalCTA({ onAnalyzeClick }: FinalCTAProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-24 lg:py-32 overflow-hidden relative bg-black/60 backdrop-blur-xl">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(74,124,89,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(163,230,53,0.07) 0%, transparent 50%)',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          className="inline-block mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#4a7c59] px-3 py-1.5 rounded-full border border-[#2d4a2d]">
            Get Started
          </span>
        </motion.div>

        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-display text-white mb-6"
          style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
        >
          Your soil already has the answers.
          <br />
          <span style={{ color: '#a3e635' }}>AGROGEN helps you read them.</span>
        </motion.h2>

        <motion.p
          className="text-[#8ba890] text-lg mb-10 max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          Enter your soil data and let AGROGEN generate a complete crop intelligence report for your farm — in under 30 seconds.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            className="btn-primary flex items-center justify-center gap-2.5 text-base"
            style={{ background: 'linear-gradient(135deg, #4a7c59, #a3e635)', color: '#1a2e1a' }}
            onClick={onAnalyzeClick}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5L3 7v9h12V7L9 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M6.5 16V10h5v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            Analyze My Farm
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
