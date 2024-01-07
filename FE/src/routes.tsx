import { createBrowserRouter, RouteObject } from "react-router-dom";
// import { MyComponent } from "./components";
import { AdminLayout, HomePages } from "./pages/layout";
import Product from "./components/admin/Product/Product";
import Order from "./components/admin/order/order";
import Detail from "./components/admin/order/detail";
import AddProduct from "./components/admin/Product/AddProduct";
import Size from "./components/admin/size/size";
import AddSize from "./components/admin/size/AddSize";
import UpdateProduct from "./components/admin/Product/UpdateProduct";
import RecycleBin from "./components/admin/Product/recycle-bin";
import UpdateSize from "./components/admin/size/UpdateSize";
import ImageProduct from "./components/admin/imageProduct/imageProduct";
import AddImage from "./components/admin/imageProduct/AddImage";
import HomeAdmin from "./pages/layout/Admin/home_admin";
import ListComment from "./components/admin/comment/list";
import SuaImageTinTuc from "./components/admin/imagetintuc/update";
import ThemImageTinTuc from "./components/admin/imagetintuc/add";
import ImageTinTuc from "./components/admin/imagetintuc/list";
import ThemTinTuc from "./components/admin/tintuc/add";
import DanhSachTinTuc from "./components/admin/tintuc/list";
import UpdateImage from "./components/admin/imageProduct/UpdateImage";
import AdminCategory from "./components/admin/Category";
import CategoryAdd from "./components/admin/Category/add";
import CategoryEdit from "./components/admin/Category/edit";
import AdminContact from "./components/admin/Contact";
import ContactAdd from "./components/admin/Contact/add";
import ContactEdit from "./components/admin/Contact/edit";
import AdminInformation from "./components/admin/Inpormation";
import InformationAdd from "./components/admin/Inpormation/add";
import InformationEdit from "./components/admin/Inpormation/edit";

import AdminUser from "./components/admin/user/user";
import AdminUserAdd from "./components/admin/user/add";
import AdminEditUser from "./components/admin/user/edit";
import AdminCustomer from "./components/admin/customer/customer";
import AdminCustomerAdd from "./components/admin/customer/add";
import AdminCustomerEdit from "./components/admin/customer/edit";
import AdminRole from "./components/admin/role/role";
import AdminRoleAdd from "./components/admin/role/add";
import AdminRoleEdit from "./components/admin/role/edit";

import SaleAdminPage from "./components/SaleAdminPage";
import PaymentAdmin from "./components/PaymentAdmin";
import ProductDetail from "./components/admin/Product/ProductDetail";
import BaseLayout from "./pages/layout/HomeLayout";
import Contact from "./pages/layout/Users/Contact/Contact";
import About from "./pages/layout/Users/About/About";
import Blog from "./pages/layout/Users/Blog/Blog";
import Blogtintuc from "./pages/layout/Users/Blog/Blogtintuc";
import Shop_Products from "./pages/layout/Users/Shop-Products/Shop_Products";
import Detail_Product from "./pages/layout/Users/Detail-Product/Detail_Product";
import Cart from "./pages/layout/Users/Cart/cart";
import Orderr from "./pages/layout/Users/order/Order";
import Payment from "./pages/layout/Users/Payment/Payment";
import ListCategory from "./pages/layout/Users/List-Category/ListCategory";
import Signin from "./pages/layout/Users/Signin/signin";
import Signup from "./pages/layout/Users/Signup/signup";

import AddColor from "./components/admin/color/add";
import UpdateColor from "./components/admin/color/update";
import Color from "./components/admin/color/list";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import ForgotPassword from "./pages/layout/Users/ForgotPassword/forgotPassword";
import Detailtintuc from "./components/admin/tintuc/detail-tintuc";
import NotFound from "./pages/layout/Client/NotFound";
import Detail_category from "./pages/layout/Users/List-Category/detail-category";
import OrderHistory from "./pages/layout/Users/OrderHistory";
import OrderDetail from "./pages/layout/Users/OrderHistory/detail";


const isAuthenticated = (): boolean => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : {};
  const allowedRoles = ["admin", "nhân viên", "quản lý"]; // Danh sách các vai trò được phép truy cập
  return user && allowedRoles.includes(user?.role?.role_name);
};

const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  return isAuthenticated() ? element : <Navigate to="/" />;
};


export const routers = createBrowserRouter([
  {
    path: "/",
    element: <BaseLayout />,
    children: [
      {
        path: "",
        element: <HomePages />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/blog",
        element: <Blog />,
      },
      {
        path: "/blog/:id",
        element: <Blogtintuc />,
      },
      {
        path: "/list-productsAll",
        element: <Shop_Products />,
      },
      {
        path: "/products/:id",
        element: <Detail_Product />,
      },
      {
        path: "/category/:id",
        element: <Detail_category />,
      },

      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/payment",
        element: <Payment />,
    },
    {
      path: "/order",
      element: <Orderr />,
  },
    {
        path: "/order-history",
        element: <OrderHistory />,
    },
    ,
    {
        path: "/order-history/detail/:id",
        element: <OrderDetail />,
    },
      {
        path: "/category",
        element: <ListCategory />,
      },
    ],
  },
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "forgotPassword",
    element: <ForgotPassword />,
  },
  {
    path: "/admin",
    element: <PrivateRoute element={<AdminLayout />} />,
    children: [
      {
        path: "product",
        element: <Product products={[]} />,
      },
      {
        path: "product/add",
        element: <AddProduct />,
      },
      {
        path: "product/:id",
        element: <ProductDetail />,
      },

      {
        path: "product/update/:id",
        element: <UpdateProduct />,
      },
      {
        path: "product/recycle",
        element: <RecycleBin />,
      },
      {
        path: "size",
        element: <Size />,
      },
      {
        path: "size/add",
        element: <AddSize />,
      },
      {
        path: "size/update/:id",
        element: <UpdateSize />,
      },
      {
        path: "imageProduct",
        element: <ImageProduct />,
      },
      {
        path: "imageProduct/add",
        element: <AddImage />,
      },
      {
        path: "imageProduct/update/:id",
        element: <UpdateImage />,
      },
      {
        path: "/admin",
        element: <HomeAdmin />,
      },
      {
        path: "tintuc",
        element: <DanhSachTinTuc />,
      },
      {
        path: "tintuc/add",
        element: <ThemTinTuc />,
      },
      {
        path: "tintuc/detailtintuc/:id",
        element: <Detailtintuc />,
      },
      

      {
        path: "imagetintuc",
        element: <ImageTinTuc />,
      },
      {
        path: "imagetintuc/add",
        element: <ThemImageTinTuc />,
      },
      {
        path: "imagetintuc/:id",
        element: <SuaImageTinTuc />,
      },
      {
        path: "comments",
        element: <ListComment />,
      },
      {
        path: "category",
        element: <AdminCategory />,
      },
      {
        path: "category/add",
        element: <CategoryAdd />,
      },
      {
        path: "category/:idCategory/edit",
        element: <CategoryEdit />,
      },
      {
        path: "contact",
        element: <AdminContact />,
      },
      {
        path: "contact/add",
        element: <ContactAdd />,
      },
      {
        path: "contact/:idContact/edit",
        element: <ContactEdit />,
      },
      {
        path: "information",
        element: <AdminInformation />,
      },
      {
        path: "information/add",
        element: <InformationAdd />,
      },
      {
        path: "information/:idInformation/edit",
        element: <InformationEdit />,
      },
      {
        path: "user",
        element: <AdminUser />,
      },
      {
        path: "user/add",
        element: <AdminUserAdd />,
      },
      {
        path: "user/edit/:id",
        element: <AdminEditUser />,
      },
      {
        path: "customer",
        element: <AdminCustomer />,
      },
      {
        path: "customer/add",
        element: <AdminCustomerAdd />,
      },
      {
        path: "customer/edit/:id",
        element: <AdminCustomerEdit />,
      },
      {
        path: "role",
        element: <AdminRole />,
      },
      {
        path: "role/add",
        element: <AdminRoleAdd />,
      },
      {
        path: "role/edit/:id",
        element: <AdminRoleEdit />,
      },
      {
        path: "color",
        element: <Color/>,
      },
      {
        path: "color/add",
        element: <AddColor/>,
      },
      {
        path: "color/edit/:id",
        element: <UpdateColor/>,
      },
      {
        path: "order",
        element: <Order />,
      },
      {
        path: "order/:id",
        element: <Detail />,
      },
      {
        path: "order:id",
        element: <Order />,
      },
      {
        path: "sale",
        element: <SaleAdminPage />,
      },
      {
        path: "payment",
        element: <PaymentAdmin />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
