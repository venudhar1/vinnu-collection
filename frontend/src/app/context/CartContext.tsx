"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Item {
  id: string;
  set_id: string;
  color: string;
  sku: string;
  quantity: number;
  price: number;
  status: string;
  item_metadata?: string;
}

export interface Set {
  id: string;
  name: string;
  description?: string;
  total_items: number;
  total_available: number;
  total_sold: number;
}

export interface CartItem {
  item: Item;
  set: Set;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Item, set: Set, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("saree_cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }
  }, []);

  // Sync cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("saree_cart", JSON.stringify(newCart));
  };

  const addToCart = (item: Item, set: Set, quantity: number = 1) => {
    const existingIndex = cart.findIndex((i) => i.item.id === item.id);
    if (existingIndex > -1) {
      const newCart = [...cart];
      const newQty = newCart[existingIndex].quantity + quantity;
      if (newQty <= item.quantity) {
        newCart[existingIndex].quantity = newQty;
        saveCart(newCart);
      }
    } else {
      saveCart([...cart, { item, set, quantity }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    const newCart = cart.filter((i) => i.item.id !== itemId);
    saveCart(newCart);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    const itemInCart = cart.find((i) => i.item.id === itemId);
    if (itemInCart && quantity <= itemInCart.item.quantity && quantity > 0) {
      const newCart = cart.map((i) => 
        i.item.id === itemId ? { ...i, quantity } : i
      );
      saveCart(newCart);
    }
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.item.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
