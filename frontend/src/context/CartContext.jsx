import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('luxehair_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponCode, setCouponCode] = useState('');

  // Persist cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem('luxehair_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, selectedVariant = null, quantity = 1) => {
    const unitPrice = selectedVariant?.price || product.price;
    const variantKey = selectedVariant ? `${product._id}-${selectedVariant._id || selectedVariant.name}` : product._id;

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.cartItemId === variantKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            cartItemId: variantKey,
            productId: product._id,
            name: product.name,
            slug: product.slug,
            image: product.images?.[0] || '',
            price: unitPrice,
            compareAtPrice: product.compareAtPrice || 0,
            quantity: quantity,
            selectedVariant: selectedVariant || null
          }
        ];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountPercent(0);
    setCouponCode('');
  };

  const applyCoupon = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'LUXE10') {
      setDiscountPercent(10);
      setCouponCode('LUXE10');
      return { success: true, message: '10% Couture VIP discount applied.' };
    }
    if (clean === 'FIRSTLUXE') {
      setDiscountPercent(15);
      setCouponCode('FIRSTLUXE');
      return { success: true, message: '15% Welcome privilege applied.' };
    }
    return { success: false, message: 'Invalid promo code. Try "LUXE10" for 10% off.' };
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const finalSubtotal = Math.max(0, subtotal - discountAmount);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    discountPercent,
    finalSubtotal,
    couponCode,
    applyCoupon,
    totalItemsCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
