import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Badge,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  MdMenu,
  MdLogout,
  MdAgriculture,
  MdShoppingCart,
  MdAdminPanelSettings,
  MdStorefront,
} from 'react-icons/md';
import { clearSessionAndRedirect } from '../Api/ApiClient';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useGetProfileQuery } from '../Api/Api';
import LanguageSelector from './custom/LanguageSelector';

const Navbar = ({ onToggleSidebar }) => {
  const { t } = useLanguage();
  const { totalItemsCount } = useCart();

  const token = localStorage.getItem('accessToken');
  const isAuthenticated = Boolean(token);

  const { data: userProfile } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const role = localStorage.getItem('role') || userProfile?.role || 'guest';

  // 1. Role Written Component (Pill badge with role-specific icon and text)
  const renderRoleBadge = () => {
    if (!isAuthenticated || !role || role === 'guest') return null;

    let label = '';
    let icon = null;
    let bg = '#EFF6FF';
    let color = '#1D4ED8';
    let border = '#BFDBFE';

    if (role === 'super_admin') {
      label = t('superAdmin', 'Super Admin');
      icon = <MdAdminPanelSettings size={15} style={{ marginRight: 5 }} />;
      bg = '#EFF6FF';
      color = '#1E40AF';
      border = '#BFDBFE';
    } else if (role === 'staff') {
      label = t('adminStaff', 'Admin Staff');
      icon = <MdAdminPanelSettings size={15} style={{ marginRight: 5 }} />;
      bg = '#F1F5F9';
      color = '#334155';
      border = '#CBD5E1';
    } else if (role === 'seller') {
      label = t('farmerSeller', 'Farmer');
      icon = <MdAgriculture size={16} style={{ marginRight: 5 }} />;
      bg = '#F0FDF4';
      color = '#15803D';
      border = '#BBF7D0';
    } else if (role === 'buyer') {
      label = t('traderBuyer', 'Buyer');
      icon = <MdStorefront size={15} style={{ marginRight: 5 }} />;
      bg = '#F0F9FF';
      color = '#0369A1';
      border = '#BAE6FD';
    } else {
      label = role;
      bg = '#F8FAFC';
      color = '#475569';
      border = '#E2E8F0';
    }

    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: { xs: 1.2, sm: 1.5 },
          py: 0.5,
          borderRadius: '9999px',
          bgcolor: bg,
          color: color,
          border: `1px solid ${border}`,
          fontSize: { xs: '0.74rem', sm: '0.8rem' },
          fontWeight: 700,
          whiteSpace: 'nowrap',
          letterSpacing: '0.01em',
        }}
      >
        {icon}
        <span>{label}</span>
      </Box>
    );
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#FFFFFF',
        color: '#0F172A',
        borderBottom: '1px solid #E2E8F0',
        zIndex: (theme) => theme.zIndex.drawer - 1,
        width: '100%',
        boxShadow: 'none',
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          px: { xs: 1.5, sm: 2, md: 3 },
          minHeight: { xs: '56px !important', sm: '62px !important' },
        }}
      >
        {/* Left Side: Mobile Hamburger + Brand Logo + Optional Public Links */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          {onToggleSidebar && (
            <IconButton onClick={onToggleSidebar} edge="start" sx={{ color: '#0F172A', p: 0.8 }}>
              <MdMenu size={24} />
            </IconButton>
          )}

          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: '#2563EB',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              <MdAgriculture />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#0F172A', letterSpacing: '-0.02em', fontSize: '1.15rem' }}>
              Khet<span style={{ color: '#2563EB' }}>Setu</span>
            </Typography>
          </Link>

          {/* Contextual Market browse shortcut for non-admin portals */}
          {!['super_admin', 'staff'].includes(role) && (
            <Button
              component={Link}
              to="/market"
              size="small"
              variant="text"
              sx={{ display: { xs: 'none', lg: 'inline-flex' }, color: '#475569', fontWeight: 600, ml: 1 }}
            >
              {t('mandiRatesMarket', 'Mandi Rates & Market')}
            </Button>
          )}
        </Box>

        {/* Right End Corner: [Role] -> [Language] -> [Logout] */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.2, md: 1.5 } }}>
          {/* Cart Shortcut for Buyers */}
          {role === 'buyer' && (
            <IconButton
              component={Link}
              to="/buyer/cart"
              size="small"
              sx={{
                color: '#0F172A',
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                p: 0.7,
                '&:hover': { bgcolor: '#F1F5F9' },
              }}
              title={t('cart', 'Cart')}
            >
              <Badge badgeContent={totalItemsCount} color="primary" max={99}>
                <MdShoppingCart size={18} />
              </Badge>
            </IconButton>
          )}

          {/* 1. ROLE WRITTEN */}
          {renderRoleBadge()}

          {/* 2. LANGUAGE BUTTON */}
          <LanguageSelector variant="menu" size="small" />

          {/* 3. LOGOUT BUTTON */}
          {isAuthenticated ? (
            <Button
              onClick={clearSessionAndRedirect}
              startIcon={<MdLogout size={16} />}
              size="small"
              variant="outlined"
              sx={{
                color: '#DC2626',
                bgcolor: '#FEF2F2',
                borderColor: '#FECACA',
                borderRadius: 2,
                px: { xs: 1, sm: 1.5 },
                py: 0.55,
                fontSize: '0.8125rem',
                fontWeight: 700,
                textTransform: 'none',
                whiteSpace: 'nowrap',
                minWidth: 'auto',
                boxShadow: 'none',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: '#FEE2E2',
                  borderColor: '#F87171',
                  boxShadow: 'none',
                },
                '& .MuiButton-startIcon': {
                  mr: { xs: 0, sm: 0.7 },
                  ml: 0,
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {t('logout', 'Sign Out')}
              </Box>
            </Button>
          ) : (
            /* Sign In Button if not authenticated */
            <Button
              component={Link}
              to="/login"
              variant="contained"
              color="primary"
              size="small"
              sx={{
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                px: 2,
              }}
            >
              {t('signIn', 'Sign In')}
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
