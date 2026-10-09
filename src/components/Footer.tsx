export default function Footer() {
  const NAV = [
    { label: 'Overview', href: '#overview' },
    { label: 'Farm Analysis', href: '#analysis' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'About', href: '#about' },
  ];

  return (
    <footer className="border-t border-[#e5e3de] bg-white/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #4a7c59 100%)' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2C5.13 2 2 5.13 2 9s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 2.5c1.38 0 2.5 1.12 2.5 2.5S10.38 9.5 9 9.5 6.5 8.38 6.5 7 7.62 4.5 9 4.5z" fill="white" fillOpacity="0.8"/>
                  <path d="M9 7a1 1 0 100-2 1 1 0 000 2z" fill="#a3e635" fillOpacity="0.9"/>
                </svg>
              </div>
              <span className="font-display font-black text-[#1a2e1a] tracking-wider text-sm">AGROGEN</span>
            </div>
            <p className="text-xs text-[#9ca3af] leading-relaxed max-w-[220px]">
              Intelligent Crop Planning & Soil Intelligence
            </p>
          </div>

          {/* Nav */}
          <div>
            <div className="text-xs font-bold text-[#1a2e1a] uppercase tracking-widest mb-4">Navigation</div>
            <ul className="space-y-2.5">
              {NAV.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[#6b7280] hover:text-[#1a2e1a] transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Technology note */}
          <div>
            <div className="text-xs font-bold text-[#1a2e1a] uppercase tracking-widest mb-4">Platform</div>
            <ul className="space-y-2.5">
              {['Soil Analysis', 'Crop Intelligence', 'What-If Simulator', 'Farm Plan Generator', 'Rotation Planner'].map((item) => (
                <li key={item} className="text-sm text-[#6b7280]">{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#e5e3de] pt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <p className="text-xs text-[#9ca3af] leading-relaxed max-w-xl">
              <span className="font-semibold text-[#6b7280]">Disclaimer:</span> AGROGEN is a decision-support prototype.
              Recommendations should be validated with local agricultural experts and current field conditions before making
              cultivation decisions.
            </p>
            <p className="text-xs text-[#c4bfb8] flex-shrink-0">
              © 2024 AGROGEN. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
