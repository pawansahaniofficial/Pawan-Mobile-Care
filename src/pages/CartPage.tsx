import React, { useState } from 'react';
import { Trash2, ShoppingBag, ArrowRight, Tag, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryCharge,
    discount,
    total,
    coupon,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponInput.trim());
    setCouponLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto shadow-md">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Your Cart is Empty
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Explore genuine mobile accessories like 65W GaN chargers, braided cables, and power banks.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="mt-4 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
        >
          Explore Accessories Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {items.length} unique accessories selected
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md divide-y divide-slate-100 dark:divide-slate-800">
          {items.map(item => (
            <div key={item.product.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                  {item.product.brand} · {item.product.category}
                </p>
                <h3
                  onClick={() => onNavigate('product-detail', { slug: item.product.slug, id: item.product.id })}
                  className="text-sm font-bold text-slate-900 dark:text-white truncate hover:text-sky-600 cursor-pointer"
                >
                  {item.product.name}
                </h3>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 mt-1">
                  NPR {item.product.price.toLocaleString()}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 shrink-0">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="px-2.5 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  -
                </button>
                <span className="px-2.5 py-1 text-xs font-bold font-mono">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="px-2.5 py-1 text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  +
                </button>
              </div>

              {/* Total for item & Delete */}
              <div className="text-right shrink-0">
                <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  NPR {(item.product.price * item.quantity).toLocaleString()}
                </p>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1 mt-1 cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 sticky top-24">
          <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Order Summary
          </h3>

          {/* Coupon Box */}
          <div>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Promo Code (PAWAN100)"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value)}
                className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase focus:outline-hidden focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={couponLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Apply
              </button>
            </form>

            {coupon && (
              <div className="flex items-center justify-between mt-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300">
                <span>Code <strong>{coupon.code}</strong> applied (-NPR {coupon.discount})</span>
                <button onClick={removeCoupon} className="text-slate-400 hover:text-rose-500 font-bold ml-2">
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Line Calculation */}
          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                NPR {subtotal.toLocaleString()}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Coupon Discount:</span>
                <span className="font-mono font-bold">-NPR {discount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span>Standard Delivery:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {deliveryCharge === 0 ? (
                  <span className="text-emerald-600 font-semibold">FREE (Order &gt; NPR 2,000)</span>
                ) : (
                  `NPR ${deliveryCharge}`
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline text-base font-extrabold text-slate-900 dark:text-white">
              <span>Total Payable:</span>
              <span className="text-xl font-mono text-sky-600 dark:text-sky-400">
                NPR {total.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('checkout')}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>eSewa & Khalti Secure Sandbox Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};
