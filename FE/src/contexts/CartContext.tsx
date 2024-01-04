import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state: Array<any>, action: any) => {
    switch (action.type) {
        case 'ADD_TO_CART':
            return [...state, action.payload];
        // Thêm các trường hợp xử lý khác tại đây nếu cần
        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [cart, dispatch] = useReducer(cartReducer, [], () => {
      const storedCart = localStorage.getItem('cart');
      return storedCart ? JSON.parse(storedCart) : [];
    });
  
    useEffect(() => {
      localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);
  
    return (
      <CartContext.Provider value={{ cart, dispatch }}>
        {children}
      </CartContext.Provider>
    );
  };

  export const useCart = () => {
    return useContext(CartContext);
  };