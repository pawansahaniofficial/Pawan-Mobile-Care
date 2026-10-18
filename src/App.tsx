import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { WhatsAppCallProvider } from './context/WhatsAppCallContext';

import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import { IntroScreen } from './components/IntroScreen';
import { FacebookMessengerWidget } from './components/FacebookMessengerWidget';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { RepairsPage } from './pages/RepairsPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { BookRepairPage } from './pages/BookRepairPage';
import { TrackRepairPage } from './pages/TrackRepairPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentStatusPage } from './pages/PaymentStatusPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { WishlistPage } from './pages/WishlistPage';
import { ContactPage } from './pages/ContactPage';
import { AuthPages } from './pages/AuthPages';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PoliciesPages } from './pages/PoliciesPages';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    // Only show animated intro once per browsing session
    return !sessionStorage.getItem('pmr_intro_shown');
  });

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIntroComplete = () => {
    sessionStorage.setItem('pmr_intro_shown', 'true');
    setShowIntro(false);
  };

  // Check URL query parameters for payment callbacks on initial mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('provider') || urlParams.get('data') || urlParams.get('pidx')) {
      setCurrentPage('payment-status');
      setPageParams({
        provider: urlParams.get('provider'),
        orderId: urlParams.get('orderId'),
        bookingId: urlParams.get('bookingId'),
        status: urlParams.get('status')
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* Intro Animated Screen */}
      {showIntro && <IntroScreen onComplete={handleIntroComplete} />}

      {/* Top Navigation */}
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

      {/* Dynamic Page Routing View */}
      <main className="flex-1">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}

        {currentPage === 'shop' && (
          <ShopPage onNavigate={handleNavigate} initialCategory={pageParams?.category} />
        )}

        {currentPage === 'product-detail' && (
          <ProductDetailPage
            idOrSlug={pageParams?.slug || pageParams?.id || 'prod-chg-65w-gan'}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'repairs' && (
          <RepairsPage onNavigate={handleNavigate} initialCategory={pageParams?.category} />
        )}

        {currentPage === 'service-detail' && (
          <ServiceDetailPage
            slug={pageParams?.slug || 'display-replacement'}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'book-repair' && (
          <BookRepairPage onNavigate={handleNavigate} initialParams={pageParams} />
        )}

        {currentPage === 'track-repair' && (
          <TrackRepairPage onNavigate={handleNavigate} initialParams={pageParams} />
        )}

        {currentPage === 'cart' && <CartPage onNavigate={handleNavigate} />}

        {currentPage === 'checkout' && <CheckoutPage onNavigate={handleNavigate} />}

        {currentPage === 'payment-status' && (
          <PaymentStatusPage onNavigate={handleNavigate} params={pageParams} />
        )}

        {currentPage === 'dashboard' && (
          <CustomerDashboardPage onNavigate={handleNavigate} initialTab={pageParams?.tab} />
        )}

        {currentPage === 'wishlist' && <WishlistPage onNavigate={handleNavigate} />}

        {currentPage === 'contact' && <ContactPage onNavigate={handleNavigate} />}

        {currentPage === 'auth' && (
          <AuthPages onNavigate={handleNavigate} initialMode={pageParams?.mode} />
        )}

        {currentPage === 'admin-login' && <AdminLoginPage onNavigate={handleNavigate} />}

        {currentPage === 'admin-dashboard' && <AdminDashboardPage onNavigate={handleNavigate} />}

        {currentPage === 'policies' && (
          <PoliciesPages initialTab={pageParams?.tab || 'privacy'} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Facebook Messenger Style Live Call and Messaging Widget */}
      <FacebookMessengerWidget onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <WhatsAppCallProvider>
                <AppContent />
              </WhatsAppCallProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
