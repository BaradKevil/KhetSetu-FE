import './App.css';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthGaurd, LogGaurd, RoleGuard, HomeRedirect } from './common/Gaurd';
import Layout from './common/Layout';
import NotAuthorized from './common/custom/NotAuthorized';

// Public Pages
import Landing from './pages/public/Landing';
import MarketBrowse from './pages/public/MarketBrowse';
import ProductDetail from './pages/public/ProductDetail';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Farmer (Seller) Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import MyProducts from './pages/seller/MyProducts';
import AddProduct from './pages/seller/AddProduct';
import SellerProductDetail from './pages/seller/SellerProductDetail';
import SellerOrders from './pages/seller/SellerOrders';
import SellerEarnings from './pages/seller/SellerEarnings';
import SellerKYC from './pages/seller/SellerKYC';

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BuyerOrders from './pages/buyer/BuyerOrders';
import BuyerProfile from './pages/buyer/BuyerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminKYCQueue from './pages/admin/AdminKYCQueue';
import AdminKYCDetail from './pages/admin/AdminKYCDetail';
import AdminLedger from './pages/admin/AdminLedger';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

function App() {
  const router = createBrowserRouter([
    // Public routes
    {
      path: '/',
      element: <Landing />,
    },
    {
      path: '/market',
      element: <MarketBrowse />,
    },
    {
      path: '/market/:id',
      element: <ProductDetail />,
    },
    {
      path: '/login',
      element: (
        <LogGaurd>
          <Login />
        </LogGaurd>
      ),
    },
    {
      path: '/register',
      element: (
        <LogGaurd>
          <Register />
        </LogGaurd>
      ),
    },
    {
      path: '/not-authorized',
      element: <NotAuthorized />,
    },
    {
      path: '/home',
      element: <HomeRedirect />,
    },

    // Farmer (Seller) Portal: /seller/*
    {
      path: '/seller',
      element: (
        <AuthGaurd>
          <RoleGuard allowedRoles={['seller', 'super_admin']}>
            <Layout />
          </RoleGuard>
        </AuthGaurd>
      ),
      children: [
        { path: '', element: <SellerDashboard /> },
        { path: 'products', element: <MyProducts /> },
        { path: 'products/new', element: <AddProduct /> },
        { path: 'products/:id', element: <SellerProductDetail /> },
        { path: 'orders', element: <SellerOrders /> },
        { path: 'earnings', element: <SellerEarnings /> },
        { path: 'profile', element: <SellerKYC /> },
      ],
    },

    // Buyer Portal: /buyer/*
    {
      path: '/buyer',
      element: (
        <AuthGaurd>
          <RoleGuard allowedRoles={['buyer', 'super_admin']}>
            <Layout />
          </RoleGuard>
        </AuthGaurd>
      ),
      children: [
        { path: '', element: <BuyerDashboard /> },
        { path: 'market', element: <MarketBrowse /> },
        { path: 'orders', element: <BuyerOrders /> },
        { path: 'profile', element: <BuyerProfile /> },
      ],
    },

    // Super Admin Portal: /admin/*
    {
      path: '/admin',
      element: (
        <AuthGaurd>
          <RoleGuard allowedRoles={['super_admin', 'staff']}>
            <Layout />
          </RoleGuard>
        </AuthGaurd>
      ),
      children: [
        { path: '', element: <AdminDashboard /> },
        { path: 'kyc', element: <AdminKYCQueue /> },
        { path: 'kyc/:sellerId', element: <AdminKYCDetail /> },
        { path: 'orders', element: <BuyerOrders /> },
        { path: 'finance/ledger', element: <AdminLedger /> },
        { path: 'finance/payouts', element: <AdminPayouts /> },
        { path: 'audit', element: <AdminAuditLogs /> },
      ],
    },

    // Fallback
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ]);

  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading KhetSetu...</div>}>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
    </Suspense>
  );
}

export default App;
