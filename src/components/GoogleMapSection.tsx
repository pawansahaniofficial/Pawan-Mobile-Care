import React from 'react';
import { MapPin, Navigation, Phone, MessageCircle, Clock, Mail, ExternalLink } from 'lucide-react';
import { ShopSettings } from '../types';

interface GoogleMapSectionProps {
  settings?: ShopSettings;
}

export const GoogleMapSection: React.FC<GoogleMapSectionProps> = ({ settings }) => {
  const shopAddress = settings?.address || 'Main Commercial Road, Biratnagar / Kathmandu, Nepal';
  const phone = settings?.phone || '+977-9812345678';
  const whatsapp = settings?.whatsapp || '+977-9812345678';
  const email = settings?.email || 'contact@pawanmobile.com';
  const openingHours = settings?.openingHours || 'Sun - Fri: 9:00 AM - 8:00 PM | Sat: 10:00 AM - 5:00 PM';
  const embedUrl = settings?.googleMapsEmbed || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.748174577821!2d85.3123293751795!3d27.70191297618247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19a0a86db9d1%3A0xe54e2c84236a1005!2sKathmandu%2044600!5e0!3m2!1sen!2snp!4v1710000000000!5m2!1sen!2snp';
  const directionsUrl = settings?.googleMapsDirectionsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopAddress)}`;

  return (
    <section className="bg-slate-50 dark:bg-slate-900/40 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Visit Our Lab
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            Shop Location & Service Center
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Walk in for instant smartphone diagnosis, screen replacement, or genuine mobile accessories pickup.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-sky-500" />
                  <span>Pawan Mobile Repairing Center</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed pl-7">
                  {shopAddress}
                </p>
              </div>

              <div className="space-y-4 pl-7 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-200">
                      Opening Hours:
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      {openingHours}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-200">
                      Customer Helpline:
                    </p>
                    <a
                      href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                      className="text-sky-600 dark:text-sky-400 hover:underline font-mono"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-200">
                      WhatsApp Instant Chat:
                    </p>
                    <a
                      href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-mono"
                    >
                      {whatsapp}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-200">
                      Email Inquiries:
                    </p>
                    <a
                      href={`mailto:${email}`}
                      className="text-slate-600 dark:text-slate-400 hover:underline"
                    >
                      {email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Direction CTA Buttons */}
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 mt-6">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all text-center"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
              </a>

              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Namaste Pawan Mobile, I have an inquiry about mobile repair.')}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all text-center"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>

          {/* Embedded Map */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl min-h-[360px] relative">
            <iframe
              title="Pawan Mobile Repairing Center Location"
              src={embedUrl}
              className="w-full h-full min-h-[380px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl p-2 px-3 border border-slate-200 dark:border-slate-700 shadow-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pointer-events-auto">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
