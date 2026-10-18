import React, { useState, useEffect } from 'react';
import {
  User,
  PackageCheck,
  Wrench,
  Heart,
  MapPin,
  Bell,
  LogOut,
  FileText,
  Star,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Plus,
  Trash2,
  ShoppingCart
} from 'lucide-react';
import { Order, RepairBooking, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { InvoiceModal } from '../components/InvoiceModal';

interface CustomerDashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialTab?: string;
}

export const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({ onNavigate, initialTab }) => {
  const { user, token, logout, updateProfile } = useAuth();
  const { wishlistProducts, removeFromWishlist, addAllToCart } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab || 'orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<RepairBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [smsEnabled, setSmsEnabled] = useState(user?.smsNotificationsEnabled !== false);

  // Address modal/form
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('Kathmandu');
  const [newState, setNewState] = useState('Bagmati Province');
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Selected for Invoice Print
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | undefined>(undefined);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<RepairBooking | undefined>(undefined);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);

    Promise.all([
      fetch('/api/orders/my-orders', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/bookings/my-bookings', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ])
      .then(([orderData, bookingData]) => {
        setOrders(orderData.orders || []);
        setBookings(bookingData.bookings || []);
      })
      .catch(e => console.error(e))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      phone,
      smsNotificationsEnabled: smsEnabled
    });
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet.trim()) return;

    const currentAddresses = user?.addresses || [];
    const newAddr = {
      id: 'addr-' + Date.now(),
      label: currentAddresses.length === 0 ? 'Home' : 'Delivery Address',
      street: newStreet.trim(),
      city: newCity.trim(),
      state: newState,
      isDefault: currentAddresses.length === 0
    };

    const success = await updateProfile({
      addresses: [...currentAddresses, newAddr]
    });

    if (success) {
      setNewStreet('');
      setShowAddressForm(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Account Login Required
        </h2>
        <p className="text-xs text-slate-500">
          Please sign in to access your order history, repair jobs, and saved wishlist.
        </p>
        <button
          onClick={() => onNavigate('auth', { mode: 'login' })}
          className="px-6 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <img
            src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=0284c7`}
            alt={user.name}
            className="w-16 h-16 rounded-2xl border-2 border-sky-500 shadow-md object-cover"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {user.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {user.email} {user.phone && `· ${user.phone}`}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                Pawan Mobile Club Member
              </span>
              {user.smsNotificationsEnabled !== false && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <span>SMS Alerts Active</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Tabs */}
        <aside className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <PackageCheck className="w-4 h-4" />
              <span>My Orders</span>
            </div>
            <span className="font-mono text-[11px] opacity-80">{orders.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('repairs')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'repairs'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Wrench className="w-4 h-4" />
              <span>Repair Bookings</span>
            </div>
            <span className="font-mono text-[11px] opacity-80">{bookings.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'wishlist'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Saved Wishlist</span>
            </div>
            <span className="font-mono text-[11px] opacity-80">{wishlistProducts.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & SMS Preferences</span>
          </button>
        </aside>

        {/* Tab Content Panes */}
        <main className="lg:col-span-9 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Order History & Tax Invoices
              </h2>

              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                        <div>
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                            #{order.orderNumber}
                          </span>
                          <span className="text-slate-400 ml-2">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Payment: {order.paymentStatus}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                            Fulfillment: {order.fulfillmentStatus}
                          </span>
                          <button
                            onClick={() => setSelectedOrderForInvoice(order)}
                            className="p-1 rounded-md text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
                            title="Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-slate-700 dark:text-slate-300 truncate max-w-sm">
                              {item.name} <span className="text-slate-400">× {item.quantity}</span>
                            </span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              NPR {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                        <span className="text-slate-500">
                          Method: <strong className="capitalize">{order.paymentMethod}</strong>
                        </span>
                        <span className="text-sm font-bold font-mono text-sky-600 dark:text-sky-400">
                          Total: NPR {order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  You haven't placed any accessory orders yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REPAIR BOOKINGS */}
          {activeTab === 'repairs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  My Smartphone Repairs
                </h2>
                <button
                  onClick={() => onNavigate('book-repair')}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold"
                >
                  Book New Repair
                </button>
              </div>

              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map(book => (
                    <div
                      key={book.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div>
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                            #{book.bookingNumber}
                          </span>
                          <span className="text-slate-500 font-bold ml-2">
                            {book.brand} {book.model}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                            {book.status}
                          </span>
                          <button
                            onClick={() => setSelectedBookingForInvoice(book)}
                            className="p-1 text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Job Card</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {book.serviceTitle} · Problem: {book.issueDescription}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                        <span className="text-slate-400">
                          Scheduled: {book.appointmentDate} ({book.timeSlot})
                        </span>
                        {book.quotedCost && (
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            Quoted: NPR {book.quotedCost.toLocaleString()}
                          </span>
                        )}
                        <button
                          onClick={() => onNavigate('track-repair', { bookingNumber: book.bookingNumber, phone: book.customerPhone })}
                          className="text-sky-600 font-semibold hover:underline"
                        >
                          View Full Tracker →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No active repair bookings. Have a broken phone? Book online in 60 seconds!
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Saved Wishlist Items
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Accessories you saved for later purchase.
                  </p>
                </div>
                {wishlistProducts.length > 0 && (
                  <button
                    onClick={addAllToCart}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Move All to Cart</span>
                  </button>
                )}
              </div>

              {wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map(prod => (
                    <div
                      key={prod.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-4"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-16 h-16 rounded-xl object-cover bg-white shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-sky-600 truncate">{prod.brand}</p>
                        <h4
                          onClick={() => onNavigate('product-detail', { slug: prod.slug, id: prod.id })}
                          className="text-xs font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:underline"
                        >
                          {prod.name}
                        </h4>
                        <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                          NPR {prod.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => addToCart(prod, 1)}
                          className="p-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 cursor-pointer"
                          title="Add to cart"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromWishlist(prod.id)}
                          className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Your wishlist is empty. Tap the heart icon on any accessory to save it here!
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Saved Delivery Addresses
                </h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Address</span>
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Add New Nepal Address
                  </h4>
                  <input
                    type="text"
                    placeholder="Street, Ward, Landmark..."
                    value={newStreet}
                    onChange={e => setNewStreet(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City..."
                      value={newCity}
                      onChange={e => setNewCity(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      required
                    />
                    <select
                      value={newState}
                      onChange={e => setNewState(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <option value="Bagmati Province">Bagmati Province</option>
                      <option value="Koshi Province">Koshi Province</option>
                      <option value="Madhesh Province">Madhesh Province</option>
                      <option value="Gandaki Province">Gandaki Province</option>
                      <option value="Lumbini Province">Lumbini Province</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {user.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map(addr => (
                    <div
                      key={addr.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
                    >
                      <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{addr.label}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] text-sky-600 font-bold bg-sky-100 dark:bg-sky-950 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300">{addr.street}</p>
                      <p className="text-slate-500">{addr.city}, {addr.state}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-4">
                  No saved delivery addresses yet. Add your home or office address for 1-click checkout.
                </p>
              )}
            </div>
          )}

          {/* TAB 5: PROFILE & SMS PREFERENCES */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
              <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Personal Information & Privacy Preferences
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              {/* Transactional SMS Preference Toggle */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-sky-500" />
                    <span>Transactional SMS Notifications</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={smsEnabled}
                    onChange={e => setSmsEnabled(e.target.checked)}
                    className="w-4 h-4 accent-sky-600 rounded-sm cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Receive automated SMS updates for repair booking confirmations, quotations, "Ready for pickup" notifications, and eSewa/Khalti payment receipts. We strictly respect your privacy.
                </p>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Save Preferences
              </button>
            </form>
          )}
        </main>
      </div>

      {/* Printable Invoice Modal Trigger */}
      {(selectedOrderForInvoice || selectedBookingForInvoice) && (
        <InvoiceModal
          order={selectedOrderForInvoice}
          booking={selectedBookingForInvoice}
          onClose={() => {
            setSelectedOrderForInvoice(undefined);
            setSelectedBookingForInvoice(undefined);
          }}
        />
      )}
    </div>
  );
};
