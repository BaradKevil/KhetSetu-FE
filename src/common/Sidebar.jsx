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
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { menulist } from './MenuList';
import {
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
} from 'react-icons/md';

import { useLanguage } from '../context/LanguageContext';
import { useGetProfileQuery } from '../Api/Api';
import { toast } from 'react-toastify';

const DRAWER_WIDTH = 280;

const menuTranslationKeys = {
  'seller-dashboard': 'dashboard',
  'seller-products': 'myProducts',
  'seller-new-product': 'addNewCrop',
  'seller-orders': 'incomingOrders',
  'seller-earnings': 'earningsPayouts',
  'seller-kyc': 'farmProfileKyc',
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
  'seller-earnings': <MdAccountBalanceWallet size={20} />,
  'seller-kyc': <MdVerifiedUser size={20} />,
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
      {/* 1. Fixed Header Section (Exact match with Reference Screenshot 1-5) */}
      <Box sx={{ p: 2, pb: 1.5, flexShrink: 0 }}>
        {/* User Profile Card (Exact match with Reference Screenshots 1-5) */}
        <Box
          sx={{
            p: 1.6,
            borderRadius: 2.5,
            bgcolor: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            src={profilePhoto || undefined}
            sx={{
              width: 38,
              height: 38,
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.95rem',
            }}
          >
            {avatarLetter}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={700} color="#0F172A" noWrap sx={{ lineHeight: 1.25 }}>
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
              sx={{ fontSize: '0.72rem', display: 'block', mt: 0.2, lineHeight: 1.25 }}
            >
              {getRoleDisplayName()}
            </Typography>
          </Box>
        </Box>
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
                  </ListItemButton>
                </ListItem>
              </Box>
            );
          })}
        </List>
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
