import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => Promise<void>;
  addAllToCart: () => void;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pmr_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with backend if authenticated
  const fetchBackendWishlist = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistIds(data.productIds || []);
        setWishlistProducts(data.products || []);
        localStorage.setItem('pmr_wishlist', JSON.stringify(data.productIds || []));
      }
    } catch (e) {
      console.error('Error fetching wishlist:', e);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) {
      // Sync guest wishlist on login
      const guestSaved = localStorage.getItem('pmr_wishlist');
      const guestIds = guestSaved ? JSON.parse(guestSaved) : [];
      if (guestIds.length > 0) {
        fetch('/api/wishlist/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ guestProductIds: guestIds })
        })
          .then(res => res.json())
          .then(data => {
            setWishlistIds(data.productIds || []);
            setWishlistProducts(data.products || []);
          })
          .catch(() => fetchBackendWishlist());
      } else {
        fetchBackendWishlist();
      }
    } else {
      // Guest mode: fetch product objects for stored IDs
      if (wishlistIds.length > 0) {
        fetch('/api/products')
          .then(res => res.json())
          .then(data => {
            const matched = (data.products || []).filter((p: Product) => wishlistIds.includes(p.id));
            setWishlistProducts(matched);
          })
          .catch(e => console.error(e));
      } else {
        setWishlistProducts([]);
      }
    }
  }, [user, token, fetchBackendWishlist]);

  const toggleWishlist = async (product: Product) => {
    const exists = wishlistIds.includes(product.id);
    let newIds = exists ? wishlistIds.filter(id => id !== product.id) : [...wishlistIds, product.id];
    let newProducts = exists
      ? wishlistProducts.filter(p => p.id !== product.id)
      : [...wishlistProducts, product];

    setWishlistIds(newIds);
    setWishlistProducts(newProducts);
    localStorage.setItem('pmr_wishlist', JSON.stringify(newIds));

    showToast(
      'info',
      exists ? 'Removed from Wishlist' : 'Added to Wishlist',
      `${product.name} has been ${exists ? 'removed from' : 'saved to'} your wishlist.`
    );

    if (token) {
      try {
        await fetch('/api/wishlist/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ productId: product.id })
        });
      } catch (err) {
        console.error('Error syncing toggle wishlist:', err);
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const target = wishlistProducts.find(p => p.id === productId);
    if (target) {
      await toggleWishlist(target);
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const addAllToCart = () => {
    if (wishlistProducts.length === 0) return;
    wishlistProducts.forEach(product => {
      if (product.stock > 0) {
        addToCart(product, 1);
      }
    });
    showToast('success', 'All Items Added to Cart', `${wishlistProducts.length} items moved to your cart.`);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        addAllToCart,
        isLoading
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
