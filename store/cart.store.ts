// ============================================================
// CARTICOM — Shopping Cart State (Zustand)
// Reactive cart with optimistic updates and server sync.
// The store is the single gateway for all cart mutations so the
// header badge stays correct everywhere (add, update, remove).
// ============================================================

import { create } from 'zustand';
import { cartApi } from '@/features/onboarding/services/onboarding.service';
import type { CartItemDto } from '@/features/onboarding/types';
import { extractErrorMessage } from '@/lib/axios';

const STORE_ID_KEY = 'cart_store_id';

const readPersistedStoreId = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(STORE_ID_KEY);
  } catch {
    return null;
  }
};

const persistStoreId = (storeId: string) => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORE_ID_KEY, storeId);
  } catch {
    // storage unavailable — in-memory storeId still works for the session
  }
};

export interface AddToCartInput {
  storeId: string;
  productId: string;
  quantity?: number;
  variantId?: string;
}

interface CartState {
  items: CartItemDto[];
  storeId: string | null;
  isLoading: boolean;
  isAdding: boolean;
  /** Human-readable message from the last failed mutation (null when last op succeeded). */
  lastError: string | null;

  // Computed
  totalItems: () => number;
  subtotal: () => number;

  // Actions
  setStoreId: (storeId: string) => void;
  fetchCart: (storeId: string) => Promise<void>;
  /** Refetch the cart for the remembered store — used on route changes. */
  refresh: () => Promise<void>;
  /** Single gateway for add-to-cart: optimistic + server sync + badge refresh. */
  addToCart: (input: AddToCartInput) => Promise<boolean>;
  updateItem: (productId: string, quantity: number) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  clearCart: () => Promise<void>;
  /** Empty the cart locally (after a successful checkout converts it). */
  markConverted: () => void;
  reset: () => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  storeId: readPersistedStoreId(),
  isLoading: false,
  isAdding: false,
  lastError: null,

  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  subtotal: () => get().items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0),

  setStoreId: (storeId: string) => {
    if (get().storeId === storeId) return;
    persistStoreId(storeId);
    set({ storeId });
  },

  fetchCart: async (storeId: string) => {
    if (!storeId) return;
    persistStoreId(storeId);
    set({ isLoading: true, storeId });
    try {
      const res = await cartApi.get(storeId);
      const cart = res.data?.data;
      set({ items: cart?.items || [], isLoading: false });
    } catch {
      set({ items: [], isLoading: false });
    }
  },

  refresh: async () => {
    const { storeId } = get();
    if (!storeId) return;
    try {
      const res = await cartApi.get(storeId);
      const cart = res.data?.data;
      set({ items: cart?.items || [] });
    } catch {
      // keep current items on transient network failure
    }
  },

  addToCart: async ({ storeId, productId, quantity = 1, variantId }) => {
    if (!storeId) return false;
    const previous = get().items;
    const previousStoreId = get().storeId;

    // Optimistic update — bump quantity when the item already exists;
    // brand-new items appear from the server response (server-priced).
    const existing = previous.find(i => i.productId === productId && i.variantId === variantId);
    const optimisticItems = existing
      ? previous.map(i =>
          i.productId === productId && i.variantId === variantId
            ? { ...i, quantity: i.quantity + quantity }
            : i)
      : previous;

    persistStoreId(storeId);
    set({ isAdding: true, storeId, items: optimisticItems });

    try {
      const res = await cartApi.add({ storeId, productId, quantity, variantId });
      const cart = res.data?.data;
      set({ items: cart?.items || optimisticItems, isAdding: false, lastError: null });
      // Re-sync so totals/prices are server-authoritative (and badge stays right)
      void get().refresh();
      return true;
    } catch (err) {
      // Revert on failure and surface the real error message
      const lastError = extractErrorMessage(err);
      set({ items: previous, storeId: previousStoreId, isAdding: false, lastError });
      return false;
    }
  },

  updateItem: async (productId, quantity) => {
    const { storeId, items } = get();
    if (!storeId) return false;

    const previousItems = items;
    set({ items: items.map(i => i.productId === productId ? { ...i, quantity } : i) });

    try {
      const res = await cartApi.updateItem(storeId, productId, quantity);
      const cart = res.data?.data;
      set({ items: cart?.items || items, lastError: null });
      void get().refresh();
      return true;
    } catch (err) {
      set({ items: previousItems, lastError: extractErrorMessage(err) });
      return false;
    }
  },

  removeItem: async (productId) => {
    const { storeId, items } = get();
    if (!storeId) return false;

    const previousItems = items;
    set({ items: items.filter(i => i.productId !== productId) });

    try {
      const res = await cartApi.removeItem(storeId, productId);
      const cart = res.data?.data;
      set({ items: cart?.items || items.filter(i => i.productId !== productId), lastError: null });
      void get().refresh();
      return true;
    } catch (err) {
      set({ items: previousItems, lastError: extractErrorMessage(err) });
      return false;
    }
  },

  clearCart: async () => {
    const { storeId } = get();
    if (!storeId) return;

    try {
      await cartApi.clear(storeId);
      set({ items: [] });
    } catch {
      // Silently fail — cart clear is best-effort
    }
  },

  markConverted: () => set({ items: [] }),

  reset: () => {
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(STORE_ID_KEY);
      } catch {
        // ignore
      }
    }
    set({ items: [], storeId: null, isLoading: false, isAdding: false, lastError: null });
  },
}));
