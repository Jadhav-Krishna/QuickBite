/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../api/cart';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: number; // menuItemId
  name: string;
  price: number;
  quantity: number;
  img?: string;
  restaurantId: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  totalPrice: number;
  promoCode: string | null;
  appliedPromoCode: any;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [appliedPromoCode, setAppliedPromoCode] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load cart from backend on mount
  useEffect(() => {
    const loadCart = async () => {
      if (!user?.userId) {
        setIsLoading(false);
        return;
      }

      try {
        const cartData = await cartService.getCart(user.userId);
        if (cartData && cartData.items && cartData.items.length > 0) {
          const cartItems: CartItem[] = cartData.items.map(item => ({
            id: item.menuItemId,
            name: item.itemName,
            price: item.price,
            quantity: item.quantity,
            restaurantId: cartData.restaurantId,
          }));
          setItems(cartItems);
          setSubtotal(cartData.subtotal || 0);
          setDiscountAmount(cartData.discountAmount || 0);
          setTotalPrice(cartData.totalPrice || 0);
          setPromoCode(cartData.promoCode || null);
          setAppliedPromoCode(cartData.appliedPromoCode || null);
        } else {
          setItems([]);
          setSubtotal(0);
          setDiscountAmount(0);
          setTotalPrice(0);
          setPromoCode(null);
          setAppliedPromoCode(null);
        }
      } catch (error) {
        console.log('No existing cart found or error loading cart');
        setItems([]);
        setSubtotal(0);
        setDiscountAmount(0);
        setTotalPrice(0);
        setPromoCode(null);
        setAppliedPromoCode(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [user?.userId]);

  const addToCart = async (item: CartItem) => {
    if (!user?.userId) {
      throw new Error('Please login to add items to cart');
    }

    console.log('Adding to cart:', { userId: user.userId, item });

    const existingRestaurantId = items[0]?.restaurantId;
    if (existingRestaurantId && existingRestaurantId !== item.restaurantId) {
      const shouldReplace = window.confirm('Your cart contains items from another restaurant. Replace cart with this restaurant?');
      if (!shouldReplace) {
        return;
      }
      await cartService.clearCart(user.userId);
      setItems([]);
    }

    try {
      const cartData = await cartService.addItem(user.userId, item.restaurantId, {
        menuItemId: item.id,
        itemName: item.name,
        quantity: item.quantity,
        price: item.price,
      });

      console.log('Cart data received:', cartData);

      if (cartData && cartData.items) {
        const cartItems: CartItem[] = cartData.items.map(i => ({
          id: i.menuItemId,
          name: i.itemName,
          price: i.price,
          quantity: i.quantity,
          restaurantId: cartData.restaurantId,
        }));
        console.log('Setting cart items:', cartItems);
        setItems(cartItems);
        setSubtotal(cartData.subtotal || 0);
        setDiscountAmount(cartData.discountAmount || 0);
        setTotalPrice(cartData.totalPrice || 0);
        setPromoCode(cartData.promoCode || null);
        setAppliedPromoCode(cartData.appliedPromoCode || null);
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (id: number) => {
    if (!user?.userId || items.length === 0) return;

    const restaurantId = items[0].restaurantId;
    const cartItem = items.find(i => i.id === id);
    if (!cartItem) return;

    try {
      const cartData = await cartService.getCart(user.userId);
      const backendItem = cartData.items.find(i => i.menuItemId === id);
      if (backendItem) {
        await cartService.removeItem(user.userId, restaurantId, backendItem.id);
      }
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    if (!user?.userId || items.length === 0) return;

    const restaurantId = items[0].restaurantId;
    try {
      const cartData = await cartService.getCart(user.userId);
      const backendItem = cartData.items.find(i => i.menuItemId === id);
      if (backendItem) {
        await cartService.updateItem(user.userId, restaurantId, backendItem.id, quantity);
      }
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    } catch (error) {
      console.error('Failed to update item quantity:', error);
    }
  };

  const clearCart = async () => {
    if (!user?.userId) {
      setItems([]);
      setSubtotal(0);
      setDiscountAmount(0);
      setTotalPrice(0);
      setPromoCode(null);
      setAppliedPromoCode(null);
      return;
    }

    try {
      await cartService.clearCart(user.userId);
      setItems([]);
      setSubtotal(0);
      setDiscountAmount(0);
      setTotalPrice(0);
      setPromoCode(null);
      setAppliedPromoCode(null);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      setItems([]);
      setSubtotal(0);
      setDiscountAmount(0);
      setTotalPrice(0);
      setPromoCode(null);
      setAppliedPromoCode(null);
    }
  };

  const applyPromoCode = async (code: string) => {
    if (!user?.userId) {
      throw new Error('Please login to apply promo code');
    }

    try {
      const cartData = await cartService.applyPromoCode(user.userId, code);
      setSubtotal(cartData.subtotal || 0);
      setDiscountAmount(cartData.discountAmount || 0);
      setTotalPrice(cartData.totalPrice || 0);
      setPromoCode(cartData.promoCode || null);
      setAppliedPromoCode(cartData.appliedPromoCode || null);
    } catch (error) {
      console.error('Failed to apply promo code:', error);
      throw error;
    }
  };

  const removePromoCode = async () => {
    if (!user?.userId) return;

    try {
      const cartData = await cartService.removePromoCode(user.userId);
      setSubtotal(cartData.subtotal || 0);
      setDiscountAmount(cartData.discountAmount || 0);
      setTotalPrice(cartData.totalPrice || 0);
      setPromoCode(null);
      setAppliedPromoCode(null);
    } catch (error) {
      console.error('Failed to remove promo code:', error);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      applyPromoCode,
      removePromoCode,
      totalItems, 
      subtotal,
      discountAmount,
      totalPrice, 
      promoCode,
      appliedPromoCode,
      isLoading 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
