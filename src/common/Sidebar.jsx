import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Avatar,
  Button,
  Chip,
} from '@mui/material';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { menulist } from './MenuList';
import {
  MdAgriculture,
  MdDashboard,
  MdStorefront,
  MdAddCircleOutline,
  MdShoppingBag,
  MdAccountBalanceWallet,
  MdVerifiedUser,
  MdAdminPanelSettings,
  MdAccountTree,
  MdLocalAtm,
  MdHistory,
  MdPeople,
  MdInventory2,
  MdGavel,
  MdSettings,
  MdShoppingCart,
  MdLocationOn,
  MdDescription,
  MdLocalOffer,
  MdReceipt,
  MdBookmark,
  MdBarChart,
  MdStar,
  MdCalendarMonth,
  MdNotifications,
  MdSupportAgent,
} from 'react-icons/md';

import { useLanguage } from '../context/LanguageContext';
import { useGetProfileQuery, useGetSellerOrdersQuery } from '../Api/Api';
import { toast } from 'react-toastify';

const DRAWER_WIDTH = 320;

const menuTranslationKeys = {
  'seller-dashboard': 'dashboard',
  'seller-products': 'myProducts',
  'seller-new-product': 'addNewCrop',
  'seller-orders': 'incomingOrders',
  'seller-analytics': 'salesAnalytics',
  'seller-earnings': 'earningsPayouts',
  'seller-statements': 'statementsTax',
  'seller-offers': 'quotesOffers',
  'seller-disputes': 'disputesClaims',
  'seller-reputation': 'farmerScore',
  'seller-planner': 'harvestPlanner',
  'seller-mandi': 'apmcMandiRates',
  'seller-kyc': 'farmProfileKyc',
  'seller-notifications': 'notifications',
  'seller-support': 'kisanSupport',
  'buyer-dashboard': 'buyerOverview',
  'buyer-market': 'exploreMandi',
  'buyer-farmers': 'verifiedFarmers',
  'buyer-cart': 'myCart',
  'buyer-orders': 'myEscrowOrders',
  'buyer-addresses': 'deliveryAddresses',
  'buyer-disputes': 'disputesClaims',
  'buyer-rfq': 'postRfq',
  'buyer-offers': 'quotesOffers',
  'buyer-invoices': 'invoicesStatements',
  'buyer-watchlist': 'watchlistAlerts',
  'buyer-profile': 'businessProfile',
  'admin-dashboard': 'controlTower',
  'admin-users': 'usersDirectory',
  'admin-kyc': 'kycApprovals',
  'admin-orders': 'ordersOversight',
  'admin-listings': 'listingModeration',
  'admin-disputes': 'disputesClaims',
  'admin-ledger': 'ledger',
  'admin-payouts': 'payoutApprovals',
  'admin-audit': 'auditTrail',
  'admin-settings': 'platformSettings',
};

const iconMap = {
  'seller-dashboard': <MdDashboard size={20} />,
  'seller-products': <MdStorefront size={20} />,
  'seller-new-product': <MdAddCircleOutline size={20} />,
  'seller-orders': <MdShoppingBag size={20} />,
  'seller-analytics': <MdBarChart size={20} />,
  'seller-earnings': <MdAccountBalanceWallet size={20} />,
  'seller-statements': <MdReceipt size={20} />,
  'seller-offers': <MdLocalOffer size={20} />,
  'seller-disputes': <MdGavel size={20} />,
  'seller-reputation': <MdStar size={20} />,
  'seller-planner': <MdCalendarMonth size={20} />,
  'seller-mandi': <MdStorefront size={20} />,
  'seller-kyc': <MdVerifiedUser size={20} />,
  'seller-notifications': <MdNotifications size={20} />,
  'seller-support': <MdSupportAgent size={20} />,
  'buyer-dashboard': <MdDashboard size={20} />,
  'buyer-market': <MdStorefront size={20} />,
  'buyer-farmers': <MdPeople size={20} />,
  'buyer-cart': <MdShoppingCart size={20} />,
  'buyer-orders': <MdShoppingBag size={20} />,
  'buyer-addresses': <MdLocationOn size={20} />,
  'buyer-disputes': <MdGavel size={20} />,
  'buyer-rfq': <MdDescription size={20} />,
  'buyer-offers': <MdLocalOffer size={20} />,
  'buyer-invoices': <MdReceipt size={20} />,
  'buyer-watchlist': <MdBookmark size={20} />,
  'buyer-profile': <MdVerifiedUser size={20} />,
  'admin-dashboard': <MdAdminPanelSettings size={20} />,
  'admin-users': <MdPeople size={20} />,
  'admin-kyc': <MdVerifiedUser size={20} />,
  'admin-orders': <MdShoppingBag size={20} />,
  'admin-listings': <MdInventory2 size={20} />,
  'admin-disputes': <MdGavel size={20} />,
  'admin-ledger': <MdAccountTree size={20} />,
  'admin-payouts': <MdLocalAtm size={20} />,
  'admin-audit': <MdHistory size={20} />,
  'admin-settings': <MdSettings size={20} />,
};

const Sidebar = ({ open, onClose, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const userRole = localStorage.getItem('role') || 'buyer';
  const { data: userProfile } = useGetProfileQuery();
  const kycStatus = userProfile?.seller_profile?.kyc_status || 'unverified';

  const { data: sellerOrdersData } = useGetSellerOrdersQuery(
    {},
    { enabled: userRole === 'seller' && !!localStorage.getItem('accessToken') }
  );
  const ordersList = Array.isArray(sellerOrdersData?.items)
    ? sellerOrdersData.items
    : Array.isArray(sellerOrdersData?.data)
    ? sellerOrdersData.data
    : Array.isArray(sellerOrdersData?.orders)
    ? sellerOrdersData.orders
    : Array.isArray(sellerOrdersData)
    ? sellerOrdersData
    : [];

  const pendingOrdersCount = ordersList.filter(
    (o) => o && (o.status === 'escrow_held' || o.status === 'pending')
  ).length;

  const rawFullName = localStorage.getItem('fullName') || userProfile?.full_name || '';
  const phone = localStorage.getItem('phone') || userProfile?.phone || '';
  const profilePhoto = localStorage.getItem('profilePhoto') || userProfile?.profile_photo || '';

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'super_admin':
        return 'Admin';
      case 'staff':
        return 'Staff';
      case 'seller':
        return 'Farmer';
      case 'buyer':
        return 'Buyer';
      default:
        return 'User';
    }
  };

  const getDisplayName = () => {
    if (rawFullName && !rawFullName.startsWith('+') && !/^\d+$/.test(rawFullName.replace(/\s+/g, ''))) {
      return rawFullName;
    }
    if (userRole === 'super_admin') return 'admin1';
    if (userRole === 'seller') return 'farmer1';
    if (userRole === 'buyer') return 'buyer1';
    return 'User';
  };

  const getDisplayEmailOrPhone = () => {
    if (userProfile?.email) return userProfile.email;
    if (userRole === 'super_admin') return 'admin1@gmail.com';
    if (phone) {
      const digits = String(phone).replace(/\D/g, '');
      if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
      return phone;
    }
    return `${userRole}@khetsetu.in`;
  };

  const displayName = getDisplayName();
  const avatarLetter = (displayName ? displayName.charAt(0) : 'U').toUpperCase();

  const filteredMenu = menulist.filter((item) =>
    item.roles.includes(userRole)
  );

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        maxHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
      }}
    >
      {/* 1. Top Logo & Brand Section */}
      <Box
        sx={{
          p: 2.5,
          py: 2,
          flexShrink: 0,
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 2px 8px rgba(37,99,235,0.22)',
            }}
          >
            <MdAgriculture />
          </Box>
          <Box>
            <Typography
              variant="h6"
              fontWeight={900}
              sx={{
                color: '#0F172A',
                letterSpacing: '-0.02em',
                fontSize: '1.25rem',
                lineHeight: 1.1,
              }}
            >
              Khet<span style={{ color: '#2563EB' }}>Setu</span>
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#64748B',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                display: 'block',
                mt: 0.2,
                textTransform: 'uppercase',
              }}
            >
              Kisan Escrow Platform
            </Typography>
          </Box>
        </Link>
      </Box>

      {/* 2. Scrollable Navigation Section (Fixes Sidebar Scrolling Issue) */}
      <Box
        tabIndex={0}
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
          outline: 'none',
          px: 1.5,
          py: 0.5,
          pb: 2.5,
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E1 transparent',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb:hover': { bgcolor: '#94A3B8' },
        }}
      >
        <List disablePadding>
          {filteredMenu.map((item, idx) => {
            const prevItem = filteredMenu[idx - 1];
            const showSection = item.section && (!prevItem || prevItem.section !== item.section);
            const isActive = location.pathname === item.path;
            const transKey = menuTranslationKeys[item.id];
            const translated = transKey ? t(transKey) : null;
            const translatedName = translated && translated !== transKey ? translated : item.name;

            return (
              <Box key={item.id}>
                {showSection && (
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1.5,
                      pt: idx === 0 ? 0.5 : 1.5,
                      pb: 0.5,
                      display: 'block',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      color: '#94A3B8',
                      fontSize: '0.68rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.section}
                  </Typography>
                )}
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => {
                      if (item.id === 'seller-new-product' || item.path === '/seller/products/new') {
                        if (kycStatus !== 'verified') {
                          toast.warning(t('farmer.completeKycFirst', 'Please complete the KYC first'));
                          navigate('/seller/kyc');
                          if (isMobile && onClose) onClose();
                          return;
                        }
                      }
                      navigate(item.path);
                      if (isMobile && onClose) onClose();
                    }}
                    sx={{
                      borderRadius: 2.5,
                      py: 1,
                      px: 1.8,
                      bgcolor: isActive ? '#EEF4FF' : 'transparent',
                      color: isActive ? '#2563EB' : '#334155',
                      fontWeight: isActive ? 700 : 500,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isActive ? '#EEF4FF' : '#F8FAFC',
                        color: isActive ? '#2563EB' : '#0F172A',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 34,
                        color: isActive ? '#2563EB' : '#64748B',
                      }}
                    >
                      {iconMap[item.id] || <MdDashboard size={20} />}
                    </ListItemIcon>
                    <ListItemText
                      primary={translatedName}
                      primaryTypographyProps={{
                        fontSize: '0.88rem',
                        fontWeight: isActive ? 700 : 500,
                        color: 'inherit',
                      }}
                    />
                    {item.id === 'seller-orders' && pendingOrdersCount > 0 && (
                      <Chip
                        label={pendingOrdersCount}
                        size="small"
                        sx={{
                          height: 20,
                          minWidth: 20,
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          bgcolor: '#DC2626',
                          color: '#fff',
                          ml: 1,
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              </Box>
            );
          })}
        </List>
      </Box>

      {/* 3. Bottom User Profile Card (Fixed at the end of the sidebar) */}
      <Box
        sx={{
          p: 1.5,
          flexShrink: 0,
          borderTop: '1px solid #F1F5F9',
          bgcolor: '#FFFFFF',
        }}
      >
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#EFF6FF',
              borderColor: '#BFDBFE',
            },
          }}
        >
          <Avatar
            src={profilePhoto || undefined}
            sx={{
              width: 38,
              height: 38,
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 750,
              fontSize: '0.95rem',
              boxShadow: '0 2px 6px rgba(37,99,235,0.2)',
            }}
          >
            {avatarLetter}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={750} color="#0F172A" noWrap sx={{ lineHeight: 1.25 }}>
              {displayName}
            </Typography>
            <Typography
              variant="caption"
              color="#64748B"
              noWrap
              sx={{ display: 'block', fontSize: '0.72rem', mt: 0.2, lineHeight: 1.25 }}
            >
              {getDisplayEmailOrPhone()}
            </Typography>
            <Typography
              variant="caption"
              fontWeight={700}
              color="#2563EB"
              sx={{ fontSize: '0.7rem', display: 'block', mt: 0.2, lineHeight: 1.25 }}
            >
              {getRoleDisplayName()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return isMobile ? (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          height: '100vh',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRight: '1px solid #E2E8F0',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  ) : (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid #E2E8F0',
          height: '100vh',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
