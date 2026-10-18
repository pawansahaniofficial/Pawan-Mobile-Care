import React from 'react';
import { Home, Grid, Wrench, PackageCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPage, onNavigate }) => {
  const { user } = useAuth();
  const { itemCount } = useCart();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'shop', label: 'Categories', icon: Grid },
    { id: 'book-repair', label: 'Repair', icon: Wrench, isHighlight: true },
    { id: 'dashboard', label: 'Orders', icon: PackageCheck, badge: undefined },
    { id: user ? 'dashboard' : 'auth', label: 'Account', icon: User }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-lg safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive =
            currentPage === item.id ||
            (item.id === 'shop' && currentPage === 'categories') ||
            (item.id === 'dashboard' && currentPage === 'orders');

          if (item.isHighlight) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative -top-3 flex flex-col items-center group cursor-pointer focus:outline-hidden"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 group-active:scale-95 transition-transform border-2 border-white dark:border-slate-900">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors cursor-pointer relative ${
                isActive
                  ? 'text-sky-600 dark:text-sky-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                {item.id === 'shop' && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-sky-500 rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
