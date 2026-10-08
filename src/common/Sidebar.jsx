import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
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
  MdAssessment,
  MdAccountTree,
  MdLocalAtm,
  MdHistory,
  MdPeople,
  MdInventory2,
  MdGavel,
  MdSettings,
} from 'react-icons/md';

import { useLanguage } from '../context/LanguageContext';

const DRAWER_WIDTH = 260;

const menuTranslationKeys = {
  'seller-dashboard': 'dashboard',
  'seller-products': 'myProducts',
  'seller-new-product': 'addNewCrop',
  'seller-orders': 'incomingOrders',
  'seller-earnings': 'earningsPayouts',
  'seller-kyc': 'farmProfileKyc',
  'buyer-dashboard': 'buyerOverview',
  'buyer-market': 'exploreMandi',
  'buyer-orders': 'myEscrowOrders',
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
  'buyer-orders': <MdShoppingBag size={20} />,
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

  const filteredMenu = menulist.filter((item) =>
    item.roles.includes(userRole)
  );

  const drawerContent = (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFFFFF',
        justifyContent: 'space-between',
      }}
    >
      <List
        sx={{
          px: 1.5,
          py: 1.5,
          flex: '1 0 auto',
        }}
      >
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
                    px: 2,
                    pt: idx === 0 ? 0.5 : 1.8,
                    pb: 0.6,
                    display: 'block',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: '#94A3B8',
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.section}
                </Typography>
              )}
              <ListItem disablePadding sx={{ mb: 0.6 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile && onClose) onClose();
                  }}
                  sx={{
                    borderRadius: 2.5,
                    py: 1.1,
                    px: 2,
                    bgcolor: isActive ? '#E8F5E9' : 'transparent',
                    color: isActive ? '#1B5E20' : '#475569',
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: isActive ? '#E8F5E9' : '#F8FAFC',
                      color: isActive ? '#1B5E20' : '#1E293B',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: isActive ? '#2E7D32' : '#94A3B8',
                    }}
                  >
                    {iconMap[item.id] || <MdDashboard size={20} />}
                  </ListItemIcon>
                  <ListItemText
                    primary={translatedName}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isActive ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Box>
          );
        })}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid #F1F5F9', textAlign: 'center', flexShrink: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {t('escrowProtectedFooter')}
        </Typography>
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
          height: '100%',
          maxHeight: '100vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { width: '5px' },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' },
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
          top: '64px',
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { width: '5px' },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: '4px' },
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
