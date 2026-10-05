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
} from 'react-icons/md';

const DRAWER_WIDTH = 260;

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
  'admin-kyc': <MdVerifiedUser size={20} />,
  'admin-orders': <MdShoppingBag size={20} />,
  'admin-ledger': <MdAccountTree size={20} />,
  'admin-payouts': <MdLocalAtm size={20} />,
  'admin-audit': <MdHistory size={20} />,
};

const Sidebar = ({ open, onClose, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role') || 'buyer';

  const filteredMenu = menulist.filter((item) =>
    item.roles.includes(userRole)
  );

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF' }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid #F1F5F9' }}>
        <Typography variant="overline" color="text.secondary" fontWeight={700} letterSpacing="0.08em">
          {userRole === 'seller'
            ? 'Kisan Portal'
            : userRole === 'buyer'
            ? 'Trader Portal'
            : 'Admin Operations'}
        </Typography>
      </Box>

      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {filteredMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.6 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile && onClose) onClose();
                }}
                sx={{
                  borderRadius: 2.5,
                  py: 1.2,
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
                  primary={item.name}
                  primaryTypographyProps={{
                    fontSize: '0.92rem',
                    fontWeight: isActive ? 700 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          KhetSetu Escrow Protected © 2026
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
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
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
          height: 'calc(100% - 64px)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
