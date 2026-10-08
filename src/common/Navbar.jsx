import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import {
  MdMenu,
  MdAccountCircle,
  MdLogout,
  MdAgriculture,
} from 'react-icons/md';
import { clearSessionAndRedirect } from '../Api/ApiClient';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './custom/LanguageSelector';

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const role = localStorage.getItem('role') || 'guest';
  const phone = localStorage.getItem('phone') || '';
  const rawFullName = localStorage.getItem('fullName') || '';
  const profilePhoto = localStorage.getItem('profilePhoto') || '';

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Formats phone into readable "+91 XXXXX XXXXX"
  const formatPhoneNumber = (p) => {
    if (!p) return '';
    const digits = String(p).replace(/\D/g, '');
    if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    return p;
  };

  // Resolves a human display name instead of showing raw phone numbers
  const getDisplayName = () => {
    if (rawFullName && !rawFullName.startsWith('+') && !/^\d+$/.test(rawFullName.replace(/\s+/g, ''))) {
      return rawFullName;
    }
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'staff':
        return 'Admin Staff';
      case 'seller':
        return 'Farmer (Seller)';
      case 'buyer':
        return 'Trader (Buyer)';
      default:
        return 'User';
    }
  };

  // Fallback avatar content when profile photo is not yet uploaded
  const getAvatarContent = () => {
    if (profilePhoto) return null;
    const name = getDisplayName();
    if (name && name !== 'User') {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    return <MdAccountCircle size={22} />;
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'seller':
        return <Chip label={t('farmerSeller', '🌾 Farmer')} size="small" sx={{ bgcolor: '#E8F5E9', color: '#1B5E20', fontWeight: 700 }} />;
      case 'buyer':
        return <Chip label={t('traderBuyer', '💼 Buyer')} size="small" sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 700 }} />;
      case 'super_admin':
      case 'staff':
        return <Chip label={t('superAdmin', '🛡️ Super Admin')} size="small" sx={{ bgcolor: '#F1F5F9', color: '#0F172A', fontWeight: 700 }} />;
      default:
        return null;
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#FFFFFF',
        color: '#1E293B',
        borderBottom: '1px solid #E2E8F0',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {onToggleSidebar && (
            <IconButton onClick={onToggleSidebar} edge="start" sx={{ color: '#1E293B' }}>
              <MdMenu size={24} />
            </IconButton>
          )}

          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: '#2E7D32',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
              }}
            >
              <MdAgriculture />
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#1E293B', letterSpacing: '-0.02em' }}>
              Khet<span style={{ color: '#2E7D32' }}>Setu</span>
            </Typography>
          </Link>

          <Box sx={{ ml: 2, display: { xs: 'none', sm: 'block' } }}>
            {getRoleBadge()}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Public browse shortcut - Hidden in Admin mode (Issue #9) */}
          {role !== 'super_admin' && role !== 'staff' ? (
            <Button
              component={Link}
              to="/market"
              size="small"
              variant="text"
              sx={{ display: { xs: 'none', md: 'inline-flex' }, color: '#475569', fontWeight: 600 }}
            >
              {t('mandiRatesMarket', 'Mandi Rates & Market')}
            </Button>
          ) : (
            <Chip
              label="PROD • ESCROW SECURE"
              size="small"
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                bgcolor: '#DCFCE7',
                color: '#166534',
                fontWeight: 800,
                fontSize: '0.72rem',
                border: '1px solid #86EFAC',
              }}
            />
          )}

          {/* Reusable Universal Language Selector */}
          <LanguageSelector variant="menu" size="small" />

          {/* User Account Menu with Photo Support */}
          {localStorage.getItem('accessToken') ? (
            <>
              <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                <Avatar
                  src={profilePhoto || undefined}
                  sx={{
                    bgcolor: '#2E7D32',
                    width: 38,
                    height: 38,
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    border: '2px solid #E2E8F0',
                  }}
                >
                  {getAvatarContent()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                slotProps={{ paper: { sx: { width: 240, borderRadius: 2.5, mt: 1, p: 0.5, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' } } }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    src={profilePhoto || undefined}
                    sx={{
                      bgcolor: '#2E7D32',
                      width: 42,
                      height: 42,
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}
                  >
                    {getAvatarContent()}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {getDisplayName()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.2 }}>
                      {formatPhoneNumber(phone)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ px: 2, py: 1 }}>
                  {getRoleBadge()}
                </Box>

                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate(role === 'seller' ? '/seller/profile' : '/buyer/profile');
                  }}
                  sx={{ borderRadius: 1.5, mx: 0.5 }}
                >
                  <MdAccountCircle size={18} style={{ marginRight: 10, color: '#64748B' }} />
                  {t('businessProfile', 'Profile & Settings')}
                </MenuItem>
                <MenuItem
                  onClick={clearSessionAndRedirect}
                  sx={{ color: '#DC2626', borderRadius: 1.5, mx: 0.5 }}
                >
                  <MdLogout size={18} style={{ marginRight: 10 }} />
                  {t('logout', 'Sign Out')}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button component={Link} to="/login" variant="contained" color="primary" size="small" sx={{ fontWeight: 700 }}>
              {t('signIn', 'Sign In')}
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
