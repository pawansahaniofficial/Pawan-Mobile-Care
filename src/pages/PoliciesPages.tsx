import React, { useState } from 'react';
import { ShieldCheck, FileText, RotateCcw, Wrench } from 'lucide-react';

interface PoliciesPagesProps {
  initialTab?: string;
}

export const PoliciesPages: React.FC<PoliciesPagesProps> = ({ initialTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
          Transparency & Legal Terms
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Shop Policies & Warranty Guidelines
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 justify-center">
        {[
          { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
          { id: 'terms', label: 'Terms & Conditions', icon: FileText },
          { id: 'refund', label: 'Return & Refund', icon: RotateCcw },
          { id: 'warranty', label: 'Repair Warranty Policy', icon: Wrench }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Panes */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-md text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Customer Privacy & Data Protection</h2>
            <p>
              At Pawan Mobile Repairing Center, customer privacy is paramount. When you bring your smartphone for hardware diagnosis or repair:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li><strong>Zero Unauthorized Access:</strong> Technicians are strictly prohibited from browsing, opening, or copying customer gallery photos, private messages, or files.</li>
              <li><strong>Passcode Policy:</strong> Whenever possible, we conduct preliminary hardware checks with the device unlocked in your presence, or test components without requesting lockscreen passcodes.</li>
              <li><strong>Transactional SMS:</strong> Your phone number is strictly used for order updates and repair tracking alerts. We never sell your contact info to third-party telemarketers.</li>
            </ul>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Terms & Conditions of Service</h2>
            <p>
              By booking an appointment or purchasing accessories at Pawan Mobile Repairing Center:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li>Repair estimates given before full microscopic teardown are advisory starting rates and subject to confirmation upon internal inspection.</li>
              <li>Liquid damaged (water-soaked) devices may have latent oxidation faults; we revive the motherboard to the highest extent possible, but unrevivable chips are not charged for repair labor.</li>
              <li>Devices not claimed within 90 days after 'Ready for Pickup' SMS alerts may be recycled according to municipal e-waste guidelines.</li>
            </ul>
          </div>
        )}

        {activeTab === 'refund' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Accessories Return & Refund Policy</h2>
            <p>
              We want you to be 100% satisfied with your mobile accessories purchases in Nepal:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li><strong>7-Day Replacement Guarantee:</strong> If a charging cable, adapter, power bank, or earphone arrives defective, we provide an immediate free replacement.</li>
              <li><strong>Proof of Purchase:</strong> Please present your invoice or order number for replacement processing.</li>
              <li>Tempered glass screen protectors must be unpeeled for return eligibility.</li>
            </ul>
          </div>
        )}

        {activeTab === 'warranty' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Repair Warranty Standards</h2>
            <p>
              We stand behind our micro-soldering and hardware craftsmanship:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li><strong>Display & Touch:</strong> 180 Days Touch Digitizer warranty on original AMOLED / IPS combo assemblies (does not cover physical glass shattering or deep liquid immersion after handover).</li>
              <li><strong>Battery Replacements:</strong> 6 Months shop replacement warranty against swelling or capacity degradation below 80%.</li>
              <li><strong>Charging Ports & IC:</strong> 90 Days warranty on micro-soldered SMD connectors.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
