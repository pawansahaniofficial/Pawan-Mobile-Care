import React, { useState } from 'react';

interface BeforeAfterItem {
  id: string;
  title: string;
  device: string;
  fault: string;
  repairDetails: string;
  beforeImg: string;
  afterImg: string;
}

const cases: BeforeAfterItem[] = [
  {
    id: 'case-1',
    title: 'Cracked Dynamic AMOLED Restoration',
    device: 'Samsung Galaxy S23 Ultra',
    fault: 'Spiderweb glass fracture & green line defect after concrete impact',
    repairDetails: 'Original OLED replacement + calibrated 120Hz touch & True Color restore in 45 mins',
    beforeImg: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80',
    afterImg: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'case-2',
    title: 'Water Damage & Micro-soldering Revival',
    device: 'iPhone 14 Pro Max',
    fault: 'Dropped in water, totally dead, drawing 0.00A current',
    repairDetails: 'Ultrasonic chemical wash + shorted VCC_MAIN capacitor replacement & 100% data recovered',
    beforeImg: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80532e?w=800&auto=format&fit=crop&q=80',
    afterImg: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
  }
];

export const BeforeAfterSlider: React.FC = () => {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [sliderPos, setSliderPos] = useState(50); // percentage

  const currentCase = cases[activeCaseIndex];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Real Lab Results
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            Before & After Repair Gallery
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Slide horizontally to inspect our precision hardware restoration quality.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2">
          {cases.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveCaseIndex(idx);
                setSliderPos(50);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeCaseIndex === idx
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {c.device}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Split-view Slider */}
      <div className="relative aspect-video max-h-[460px] w-full rounded-2xl overflow-hidden select-none touch-none bg-slate-950">
        {/* After Image (Full background) */}
        <img
          src={currentCase.afterImg}
          alt="Repaired phone"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute top-4 right-4 bg-emerald-600/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-md">
          AFTER (Restored)
        </div>

        {/* Before Image (Clipped by slider position) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={currentCase.beforeImg}
            alt="Damaged phone"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ width: '100%', maxWidth: 'none' }}
          />
          <div className="absolute top-4 left-4 bg-rose-600/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-md">
            BEFORE (Damaged)
          </div>
        </div>

        {/* Slider Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-2xl"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-800 shadow-xl flex items-center justify-center font-bold text-xs border-2 border-sky-600">
            ↔
          </div>
        </div>

        {/* Transparent Range Input Overlay for Dragging */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={e => setSliderPos(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
        />
      </div>

      {/* Details Box below */}
      <div className="mt-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            {currentCase.title}
          </h4>
          <p className="text-xs text-rose-500 font-medium mt-0.5">
            Reported Issue: {currentCase.fault}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            Lab Procedure: {currentCase.repairDetails}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Warranty Included
          </span>
          <p className="text-xs font-bold text-sky-600 dark:text-sky-400">
            180 Days Free Guarantee
          </p>
        </div>
      </div>
    </div>
  );
};
