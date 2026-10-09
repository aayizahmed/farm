import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from './components/Navbar';
import ScrollSequenceHero from './components/hero/ScrollSequenceHero';
import Problem from './components/Problem';
import HowItWorks from './components/HowItWorks';
import FarmAnalysisForm from './components/FarmAnalysisForm';
import AnalyzingScreen from './components/AnalyzingScreen';
import ResultsDashboard from './components/ResultsDashboard';
import Impact from './components/Impact';
import CropSimulatorSection from './components/CropSimulatorSection';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

import type { FarmInputs, AnalysisResult, AppStep } from './types';
import { analyzeField } from './engine/analyzer';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [appStep, setAppStep] = useState<AppStep>('landing');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [lastInputs, setLastInputs] = useState<FarmInputs | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      // Removed smoothWheel since it's true by default and typescript might complain if it's not strictly defined in their typings
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0, 0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  // Handle Demo Farm Data
  useEffect(() => {
    const handleRunDemo = () => {
      const demoInputs: FarmInputs = {
        location: 'Kozhikode',
        farmArea: 2,
        ph: 6.4,
        nitrogen: 72,
        phosphorus: 38,
        potassium: 55,
        moisture: 42,
        soilType: 'loamy',
        temperature: 27,
        rainfall: 1800,
        waterAvailability: 'moderate',
        season: 'kharif'
      };
      setLastInputs(demoInputs);
      setAppStep('analyzing');
    };
    
    window.addEventListener('run-demo', handleRunDemo);
    return () => window.removeEventListener('run-demo', handleRunDemo);
  }, []);

  const handleFormSubmit = useCallback((inputs: FarmInputs) => {
    setLastInputs(inputs);
    setAppStep('analyzing');
  }, []);

  const handleAnalysisComplete = useCallback(() => {
    if (lastInputs) {
      const result = analyzeField(lastInputs);
      setAnalysisResult(result);
      setAppStep('results');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [lastInputs]);

  const handleReset = useCallback(() => {
    setAppStep('landing');
    setAnalysisResult(null);
    setLastInputs(null);
    setTimeout(() => {
      document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const scrollToAnalysis = useCallback(() => {
    if (appStep === 'landing') {
      document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setAppStep('landing');
      setTimeout(() => {
        document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [appStep]);

  return (
    <div className="bg-[#f8fafc] text-[#0f1712] min-h-screen selection:bg-[#84cc16] selection:text-white">
      <Navbar onAnalyzeClick={scrollToAnalysis} />
      
      <AnimatePresence mode="wait">
        {appStep === 'analyzing' ? (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-[#0f1712]"
          >
            <AnalyzingScreen onComplete={handleAnalysisComplete} />
          </motion.div>
        ) : appStep === 'results' && analysisResult ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pt-[70px]"
          >
            <ResultsDashboard result={analysisResult} onReset={handleReset} />
            <FinalCTA onAnalyzeClick={handleReset} />
            <Footer />
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full relative"
          >
            {/* The Cinematic Hero Sequence */}
            <ScrollSequenceHero frameCount={300} />
            
            {/* Soft cross-fade into off-white sections */}
            <div className="relative z-10 w-full bg-[#f8fafc] -mt-1 rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] pt-20">
              <Problem />
              <HowItWorks />
              
              <div id="analysis-section" className="scroll-mt-20">
                <FarmAnalysisForm onSubmit={handleFormSubmit} />
              </div>
              
              <Impact />
              <CropSimulatorSection lastInputs={lastInputs} analysisResult={analysisResult} />
              <FinalCTA onAnalyzeClick={scrollToAnalysis} />
              <Footer />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
