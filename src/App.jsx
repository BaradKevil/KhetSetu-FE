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
import SellerOrderDetail from './pages/seller/SellerOrderDetail';
import SellerAnalytics from './pages/seller/SellerAnalytics';
import SellerEarnings from './pages/seller/SellerEarnings';
import SellerStatements from './pages/seller/SellerStatements';
import SellerOffers from './pages/seller/SellerOffers';
import SellerDisputes from './pages/seller/SellerDisputes';
import SellerReputation from './pages/seller/SellerReputation';
import SellerHarvestPlanner from './pages/seller/SellerHarvestPlanner';
import SellerMandiPrices from './pages/seller/SellerMandiPrices';
import SellerKYC from './pages/seller/SellerKYC';
import SellerNotifications from './pages/seller/SellerNotifications';
import SellerSupport from './pages/seller/SellerSupport';

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BuyerOrders from './pages/buyer/BuyerOrders';
import BuyerOrderDetail from './pages/buyer/BuyerOrderDetail';
import BuyerProfile from './pages/buyer/BuyerProfile';
import BuyerFarmers from './pages/buyer/BuyerFarmers';
import FarmerProfile from './pages/buyer/FarmerProfile';
import BuyerListingDetail from './pages/buyer/BuyerListingDetail';
import BuyerCart from './pages/buyer/BuyerCart';
import BuyerCheckout from './pages/buyer/BuyerCheckout';
import BuyerAddresses from './pages/buyer/BuyerAddresses';
import BuyerDisputes from './pages/buyer/BuyerDisputes';
import BuyerRFQ from './pages/buyer/BuyerRFQ';
import BuyerOffers from './pages/buyer/BuyerOffers';
import BuyerInvoices from './pages/buyer/BuyerInvoices';
import BuyerWatchlist from './pages/buyer/BuyerWatchlist';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminKYCQueue from './pages/admin/AdminKYCQueue';
import AdminKYCDetail from './pages/admin/AdminKYCDetail';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminListings from './pages/admin/AdminListings';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminSettings from './pages/admin/AdminSettings';
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
        { path: 'orders/:id', element: <SellerOrderDetail /> },
        { path: 'analytics', element: <SellerAnalytics /> },
        { path: 'earnings', element: <SellerEarnings /> },
        { path: 'statements', element: <SellerStatements /> },
        { path: 'offers', element: <SellerOffers /> },
        { path: 'disputes', element: <SellerDisputes /> },
        { path: 'reputation', element: <SellerReputation /> },
        { path: 'planner', element: <SellerHarvestPlanner /> },
        { path: 'mandi-rates', element: <SellerMandiPrices /> },
        { path: 'profile', element: <SellerKYC /> },
        { path: 'notifications', element: <SellerNotifications /> },
        { path: 'support', element: <SellerSupport /> },
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
        { path: 'listings/:id', element: <BuyerListingDetail /> },
        { path: 'farmers', element: <BuyerFarmers /> },
        { path: 'farmers/:id', element: <FarmerProfile /> },
        { path: 'cart', element: <BuyerCart /> },
        { path: 'checkout', element: <BuyerCheckout /> },
        { path: 'orders', element: <BuyerOrders /> },
        { path: 'orders/:id', element: <BuyerOrderDetail /> },
        { path: 'addresses', element: <BuyerAddresses /> },
        { path: 'disputes', element: <BuyerDisputes /> },
        { path: 'rfq', element: <BuyerRFQ /> },
        { path: 'offers', element: <BuyerOffers /> },
        { path: 'invoices', element: <BuyerInvoices /> },
        { path: 'watchlist', element: <BuyerWatchlist /> },
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
        { path: 'users', element: <AdminUsers /> },
        { path: 'users/:id', element: <AdminUserDetail /> },
        { path: 'kyc', element: <AdminKYCQueue /> },
        { path: 'kyc/:sellerId', element: <AdminKYCDetail /> },
        { path: 'orders', element: <AdminOrders /> },
        { path: 'listings', element: <AdminListings /> },
        { path: 'disputes', element: <AdminDisputes /> },
        { path: 'finance/ledger', element: <AdminLedger /> },
        { path: 'ledger', element: <AdminLedger /> },
        { path: 'finance/payouts', element: <AdminPayouts /> },
        { path: 'payouts', element: <AdminPayouts /> },
        { path: 'audit', element: <AdminAuditLogs /> },
        { path: 'audit-logs', element: <AdminAuditLogs /> },
        { path: 'settings', element: <AdminSettings /> },
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
