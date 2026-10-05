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
import { MdMenu, MdAccountCircle, MdLogout, MdAgriculture, MdLanguage } from 'react-icons/md';
import { clearSessionAndRedirect } from '../Api/ApiClient';

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'guest';
  const phone = localStorage.getItem('phone') || '';
  const fullName = localStorage.getItem('fullName') || 'User';

  const [anchorEl, setAnchorEl] = useState(null);
  const [langAnchorEl, setLangAnchorEl] = useState(null);
  const [currentLang, setCurrentLang] = useState('English');

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLangOpen = (event) => setLangAnchorEl(event.currentTarget);
  const handleLangClose = (lang) => {
    if (typeof lang === 'string') setCurrentLang(lang);
    setLangAnchorEl(null);
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'seller':
        return <Chip label="🌾 Farmer / Seller" size="small" sx={{ bgcolor: '#E8F5E9', color: '#1B5E20', fontWeight: 600 }} />;
      case 'buyer':
        return <Chip label="💼 Trader / Buyer" size="small" sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 600 }} />;
      case 'super_admin':
      case 'staff':
        return <Chip label="🛡️ Super Admin" size="small" sx={{ bgcolor: '#F1F5F9', color: '#0F172A', fontWeight: 600 }} />;
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
          {/* Public browse shortcut */}
          <Button
            component={Link}
            to="/market"
            size="small"
            variant="text"
            sx={{ display: { xs: 'none', md: 'inline-flex' }, color: '#475569' }}
          >
            Mandi Rates & Market
          </Button>

          {/* Regional Language Switcher */}
          <Button
            size="small"
            startIcon={<MdLanguage size={18} />}
            onClick={handleLangOpen}
            sx={{
              color: '#334155',
              border: '1px solid #E2E8F0',
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              fontSize: '0.85rem',
            }}
          >
            {currentLang}
          </Button>
          <Menu anchorEl={langAnchorEl} open={Boolean(langAnchorEl)} onClose={() => handleLangClose(null)}>
            <MenuItem onClick={() => handleLangClose('English')}>English</MenuItem>
            <MenuItem onClick={() => handleLangClose('हिन्दी (Hindi)')}>हिन्दी (Hindi)</MenuItem>
            <MenuItem onClick={() => handleLangClose('ગુજરાતી (Gujarati)')}>ગુજરાતી (Gujarati)</MenuItem>
          </Menu>

          {/* User Account Menu */}
          {localStorage.getItem('accessToken') ? (
            <>
              <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
                <Avatar sx={{ bgcolor: '#2E7D32', width: 36, height: 36, fontSize: '0.95rem' }}>
                  {fullName.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                slotProps={{ paper: { sx: { width: 220, borderRadius: 2, mt: 1, p: 0.5 } } }}
              >
                <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                  <Typography variant="subtitle2" fontWeight={700} noWrap>
                    {fullName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {phone}
                  </Typography>
                </Box>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/seller/profile'); }}>
                  <MdAccountCircle size={18} style={{ marginRight: 10, color: '#64748B' }} />
                  Profile Details
                </MenuItem>
                <MenuItem onClick={clearSessionAndRedirect} sx={{ color: '#DC2626' }}>
                  <MdLogout size={18} style={{ marginRight: 10 }} />
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button component={Link} to="/login" variant="contained" color="primary" size="small">
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
