import React from 'react';
import {
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
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { RepairService } from '../types';

interface ServiceCardProps {
  service: RepairService;
  onBook: (service: RepairService) => void;
  onDiagnose: (service: RepairService) => void;
  onViewDetails: (service: RepairService) => void;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
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
  Shield
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onBook,
  onDiagnose,
  onViewDetails
}) => {
  const IconComponent = iconMap[service.iconName] || Smartphone;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-sky-500/50 dark:hover:border-sky-500/50 shadow-xs hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between">
      <div>
        {/* Category Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
            <IconComponent className="w-6 h-6" />
          </div>

          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {service.categoryLabel}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium justify-end mt-0.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{service.estimatedDuration}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onViewDetails(service)}
          className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors mb-2 line-clamp-1"
        >
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {service.description}
        </p>

        {/* Symptoms Bullet Preview */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-4 space-y-1.5 border border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3 text-amber-500" />
            <span>Common Symptoms:</span>
          </p>
          <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            {service.symptoms.slice(0, 2).map((symptom, idx) => (
              <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                <span className="text-sky-500 font-bold">·</span>
                <span className="truncate">{symptom}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        {/* Estimated Pricing in NPR */}
        <div className="flex items-baseline justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mb-4">
          <span className="text-xs text-slate-500 font-medium">Estimated Cost</span>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            NPR {service.estimatedPriceMin.toLocaleString()} - {service.estimatedPriceMax.toLocaleString()}
          </span>
        </div>

        {/* Dual Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onDiagnose(service)}
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-center transition-colors cursor-pointer"
          >
            Diagnose
          </button>
          <button
            onClick={() => onBook(service)}
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <span>Book Repair</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
