import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Wrench,
  ShoppingBag,
  PackageCheck,
  Users,
  Settings,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  ExternalLink,
  Save,
  Send,
  Star
} from 'lucide-react';
import { Product, RepairBooking, Order, ShopSettings, SmsLog, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { InvoiceModal } from '../components/InvoiceModal';

interface AdminDashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user, token, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'repairs' | 'products' | 'orders' | 'customers' | 'settings' | 'reports' | 'sms' | 'reviews'>('overview');

  const [overview, setOverview] = useState<any>(null);
  const [bookings, setBookings] = useState<RepairBooking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reports, setReports] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Modals / Selected Items
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | undefined>(undefined);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<RepairBooking | undefined>(undefined);

  // Edit / Add Product State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Chargers');
  const [prodBrand, setProdBrand] = useState('PawanTech Pro');
  const [prodPrice, setProdPrice] = useState(1500);
  const [prodOriginalPrice, setProdOriginalPrice] = useState(2000);
  const [prodStock, setProdStock] = useState(25);
  const [prodDesc, setProdDesc] = useState('');
  const [prodImg, setProdImg] = useState('');

  // Selected Booking Edit Modal
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<RepairBooking | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editTech, setEditTech] = useState('');
  const [editQuote, setEditQuote] = useState(0);
  const [editNotes, setEditNotes] = useState('');

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [ovRes, bookRes, prodRes, ordRes, setRes, smsRes, revRes, repRes, userRes] = await Promise.all([
        fetch('/api/admin/overview', { headers }).then(r => r.json()),
        fetch('/api/bookings', { headers }).then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/orders', { headers }).then(r => r.json()),
        fetch('/api/settings/full', { headers }).then(r => r.json()),
        fetch('/api/admin/sms-logs', { headers }).then(r => r.json()),
        fetch('/api/reviews?all=true', { headers }).then(r => r.json()),
        fetch('/api/admin/reports', { headers }).then(r => r.json()),
        fetch('/api/admin/users', { headers }).then(r => r.json())
      ]);

      setOverview(ovRes);
      setBookings(bookRes.bookings || []);
      setProducts(prodRes.products || []);
      setOrders(ordRes.orders || []);
      setSettings(setRes.settings || null);
      setSmsLogs(smsRes.smsLogs || []);
      setReviews(revRes.reviews || []);
      setReports(repRes);
      setCustomers(userRes.users || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Access Restricted
        </h2>
        <p className="text-xs text-slate-500">
          Only verified Pawan Mobile administrators can access this management portal.
        </p>
        <button
          onClick={() => onNavigate('admin-login')}
          className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          Staff Sign In
        </button>
      </div>
    );
  }

  // Handle Product Save (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: prodName,
      category: prodCategory,
      brand: prodBrand,
      price: Number(prodPrice),
      originalPrice: Number(prodOriginalPrice),
      stock: Number(prodStock),
      description: prodDesc,
      images: [prodImg || 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80']
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('success', editingProduct ? 'Product Updated' : 'Product Added');
        setShowProductModal(false);
        setEditingProduct(null);
        fetchData();
      }
    } catch (e: any) {
      showToast('error', 'Error', e.message);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this accessory?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('info', 'Product Deleted');
        fetchData();
      }
    } catch (e: any) {
      showToast('error', 'Error', e.message);
    }
  };

  // Handle Booking Status Update
  const handleUpdateBookingStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForEdit) return;

    try {
      const res = await fetch(`/api/bookings/${selectedBookingForEdit.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          status: editStatus,
          assignedTechnician: editTech,
          quotedCost: Number(editQuote),
          technicianNotes: editNotes
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', 'Repair Status Updated', `Status changed to ${editStatus}. SMS dispatched.`);
        setSelectedBookingForEdit(null);
        fetchData();
      }
    } catch (e: any) {
      showToast('error', 'Update Error', e.message);
    }
  };

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, fulfillmentStatus: string, paymentStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fulfillmentStatus, paymentStatus })
      });
      if (res.ok) {
        showToast('success', 'Order Updated');
        fetchData();
      }
    } catch (e: any) {
      showToast('error', 'Error', e.message);
    }
  };

  // Handle Review Moderation
  const handleToggleReview = async (id: string, isApproved: boolean) => {
    try {
      const res = await fetch(`/api/reviews/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isApproved })
      });
      if (res.ok) {
        showToast('success', `Review ${isApproved ? 'Approved' : 'Hidden'}`);
        fetchData();
      }
    } catch (e: any) {
      showToast('error', 'Error', e.message);
    }
  };

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        showToast('success', 'Shop Settings Updated Successfully');
      }
    } catch (e: any) {
      showToast('error', 'Settings Error', e.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase tracking-wider">
              Admin Portal
            </span>
            <span className="text-xs text-slate-500">Pawan Mobile Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Shop & Laboratory Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Customer View
          </button>
          <button
            onClick={fetchData}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'repairs', label: 'Repairs & Job Cards', icon: Wrench, count: bookings.length },
          { id: 'orders', label: 'Orders & Payments', icon: PackageCheck, count: orders.length },
          { id: 'products', label: 'Products & Catalog', icon: ShoppingBag, count: products.length },
          { id: 'sms', label: 'SMS Gateway Logs', icon: MessageSquare, count: smsLogs.length },
          { id: 'reviews', label: 'Reviews Moderation', icon: Star, count: reviews.length },
          { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
          { id: 'reports', label: 'Analytics Reports', icon: BarChart3 },
          { id: 'settings', label: 'Shop Settings', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Verified NPR Revenue
              </span>
              <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                NPR {overview.metrics.totalRevenueNpr?.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500">eSewa & Khalti Verified</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Repair Bookings
              </span>
              <p className="text-2xl font-extrabold font-mono text-sky-600 dark:text-sky-400">
                {overview.metrics.pendingRepairBookings} / {overview.metrics.totalRepairBookings}
              </p>
              <p className="text-[11px] text-slate-500">Pending Lab Execution</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Orders Placed
              </span>
              <p className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                {overview.metrics.totalOrders}
              </p>
              <p className="text-[11px] text-slate-500">{overview.metrics.todayOrders} Orders Today</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Transactional SMS Sent
              </span>
              <p className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                {overview.metrics.smsSentCount}
              </p>
              <p className="text-[11px] text-slate-500">Alerts to Customers</p>
            </div>
          </div>

          {/* Low Stock Warning */}
          {overview.lowStockProducts && overview.lowStockProducts.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/40 rounded-3xl p-5 border border-amber-200 dark:border-amber-900/60 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Low Stock Inventory Warning ({overview.lowStockProducts.length} items):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {overview.lowStockProducts.map((p: Product) => (
                  <div key={p.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900 text-xs flex items-center justify-between">
                    <span className="font-semibold truncate max-w-[180px]">{p.name}</span>
                    <span className="font-mono font-bold text-rose-600">{p.stock} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Repair Bookings */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-sky-500" />
                  <span>Recent Repair Requests</span>
                </h3>
                <button onClick={() => setActiveTab('repairs')} className="text-xs text-sky-600 hover:underline">
                  View All →
                </button>
              </div>

              <div className="space-y-3">
                {overview.recentBookings.map((b: RepairBooking) => (
                  <div key={b.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white font-mono">#{b.bookingNumber}</p>
                      <p className="text-slate-500">{b.customerName} · {b.brand} {b.model}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-emerald-500" />
                  <span>Recent Accessory Orders</span>
                </h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs text-sky-600 hover:underline">
                  View All →
                </button>
              </div>

              <div className="space-y-3">
                {overview.recentOrders.map((o: Order) => (
                  <div key={o.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white font-mono">#{o.orderNumber}</p>
                      <p className="text-slate-500">{o.customerName} · {o.items.length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-slate-900 dark:text-white">NPR {o.total.toLocaleString()}</p>
                      <span className="text-[10px] text-emerald-600 uppercase font-bold">{o.paymentStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REPAIR MANAGEMENT */}
      {activeTab === 'repairs' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                All Repair Bookings & Job Cards ({bookings.length})
              </h2>
              <p className="text-xs text-slate-500">
                Update status, assign lab technicians, issue diagnosis quotes, and trigger SMS notifications.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Device & Fault</th>
                  <th className="p-3">Scheduled</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Quote (NPR)</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                      #{b.bookingNumber}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{b.customerName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{b.customerPhone}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold">{b.brand} {b.model}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{b.serviceTitle}</p>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {b.appointmentDate} <br />
                      <span className="text-[10px] text-slate-400">{b.timeSlot}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        b.status === 'Ready for Pickup' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                        'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600">
                      {b.quotedCost ? `NPR ${b.quotedCost.toLocaleString()}` : '—'}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBookingForEdit(b);
                          setEditStatus(b.status);
                          setEditTech(b.assignedTechnician || 'Pawan Kumar');
                          setEditQuote(b.quotedCost || 1500);
                          setEditNotes(b.technicianNotes || '');
                        }}
                        className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 hover:bg-sky-100 text-xs font-semibold"
                        title="Update Status"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => setSelectedBookingForInvoice(b)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                        title="Print Job Card"
                      >
                        Card
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Catalog Products & Accessories ({products.length})
              </h2>
              <p className="text-xs text-slate-500">
                Manage stock levels, prices in NPR, categories, and warranty terms.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProdName('');
                setProdCategory('Chargers');
                setProdBrand('PawanTech Pro');
                setProdPrice(1500);
                setProdOriginalPrice(2000);
                setProdStock(30);
                setProdDesc('');
                setProdImg('');
                setShowProductModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Accessory</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price (NPR)</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-white shrink-0" />
                      <div className="truncate max-w-xs">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                        <p className="text-[11px] text-slate-400">{p.brand}</p>
                      </div>
                    </td>
                    <td className="p-3">{p.category}</td>
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                      NPR {p.price.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className={`font-mono font-bold ${p.stock <= 8 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{p.sku}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setProdName(p.name);
                          setProdCategory(p.category);
                          setProdBrand(p.brand);
                          setProdPrice(p.price);
                          setProdOriginalPrice(p.originalPrice || p.price);
                          setProdStock(p.stock);
                          setProdDesc(p.description);
                          setProdImg(p.images[0] || '');
                          setShowProductModal(true);
                        }}
                        className="p-1.5 text-sky-600 hover:text-sky-700"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Customer Orders & Shipments ({orders.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total (NPR)</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Fulfillment</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                      #{o.orderNumber}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold">{o.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{o.customerPhone}</p>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600">
                      NPR {o.total.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <select
                        value={o.paymentStatus}
                        onChange={e => handleUpdateOrderStatus(o.id, o.fulfillmentStatus, e.target.value)}
                        className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                      >
                        <option value="pending">pending</option>
                        <option value="verified">verified</option>
                        <option value="failed">failed</option>
                        <option value="refunded">refunded</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <select
                        value={o.fulfillmentStatus}
                        onChange={e => handleUpdateOrderStatus(o.id, e.target.value, o.paymentStatus)}
                        className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="processing">processing</option>
                        <option value="shipped">shipped</option>
                        <option value="delivered">delivered</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedOrderForInvoice(o)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1 ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SMS GATEWAY LOGS */}
      {activeTab === 'sms' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Transactional SMS Dispatch Audit Trail ({smsLogs.length})
              </h2>
              <p className="text-xs text-slate-500">
                Inspect automated SMS notifications delivered to customers via Sparrow SMS / Aakash SMS.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {smsLogs.map(sms => (
              <div
                key={sms.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                      {sms.recipientPhone}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 uppercase">
                      {sms.event}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(sms.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
                    {sms.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                    Status: {sms.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white pb-4 border-b border-slate-100 dark:border-slate-800">
            Customer Reviews & Ratings Moderation ({reviews.length})
          </h2>

          <div className="space-y-3">
            {reviews.map(rev => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{rev.userName}</span>
                    <span className="text-[10px] text-sky-600">[{rev.targetType.toUpperCase()}: {rev.targetName}]</span>
                    {rev.isVerified && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 rounded-sm font-semibold">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-amber-400 my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{rev.comment}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleReview(rev.id, !rev.isApproved)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                      rev.isApproved
                        ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                  >
                    {rev.isApproved ? 'Hide Review' : 'Approve Review'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SHOP SETTINGS */}
      {activeTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 max-w-3xl">
          <h2 className="text-base font-bold text-slate-900 dark:text-white pb-4 border-b border-slate-100 dark:border-slate-800">
            Shop Contact, Google Maps, eSewa & Khalti Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Shop Name</label>
              <input
                type="text"
                value={settings.shopName}
                onChange={e => setSettings({ ...settings, shopName: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Helpline Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Shop Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Google Maps Embed URL</label>
              <input
                type="text"
                value={settings.googleMapsEmbed}
                onChange={e => setSettings({ ...settings, googleMapsEmbed: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">eSewa Product Code</label>
              <input
                type="text"
                value={settings.esewaProductCode || 'EPAYTEST'}
                onChange={e => setSettings({ ...settings, esewaProductCode: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Khalti Public Key</label>
              <input
                type="text"
                value={settings.khaltiPublicKey || ''}
                onChange={e => setSettings({ ...settings, khaltiPublicKey: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-600/20 cursor-pointer"
          >
            Save All Settings
          </button>
        </form>
      )}

      {/* Edit Booking Status Modal */}
      {selectedBookingForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Update Repair Booking #{selectedBookingForEdit.bookingNumber}
            </h3>

            <form onSubmit={handleUpdateBookingStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Workflow Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Device Received">Device Received</option>
                  <option value="Under Diagnosis">Under Diagnosis</option>
                  <option value="Awaiting Approval">Awaiting Customer Approval</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Ready for Pickup">Ready for Pickup (Auto SMS)</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Assigned Technician</label>
                <input
                  type="text"
                  value={editTech}
                  onChange={e => setEditTech(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Quoted Cost (NPR)</label>
                <input
                  type="number"
                  value={editQuote}
                  onChange={e => setEditQuote(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Technician Notes</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-sky-600 text-white font-bold"
                >
                  Save & Notify Customer via SMS
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBookingForEdit(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingProduct ? 'Edit Accessory' : 'Add New Accessory'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Product Title</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Chargers">Chargers</option>
                    <option value="Earphones">Earphones</option>
                    <option value="Headphones">Headphones</option>
                    <option value="Bluetooth Speakers">Bluetooth Speakers</option>
                    <option value="Data Cables">Data Cables</option>
                    <option value="Additional Accessories">Additional Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    value={prodBrand}
                    onChange={e => setProdBrand(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Price (NPR)</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={e => setProdPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Original Price</label>
                  <input
                    type="number"
                    value={prodOriginalPrice}
                    onChange={e => setProdOriginalPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Stock</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={e => setProdStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Image URL</label>
                <input
                  type="text"
                  value={prodImg}
                  onChange={e => setProdImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-sky-600 text-white font-bold"
                >
                  Save Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal Preview */}
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
