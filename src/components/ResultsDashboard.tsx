import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalysisResult, CropResult } from '../types';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ArrowLeft, ChevronRight, AlertTriangle, CheckCircle, Info, Box } from 'lucide-react';
import Crop3DViewer from './Crop3DViewer';

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

// Circular progress ring
function ScoreRing({ score, size = 160, strokeWidth = 10, color = '#4a7c59', label }: {
  score: number; size?: number; strokeWidth?: number; color?: string; label?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0ede8" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - dash }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-display font-black"
            style={{ fontSize: size * 0.22, color: '#1a2e1a', lineHeight: 1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-[#9ca3af] font-medium tracking-wider">/100</span>
        </div>
      </div>
      {label && <div className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">{label}</div>}
    </div>
  );
}

// Sub score pill
function SubScore({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#f0ede8] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
        />
      </div>
    </div>
  );
}

// Crop card
function CropCard({ cropResult, rank, onClick }: { cropResult: CropResult; rank: number; onClick: () => void }) {
  const isTop = rank === 1;
  const score = cropResult.score;
  const color = score >= 80 ? '#4a7c59' : score >= 60 ? '#8b7355' : '#9ca3af';

  return (
    <motion.button
      className="w-full text-left rounded-2xl p-5 transition-all duration-200 group"
      style={{
        background: isTop ? 'linear-gradient(135deg, rgba(74,124,89,0.06), rgba(163,230,53,0.06))' : 'white',
        border: `1.5px solid ${isTop ? '#4a7c59' : '#e5e3de'}`,
        boxShadow: isTop ? '0 4px 24px rgba(74,124,89,0.12)' : 'none',
      }}
      onClick={onClick}
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08 }}
    >
      <div className="flex items-center gap-4">
        {/* Rank + emoji */}
        <div className="flex-shrink-0">
          <div className="text-3xl mb-1">{cropResult.crop.icon}</div>
          <div className="text-[10px] font-black text-center" style={{ color: isTop ? '#4a7c59' : '#9ca3af' }}>
            #{rank}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-[#1a2e1a]">{cropResult.crop.name}</h4>
            {isTop && <span className="tag tag-green text-[10px]">Best Match</span>}
          </div>
          <div className="text-xs text-[#9ca3af] font-medium mb-2">{cropResult.crop.category} · {cropResult.crop.growingPeriodDays[0]}–{cropResult.crop.growingPeriodDays[1]} days</div>

          {/* Score bar */}
          <div className="h-1.5 rounded-full bg-[#f0ede8] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: rank * 0.08 + 0.3 }}
            />
          </div>
        </div>

        {/* Score */}
        <div className="flex-shrink-0 text-right">
          <div className="text-xl font-black" style={{ color }}>{score}%</div>
          <div className="text-[10px] text-[#9ca3af] font-medium">match</div>
        </div>

        <ChevronRight size={16} className="text-[#d5d2cb] group-hover:text-[#4a7c59] transition-colors" />
      </div>
    </motion.button>
  );
}

// Crop detail modal
function CropDetail({ cropResult, onClose }: { cropResult: CropResult; onClose: () => void }) {
  const { crop, score, breakdown, reasons, warnings } = cropResult;

  const radarData = [
    { subject: 'pH', value: breakdown.ph },
    { subject: 'Nitrogen', value: breakdown.nitrogen },
    { subject: 'Phosphorus', value: breakdown.phosphorus },
    { subject: 'Potassium', value: breakdown.potassium },
    { subject: 'Moisture', value: breakdown.moisture },
    { subject: 'Temperature', value: breakdown.temperature },
    { subject: 'Rainfall', value: breakdown.rainfall },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 200 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-[#f0ede8] px-6 py-4 flex items-center gap-4 z-10">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f5f4f0] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{crop.icon}</span>
            <div>
              <h3 className="font-bold text-[#1a2e1a] text-lg">{crop.name}</h3>
              <p className="text-xs text-[#9ca3af]">{crop.category}</p>
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-2xl font-black text-[#4a7c59]">{score}%</div>
            <div className="text-[10px] text-[#9ca3af] font-medium">Compatibility</div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Optimal pH', value: `${crop.phRange[0]}–${crop.phRange[1]}` },
              { label: 'Temperature', value: `${crop.temperatureRange[0]}–${crop.temperatureRange[1]}°C` },
              { label: 'Water Need', value: crop.waterRequirement.charAt(0).toUpperCase() + crop.waterRequirement.slice(1) },
              { label: 'Growing Period', value: `${crop.growingPeriodDays[0]}–${crop.growingPeriodDays[1]} days` },
              { label: 'Risk Level', value: crop.riskLevel.charAt(0).toUpperCase() + crop.riskLevel.slice(1) },
              { label: 'Category', value: crop.category },
            ].map((spec) => (
              <div key={spec.label} className="rounded-xl p-3 border border-[#f0ede8] bg-[#fafaf8]">
                <div className="text-xs text-[#9ca3af] font-medium mb-1">{spec.label}</div>
                <div className="text-sm font-bold text-[#1a2e1a]">{spec.value}</div>
              </div>
            ))}
          </div>

          {/* Radar chart */}
          <div>
            <h4 className="text-sm font-bold text-[#1a2e1a] mb-3">Compatibility Breakdown</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#f0ede8" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Radar name="Score" dataKey="value" stroke="#4a7c59" fill="#4a7c59" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Why this crop */}
          {reasons.length > 0 && (
            <div className="rounded-xl p-4 border border-[#d4edda] bg-[#f0f9f0]">
              <h4 className="text-sm font-bold text-[#1a2e1a] flex items-center gap-2 mb-3">
                <CheckCircle size={16} className="text-[#4a7c59]" />
                Why This Crop?
              </h4>
              <ul className="space-y-2">
                {reasons.map((r, i) => (
                  <li key={i} className="text-sm text-[#3a5a3a] leading-relaxed flex gap-2">
                    <span className="text-[#4a7c59] flex-shrink-0 mt-0.5">·</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="rounded-xl p-4 border border-[#fde8c8] bg-[#fdf8f0]">
              <h4 className="text-sm font-bold text-[#92400e] flex items-center gap-2 mb-3">
                <AlertTriangle size={16} />
                Points to Consider
              </h4>
              <ul className="space-y-2">
                {warnings.map((w, i) => (
                  <li key={i} className="text-sm text-[#7a4a1a] leading-relaxed flex gap-2">
                    <span className="flex-shrink-0 mt-0.5">·</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          <div className="rounded-xl p-4 border border-[#f0ede8] bg-[#fafaf8]">
            <h4 className="text-sm font-bold text-[#1a2e1a] flex items-center gap-2 mb-2">
              <Info size={16} className="text-[#8b7355]" />
              About {crop.name}
            </h4>
            <p className="text-sm text-[#6b7280] leading-relaxed">{crop.description}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Soil intelligence panel
function SoilPanel({ result }: { result: AnalysisResult }) {
  const { soilAnalysis } = result;

  const phColors: Record<string, string> = {
    'very-acidic': '#ef4444',
    'acidic': '#f97316',
    'slightly-acidic': '#a3e635',
    'neutral': '#4a7c59',
    'slightly-alkaline': '#6aab7a',
    'alkaline': '#f97316',
    'very-alkaline': '#ef4444',
  };

  const phLabels: Record<string, string> = {
    'very-acidic': 'Very Acidic',
    'acidic': 'Acidic',
    'slightly-acidic': 'Slightly Acidic',
    'neutral': 'Neutral',
    'slightly-alkaline': 'Slightly Alkaline',
    'alkaline': 'Alkaline',
    'very-alkaline': 'Very Alkaline',
  };

  const phColor = phColors[soilAnalysis.phStatus];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* pH Card */}
        <div className="rounded-xl p-5 border border-[#f0ede8] bg-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-[#1a2e1a]">Soil pH</h4>
            <span
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{ background: phColor + '18', color: phColor }}
            >
              {phLabels[soilAnalysis.phStatus]}
            </span>
          </div>
          <div className="text-4xl font-black mb-2" style={{ color: phColor, letterSpacing: '-0.03em' }}>
            {result.inputs.ph}
          </div>
          {/* pH scale */}
          <div className="relative h-2 rounded-full overflow-hidden mb-3"
            style={{ background: 'linear-gradient(90deg, #ef4444 0%, #f97316 25%, #a3e635 40%, #4a7c59 50%, #6aab7a 65%, #f97316 80%, #ef4444 100%)' }}>
            <div
              className="absolute top-0 w-3 h-full rounded-full bg-white border-2 border-[#1a2e1a] -translate-x-1/2"
              style={{ left: `${((result.inputs.ph - 0) / 14) * 100}%` }}
            />
          </div>
          <p className="text-xs text-[#6b7280] leading-relaxed">{soilAnalysis.phRecommendation}</p>
        </div>

        {/* Soil health */}
        <div className="rounded-xl p-5 border border-[#f0ede8] bg-white flex flex-col items-center justify-center text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Soil Health</div>
          <ScoreRing score={soilAnalysis.overallSoilScore} size={100} strokeWidth={8} color="#4a7c59" />
          <div className="mt-3 text-base font-bold text-[#1a2e1a]">{soilAnalysis.soilHealthLabel}</div>
        </div>
      </div>

      {/* Nutrient cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {soilAnalysis.nutrients.map((n) => {
          const statusColor = n.status === 'optimal' ? '#4a7c59' : n.status === 'low' ? '#ef4444' : '#f97316';
          const statusLabel = n.status === 'optimal' ? 'Optimal' : n.status === 'low' ? 'Deficient' : 'Excess';

          return (
            <div key={n.name} className="rounded-xl p-5 border border-[#f0ede8] bg-white">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-[#1a2e1a]">{n.name}</h4>
                <span
                  className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{ background: statusColor + '15', color: statusColor }}
                >
                  {statusLabel}
                </span>
              </div>
              <div className="text-3xl font-black mb-1" style={{ color: statusColor, letterSpacing: '-0.03em' }}>
                {n.value}
                <span className="text-sm font-medium text-[#9ca3af] ml-1">{n.unit}</span>
              </div>
              <p className="text-xs text-[#6b7280] leading-relaxed mt-2">{n.recommendation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Farm plan timeline
function FarmPlan({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-0">
      {result.farmPlan.map((week, i) => (
        <motion.div
          key={week.week}
          className="flex gap-5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {/* Timeline */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-base z-10 relative"
              style={{ background: 'linear-gradient(135deg, #2d4a2d, #4a7c59)' }}
            >
              {week.icon}
            </div>
            {i < result.farmPlan.length - 1 && (
              <div className="w-px flex-1 my-1" style={{ background: 'linear-gradient(180deg, #4a7c59 0%, #e5e3de 100%)', minHeight: 24 }} />
            )}
          </div>

          {/* Content */}
          <div className="pb-6 flex-1">
            <div className="text-xs font-bold text-[#4a7c59] uppercase tracking-wider mb-0.5">{week.week}</div>
            <h4 className="font-bold text-[#1a2e1a] text-base mb-1">{week.label}</h4>
            <p className="text-sm text-[#6b7280] font-medium mb-1.5">{week.activity}</p>
            <p className="text-xs text-[#9ca3af] leading-relaxed">{week.details}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Rotation section
function RotationView({ result }: { result: AnalysisResult }) {
  const rotationColors = ['#4a7c59', '#8b7355', '#2d4a2d'];

  return (
    <div className="space-y-4">
      {result.rotationSuggestions.map((s, i) => (
        <motion.div
          key={s.season}
          className="rounded-xl p-5 border border-[#f0ede8] bg-white flex gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div
            className="w-2 rounded-full flex-shrink-0"
            style={{ background: rotationColors[i % rotationColors.length] }}
          />
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: rotationColors[i % rotationColors.length] }}>
              {s.label}
            </div>
            <h4 className="font-bold text-[#1a2e1a] text-base mb-1">{s.crop}</h4>
            <p className="text-sm text-[#6b7280] leading-relaxed">{s.reason}</p>
          </div>
          {i < result.rotationSuggestions.length - 1 && (
            <div className="flex-shrink-0 self-end text-[#d5d2cb]">↓</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'crops', label: 'Crop Ranking' },
  { id: 'simulator', label: '3D Simulator', icon: true },
  { id: 'soil', label: 'Soil Intelligence' },
  { id: 'plan', label: 'Farm Plan' },
  { id: 'rotation', label: 'Crop Rotation' },
];

export default function ResultsDashboard({ result, onReset }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCrop, setSelectedCrop] = useState<CropResult | null>(null);

  const barData = result.cropResults.slice(0, 6).map((c) => ({
    name: c.crop.name,
    score: c.score,
  }));

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-warm)' }}>
      {/* Header bar */}
      <div className="sticky top-[70px] z-30 border-b border-[#e5e3de]"
        style={{ background: 'rgba(250,248,243,0.9)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-3">
            <button
              className="flex items-center gap-2 text-sm font-medium text-[#6b7280] hover:text-[#1a2e1a] transition-colors"
              onClick={onReset}
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">New Analysis</span>
            </button>

            <div className="h-5 w-px bg-[#e5e3de]" />

            {/* Tabs */}
            <div className="flex gap-0.5 overflow-x-auto scrollbar-hide">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2"
                  style={{
                    background: activeTab === tab.id ? 'rgba(74,124,89,0.12)' : 'transparent',
                    color: activeTab === tab.id ? '#2d4a2d' : '#6b7280',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                  }}
                >
                  {tab.icon && <Box size={14} className={activeTab === tab.id ? 'text-[#4a7c59]' : 'text-[#9ca3af]'} />}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="section-label">Your Farm Intelligence Report</span>
          <h2 className="text-3xl lg:text-4xl font-display text-[#1a2e1a] mt-2" style={{ letterSpacing: '-0.025em' }}>
            {result.inputs.location || 'Your Farm'} Analysis
          </h2>
          <p className="text-sm text-[#9ca3af] mt-1">
            {result.inputs.farmArea} acres · {result.inputs.soilType} soil · {result.inputs.season} season
          </p>
        </motion.div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Score cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main score */}
              <div className="lg:col-span-1 rounded-2xl p-8 flex flex-col items-center text-center"
                style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 100%)' }}>
                <div className="text-xs font-bold uppercase tracking-widest text-[#a3e635] mb-4">Farm Suitability Score</div>
                <ScoreRing score={result.farmSuitabilityScore} size={140} strokeWidth={10} color="#a3e635" />
                <div className="mt-4 text-[#8ba890] text-sm">
                  {result.farmSuitabilityScore >= 80 ? 'Excellent conditions for cultivation' :
                    result.farmSuitabilityScore >= 65 ? 'Good conditions with minor adjustments' :
                    'Moderate conditions — soil amendment recommended'}
                </div>
              </div>

              {/* Sub scores */}
              <div className="lg:col-span-2 rounded-2xl p-6 bg-white border border-[#e5e3de]">
                <h3 className="text-sm font-bold text-[#1a2e1a] mb-5">Score Breakdown</h3>
                <div className="space-y-4">
                  <SubScore label="Soil Composition" value={result.soilScore} color="#4a7c59" />
                  <SubScore label="Climate Compatibility" value={result.climateScore} color="#8b7355" />
                  <SubScore label="Water Availability" value={result.waterScore} color="#2d4a2d" />
                  <SubScore label="Nutrient Profile" value={result.nutrientScore} color="#6aab7a" />
                </div>
              </div>
            </div>

            {/* Top 3 crops quick view */}
            <div>
              <h3 className="text-lg font-bold text-[#1a2e1a] mb-4">Top Recommended Crops</h3>
              <div className="space-y-3">
                {result.cropResults.slice(0, 3).map((cr) => (
                  <CropCard
                    key={cr.crop.id}
                    cropResult={cr}
                    rank={cr.rank}
                    onClick={() => setSelectedCrop(cr)}
                  />
                ))}
              </div>
              <button
                className="mt-4 text-sm font-semibold text-[#4a7c59] hover:underline"
                onClick={() => setActiveTab('crops')}
              >
                View all {result.cropResults.length} crops →
              </button>
            </div>

            {/* Bar chart */}
            <div className="rounded-2xl p-6 bg-white border border-[#e5e3de]">
              <h3 className="text-sm font-bold text-[#1a2e1a] mb-4">Crop Compatibility Overview</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={28}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      cursor={{ fill: 'rgba(74,124,89,0.05)' }}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e5e3de', fontSize: 12 }}
                      formatter={(v: any) => [`${v}%`, 'Compatibility']}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {barData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? '#4a7c59' : i === 1 ? '#6aab7a' : '#a8c8b0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* CROPS TAB */}
        {activeTab === 'crops' && (
          <motion.div key="crops" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-sm text-[#6b7280] mb-6">
              All {result.cropResults.length} crop profiles scored against your field conditions. Click any crop for detailed analysis.
            </p>
            {result.cropResults.map((cr) => (
              <CropCard
                key={cr.crop.id}
                cropResult={cr}
                rank={cr.rank}
                onClick={() => setSelectedCrop(cr)}
              />
            ))}
          </motion.div>
        )}

        {/* 3D SIMULATOR TAB */}
        {activeTab === 'simulator' && (
          <motion.div key="simulator" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#1a2e1a]">Interactive Growth Simulation</h3>
              <p className="text-sm text-[#6b7280] mt-1">
                Visualizing the 120-day growth cycle of your most recommended crop under predicted conditions.
              </p>
            </div>
            <div className="h-[500px] w-full">
              <Crop3DViewer 
                cropName={result.cropResults[0].crop.name} 
                suitabilityScore={result.cropResults[0].score} 
              />
            </div>
          </motion.div>
        )}

        {/* SOIL TAB */}
        {activeTab === 'soil' && (
          <motion.div key="soil" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#1a2e1a]">Your Soil, Decoded.</h3>
              <p className="text-sm text-[#6b7280] mt-1">
                Detailed breakdown of your soil chemistry and actionable improvement recommendations.
              </p>
            </div>
            <SoilPanel result={result} />
          </motion.div>
        )}

        {/* PLAN TAB */}
        {activeTab === 'plan' && (
          <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#1a2e1a]">Your Recommended Farm Plan</h3>
              <p className="text-sm text-[#6b7280] mt-1">
                A structured cultivation timeline tailored to your top crop recommendation and field conditions.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#e5e3de] p-6">
              <FarmPlan result={result} />
            </div>
          </motion.div>
        )}

        {/* ROTATION TAB */}
        {activeTab === 'rotation' && (
          <motion.div key="rotation" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#1a2e1a]">Plan Beyond One Harvest.</h3>
              <p className="text-sm text-[#6b7280] mt-1 max-w-xl">
                Crop rotation helps maintain soil fertility, break pest cycles, and improve long-term farm productivity. Each rotation is selected to complement the previous season.
              </p>
            </div>
            <RotationView result={result} />
          </motion.div>
        )}
      </div>

      {/* Crop detail modal */}
      <AnimatePresence>
        {selectedCrop && (
          <CropDetail cropResult={selectedCrop} onClose={() => setSelectedCrop(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
