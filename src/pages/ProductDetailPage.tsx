import React, { useState, useEffect } from 'react';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  ShoppingCart,
  Zap,
  Check,
  ChevronRight,
  Share2,
  MessageSquare,
  ThumbsUp,
  MapPin,
  CornerDownRight
} from 'lucide-react';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/ProductCard';
import { ReviewModal } from '../components/ReviewModal';

interface ProductDetailPageProps {
  idOrSlug: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ idOrSlug, onNavigate }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const fetchProduct = () => {
    setIsLoading(true);
    fetch(`/api/products/${idOrSlug}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data.product);
        setReviews(data.reviews || []);
        setRelated(data.related || []);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [idOrSlug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading product specs...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Product Not Found
        </h2>
        <button
          onClick={() => onNavigate('shop')}
          className="mt-4 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold"
        >
          Return to Accessories Store
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <button onClick={() => onNavigate('home')} className="hover:text-sky-600">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('shop')} className="hover:text-sky-600">Accessories</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-400 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
            <img
              src={product.images[selectedImgIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.discountPercentage && product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md">
                -{product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImgIndex === idx
                      ? 'border-sky-500 ring-2 ring-sky-500/20'
                      : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info Column */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 mb-1">
              <span>{product.brand}</span>
              <span>·</span>
              <span>{product.category}</span>
              {product.subCategory && <span>· {product.subCategory}</span>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Ratings & SKU */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400 mr-1" />
                <span className="font-bold text-slate-800 dark:text-slate-200">{product.rating}</span>
                <span className="text-slate-400 ml-1">({product.reviewCount} customer reviews)</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="font-mono text-slate-500 dark:text-slate-400">SKU: {product.sku}</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className={`font-semibold ${isOutOfStock ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock} units)`}
              </span>
            </div>
          </div>

          {/* Pricing Box in NPR */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              NPR {product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-slate-400 line-through font-mono">
                NPR {product.originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-xs text-emerald-600 font-semibold ml-auto">
              Inclusive of Nepal VAT & Taxes
            </span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* Key Features */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Key Specifications:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Compatibility */}
          {product.compatibility && product.compatibility.length > 0 && (
            <div className="bg-sky-50 dark:bg-sky-950/40 rounded-xl p-3 border border-sky-100 dark:border-sky-900 text-xs text-sky-800 dark:text-sky-300">
              <span className="font-bold">Verified Compatible With: </span>
              <span>{product.compatibility.join(', ')}</span>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quantity:</span>
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-bold font-mono min-w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={isOutOfStock}
                className="sm:col-span-1 py-3 px-4 rounded-xl border-2 border-sky-600 text-sky-600 dark:text-sky-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors cursor-pointer disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={() => {
                  addToCart(product, quantity);
                  onNavigate('checkout');
                }}
                disabled={isOutOfStock}
                className="sm:col-span-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now</span>
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`sm:col-span-1 py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isFavorited
                    ? 'border-rose-500 text-rose-500 bg-rose-50 dark:bg-rose-950/30'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isFavorited ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>
          </div>

          {/* Shop Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-5 h-5 text-sky-500" />
              <span>{product.warranty}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-5 h-5 text-emerald-500" />
              <span>Free Delivery Over NPR 2000</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-5 h-5 text-amber-500" />
              <span>7-Day Replacement Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-500" />
              <span>Customer Reviews & Ratings ({reviews.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified feedback from Nepali customers who bought this accessory.
            </p>
          </div>

          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            Leave a Review
          </button>
        </div>

        {/* Reviews List */}
        <div className="mt-6 space-y-4">
          {reviews.length > 0 ? (
            reviews.map(rev => (
              <div
                key={rev.id}
                className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.userName)}&backgroundColor=0284c7`}
                      alt={rev.userName}
                      className="w-9 h-9 rounded-full border border-sky-500 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {rev.userName}
                        </span>
                        {rev.location && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{rev.location}</span>
                          </span>
                        )}
                        {rev.isVerified && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded-sm font-semibold">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-amber-400 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {rev.title && (
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 pl-12">
                    "{rev.title}"
                  </p>
                )}

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-12">
                  {rev.comment}
                </p>

                {rev.adminReply && (
                  <div className="ml-12 p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1">
                      <CornerDownRight className="w-3 h-3" />
                      <span>Response from Technician:</span>
                    </span>
                    <p className="pl-4 mt-0.5 italic">"{rev.adminReply}"</p>
                  </div>
                )}

                <div className="pl-12 pt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/reviews/${rev.id}/helpful`, { method: 'POST' });
                        if (res.ok) {
                          fetchProduct();
                          showToast('success', 'Helpful Vote Recorded');
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Helpful ({rev.helpfulCount || 0})</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic py-4">
              No customer reviews yet. Be the first to share your experience with this item!
            </p>
          )}
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Recommended Related Accessories
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {related.map(rel => (
              <ProductCard
                key={rel.id}
                product={rel}
                onSelect={p => onNavigate('product-detail', { slug: p.slug, id: p.id })}
                onQuickBuy={() => onNavigate('checkout')}
              />
            ))}
          </div>
        </section>
      )}

      {/* Review Modal Trigger */}
      {reviewModalOpen && (
        <ReviewModal
          targetType="product"
          targetId={product.id}
          targetName={product.name}
          onClose={() => setReviewModalOpen(false)}
          onSuccess={() => fetchProduct()}
        />
      )}
    </div>
  );
};
