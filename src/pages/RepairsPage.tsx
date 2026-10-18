import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Zap,
  BatteryCharging,
  Smartphone,
  Layers,
  Volume2,
  Activity,
  Wifi,
  Camera,
  Terminal,
  Droplets,
  Shield,
  Clock,
  ArrowRight
} from 'lucide-react';
import { RepairService, DeviceBrand } from '../types';
import { ServiceCard } from '../components/ServiceCard';
import { MobileRepairingBg } from '../components/MobileRepairingBg';

interface RepairsPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialCategory?: string;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Repairs' },
  { id: 'charging', label: 'Charging & Port' },
  { id: 'battery', label: 'Battery & Backup' },
  { id: 'display', label: 'Screen & Touch' },
  { id: 'audio', label: 'Speaker & Mic' },
  { id: 'power', label: 'Motherboard & Dead' },
  { id: 'network', label: 'SIM & Wi-Fi' },
  { id: 'camera', label: 'Camera & Sensor' },
  { id: 'software', label: 'Firmware & OS' },
  { id: 'additional', label: 'Water Damage & Body' }
];

export const RepairsPage: React.FC<RepairsPageProps> = ({ onNavigate, initialCategory }) => {
  const [services, setServices] = useState<RepairService[]>([]);
  const [brands, setBrands] = useState<DeviceBrand[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    let url = '/api/repairs/services?';
    if (selectedCategory !== 'all') {
      url += `category=${selectedCategory}&`;
    }
    if (searchQuery.trim()) {
      url += `search=${encodeURIComponent(searchQuery)}&`;
    }

    Promise.all([
      fetch(url).then(res => res.json()),
      fetch('/api/repairs/brands').then(res => res.json())
    ])
      .then(([serviceData, brandData]) => {
        setServices(serviceData.services || []);
        setBrands(brandData.brands || []);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Header with Animated Repairing Background */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-sky-500/10 via-slate-50 to-white dark:from-sky-950/30 dark:via-slate-900/40 dark:to-slate-900/20 p-8 sm:p-12 border border-slate-200/80 dark:border-slate-800">
        <MobileRepairingBg intensity="subtle" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5 text-sky-500" />
            <span>Professional Mobile Repair Laboratory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Smartphone Repair Services in Nepal
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            From micro-soldering BGA ICs to optical screen refurbishing, our certified technicians repair Apple iPhone, Samsung, Xiaomi, Realme, Vivo, and OnePlus devices with genuine components.
          </p>

          {/* Live Search Input */}
          <div className="max-w-xl mx-auto relative pt-2">
            <input
              type="text"
              placeholder="Search symptoms: e.g. green line, fake charging, water drop, no service..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-sky-500 shadow-md"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-5" />
          </div>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start lg:justify-center">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={s => onNavigate('book-repair', { serviceCategory: s.category, serviceTitle: s.title })}
              onDiagnose={s => onNavigate('service-detail', { slug: s.slug })}
              onViewDetails={s => onNavigate('service-detail', { slug: s.slug })}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <Wrench className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No matching repair services found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Try typing a general problem or contact us directly on WhatsApp for custom diagnostic inspection.
          </p>
          <button
            onClick={() => onNavigate('book-repair')}
            className="mt-4 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold"
          >
            Book Free Diagnostic Check
          </button>
        </div>
      )}

      {/* Device Brand Coverage Banner */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
          Supported Device Brands in Nepal:
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          We stock original assemblies, flex cables, and PMICs for all popular smartphone flagships and budget kings.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {brands.map(brand => (
            <div
              key={brand.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center"
            >
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{brand.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{brand.models.length} popular models</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
