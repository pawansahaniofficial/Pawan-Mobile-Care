import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Building,
  CheckCircle2,
  ArrowRight,
  Lock,
  Phone,
  Mail,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

interface CheckoutPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { items, subtotal, deliveryCharge, discount, total, coupon, clearCart } = useCart();
  const { user, token } = useAuth();
  const { showToast, showSmsToast } = useToast();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');

  const [street, setStreet] = useState(user?.addresses?.[0]?.street || '');
  const [city, setCity] = useState(user?.addresses?.[0]?.city || 'Kathmandu');
  const [landmark, setLandmark] = useState('');
  const [province, setProvince] = useState(user?.addresses?.[0]?.state || 'Bagmati Province');
  const [notes, setNotes] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti' | 'cod' | 'pay_at_shop'>('esewa');
  const [isProcessing, setIsProcessing] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          No items in cart for checkout
        </h2>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('error', 'Contact Required', 'Please enter your name and phone number for SMS tracking.');
      return;
    }

    if (!street.trim() || !city.trim()) {
      showToast('error', 'Address Required', 'Please specify your street address and city.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on backend (Server verifies prices & stock)
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
          shippingAddress: { street, city, landmark, province },
          paymentMethod,
          couponCode: coupon?.code,
          customerName,
          customerEmail,
          customerPhone,
          notes
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        showToast('error', 'Order Failed', orderData.error);
        setIsProcessing(false);
        return;
      }

      const order = orderData.order;

      // Notify customer via SMS Toast
      const smsMsg = `[Pawan Mobile] Thank you ${customerName}! Your order #${order.orderNumber} of NPR ${order.total.toLocaleString()} has been placed. We are preparing it for delivery.`;
      showSmsToast(customerPhone, smsMsg);

      // 2. Route according to selected payment method
      if (paymentMethod === 'esewa') {
        // Initiate eSewa payment
        const esewaRes = await fetch('/api/payments/esewa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.orderNumber,
            amount: order.total
          })
        });
        const esewaData = await esewaRes.json();

        if (esewaData.actionUrl && esewaData.fields) {
          // Construct and submit eSewa POST form
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = esewaData.actionUrl;

          Object.keys(esewaData.fields).forEach(key => {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = esewaData.fields[key];
            form.appendChild(hiddenField);
          });

          document.body.appendChild(form);
          clearCart();
          form.submit();
          return;
        }
      } else if (paymentMethod === 'khalti') {
        // Initiate Khalti payment
        const khaltiRes = await fetch('/api/payments/khalti/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.orderNumber,
            amount: order.total,
            customerInfo: { name: customerName, email: customerEmail, phone: customerPhone }
          })
        });
        const khaltiData = await khaltiRes.json();

        if (khaltiData.paymentUrl) {
          clearCart();
          window.location.href = khaltiData.paymentUrl;
          return;
        }
      }

      // COD or Pay at Shop
      clearCart();
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      onNavigate('payment-status', {
        orderId: order.orderNumber,
        provider: paymentMethod,
        status: 'pending',
        amount: order.total
      });
    } catch (err: any) {
      showToast('error', 'Checkout Error', err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <div className="max-w-xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Checkout & Shipping
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete your delivery details and choose your preferred Nepal payment method.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Delivery Address & Customer Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Contact Details */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4 text-sky-500" />
              <span>1. Contact & SMS Delivery Updates</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Ramesh Adhikari"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone (For SMS Confirmation)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+977-9841234567"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-500" />
              <span>2. Shipping Address in Nepal</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Street Address / Tole / Ward
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="e.g. Ward No. 10, New Baneshwor / Main Road, Ward 4"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City / Town
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Kathmandu / Biratnagar / Pokhara"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Province
                </label>
                <select
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Koshi Province">Koshi Province</option>
                  <option value="Madhesh Province">Madhesh Province</option>
                  <option value="Bagmati Province">Bagmati Province</option>
                  <option value="Gandaki Province">Gandaki Province</option>
                  <option value="Lumbini Province">Lumbini Province</option>
                  <option value="Karnali Province">Karnali Province</option>
                  <option value="Sudurpashchim Province">Sudurpashchim Province</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nearby Landmark / Special Instructions
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Nepal Bank, near Krishna Temple..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-sky-500" />
              <span>3. Select Payment Gateway</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* eSewa */}
              <label
                className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'esewa'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'esewa'}
                  onChange={() => setPaymentMethod('esewa')}
                  className="accent-emerald-600"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>eSewa ePay</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Official eSewa Gateway (EPAYTEST sandbox ready)
                  </p>
                </div>
              </label>

              {/* Khalti */}
              <label
                className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'khalti'
                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'khalti'}
                  onChange={() => setPaymentMethod('khalti')}
                  className="accent-purple-600"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                    <span>Khalti ePayment</span>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Official Khalti v2 API (Sandbox test keys active)
                  </p>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-sky-600"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Cash on Delivery (COD)
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pay in cash upon doorstep delivery in Nepal
                  </p>
                </div>
              </label>

              {/* Pay at Shop */}
              <label
                className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'pay_at_shop'
                    ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'pay_at_shop'}
                  onChange={() => setPaymentMethod('pay_at_shop')}
                  className="accent-sky-600"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Pay at Shop Counter
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Collect directly from our Biratnagar / KTM center
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 sticky top-24">
          <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Review & Complete
          </h3>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
            {items.map(item => (
              <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                <div className="truncate pr-2">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {item.product.name}
                  </p>
                  <p className="text-slate-400">
                    Qty: {item.quantity} × NPR {item.product.price.toLocaleString()}
                  </p>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                  NPR {(item.product.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                NPR {subtotal.toLocaleString()}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon Savings ({coupon?.code}):</span>
                <span className="font-mono">-NPR {discount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {deliveryCharge === 0 ? 'FREE' : `NPR ${deliveryCharge}`}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline text-base font-extrabold text-slate-900 dark:text-white">
              <span>Total Payable:</span>
              <span className="text-2xl font-mono text-sky-600 dark:text-sky-400">
                NPR {total.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Connecting to {paymentMethod.toUpperCase()}...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay NPR {total.toLocaleString()} & Confirm</span>
              </>
            )}
          </button>

          <div className="text-center text-[11px] text-slate-400 space-y-1">
            <p className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Nepal Merchant Verification</span>
            </p>
            <p>SMS order confirmation will be dispatched upon placement.</p>
          </div>
        </div>
      </form>
    </div>
  );
};
