import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardActionArea,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  Fade,
} from '@mui/material';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  MdAgriculture,
  MdShoppingCart,
  MdLanguage,
  MdArrowForward,
  MdCheckCircle,
} from 'react-icons/md';
import { useRegisterMutation } from '../../Api/Api';
import { unwrap } from '../../Api/apiUtils';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../../common/custom/LanguageSelector';
import PhoneInput from '../../common/custom/PhoneInput';
import LocationSelector from '../../common/custom/LocationSelector';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { t, language: lang, changeLanguage: setLang } = useLanguage();

  // Initialize role based on URL parameter (?role=buyer or ?role=seller)
  const initialRole = searchParams.get('role') === 'buyer' ? 'buyer' : 'seller';
  const [role, setRole] = useState(initialRole);

  // Sync role state and update URL query parameter immediately
  const handleRoleSelect = (newRole) => {
    setRole(newRole);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('role', newRole);
    setSearchParams(newParams, { replace: true });
  };

  // Keep state in sync if user navigates back/forward or URL changes
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'buyer' || roleParam === 'seller') {
      setRole(roleParam);
    }
  }, [searchParams]);

  // Initialize language once from query parameter on initial mount if provided
  useEffect(() => {
    const paramLang = searchParams.get('lang');
    if (paramLang && (paramLang === 'en' || paramLang === 'hi' || paramLang === 'gu')) {
      setLang(paramLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL query param in sync with currently selected language without triggering resets
  useEffect(() => {
    if (searchParams.get('lang') !== lang) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('lang', lang);
      setSearchParams(newParams, { replace: true });
    }
  }, [lang, searchParams, setSearchParams]);

  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: searchParams.get('phone') || '',
    password: '',
    state: '',
    district: '',
    city: '',
    village: '',
    buyer_type: 'individual',
    company_name: '',
  });

  const registerMutation = useRegisterMutation();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.full_name?.trim()) {
      toast.error(t('auth.enterFullName'));
      return;
    }

    const cleanDigits = formData.phone.replace(/\D/g, '').slice(-10);
    if (!cleanDigits || cleanDigits.length < 10) {
      toast.error(t('auth.enterValidPhone'));
      return;
    }
    const fullPhone = `+91${cleanDigits}`;

    if (!acceptedTerms) {
      toast.error(t('auth.acceptTermsError'));
      return;
    }

    try {
      // Build clean payload without unnecessary empty fields
      const payload = {
        role,
        full_name: formData.full_name.trim(),
        phone: fullPhone,
        preferred_language: lang,
      };

      if (formData.password?.trim()) {
        payload.password = formData.password.trim();
      }

      if (role === 'seller') {
        if (formData.state?.trim()) payload.state = formData.state.trim();
        if (formData.district?.trim()) payload.district = formData.district.trim();
        if (formData.city?.trim()) payload.sub_district = formData.city.trim();
        if (formData.village?.trim()) payload.village = formData.village.trim();
      } else {
        payload.buyer_type = formData.buyer_type || 'individual';
        // Company name is completely optional for buyers (e.g. for personal use)
        if (formData.company_name?.trim()) {
          payload.company_name = formData.company_name.trim();
        }
        if (formData.state?.trim()) payload.state = formData.state.trim();
        if (formData.district?.trim()) payload.district = formData.district.trim();
        if (formData.city?.trim()) payload.sub_district = formData.city.trim();
      }

      await registerMutation.mutateAsync(payload);

      const successMsg =
        role === 'seller'
          ? t('auth.registrationSuccessFarmer')
          : t('auth.registrationSuccessBuyer');

      toast.success(successMsg);

      // Production-grade flow: Redirect to /login after successful account registration
      navigate(`/login?phone=${encodeURIComponent(cleanDigits)}&role=${role}&lang=${lang}`);
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.registrationFailed'));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'center',
        p: { xs: 0, sm: 2.5, md: 4 },
        bgcolor: { xs: '#FFFFFF', sm: '#F8FAFC' },
        background: {
          xs: '#FFFFFF',
          sm: 'radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.06) 0%, transparent 45%), #F8FAFC',
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 4, md: 4.5 },
          width: '100%',
          maxWidth: { xs: '100%', sm: 540 },
          minHeight: { xs: '100vh', sm: 'auto' },
          borderRadius: { xs: 0, sm: 4 },
          border: { xs: 'none', sm: '1px solid #E2E8F0' },
          boxShadow: { xs: 'none', sm: '0 20px 40px rgba(15, 23, 42, 0.05)' },
          bgcolor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Universal Language Selection Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <MdLanguage color="#64748B" size={18} />
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              {t('common.language')}
            </Typography>
          </Box>
          <LanguageSelector variant="chips" size="small" showIcon={false} />
        </Box>

        {/* Header Heading */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              mx: 'auto',
              mb: 1.5,
              transition: 'background-color 0.3s ease',
              boxShadow: '0 8px 18px rgba(37, 99, 235, 0.22)',
            }}
          >
            {role === 'seller' ? <MdAgriculture /> : <MdShoppingCart />}
          </Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.3px' }}>
            {t('auth.regTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('auth.regSubtitle')}
          </Typography>
        </Box>

        {/* Clean Production-Grade Role Toggle Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            mb: 3,
            width: '100%',
          }}
        >
          {/* Card 1: Farmer (Seller) */}
          <Card
            elevation={0}
            onClick={() => handleRoleSelect('seller')}
            sx={{
              position: 'relative',
              cursor: 'pointer',
              borderRadius: 3,
              border: role === 'seller' ? '2px solid #2E7D32' : '1.5px solid #E2E8F0',
              bgcolor: role === 'seller' ? '#F0FDF4' : '#FFFFFF',
              boxShadow:
                role === 'seller'
                  ? '0 6px 16px rgba(46, 125, 50, 0.12)'
                  : '0 2px 6px rgba(0, 0, 0, 0.02)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              userSelect: 'none',
              '&:hover': {
                borderColor: role === 'seller' ? '#2E7D32' : '#CBD5E1',
                transform: 'translateY(-2px)',
                boxShadow:
                  role === 'seller'
                    ? '0 8px 20px rgba(46, 125, 50, 0.16)'
                    : '0 4px 12px rgba(0, 0, 0, 0.06)',
              },
            }}
          >
            {/* Top-right active checkmark badge */}
            {role === 'seller' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  color: '#2E7D32',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <MdCheckCircle size={18} />
              </Box>
            )}

            <Box
              sx={{
                p: { xs: 2, sm: 2.2 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: role === 'seller' ? 'rgba(46, 125, 50, 0.14)' : '#F1F5F9',
                  color: role === 'seller' ? '#2E7D32' : '#64748B',
                  mb: 1.2,
                  transition: 'all 0.2s ease',
                }}
              >
                <MdAgriculture size={24} />
              </Box>

              <Typography
                variant="subtitle2"
                fontWeight={800}
                sx={{
                  color: role === 'seller' ? '#166534' : '#1E293B',
                  fontSize: '0.9rem',
                  lineHeight: 1.2,
                }}
              >
                {t('auth.farmerTitle')}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: role === 'seller' ? '#15803D' : '#64748B',
                  fontSize: '0.72rem',
                  mt: 0.6,
                  lineHeight: 1.35,
                  minHeight: 32,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {t('auth.farmerDesc')}
              </Typography>
            </Box>
          </Card>

          {/* Card 2: Buyer (Personal / Trade) */}
          <Card
            elevation={0}
            onClick={() => handleRoleSelect('buyer')}
            sx={{
              position: 'relative',
              cursor: 'pointer',
              borderRadius: 3,
              border: role === 'buyer' ? '2px solid #0288D1' : '1.5px solid #E2E8F0',
              bgcolor: role === 'buyer' ? '#F0F9FF' : '#FFFFFF',
              boxShadow:
                role === 'buyer'
                  ? '0 6px 16px rgba(2, 136, 209, 0.12)'
                  : '0 2px 6px rgba(0, 0, 0, 0.02)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              userSelect: 'none',
              '&:hover': {
                borderColor: role === 'buyer' ? '#0288D1' : '#CBD5E1',
                transform: 'translateY(-2px)',
                boxShadow:
                  role === 'buyer'
                    ? '0 8px 20px rgba(2, 136, 209, 0.16)'
                    : '0 4px 12px rgba(0, 0, 0, 0.06)',
              },
            }}
          >
            {/* Top-right active checkmark badge */}
            {role === 'buyer' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  color: '#0288D1',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <MdCheckCircle size={18} />
              </Box>
            )}

            <Box
              sx={{
                p: { xs: 2, sm: 2.2 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: role === 'buyer' ? 'rgba(2, 136, 209, 0.14)' : '#F1F5F9',
                  color: role === 'buyer' ? '#0288D1' : '#64748B',
                  mb: 1.2,
                  transition: 'all 0.2s ease',
                }}
              >
                <MdShoppingCart size={24} />
              </Box>

              <Typography
                variant="subtitle2"
                fontWeight={800}
                sx={{
                  color: role === 'buyer' ? '#0369A1' : '#1E293B',
                  fontSize: '0.9rem',
                  lineHeight: 1.2,
                }}
              >
                {t('auth.buyerTitle')}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: role === 'buyer' ? '#0284C7' : '#64748B',
                  fontSize: '0.72rem',
                  mt: 0.6,
                  lineHeight: 1.35,
                  minHeight: 32,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {t('auth.buyerDesc')}
              </Typography>
            </Box>
          </Card>
        </Box>

        {/* User-Friendly Form */}
        <Box component="form" onSubmit={handleRegister} noValidate>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block' }}>
              {t('auth.fullName')} *
            </Typography>
            <TextField
              fullWidth
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder={t('auth.fullNamePlaceholder')}
              size="medium"
              InputProps={{ sx: { borderRadius: 2.5 } }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block' }}>
              {t('auth.phone')} *
            </Typography>
            <PhoneInput
              fullWidth
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder={t('auth.phonePlaceholder')}
              autoComplete="off"
              size="medium"
            />
          </Box>

          {/* Cascading Location Selector (State -> District -> City / Taluka -> Village) */}
          <Box sx={{ mb: 2 }}>
            <LocationSelector
              values={{
                state: formData.state,
                district: formData.district,
                city: formData.city,
                village: formData.village,
              }}
              onChange={(loc) => setFormData((prev) => ({ ...prev, ...loc }))}
              showVillage={role === 'seller'}
              labels={{
                state: t('common.state'),
                district: t('common.district'),
                city: t('common.city'),
                village: t('common.village'),
                selectState: t('common.selectState'),
                selectDistrict: t('common.selectDistrict'),
                selectCity: t('common.selectCity'),
                selectVillage: t('common.selectVillage'),
                selectStateFirst: t('common.selectStateFirst'),
                selectDistrictFirst: t('common.selectDistrictFirst'),
                selectCityFirst: t('common.selectCityFirst'),
                lang: lang,
              }}
            />
          </Box>

          {/* Buyer Specific: Individual vs Business (Company NOT required) */}
          {role === 'buyer' && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block' }}>
                  {t('auth.buyerType')}
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={formData.buyer_type}
                  onChange={(e) => setFormData({ ...formData, buyer_type: e.target.value })}
                  size="medium"
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                >
                  <MenuItem value="individual">{t('auth.individualBuyer')}</MenuItem>
                  <MenuItem value="trader">{t('auth.tradeBuyer')}</MenuItem>
                  <MenuItem value="retailer">{t('auth.retailBuyer')}</MenuItem>
                  <MenuItem value="miller">{t('auth.millerBuyer')}</MenuItem>
                </TextField>
              </Box>

              {/* Company name only shown as optional helper for trade buyers */}
              {formData.buyer_type !== 'individual' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block' }}>
                    {t('auth.companyOptional')}
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g. Shree Ram Agro Commodities"
                    size="medium"
                    InputProps={{ sx: { borderRadius: 2.5 } }}
                  />
                </Box>
              )}
            </>
          )}

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block' }}>
              {t('auth.password')}
            </Typography>
            <TextField
              fullWidth
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              size="medium"
              InputProps={{ sx: { borderRadius: 2.5 } }}
              helperText={t('auth.passwordHelper')}
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={<Typography variant="caption" color="text.secondary">{t('auth.terms')}</Typography>}
            sx={{ mb: 2.5 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={registerMutation.isPending}
            endIcon={<MdArrowForward />}
            sx={{
              py: 1.4,
              borderRadius: 2.5,
              fontWeight: 700,
              fontSize: '0.95rem',
              textTransform: 'none',
              bgcolor: role === 'seller' ? '#2E7D32' : '#0288D1',
              '&:hover': {
                bgcolor: role === 'seller' ? '#1B5E20' : '#0277BD',
              },
              boxShadow:
                role === 'seller'
                  ? '0 6px 16px rgba(46, 125, 50, 0.25)'
                  : '0 6px 16px rgba(2, 136, 209, 0.25)',
            }}
          >
            {registerMutation.isPending
              ? t('auth.creatingAccount')
              : role === 'seller'
              ? t('auth.createFarmerBtn')
              : t('auth.createBuyerBtn')}
          </Button>
        </Box>

        {/* Footer Link to Login */}
        <Box sx={{ mt: 3, textAlign: 'center', pt: 2, borderTop: '1px solid #F1F5F9' }}>
          <Typography variant="body2" color="text.secondary">
            {t('auth.alreadyAccount')}{' '}
            <Link to="/login" style={{ color: '#2E7D32', fontWeight: 800, textDecoration: 'none' }}>
              {t('auth.signIn')}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
