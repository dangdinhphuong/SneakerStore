import { IProduct } from "@/interfaces/product";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type ICart = { _id: string | null; product: IProduct; quantity: number; size: ""; color: "" };
export type InitialStateType = {
    quantity: number;
    cart: ICart[];
};

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        quantity: 0,
        cart: [],
    } as InitialStateType,
    reducers: {
        addProductToCart: (state, action: PayloadAction<ICart>) => {
            const isMatch = [...state.cart].some((cart) => cart.product._id === action.payload.product._id);

            if (!isMatch) {
                state.cart = [...state.cart, action.payload];
                state.quantity = state.cart.length;
                return;
            }
            state.cart = [...state.cart].map((cart) =>
                cart.product._id === action.payload.product._id ? { ...cart, quantity: cart.quantity + action.payload.quantity } : cart
            );
        },
        removeProductToCart: (state, action: PayloadAction<string>) => {
            state.cart = [...state.cart].filter((item) => item._id !== action.payload);
            state.quantity = state.cart.length;
        },
        removeMultiplePrdCart: (state, action: PayloadAction<string[]>) => {
            state.cart = [...state.cart].filter((item) => !action.payload.includes(item._id as any));
            state.quantity = state.cart.length;
        },
        updateQuantityCart: (state, action: PayloadAction<{ _id: string; quantity: number }>) => {
            state.cart = [...state.cart].map((item) => (item._id === action.payload._id ? { ...item, quantity: action.payload.quantity } : item));
            state.quantity = state.cart.length;
        },
    },
});

export const { addProductToCart, removeProductToCart, removeMultiplePrdCart, updateQuantityCart } = cartSlice.actions;
export default cartSlice;
