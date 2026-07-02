import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import sugarcaneAsset from "@/assets/product-sugarcane.jpg.asset.json";
import pondicherrySmallAsset from "@/assets/product-tender-coconut-styled.jpg.asset.json";
import pondicherryLargeAsset from "@/assets/product-coconut-pondicherry-large.jpg.asset.json";
import pollachiAsset from "@/assets/product-coconut-pollachi.jpg.asset.json";

export type Product = {
  id: string;
  name: string;
  price: number; // in rupees
  unit: string;
  description?: string;
  image: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "sugarcane-juice-1l",
    name: "Sugarcane Juice",
    price: 120,
    unit: "per 1 litre",
    description: "Cold-pressed daily from handpicked cane.",
    image: sugarcaneAsset.url,
  },
  {
    id: "coconut-pondicherry-small",
    name: "Tender Coconut - Pondicherry (Regular)",
    price: 50,
    unit: "per piece",
    description: "Naturally hydrating, straight from the coast.",
    image: pondicherrySmallAsset.url,
  },
  {
    id: "coconut-pondicherry-large",
    name: "Tender Coconut - Pondicherry (Large)",
    price: 70,
    unit: "per piece",
    description: "A bigger Pondicherry coconut - more water, more refreshment.",
    image: pondicherryLargeAsset.url,
  },
  {
    id: "coconut-pollachi",
    name: "Tender Coconut - Pollachi",
    price: 80,
    unit: "per piece",
    description: "Larger, sweeter Pollachi variety - naturally rich and creamy.",
    image: pollachiAsset.url,
  },
];

export type CartItem = { id: string; qty: number };

type CartContextValue = {
  items: CartItem[];
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  reorder: (items: { product_id: string; qty: number }[]) => number;
  count: number;
  subtotal: number;
  withProducts: { product: Product; qty: number; lineTotal: number }[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setOpen: (open: boolean) => void;
};


const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "carwalhos:cart:v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load from localStorage on mount (client only)
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed.filter((x) => x && typeof x.id === "string"));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    } catch {
      /* ignore */
    }
  }, [items]);

  const add = useCallback((id: string, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { id, qty }];
    });
    // Auto-open drawer when an item is added - premium-store pattern
    setIsOpen(true);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.id !== id);
      return prev.map((i) => (i.id === id ? { ...i, qty } : i));
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const reorder = useCallback((incoming: { product_id: string; qty: number }[]) => {
    let added = 0;
    setItems((prev) => {
      const next = [...prev];
      for (const it of incoming) {
        if (!PRODUCTS.find((p) => p.id === it.product_id)) continue;
        const idx = next.findIndex((n) => n.id === it.product_id);
        if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + it.qty };
        else next.push({ id: it.product_id, qty: it.qty });
        added += it.qty;
      }
      return next;
    });
    setIsOpen(true);
    return added;
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);


  const value = useMemo<CartContextValue>(() => {
    const withProducts = items
      .map((i) => {
        const product = PRODUCTS.find((p) => p.id === i.id);
        if (!product) return null;
        return { product, qty: i.qty, lineTotal: product.price * i.qty };
      })
      .filter(Boolean) as { product: Product; qty: number; lineTotal: number }[];

    const subtotal = withProducts.reduce((s, x) => s + x.lineTotal, 0);
    const count = withProducts.reduce((s, x) => s + x.qty, 0);

    return {
      items,
      add,
      remove,
      setQty,
      clear,
      count,
      subtotal,
      withProducts,
      isOpen,
      openCart,
      closeCart,
      setOpen: setIsOpen,
    };
  }, [items, add, remove, setQty, clear, isOpen, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export const MIN_ORDER_VALUE = 300;
export const BULK_THRESHOLD = 2000;
