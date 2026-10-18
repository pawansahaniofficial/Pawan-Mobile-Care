import React, { useState, useEffect } from 'react';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Wrench,
  ShoppingBag,
  MapPin,
  Sparkles,
  Filter,
  Search,
  ArrowRight,
  Award,
  ChevronRight,
  TrendingUp,
  CornerDownRight
} from 'lucide-react';
import { Review } from '../types';
import { ReviewModal } from './ReviewModal';
import { useToast } from '../context/ToastContext';

interface CustomerReviewsSectionProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<'all' | 'repair' | 'product' | '5star'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'helpful'>('helpful');
  const [starFilter, setStarFilter] = useState<number | null>(null);

  // Review Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [helpfulVotedIds, setHelpfulVotedIds] = useState<Record<string, boolean>>({});

  const fetchReviewsAndStats = async () => {
    setIsLoading(true);
    try {
      const [revRes, statRes] = await Promise.all([
        fetch('/api/reviews').then(r => r.json()),
        fetch('/api/reviews/stats').then(r => r.json())
      ]);
      setReviews(revRes.reviews || []);
      setStats(statRes);
    } catch (err) {
      console.error('Failed to load reviews and stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsAndStats();
  }, []);

  const handleHelpfulClick = async (reviewId: string) => {
    if (helpfulVotedIds[reviewId]) {
      showToast('info', 'Already Voted', 'You have already marked this review as helpful.');
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setHelpfulVotedIds(prev => ({ ...prev, [reviewId]: true }));
        setReviews(prev =>
          prev.map(r => (r.id === reviewId ? { ...r, helpfulCount: data.helpfulCount } : r))
        );
        showToast('success', 'Helpful Vote Recorded', 'Thank you for your feedback!');
      }
    } catch (err) {
      console.error('Error voting helpful:', err);
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter(rev => {
    // Tab filter
    if (activeTab === 'repair' && rev.targetType !== 'repair') return false;
    if (activeTab === 'product' && rev.targetType !== 'product') return false;
    if (activeTab === '5star' && rev.rating < 5) return false;

    // Star filter
    if (starFilter !== null && Math.round(rev.rating) !== starFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchComment = rev.comment?.toLowerCase().includes(q);
      const matchName = rev.userName?.toLowerCase().includes(q);
      const matchTarget = rev.targetName?.toLowerCase().includes(q);
      const matchLocation = rev.location?.toLowerCase().includes(q);
      const matchTitle = rev.title?.toLowerCase().includes(q);
      if (!matchComment && !matchName && !matchTarget && !matchLocation && !matchTitle) {
        return false;
      }
    }

    return true;
  });

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating || (b.helpfulCount || 0) - (a.helpfulCount || 0);
    } else if (sortBy === 'helpful') {
      return (b.helpfulCount || 0) - (a.helpfulCount || 0) || b.rating - a.rating;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const averageRating = stats?.averageRating || 4.9;
  const totalCount = stats?.totalReviews || reviews.length;
  const recommendationRate = stats?.recommendationRate || 99;
  const ratingDistribution = stats?.ratingDistribution || { 5: 8, 4: 1, 3: 0, 2: 0, 1: 0 };
  const ratingPercentages = stats?.ratingPercentages || { 5: 89, 4: 11, 3: 0, 2: 0, 1: 0 };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Trust Header Block */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 text-white rounded-3xl p-6 sm:p-10 border border-sky-800/40 shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold tracking-wide">
              <Award className="w-3.5 h-3.5" />
              <span>Real Customer Trust & Verified Testimonials</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Trusted by Thousands of Smartphone Users Across Nepal
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              From microscopic motherboard repair in Biratnagar to fast-couriered GaN chargers in Kathmandu and Pokhara. See what real device owners have to say about our 30-minute turnarounds, transparent pricing, and 180-day warranty.
            </p>

            {/* Quick Metrics Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">{stats?.verifiedCount || 8}+ Verified Repairs</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span className="font-semibold text-slate-200">{recommendationRate}% Recommendation Rate</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-slate-200">Koshi to Bagmati Coverage</span>
              </div>
            </div>
          </div>

          {/* Right Trust Rating Card & Breakdown */}
          <div className="lg:col-span-5 bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/80 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-mono text-white">
                    {averageRating}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(averageRating)
                          ? 'fill-amber-400'
                          : 'fill-amber-400/40 text-amber-400/40'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Based on {totalCount} authentic reviews
                </p>
              </div>

              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Write a Review</span>
              </button>
            </div>

            {/* Star Distribution Progress Bars */}
            <div className="space-y-1.5 text-xs">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = ratingDistribution[stars] || 0;
                const pct = ratingPercentages[stars] || 0;
                const isSelected = starFilter === stars;
                return (
                  <button
                    key={stars}
                    onClick={() => setStarFilter(isSelected ? null : stars)}
                    className={`w-full flex items-center gap-2 p-1 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/20 text-white font-bold'
                        : 'hover:bg-slate-700/40 text-slate-300'
                    }`}
                  >
                    <span className="w-12 text-[11px] flex items-center gap-1 font-mono">
                      <span>{stars}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-[11px] font-mono text-slate-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {starFilter !== null && (
              <div className="flex items-center justify-between text-xs text-sky-300 pt-1">
                <span>Filtering by {starFilter} star reviews</span>
                <button
                  onClick={() => setStarFilter(null)}
                  className="text-[11px] underline hover:text-white cursor-pointer"
                >
                  Clear Star Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Testimonials ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('repair')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'repair'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Phone Repairs ({stats?.repairsCount || 5})</span>
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'product'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Accessories ({stats?.productsCount || 4})</span>
          </button>
          <button
            onClick={() => setActiveTab('5star')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === '5star'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>5-Star Only</span>
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search screen, battery, city..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-sky-500 cursor-pointer"
            >
              <option value="helpful">Most Helpful</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedReviews.length > 0 ? (
          sortedReviews.map(rev => (
            <div
              key={rev.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* User Header & Verification Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        rev.userAvatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.userName)}&backgroundColor=0284c7`
                      }
                      alt={rev.userName}
                      className="w-10 h-10 rounded-full border-2 border-sky-500 object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{rev.userName}</span>
                        {rev.isVerified && (
                          <span
                            title="Verified customer who serviced phone or purchased accessory"
                            className="inline-flex items-center text-emerald-500"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-white dark:text-slate-900" />
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{rev.location || 'Nepal'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center text-amber-400 shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Target Item Badge (Clickable link to service or product) */}
                <div>
                  <button
                    onClick={() => {
                      if (rev.targetType === 'repair') {
                        onNavigate('service-detail', { slug: rev.targetId });
                      } else {
                        onNavigate('product-detail', { slug: rev.targetId, id: rev.targetId });
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer text-left ${
                      rev.targetType === 'repair'
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 hover:bg-sky-100'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    {rev.targetType === 'repair' ? (
                      <Wrench className="w-3 h-3 shrink-0" />
                    ) : (
                      <ShoppingBag className="w-3 h-3 shrink-0" />
                    )}
                    <span className="truncate max-w-[200px]">{rev.targetName}</span>
                    <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />
                  </button>
                </div>

                {/* Review Title */}
                {rev.title && (
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    "{rev.title}"
                  </h5>
                )}

                {/* Review Comment Text */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rev.comment}
                </p>

                {/* Admin / Technician Reply (if available) */}
                {rev.adminReply && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                    <p className="font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1">
                      <CornerDownRight className="w-3 h-3" />
                      <span>Response from Pawan Mobile Tech Lab:</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 italic pl-4">
                      "{rev.adminReply}"
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom footer: Date & Helpful button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] font-mono">
                  {new Date(rev.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>

                <button
                  onClick={() => handleHelpfulClick(rev.id)}
                  disabled={helpfulVotedIds[rev.id]}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    helpfulVotedIds[rev.id]
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <ThumbsUp className={`w-3 h-3 ${helpfulVotedIds[rev.id] ? 'fill-emerald-500' : ''}`} />
                  <span>Helpful ({rev.helpfulCount || 0})</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No testimonials match your filter
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or filter tabs to see verified feedback from other phone owners.
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
                setStarFilter(null);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Bottom Share Your Experience CTA Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5 text-center sm:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200">
            Have You Visited Pawan Mobile or Ordered Online?
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold">
            Your Feedback Strengthens Smartphone Care Across Nepal
          </h3>
          <p className="text-xs text-sky-100 max-w-xl">
            Whether we replaced your iPhone OLED screen, solved a dead motherboard capacitor, or delivered a fast GaN charger, rate your technician experience in under 1 minute.
          </p>
        </div>

        <button
          onClick={() => setIsReviewModalOpen(true)}
          className="px-6 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-extrabold shadow-lg transition-transform hover:scale-105 shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>Write a Testimonial Now</span>
        </button>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <ReviewModal
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={() => fetchReviewsAndStats()}
        />
      )}
    </section>
  );
};
