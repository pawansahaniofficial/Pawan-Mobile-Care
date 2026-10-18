import React, { useState, useEffect } from 'react';
import { Star, X, CheckCircle2, ShieldCheck, Sparkles, MapPin, Wrench, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Product, RepairService } from '../types';

interface ReviewModalProps {
  targetType?: 'product' | 'repair';
  targetId?: string;
  targetName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  targetType: initialTargetType,
  targetId: initialTargetId,
  targetName: initialTargetName,
  onClose,
  onSuccess
}) => {
  const { user, token } = useAuth();
  const { showToast } = useToast();

  const [targetType, setTargetType] = useState<'product' | 'repair'>(initialTargetType || 'repair');
  const [selectedId, setSelectedId] = useState<string>(initialTargetId || '');
  const [selectedName, setSelectedName] = useState<string>(initialTargetName || '');

  // Options for item picker if not preset
  const [repairServices, setRepairServices] = useState<RepairService[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.addresses?.[0]?.city || 'Biratnagar, Nepal');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If initial target wasn't provided, fetch available products and services to choose from
  useEffect(() => {
    if (!initialTargetId) {
      setIsLoadingItems(true);
      Promise.all([
        fetch('/api/repairs/services').then(r => r.json()),
        fetch('/api/products').then(r => r.json())
      ])
        .then(([servData, prodData]) => {
          const servs = servData.services || [];
          const prods = prodData.products || [];
          setRepairServices(servs);
          setProducts(prods);

          if (targetType === 'repair' && servs.length > 0 && !selectedId) {
            setSelectedId(servs[0].category || servs[0].id);
            setSelectedName(servs[0].title);
          } else if (targetType === 'product' && prods.length > 0 && !selectedId) {
            setSelectedId(prods[0].id);
            setSelectedName(prods[0].name);
          }
        })
        .catch(err => console.error('Failed to load items for review modal', err))
        .finally(() => setIsLoadingItems(false));
    }
  }, [initialTargetId]);

  // When user toggles targetType tab if item wasn't preset
  const handleTypeChange = (type: 'repair' | 'product') => {
    setTargetType(type);
    if (!initialTargetId) {
      if (type === 'repair' && repairServices.length > 0) {
        setSelectedId(repairServices[0].category || repairServices[0].id);
        setSelectedName(repairServices[0].title);
      } else if (type === 'product' && products.length > 0) {
        setSelectedId(products[0].id);
        setSelectedName(products[0].name);
      }
    }
  };

  const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    if (targetType === 'repair') {
      const found = repairServices.find(s => (s.category === id || s.id === id || s.slug === id));
      if (found) setSelectedName(found.title);
    } else {
      const found = products.find(p => p.id === id);
      if (found) setSelectedName(found.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('error', 'Review Required', 'Please share your experience in the review box.');
      return;
    }

    const finalTargetId = initialTargetId || selectedId;
    const finalTargetName = initialTargetName || selectedName;

    if (!finalTargetId) {
      showToast('error', 'Select Item', 'Please select which service or product you are reviewing.');
      return;
    }

    setIsSubmitting(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          targetType,
          targetId: finalTargetId,
          targetName: finalTargetName,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
          customerName: customerName.trim() || undefined,
          location: location.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          customerEmail: customerEmail.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', 'Submission Failed', data.error || 'Failed to submit review');
        return;
      }

      // Celebrate high rating
      if (rating >= 4) {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 }
        });
      }

      showToast('success', 'Review Published!', data.message);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', 'Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Customer Testimonial & Review
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            Share Your Experience
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your authentic review helps smartphone users across Nepal choose dependable repairs and genuine parts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Item Selector (if not preset) */}
          {!initialTargetId ? (
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange('repair')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    targetType === 'repair'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Repair Service</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('product')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    targetType === 'product'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Accessory / Product</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Choose specific {targetType === 'repair' ? 'repair service' : 'product'}:
                </label>
                {isLoadingItems ? (
                  <p className="text-xs text-slate-400">Loading catalog...</p>
                ) : targetType === 'repair' ? (
                  <select
                    value={selectedId}
                    onChange={handleItemSelect}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-sky-500"
                  >
                    {repairServices.map(s => (
                      <option key={s.id} value={s.category || s.id}>
                        {s.title} ({s.categoryLabel})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedId}
                    onChange={handleItemSelect}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — NPR {p.price?.toLocaleString()}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 text-xs text-sky-900 dark:text-sky-300 flex items-center justify-between">
              <span className="font-bold">Reviewing: {initialTargetName}</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300">
                {initialTargetType}
              </span>
            </div>
          )}

          {/* Interactive Star Rating Selector */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 text-slate-300 transition-all hover:scale-120 focus:outline-hidden cursor-pointer"
                  aria-label={`Rate ${star} stars out of 5`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-2">
              {rating === 5 && 'Outstanding - 5 Stars (Highly Recommended!)'}
              {rating === 4 && 'Very Good - 4 Stars (Great service)'}
              {rating === 3 && 'Average - 3 Stars (Satisfactory)'}
              {rating === 2 && 'Fair - 2 Stars (Needs improvement)'}
              {rating === 1 && 'Disappointing - 1 Star'}
            </p>
          </div>

          {/* Review Title / Headline */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Headline / Summary (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. iPhone 13 screen fixed like new in 40 minutes!"
              maxLength={80}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          {/* Written Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Written Testimonial <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="How was the diagnostic speed, part durability, technician communication, and warranty? Mention your phone model if applicable..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-sky-500 transition-all resize-none"
              required
            />
          </div>

          {/* Customer Details: Name & Location in Nepal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Adhikari"
                required
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-500" />
                <span>City / District</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Biratnagar / Kathmandu"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          {/* Optional Phone / Email for Verified Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number (For Verified Badge)
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="+977-98..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              If your phone or email matches an order or repair in our system, you will automatically receive a <strong>Verified Customer</strong> badge!
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Publishing Review...' : 'Submit Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
