import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Smartphone,
  ShieldCheck,
  Clock,
  Zap,
  Star,
  ArrowRight,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  ChevronDown,
  ShoppingBag,
  Truck,
  HelpCircle,
  Cpu,
  Layers,
  BatteryCharging
} from 'lucide-react';
import { Product, RepairService, DeviceBrand } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ServiceCard } from '../components/ServiceCard';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { CustomerReviewsSection } from '../components/CustomerReviewsSection';
import { GoogleMapSection } from '../components/GoogleMapSection';
import { MobileRepairingBg } from '../components/MobileRepairingBg';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popularServices, setPopularServices] = useState<RepairService[]>([]);
  const [brands, setBrands] = useState<DeviceBrand[]>([]);

  // Instant estimate calculator state
  const [selectedBrand, setSelectedBrand] = useState('Apple iPhone');
  const [selectedCategory, setSelectedCategory] = useState('display');
  const [calcEstimate, setCalcEstimate] = useState<any>(null);

  // FAQ open state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    // Fetch products and repair services
    Promise.all([
      fetch('/api/products?featured=true').then(res => res.json()),
      fetch('/api/repairs/services').then(res => res.json()),
      fetch('/api/repairs/brands').then(res => res.json())
    ])
      .then(([prodData, repData, brandData]) => {
        setFeaturedProducts((prodData.products || []).slice(0, 4));
        setPopularServices((repData.services || []).filter((s: RepairService) => s.isPopular).slice(0, 6));
        setBrands(brandData.brands || []);
      })
      .catch(err => console.error(err));
  }, []);

  // Update instant calculator
  useEffect(() => {
    fetch('/api/repairs/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand: selectedBrand, serviceCategory: selectedCategory })
    })
      .then(res => res.json())
      .then(data => setCalcEstimate(data))
      .catch(err => console.error(err));
  }, [selectedBrand, selectedCategory]);

  const faqs = [
    {
      q: 'How long does a mobile phone repair take at Pawan Mobile?',
      a: 'Most standard repairs like cracked screen replacements, original battery installations, and charging port pin soldering are completed within 30 to 45 minutes right in front of you.'
    },
    {
      q: 'Do you offer warranty on screen and spare parts?',
      a: 'Yes! All original display replacements come with a 180-day warranty on touch digitizer functionality. Batteries and fast charging adapters carry a 6-month shop replacement warranty.'
    },
    {
      q: 'Will my personal data, photos, and WhatsApp chats remain safe?',
      a: 'Absolutely. We practice data-safe diagnostic procedures. We never wipe or access your phone storage without your explicit written authorization.'
    },
    {
      q: 'Can I pay online using eSewa or Khalti?',
      a: 'Yes, we accept instant digital payments through eSewa, Khalti QR, mobile banking, and Cash on Delivery / Counter payment.'
    },
    {
      q: 'Do you provide doorstep pickup and delivery in Nepal?',
      a: 'Yes! If you are unable to visit our shop, you can request our door-to-door device pickup and safe courier return service.'
    }
  ];

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-500/10 via-slate-50 to-white dark:from-sky-950/30 dark:via-slate-950 dark:to-slate-950 pt-10 pb-16 lg:pt-16 lg:pb-24 px-4 sm:px-6 lg:px-8">
        {/* Animated Mobile Repairing Laboratory Background with Continuous Loop */}
        <MobileRepairingBg intensity="medium" showControls={true} />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Nepal's Premier Certified Smartphone Care Lab</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Expert Smartphone Repair &{' '}
              <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
                Genuine Accessories
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              From shattered AMOLED displays and dead motherboard short-circuits to fast GaN chargers and braided cables. Trust <strong>Pawan Mobile Repairing Center</strong> for precision diagnosis and genuine parts in Nepal.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('book-repair')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-sky-600/25 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>Book Your Repair</span>
              </button>

              <button
                onClick={() => onNavigate('shop')}
                className="px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-sky-500" />
                <span>Shop Accessories</span>
              </button>

              <button
                onClick={() => onNavigate('track-repair')}
                className="px-4 py-3.5 text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span>Track Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800/80">
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                  30 Mins
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Express Screen & Battery Swap
                </p>
              </div>

              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">
                  180 Days
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Guaranteed Part Warranty
                </p>
              </div>

              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  100%
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data-Safe Confidentiality
                </p>
              </div>
            </div>

            {/* Testimonials Trust Indicator */}
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-slate-900 dark:text-white font-mono">4.9 / 5.0</span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span>Based on verified repairs & genuine parts across Nepal</span>
            </div>
          </div>

          {/* Right Visual Phone Animation Box */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-sm aspect-4/5 rounded-3xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-800 p-1 shadow-2xl shadow-sky-500/20">
              <div className="w-full h-full rounded-[22px] bg-slate-950 p-6 flex flex-col justify-between overflow-hidden relative">
                {/* Circuit Grid pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

                {/* Status bar */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Pawan Lab OS v4.2</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    ONLINE
                  </span>
                </div>

                {/* Center Visual: Smartphone Chipset & Diagnostics */}
                <div className="relative z-10 text-center my-auto py-6">
                  <div className="relative w-28 h-28 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-400 p-0.5 shadow-xl shadow-sky-500/30">
                    <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center relative">
                      <Smartphone className="w-14 h-14 text-sky-400 animate-pulse" />
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    Diagnostic Bench Live
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Microscope BGA Soldering · AMOLED Calibration · Battery Cell Load Testing
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 border border-sky-800/50">
                      eSewa Verified
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-purple-300 border border-purple-800/50">
                      Khalti Integrated
                    </span>
                  </div>
                </div>

                {/* Bottom floating notification */}
                <div className="relative z-10 bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs flex items-center gap-3 backdrop-blur-md">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Same-Day Pickup & Delivery</p>
                    <p className="text-[11px] text-slate-400">Available in Biratnagar & Kathmandu Valley</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Repair Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Hardware & Software Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Popular Mobile Repair Services
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Select your smartphone problem to view repair steps, duration, and transparent Nepali Rupee pricing.
            </p>
          </div>

          <button
            onClick={() => onNavigate('repairs')}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View All 9 Repair Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={s => onNavigate('book-repair', { serviceCategory: s.category, serviceTitle: s.title })}
              onDiagnose={s => onNavigate('service-detail', { slug: s.slug })}
              onViewDetails={s => onNavigate('service-detail', { slug: s.slug })}
            />
          ))}
        </div>
      </section>

      {/* Featured Accessories Store Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Curated Nepali Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Featured Mobile Accessories
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Fast GaN chargers, heavy-duty cables, high-capacity power banks, and tempered protection.
            </p>
          </div>

          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Explore Entire Store</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={p => onNavigate('product-detail', { slug: p.slug, id: p.id })}
              onQuickBuy={() => onNavigate('checkout')}
            />
          ))}
        </div>
      </section>

      {/* Instant Repair Pricing Estimator Tool */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-sky-800/40 relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Transparent Estimates
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Check Repair Cost Estimate
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Choose your phone brand and the issue to instantly see the expected repair cost and duration in NPR.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Select Brand */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                1. Device Brand
              </label>
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white focus:outline-hidden focus:border-sky-500"
              >
                <option value="Apple iPhone">Apple iPhone</option>
                <option value="Samsung Galaxy">Samsung Galaxy</option>
                <option value="Xiaomi / Redmi / POCO">Xiaomi / Redmi / POCO</option>
                <option value="Realme">Realme</option>
                <option value="OnePlus">OnePlus</option>
                <option value="Vivo">Vivo</option>
                <option value="Oppo">Oppo</option>
                <option value="Google Pixel">Google Pixel</option>
              </select>
            </div>

            {/* Select Issue */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                2. Problem Category
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-medium text-white focus:outline-hidden focus:border-sky-500"
              >
                <option value="display">Display & Touch Screen Replacement</option>
                <option value="battery">Battery Drain & Replacement</option>
                <option value="charging">Charging Port & IC Repair</option>
                <option value="power">Dead Phone & Motherboard Repair</option>
                <option value="additional">Water Damage Ultrasonic Treatment</option>
                <option value="audio">Loudspeaker & Mic Repair</option>
                <option value="network">Network Signal & Wi-Fi IC</option>
                <option value="camera">Camera Module & Lens Replacement</option>
                <option value="software">Bootloop & Firmware Flash</option>
              </select>
            </div>

            {/* Instant Result Box */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Estimated Repair Cost
                </p>
                {calcEstimate ? (
                  <>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">
                      NPR {calcEstimate.minPrice?.toLocaleString()} - {calcEstimate.maxPrice?.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Est. Time: {calcEstimate.estimatedDuration}</span>
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 mt-2">Calculating...</p>
                )}
              </div>

              <button
                onClick={() => onNavigate('book-repair', { brand: selectedBrand, serviceCategory: selectedCategory })}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Book This Repair Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Before and After Repair Slider Component */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BeforeAfterSlider />
      </section>

      {/* Customer Reviews & Trust Testimonials Section */}
      <CustomerReviewsSection onNavigate={onNavigate} />

      {/* Why Choose Pawan Mobile */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Precision & Integrity
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Why Choose Pawan Mobile Repairing Center?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            We operate a specialized electronics laboratory equipped with optical microscopes, hot air rework stations, and ultrasonic cleaning baths.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Micro-Soldering & BGA Repairs
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Where other shops say "replace the motherboard", we diagnose individual shorted capacitors, charging ICs, and PMICs to save your original device and data.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Transparent Quotations & SMS
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              No hidden fees. You receive an automated SMS with your diagnosis quotation and approve or decline before technician work commences.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Fast Doorstep Courier Pickup
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Too busy to visit the shop? Schedule a pickup from your home or office. We repair, test, and safely deliver back to your hands.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - 4 Step Timeline */}
      <section className="bg-slate-50 dark:bg-slate-900/40 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Smooth Service Flow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              How Our Repair Process Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Book Appointment',
                desc: 'Pick your phone brand, describe the fault, and select an available time slot.'
              },
              {
                step: '02',
                title: 'Diagnostic Check',
                desc: 'Our technician inspects circuit health and provides an exact price quote.'
              },
              {
                step: '03',
                title: 'Customer Approval',
                desc: 'You approve the quotation online or via SMS. Zero work is done without your consent.'
              },
              {
                step: '04',
                title: 'Collect & Warranty',
                desc: 'Receive an SMS when ready for pickup. Pay via eSewa, Khalti, or Cash with warranty card.'
              }
            ].map((st, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative">
                <span className="text-3xl font-extrabold text-sky-600/20 dark:text-sky-400/20 font-mono">
                  {st.step}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-sky-500' : ''}`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Google Maps Location Section */}
      <GoogleMapSection />
    </div>
  );
};
