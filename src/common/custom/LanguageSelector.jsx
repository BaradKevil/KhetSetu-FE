import { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Chip,
  Select,
  FormControl,
} from '@mui/material';
import { MdLanguage, MdCheck } from 'react-icons/md';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Reusable Universal Language Selector Component
 * @param {'menu' | 'chips' | 'select'} variant - Visual rendering mode
 * @param {'small' | 'medium'} size - Sizing
 * @param {boolean} showIcon - Whether to render the globe icon
 * @param {object} sx - Custom MUI SX styles
 */
export const LanguageSelector = ({
  variant = 'menu',
  size = 'small',
  showIcon = true,
  sx = {},
}) => {
  const { language, changeLanguage, languages, currentLanguage } = useLanguage();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleSelect = (code) => {
    changeLanguage(code);
    handleMenuClose();
  };

  // 1. Variant: Horizontal Chips (Ideal for Login & Register cards)
  if (variant === 'chips') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, ...sx }}>
        {showIcon && (
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.5, color: '#64748B' }}>
            <MdLanguage size={18} />
          </Box>
        )}
        {languages.map((item) => {
          const isSelected = language === item.code;
          return (
            <Chip
              key={item.code}
              size={size}
              label={item.native}
              clickable
              color={isSelected ? 'primary' : 'default'}
              variant={isSelected ? 'filled' : 'outlined'}
              onClick={() => changeLanguage(item.code)}
              sx={{
                fontSize: size === 'small' ? '0.78rem' : '0.88rem',
                fontWeight: 700,
                borderRadius: 2,
                bgcolor: isSelected ? '#2563EB' : 'transparent',
                color: isSelected ? '#FFFFFF' : '#475569',
                borderColor: isSelected ? '#2563EB' : '#CBD5E1',
                '&:hover': {
                  bgcolor: isSelected ? '#1D4ED8' : '#F1F5F9',
                },
                transition: 'all 0.15s ease',
              }}
            />
          );
        })}
      </Box>
    );
  }

  // 2. Variant: Standard Form Select (Ideal for Settings / Profile modals)
  if (variant === 'select') {
    return (
      <FormControl size={size} sx={{ minWidth: 140, ...sx }}>
        <Select
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
          displayEmpty
          startAdornment={
            showIcon ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: '#2563EB' }}>
                <MdLanguage size={18} />
              </Box>
            ) : null
          }
          sx={{ borderRadius: 2.5, fontWeight: 700 }}
        >
          {languages.map((item) => (
            <MenuItem key={item.code} value={item.code} sx={{ fontWeight: 600 }}>
              {item.native} ({item.label})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  // 3. Variant: Dropdown Button & Menu (Default for Navbar and Layout Headers)
  return (
    <Box sx={sx}>
      <Button
        size={size}
        startIcon={showIcon ? <MdLanguage size={18} color="#2563EB" /> : null}
        onClick={handleMenuOpen}
        aria-label="Select Language"
        sx={{
          color: '#1E293B',
          border: '1.5px solid #E2E8F0',
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          fontSize: size === 'small' ? '0.85rem' : '0.92rem',
          fontWeight: 700,
          textTransform: 'none',
          bgcolor: '#F8FAF9',
          '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
          transition: 'all 0.15s ease',
        }}
      >
        {currentLanguage.native} ({currentLanguage.code.toUpperCase()})
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            sx: {
              width: 190,
              borderRadius: 2.5,
              mt: 1,
              p: 0.5,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
              border: '1px solid #E2E8F0',
            },
          },
        }}
      >
        {languages.map((langItem) => {
          const isSelected = language === langItem.code;
          return (
            <MenuItem
              key={langItem.code}
              selected={isSelected}
              onClick={() => handleSelect(langItem.code)}
              sx={{
                borderRadius: 1.5,
                fontWeight: isSelected ? 800 : 500,
                color: isSelected ? '#2563EB' : 'inherit',
                display: 'flex',
                justifyContent: 'space-between',
                py: 1,
                mb: 0.2,
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={isSelected ? 700 : 500}>
                  {langItem.native}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {langItem.label}
                </Typography>
              </Box>
              {isSelected && <MdCheck color="#2563EB" size={18} />}
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};

export default LanguageSelector;
