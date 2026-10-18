import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertCircle,
  Cpu,
  ChevronRight,
  ArrowRight,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import { RepairService, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ReviewModal } from '../components/ReviewModal';

interface ServiceDetailPageProps {
  slug: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({ slug, onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [service, setService] = useState<RepairService | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const fetchService = () => {
    setIsLoading(true);
    fetch(`/api/repairs/services/${slug}`)
      .then(res => res.json())
      .then(data => {
        setService(data.service);
        setReviews(data.reviews || []);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchService();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading repair service procedures...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Service Not Found
        </h2>
        <button
          onClick={() => onNavigate('repairs')}
          className="mt-4 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold"
        >
          View All Repair Services
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <button onClick={() => onNavigate('home')} className="hover:text-sky-600">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('repairs')} className="hover:text-sky-600">Repair Services</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-400 truncate max-w-xs">{service.title}</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-sky-800/40 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-900/60 border border-sky-700/60 text-sky-300 text-xs font-bold uppercase tracking-wider">
            <span>{service.categoryLabel}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {service.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {service.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Repair Time: <strong>{service.estimatedDuration}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Shop Warranty: <strong>180 Days</strong></span>
            </div>
            {service.reviewCount && service.reviewCount > 0 ? (
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-white">{service.rating}</span>
                <span className="text-slate-400">({service.reviewCount} reviews)</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Pricing Card */}
        <div className="lg:col-span-4 bg-slate-800/90 rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Estimated Pricing in Nepal
          </span>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
              NPR {service.estimatedPriceMin.toLocaleString()} - {service.estimatedPriceMax.toLocaleString()}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Exact quote confirmed after free physical inspection.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => onNavigate('book-repair', { serviceCategory: service.category, serviceTitle: service.title })}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Book This Repair Online</span>
            </button>

            <a
              href="https://wa.me/9779812345678"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-600 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors text-center"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ask Technician on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Diagnostic Symptoms and Causes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Symptoms */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Common Fault Symptoms:</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            {service.symptoms.map((symptom, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{symptom}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Causes */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <Cpu className="w-4 h-4" />
            <span>Underlying Causes:</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            {service.possibleCauses.map((cause, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{cause}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Repair Procedure Step-by-Step */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Laboratory Repair Procedure
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Step-by-step procedure carried out by our technician to ensure 100% functionality and data safety.
        </p>

        <div className="space-y-4">
          {service.procedure.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                {idx + 1}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {step}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews for This Service */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-500" />
              <span>Customer Reviews ({reviews.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified feedback for {service.title}
            </p>
          </div>

          <button
            onClick={() => {
              if (!user) {
                showToast('info', 'Please sign in to post a review');
                onNavigate('auth', { mode: 'login' });
              } else {
                setReviewModalOpen(true);
              }
            }}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Leave Review
          </button>
        </div>

        <div className="space-y-3">
          {reviews.length > 0 ? (
            reviews.map(rev => (
              <div
                key={rev.id}
                className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                    <span>{rev.userName}</span>
                    {rev.isVerified && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded-sm font-semibold">
                        Verified Repair
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                    />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic py-2">
              No specific reviews for this repair yet. Our past customers rate our service 4.9/5 stars!
            </p>
          )}
        </div>
      </section>

      {/* Review Modal Trigger */}
      {reviewModalOpen && (
        <ReviewModal
          targetType="repair"
          targetId={service.id}
          targetName={service.title}
          onClose={() => setReviewModalOpen(false)}
          onSuccess={() => fetchService()}
        />
      )}
    </div>
  );
};
