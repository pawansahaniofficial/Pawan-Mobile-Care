import React from 'react';
import {
  Smartphone,
  Wrench,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  ShieldCheck,
  Zap,
  CreditCard
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-24 lg:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white shadow-md">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white tracking-tight">
                  PAWAN MOBILE <span className="text-sky-400">REPAIRING CENTER</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Your Trusted Mobile Repair & Accessories Partner in Nepal
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Professional smartphone micro-soldering, OLED screen replacements, original battery installs, and genuine mobile accessories with nationwide fast shipping across Nepal.
            </p>

            {/* Official Nepal Payment Badges */}
            <div className="pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Supported Nepal Payment Gateways:
              </p>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-lg bg-emerald-950 border border-emerald-800/80 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>eSewa ePay</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-purple-950 border border-purple-800/80 text-purple-400 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span>Khalti</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold">
                  Cash on Delivery
                </div>
              </div>
            </div>
          </div>

          {/* Repair Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Repair Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('repairs', { category: 'display' })}
                  className="hover:text-sky-400 transition-colors text-left"
                >
                  Screen & OLED Replacement
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('repairs', { category: 'battery' })}
                  className="hover:text-sky-400 transition-colors text-left"
                >
                  Battery Replacement & Backup
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('repairs', { category: 'charging' })}
                  className="hover:text-sky-400 transition-colors text-left"
                >
                  Charging Port & Pin Repair
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('repairs', { category: 'power' })}
                  className="hover:text-sky-400 transition-colors text-left"
                >
                  Motherboard Micro-soldering
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('repairs', { category: 'additional' })}
                  className="hover:text-sky-400 transition-colors text-left"
                >
                  Water Damage Chemical Wash
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('repairs', { category: 'camera' })}
                  className="hover:text-sky-400 transition-colors text-left"
                >
                  Camera Lens & Sensor Swap
                </button>
              </li>
            </ul>
          </div>

          {/* Accessories Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Accessories Store
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'Chargers' })}
                  className="hover:text-sky-400 transition-colors text-left"
                >
                  Fast Chargers & PD Adapters
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'Earphones' })}
                  className="hover:text-sky-400 transition-colors text-left"
                >
                  TWS Wireless & Type-C Earphones
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'Headphones' })}
                  className="hover:text-sky-400 transition-colors text-left"
                >
                  Over-Ear Bluetooth Headphones
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'Bluetooth Speakers' })}
                  className="hover:text-sky-400 transition-colors text-left"
                >
                  IPX7 Waterproof Speakers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'Data Cables' })}
                  className="hover:text-sky-400 transition-colors text-left"
                >
                  Braided 100W Fast Cables
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop', { category: 'Additional Accessories' })}
                  className="hover:text-sky-400 transition-colors text-left"
                >
                  Power Banks & Tempered Glass
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Support & Shop Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Shop Details & Hours
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Main Commercial Road, Biratnagar / Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+9779812345678" className="hover:text-white font-mono">
                  +977-9812345678
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Sun - Fri: 9 AM - 8 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>contact@pawanmobile.com</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={() => onNavigate('admin-login')}
                className="text-[11px] text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Shop Owner / Staff Login</span>
              </button>
            </div>
          </div>
        </div>

        {/* Legal Policies & Copyright Row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} Pawan Mobile Repairing Center. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('policies', { tab: 'privacy' })}
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('policies', { tab: 'terms' })}
              className="hover:text-slate-300 transition-colors"
            >
              Terms & Conditions
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('policies', { tab: 'refund' })}
              className="hover:text-slate-300 transition-colors"
            >
              Return & Refund Policy
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('policies', { tab: 'warranty' })}
              className="hover:text-slate-300 transition-colors"
            >
              Repair Warranty Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
