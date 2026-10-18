import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench,
  Smartphone,
  Search,
  ShoppingCart,
  Heart,
  User,
  Sun,
  Moon,
  Phone,
  MessageCircle,
  Clock,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  CheckCircle,
  Cpu,
  Video,
  PhoneCall
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useWhatsAppCall } from '../context/WhatsAppCallContext';
import { Product, RepairService } from '../types';

interface NavbarProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const { wishlistIds } = useWishlist();
  const { user, logout, isAdmin } = useAuth();
  const { startCall } = useWhatsAppCall();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [whatsAppMenuOpen, setWhatsAppMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<{ products: Product[]; repairs: RepairService[] }>({
    products: [],
    repairs: []
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ products: [], repairs: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const [prodRes, repRes] = await Promise.all([
          fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`),
          fetch(`/api/repairs/services?search=${encodeURIComponent(searchQuery)}`)
        ]);
        const prodData = await prodRes.json();
        const repData = await repRes.json();
        setSearchResults({
          products: (prodData.products || []).slice(0, 4),
          repairs: (repData.services || []).slice(0, 3)
        });
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (product: Product) => {
    setSearchQuery('');
    setSearchFocused(false);
    onNavigate('product-detail', { slug: product.slug, id: product.id });
  };

  const handleSelectRepair = (service: RepairService) => {
    setSearchQuery('');
    setSearchFocused(false);
    onNavigate('service-detail', { slug: service.slug });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      {/* Top micro-bar for Nepal contact & urgent announcement */}
      <div className="hidden lg:block bg-slate-950 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a
              href="tel:+9779812345678"
              className="flex items-center gap-1.5 hover:text-sky-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              <span>+977-9802871587</span>
            </a>
            {/* WhatsApp Audio Call Trigger */}
            <button
              onClick={() => startCall('audio')}
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-pointer text-slate-300"
              title="Start WhatsApp Audio Call"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Audio</span>
            </button>

            {/* WhatsApp Video Call Trigger */}
            <button
              onClick={() => startCall('video')}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 transition-all cursor-pointer font-semibold"
              title="Start WhatsApp Video Call - Live Phone Diagnosis"
            >
              <Video className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>WhatsApp Video Call</span>
            </button>

            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Sun - Fri: 9 AM - 8 PM</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-amber-300 font-medium flex items-center gap-1">
              🇳🇵 Express 30-min Phone Repair & Genuine Accessories with Warranty
            </span>
            <button
              onClick={() => onNavigate('track-repair')}
              className="text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
            >
              Track Repair Status
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Logo with phone & wrench motif */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 group text-left cursor-pointer focus:outline-hidden"
          >
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Smartphone className="w-6 h-6 text-white" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-2 ring-white dark:ring-slate-900 shadow-xs">
                <Wrench className="w-3 h-3" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  PAWAN <span className="text-sky-600 dark:text-sky-400">MOBILE</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800 uppercase tracking-widest hidden sm:inline-block">
                  Manawa Bazar
                </span>
              </div>
            </div>
          </button>

          {/* Search bar with live autocomplete dropdown */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-md relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search phone problem, display, charger, battery..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {searchFocused && (searchResults.products.length > 0 || searchResults.repairs.length > 0) && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {searchResults.repairs.length > 0 && (
                  <div className="p-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Repair Solutions
                    </p>
                    <div className="space-y-1">
                      {searchResults.repairs.map(rep => (
                        <button
                          key={rep.id}
                          onClick={() => handleSelectRepair(rep)}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Wrench className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                              {rep.title}
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                            From NPR {rep.estimatedPriceMin}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.products.length > 0 && (
                  <div className="p-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Accessories & Spare Parts
                    </p>
                    <div className="space-y-1">
                      {searchResults.products.map(prod => (
                        <button
                          key={prod.id}
                          onClick={() => handleSelectProduct(prod)}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-3 text-xs transition-colors"
                        >
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-8 h-8 rounded-md object-cover bg-slate-100"
                          />
                          <div className="flex-1 truncate">
                            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                              {prod.name}
                            </p>
                            <p className="text-[11px] text-sky-600 dark:text-sky-400 font-mono">
                              NPR {prod.price.toLocaleString()}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 text-center">
                  <button
                    onClick={() => {
                      onNavigate('shop');
                      setSearchFocused(false);
                    }}
                    className="text-xs text-sky-500 font-medium hover:underline"
                  >
                    View all catalog results →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                currentPage === 'home'
                  ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                  : 'text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('repairs')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentPage === 'repairs'
                  ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                  : 'text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>Repair Services</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
                Expert
              </span>
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                currentPage === 'shop'
                  ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                  : 'text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Accessories Store
            </button>
            <button
              onClick={() => onNavigate('track-repair')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                currentPage === 'track-repair'
                  ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                  : 'text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Track Repair
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                currentPage === 'contact'
                  ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                  : 'text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative"
              title="My Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlistIds.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              {wishlistIds.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => onNavigate('cart')}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-sky-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Book Repair Primary CTA Button */}
            <button
              onClick={() => onNavigate('book-repair')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-sm font-semibold shadow-md shadow-sky-500/20 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Wrench className="w-4 h-4" />
              <span>Book Repair</span>
            </button>

            {/* User Account Menu */}
            <div ref={userMenuRef} className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <img
                      src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=0284c7`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-sky-500 object-cover"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                            Administrator
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate('dashboard');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-sky-500" />
                          <span>My Account & Orders</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate('wishlist');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Heart className="w-4 h-4 text-rose-500" />
                          <span>My Wishlist ({wishlistIds.length})</span>
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onNavigate('admin-dashboard');
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold flex items-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Admin Portal</span>
                          </button>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('auth', { mode: 'login' })}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-sky-500" />
                    <span>Login</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search phone repair, accessories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-transparent focus:border-sky-500 focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('repairs');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
          >
            <span>Repair Services</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              All Problems
            </span>
          </button>
          <button
            onClick={() => {
              onNavigate('shop');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Accessories Store
          </button>
          <button
            onClick={() => {
              onNavigate('book-repair');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 flex items-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            <span>Book Repair Appointment</span>
          </button>
          <button
            onClick={() => {
              onNavigate('track-repair');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Track Repair Status
          </button>
          <button
            onClick={() => {
              onNavigate('contact');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Shop Location & Contact
          </button>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <a
              href="tel:+9779812345678"
              className="flex-1 py-2 text-center rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-sky-500" />
              <span>Call Shop</span>
            </a>
            <a
              href="https://wa.me/9779812345678"
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2 text-center rounded-xl bg-emerald-600 text-xs font-semibold text-white flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
