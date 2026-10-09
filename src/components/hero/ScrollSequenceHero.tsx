import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useFrameLoader } from '../../hooks/useFrameLoader';

gsap.registerPlugin(ScrollTrigger);

interface ScrollSequenceHeroProps {
  frameCount: number;
}

export default function ScrollSequenceHero({ frameCount }: ScrollSequenceHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { images, progress } = useFrameLoader(frameCount);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || images.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use final frame if reduced motion
    
    const renderFrame = (img: HTMLImageElement) => {
      if (!img || !img.complete) return;
      
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        img,
        0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
      );
    };

    const handleResize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      
      // Re-render current frame on resize
      if (isReducedMotion && images[frameCount - 1]) {
         renderFrame(images[frameCount - 1]);
      } else {
         renderFrame(images[0]);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    if (isReducedMotion) {
      if (images[frameCount - 1]) {
        renderFrame(images[frameCount - 1]);
      }
      return;
    }

    // Scroll animation logic
    const sequenceObj = { frame: 0 };
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5, // light easing
      }
    });

    tl.to(sequenceObj, {
      frame: frameCount - 1,
      snap: 'frame',
      ease: 'none',
      onUpdate: () => {
        if (images[Math.round(sequenceObj.frame)]) {
          renderFrame(images[Math.round(sequenceObj.frame)]);
        }
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      tl.kill();
      ScrollTrigger.getAll().forEach(t => {
         if (t.trigger === containerRef.current) t.kill();
      });
    };
  }, [images, frameCount, isReducedMotion]);

  return (
    <div id="about" ref={containerRef} className="relative w-full h-[1200vh] sm:h-[1000vh] bg-[#1a2e1a]">
      {/* Pinned Canvas Area */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {progress < 0.1 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0f1712] text-white flex-col">
            <h1 className="text-3xl font-bold tracking-tight mb-4 text-[#e2e8f0]">AGROGEN</h1>
            <div className="w-48 h-1 bg-[#2d4233] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#84cc16] transition-all duration-300" 
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-[#94a3b8]">{Math.round(progress * 100)}% loaded</p>
          </div>
        )}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        
        {/* HUD Overlay */}
        <HudOverlay />
      </div>
    </div>
  );
}

function HudOverlay() {
  // We'll manage HUD animations based on ScrollTrigger in a separate hook or useEffect
  // For now, let's just lay out the nodes and text areas with specific classes 
  // that we will animate with GSAP.
  
  useEffect(() => {
    // Stage 1: 0-12% SEED
    gsap.fromTo('.hero-stage-1', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, scrollTrigger: { trigger: '.hero-container', start: 'top top', end: '8% top', scrub: true } }
    );
    gsap.to('.hero-stage-1', {
      opacity: 0, y: -20, scrollTrigger: { trigger: '.hero-container', start: '10% top', end: '15% top', scrub: true }
    });

    // About Text 1: 15-25%
    gsap.fromTo('.about-stage-1',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, scrollTrigger: { trigger: '.hero-container', start: '15% top', end: '20% top', scrub: true } }
    );
    gsap.to('.about-stage-1', {
      opacity: 0, y: -30, scrollTrigger: { trigger: '.hero-container', start: '23% top', end: '28% top', scrub: true }
    });

    // About Text 2: 28-38%
    gsap.fromTo('.about-stage-2',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, scrollTrigger: { trigger: '.hero-container', start: '28% top', end: '33% top', scrub: true } }
    );
    gsap.to('.about-stage-2', {
      opacity: 0, y: -30, scrollTrigger: { trigger: '.hero-container', start: '36% top', end: '41% top', scrub: true }
    });

    // Stage 2: 42-55% SOIL
    gsap.fromTo('.hero-stage-2',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, scrollTrigger: { trigger: '.hero-container', start: '42% top', end: '47% top', scrub: true } }
    );
    gsap.to('.hero-stage-2', {
      opacity: 0, scale: 1.05, scrollTrigger: { trigger: '.hero-container', start: '53% top', end: '58% top', scrub: true }
    });

    // Stage 3: 58-72% DATA & INTELLIGENCE
    gsap.fromTo('.hero-stage-3',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, scrollTrigger: { trigger: '.hero-container', start: '58% top', end: '63% top', scrub: true } }
    );
    gsap.to('.hero-stage-3', {
      opacity: 0, x: 20, scrollTrigger: { trigger: '.hero-container', start: '70% top', end: '75% top', scrub: true }
    });

    // Stage 4: 75-88% CROP
    gsap.fromTo('.hero-stage-4',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, scrollTrigger: { trigger: '.hero-container', start: '75% top', end: '80% top', scrub: true } }
    );
    gsap.to('.hero-stage-4', {
      opacity: 0, scrollTrigger: { trigger: '.hero-container', start: '86% top', end: '90% top', scrub: true }
    });

    // Stage 5: 90-100% FARMLAND
    gsap.fromTo('.hero-stage-5',
      { opacity: 0 },
      { opacity: 1, scrollTrigger: { trigger: '.hero-container', start: '90% top', end: '95% top', scrub: true } }
    );
  }, []);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none hero-container">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full relative flex items-center justify-center">
        
        {/* Progress Rail */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-8 text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
           <div className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-white/40 stage-dot-1"/> <span>Soil</span></div>
           <div className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-white/40 stage-dot-2"/> <span>Data</span></div>
           <div className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-white/40 stage-dot-3"/> <span>Intelligence</span></div>
           <div className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-white/40 stage-dot-4"/> <span>Crop</span></div>
        </div>

        {/* Stage 1 */}
        <div className="hero-stage-1 absolute text-center max-w-3xl px-4 pointer-events-auto">
          <div className="mb-8 flex flex-col items-center justify-center">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white drop-shadow-lg font-display">
              AGROGEN
            </h1>
            <p className="text-[#84cc16] text-sm md:text-base tracking-[0.2em] font-medium uppercase mt-3">
              Intelligent Crop Planning & Soil Intelligence
            </p>
          </div>
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-white/90 mb-4">
            Grow Smarter. Plan Better. Harvest with Confidence.
          </h2>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
            Transforming raw soil and environmental data into precise agricultural decisions.
          </p>
        </div>

        {/* About Text 1 */}
        <div className="about-stage-1 absolute text-center max-w-4xl px-4 pointer-events-none opacity-0">
          <span className="text-sm font-mono tracking-widest text-[#84cc16] mb-4 uppercase block">Our Story</span>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white mb-6">
            More than just data.
          </h2>
          <p className="text-lg md:text-2xl text-white/80 font-light leading-relaxed">
            Farmers have access to raw measurements, but transforming those numbers into actionable crop intelligence is incredibly complex.
          </p>
        </div>

        {/* About Text 2 */}
        <div className="about-stage-2 absolute text-center max-w-4xl px-4 pointer-events-none opacity-0">
          <span className="text-sm font-mono tracking-widest text-[#84cc16] mb-4 uppercase block">Our Approach</span>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white mb-6">
            Precision meets Nature.
          </h2>
          <p className="text-lg md:text-2xl text-white/80 font-light leading-relaxed">
            By combining robust agronomic rules, environmental thresholds, and soil chemistry, we created an explainable engine that empowers smarter, data-driven cultivation.
          </p>
        </div>

        {/* Stage 2 - SOIL */}
        <div className="hero-stage-2 absolute inset-0 flex items-center justify-center pointer-events-none opacity-0">
          <div className="relative w-[300px] h-[300px]">
            {/* Scientific Callouts */}
            <div className="absolute top-0 right-[-100px] backdrop-blur-md bg-black/40 border border-white/10 p-3 rounded-xl">
              <div className="text-[10px] text-[#84cc16] mb-1 font-mono">pH LEVEL</div>
              <div className="text-xl text-white font-semibold">6.4</div>
            </div>
            <div className="absolute bottom-10 left-[-150px] backdrop-blur-md bg-black/40 border border-white/10 p-3 rounded-xl flex gap-4">
              <div><div className="text-[10px] text-white/60 mb-1">N</div><div className="text-lg text-white font-semibold">72</div></div>
              <div><div className="text-[10px] text-white/60 mb-1">P</div><div className="text-lg text-white font-semibold">38</div></div>
              <div><div className="text-[10px] text-white/60 mb-1">K</div><div className="text-lg text-white font-semibold">55</div></div>
            </div>
          </div>
        </div>

        {/* Stage 3 - DATA */}
        <div className="hero-stage-3 absolute left-[10%] top-[40%] max-w-xs backdrop-blur-md bg-black/40 border border-white/10 p-6 rounded-2xl opacity-0">
           <h3 className="text-[11px] font-mono tracking-widest text-[#84cc16] mb-4">INTELLIGENCE</h3>
           <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-white mb-2"><span>Climate Match</span><span>84%</span></div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full w-[84%] bg-[#84cc16]"/></div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-white mb-2"><span>Water Avail.</span><span>78%</span></div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full w-[78%] bg-[#84cc16]"/></div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-white mb-2"><span>Nutrient Profile</span><span>89%</span></div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full w-[89%] bg-[#84cc16]"/></div>
              </div>
           </div>
           <p className="text-[9px] text-white/40 mt-4 italic">* Illustrative Data</p>
        </div>

        {/* Stage 4 - CROP */}
        <div className="hero-stage-4 absolute right-[10%] top-[30%] max-w-[280px] w-full opacity-0">
          <h3 className="text-[11px] font-mono tracking-widest text-[#84cc16] mb-4 drop-shadow-md">RECOMMENDATIONS</h3>
          <div className="space-y-3">
             <div className="backdrop-blur-md bg-white/10 border border-white/20 p-4 rounded-xl flex items-center justify-between shadow-lg">
                <span className="text-white font-medium text-sm">01 Tomato</span>
                <span className="text-[#84cc16] font-semibold">92%</span>
             </div>
             <div className="backdrop-blur-md bg-black/40 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                <span className="text-white/80 text-sm">02 Chili</span>
                <span className="text-white/80">87%</span>
             </div>
             <div className="backdrop-blur-md bg-black/40 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                <span className="text-white/80 text-sm">03 Groundnut</span>
                <span className="text-white/80">81%</span>
             </div>
          </div>
        </div>

        {/* Stage 5 - FARMLAND */}
        <div className="hero-stage-5 absolute bottom-24 left-0 right-0 text-center pointer-events-auto opacity-0">
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white mb-8 drop-shadow-lg">
            Your soil already has the answers.
          </h2>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => document.getElementById('analysis-section')?.scrollIntoView({behavior: 'smooth'})} className="px-8 py-4 bg-white text-[#0f1712] font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-xl">
              Analyze My Farm
            </button>
            <button onClick={() => window.dispatchEvent(new CustomEvent('run-demo'))} className="px-8 py-4 bg-[#84cc16] text-[#0f1712] font-semibold rounded-full hover:bg-[#65a30d] transition-colors shadow-xl">
              Try Demo Farm
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
