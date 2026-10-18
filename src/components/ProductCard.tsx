import React from 'react';
import { ShoppingCart, Heart, Star, Check, Zap } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickBuy?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onQuickBuy }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-sky-500/50 dark:hover:border-sky-500/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image Box */}
      <div
        onClick={() => onSelect(product)}
        className="relative w-full aspect-square bg-slate-100 dark:bg-slate-950 overflow-hidden cursor-pointer"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Tag */}
        {product.discountPercentage && product.discountPercentage > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            -{product.discountPercentage}%
          </span>
        )}

        {/* Stock Badge */}
        {isOutOfStock ? (
          <span className="absolute bottom-2.5 left-2.5 bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
            Out of Stock
          </span>
        ) : product.stock <= 5 ? (
          <span className="absolute bottom-2.5 left-2.5 bg-amber-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
            Only {product.stock} left
          </span>
        ) : null}

        {/* Wishlist Heart Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors shadow-xs cursor-pointer"
          title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'text-rose-500 fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata: clean unboxed text */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 truncate">
            <span>{product.brand}</span>
            <span>·</span>
            <span className="truncate">{product.category}</span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onSelect(product)}
            className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 line-clamp-2 leading-snug cursor-pointer transition-colors mb-2"
          >
            {product.name}
          </h3>

          {/* Ratings row */}
          {product.reviewCount > 0 ? (
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="flex items-center text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 ml-1">
                  {product.rating}
                </span>
              </div>
              <span className="text-xs text-slate-400">({product.reviewCount} reviews)</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 mb-2.5">Authentic Nepali Retail</div>
          )}
        </div>

        <div>
          {/* Price & Savings in Nepali Rupees */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-slate-950 dark:text-white font-mono tracking-tight">
              NPR {product.price.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through font-mono">
                NPR {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Actions: Add to Cart & Buy Now */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addToCart(product, 1)}
              disabled={isOutOfStock}
              className="w-full py-2 px-2 rounded-xl border border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>

            <button
              onClick={() => {
                addToCart(product, 1);
                if (onQuickBuy) onQuickBuy(product);
              }}
              disabled={isOutOfStock}
              className="w-full py-2 px-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
