'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { Activity, BookingState } from '../types';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

export interface CartItem {
  activity: Activity;
  addedAt: number;
  bookingProgress?: {
    step: number;
    date?: string | null;
    timeSlot?: string;
    adults?: number;
    children?: number;
    fullName?: string;
    email?: string;
    phone?: string;
    selectedTransportIndex?: number;
    pickupLocation?: string;
    dropoffLocation?: string;
    specialRequirements?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (activity: Activity) => void;
  removeFromCart: (activityId: string) => void;
  clearCart: () => void;
  isInCart: (activityId: string) => boolean;
  updateBookingProgress: (activityId: string, progress: CartItem['bookingProgress']) => void;
  getBookingProgress: (activityId: string) => CartItem['bookingProgress'] | undefined;
  count: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const isInitialLoad = useRef(true);

  // Dynamic storage key based on user state
  const storageKey = user && user.email 
    ? `dubai_cart_${user.email}` 
    : 'dubai_cart_guest';

  // 1. Load data from localStorage when the storage key changes (e.g. user logs in or out)
  useEffect(() => {
    isInitialLoad.current = true; // Pause saving while we load

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setItems(Array.isArray(parsed) ? parsed : []);
      } else {
        setItems([]); // Clear screen for new/empty accounts
      }
    } catch (e) {
      console.error("Cart load error:", e);
      setItems([]);
    }

    // Re-enable saving
    setTimeout(() => {
      isInitialLoad.current = false;
    }, 100);
  }, [storageKey]);

  // 2. Save data seamlessly to localStorage whenever items change
  useEffect(() => {
    // Prevent wiping out the data with [] during the initial component load
    if (isInitialLoad.current) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (e) {
      console.error("Cart save error:", e);
    }
  }, [items, storageKey]);

  // ──────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────
  const getActivityId = (a: Activity) => a.id || (a as any)._id;

  const addToCart = useCallback((activity: Activity) => {
    const id = getActivityId(activity);
    setItems(prev => {
      if (prev.some(item => getActivityId(item.activity) === id)) {
        toast.info('Already in your cart!', { description: activity.title });
        return prev;
      }
      toast.success('Added to cart!', {
        description: activity.title,
        icon: '🛒',
      });
      return [...prev, { activity, addedAt: Date.now() }];
    });
  }, []);

  const removeFromCart = useCallback((activityId: string) => {
    setItems(prev => {
      const item = prev.find(i => getActivityId(i.activity) === activityId);
      if (item) {
        toast.info('Removed from cart', { description: item.activity.title });
      }
      return prev.filter(i => getActivityId(i.activity) !== activityId);
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    toast.info('Cart cleared');
  }, []);

  const isInCart = useCallback((activityId: string) => {
    return items.some(item => getActivityId(item.activity) === activityId);
  }, [items]);

  const updateBookingProgress = useCallback((activityId: string, progress: CartItem['bookingProgress']) => {
    setItems(prev => prev.map(item =>
      getActivityId(item.activity) === activityId
        ? { ...item, bookingProgress: progress }
        : item
    ));
  }, []);

  const getBookingProgress = useCallback((activityId: string) => {
    return items.find(item => getActivityId(item.activity) === activityId)?.bookingProgress;
  }, [items]);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, clearCart, isInCart,
      updateBookingProgress, getBookingProgress,
      count: items.length
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
