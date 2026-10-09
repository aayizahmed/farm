import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onAnalyzeClick: () => void;
}

const NAV_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Platform Impact', href: '#platform' },
  { label: 'Farm Analysis', href: '#analysis-section' },
];

export default function Navbar({ onAnalyzeClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 40);
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(250, 248, 243, 0.88)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(229,227,222,0.8)' : '1px solid transparent',
          boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.06)' : 'none',
        }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[70px]">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2.5 cursor-pointer"
              whileHover={{ opacity: 0.85 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #4a7c59 100%)' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2C5.13 2 2 5.13 2 9s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 2.5c1.38 0 2.5 1.12 2.5 2.5S10.38 9.5 9 9.5 6.5 8.38 6.5 7 7.62 4.5 9 4.5zM9 14.2c-1.86 0-3.51-.93-4.5-2.34.02-1.49 3-2.31 4.5-2.31s4.48.82 4.5 2.31c-.99 1.41-2.64 2.34-4.5 2.34z" fill="white" fillOpacity="0.9"/>
                  <path d="M9 7a1 1 0 100-2 1 1 0 000 2z" fill="#a3e635" fillOpacity="0.8"/>
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-[15px] tracking-wider text-[#1a2e1a]" style={{ fontWeight: 800 }}>
                  AGROGEN
                </span>
                <span className="text-[9px] text-[#6b7280] tracking-[0.08em] font-medium uppercase hidden lg:block">
                  Soil Intelligence
                </span>
              </div>
            </motion.div>

            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-[#3d3d3d] rounded-full hover:bg-black/5 hover:text-[#1a2e1a] transition-all duration-200"
                  style={{ letterSpacing: '0.01em' }}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <motion.button
                className="btn-primary hidden sm:flex items-center gap-2 text-sm px-5 py-2.5"
                onClick={onAnalyzeClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 1L2 5v7h10V5L7 1z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M5 12V8h4v4" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                Analyze Farm
              </motion.button>

              {/* Mobile menu toggle */}
              <button
                className="lg:hidden p-2 rounded-full hover:bg-black/5 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="absolute top-0 right-0 w-72 h-full bg-white/95 backdrop-blur-xl shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-6 pt-20 flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    className="px-4 py-3 text-base font-medium text-[#1a2e1a] rounded-xl hover:bg-[#f5f4f0] transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      setMenuOpen(false);
                      setTimeout(() => {
                        document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {link.label}
                  </motion.a>
                ))}
                <motion.button
                  className="btn-primary mt-4 w-full"
                  onClick={() => { setMenuOpen(false); onAnalyzeClick(); }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Analyze Farm
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
