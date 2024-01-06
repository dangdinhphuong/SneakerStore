import { ISOrder } from '../interfaces/orders';
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const orderApi = createApi({
    reducerPath: "orderApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:8080",
    }),
    tagTypes: ["Orders"],
    endpoints: (builder) => ({
        getAllOrdersInAdmin: builder.query<ISOrder[], void>({
            query: () => `/api/GetAllOrder`,
            providesTags: ["Orders"]
        }),
        getAllOrders: builder.query<{ data: any[] }, any>({
            query: (params) => ({ url: "/api/orders", params }),
            providesTags: ["Orders"]
        }),
        newOrder: builder.mutation<{ data: any }, any>({
            query: (data) => ({ url: "/api/orders", method: "POST", body: data }),
            invalidatesTags: ["Orders"]
        }),
        updateOrder: builder.mutation<any, any>({
            query: ({ _id, status }) => ({ url: "/api/orders/" + _id, method: "PUT", body: { status } }),
            invalidatesTags: ["Orders"]
        }),
        getOrderById2: builder.query<any, any>({
            query: (id) => `/api/orders/${id}`,
            providesTags: ["Orders"]
        }),
        getOrderById: builder.query<ISOrder, number | string>({
            query: (id) => `/api/orders/${id}`,
            providesTags: ["Orders"]  
        }),
    }),
});

export const {useGetAllOrdersInAdminQuery , useGetAllOrdersQuery, useNewOrderMutation, useUpdateOrderMutation, useGetOrderByIdQuery } = orderApi;
export const orderReducer = orderApi.reducer;
export default orderApi;
