import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { getFirstImage } from '../common/imageUtils';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('khetsetu_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('khetsetu_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (product, quantity) => {
    const qty = Number(quantity);
    if (qty <= 0) return;

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product_id === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + qty;
        if (newQty > product.available_quantity) {
          toast.warning(`Maximum available quantity is ${product.available_quantity} ${product.unit}`);
          updated[existingIdx].quantity = product.available_quantity;
        } else {
          updated[existingIdx].quantity = newQty;
          toast.success(`Updated ${product.variety} quantity in cart!`);
        }
        return updated;
      }

      toast.success(`Added ${product.variety} to cart!`);
      const sellerProfile = product.seller?.seller_profile;
      const sellerName = sellerProfile?.full_name || sellerProfile?.farm_name || 'Farmer Seller';
      const sellerLocation = `${product.pickup_village ? product.pickup_village + ', ' : ''}${product.pickup_district}, ${product.pickup_state}`;

      return [
        ...prev,
        {
          product_id: product.id,
          seller_id: product.seller_id,
          seller_name: sellerName,
          seller_location: sellerLocation,
          crop_name: product.crop?.name || 'Produce',
          variety: product.variety,
          grade: product.grade,
          is_organic: product.is_organic,
          price_per_unit_paise: product.price_per_unit_paise,
          unit: product.unit,
          quantity: qty,
          min_order_quantity: product.min_order_quantity || 1,
          available_quantity: product.available_quantity,
          image: getFirstImage(product),
          added_at: new Date().toISOString(),
        },
      ];
    });
  };

  const updateQuantity = (productId, newQty) => {
    const qty = Number(newQty);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product_id === productId) {
          if (qty > item.available_quantity) {
            toast.warning(`Cannot exceed available quantity (${item.available_quantity} ${item.unit})`);
            return { ...item, quantity: item.available_quantity };
          }
          if (qty < item.min_order_quantity) {
            toast.info(`Minimum order quantity is ${item.min_order_quantity} ${item.unit}`);
            return { ...item, quantity: item.min_order_quantity };
          }
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
    toast.info('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
  };

  const clearSellerCart = (sellerId) => {
    setCart((prev) => prev.filter((item) => item.seller_id !== sellerId));
  };

  // Group items by seller_id (Each seller gets a separate Escrow Order)
  const groupedBySeller = useMemo(() => {
    const groups = {};
    for (const item of cart) {
      if (!groups[item.seller_id]) {
        groups[item.seller_id] = {
          seller_id: item.seller_id,
          seller_name: item.seller_name,
          seller_location: item.seller_location,
          items: [],
          subtotalPaise: 0,
          buyerFeePaise: 0,
          totalPayablePaise: 0,
        };
      }
      const itemSubtotal = item.quantity * item.price_per_unit_paise;
      groups[item.seller_id].items.push(item);
      groups[item.seller_id].subtotalPaise += itemSubtotal;
    }

    Object.values(groups).forEach((grp) => {
      grp.buyerFeePaise = Math.round(grp.subtotalPaise * 0.005); // 0.5% escrow fee
      grp.totalPayablePaise = grp.subtotalPaise + grp.buyerFeePaise;
    });

    return Object.values(groups);
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + 1, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        clearSellerCart,
        groupedBySeller,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
