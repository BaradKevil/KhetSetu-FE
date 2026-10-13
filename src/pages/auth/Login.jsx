import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Fade,
  Collapse,
} from '@mui/material';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  MdAgriculture,
  MdPhoneIphone,
  MdLockOpen,
  MdTimer,
  MdLanguage,
  MdArrowForward,
} from 'react-icons/md';
import { useSendOtpMutation, useVerifyOtpMutation } from '../../Api/Api';
import { unwrap } from '../../Api/apiUtils';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../../common/custom/LanguageSelector';
import PhoneInput from '../../common/custom/PhoneInput';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language: lang, changeLanguage: setLang } = useLanguage();

  const [phone, setPhone] = useState(() => searchParams.get('phone') || '');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Sync phone and lang from URL searchParams
  useEffect(() => {
    const urlPhone = searchParams.get('phone');
    if (urlPhone) setPhone(urlPhone);

    const urlLang = searchParams.get('lang');
    if (urlLang && ['en', 'hi', 'gu'].includes(urlLang) && urlLang !== lang) {
      setLang(urlLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const sendOtpMutation = useSendOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();

  // 30-second cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    if (!cleanDigits || cleanDigits.length < 10) {
      toast.error(t('auth.enterValidPhone'));
      return;
    }
    const fullPhone = `+91${cleanDigits}`;
    try {
      const res = await sendOtpMutation.mutateAsync({ phone: fullPhone });
      setOtpSent(true);
      setResendCooldown(30);
      toast.success(res.data?.message || res.message || t('auth.otpSentToast'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.otpSendFailed'));
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      toast.error(t('auth.enterValidOtp'));
      return;
    }

    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    const fullPhone = `+91${cleanDigits}`;

    try {
      const res = await verifyOtpMutation.mutateAsync({
        phone: fullPhone,
        otp: cleanOtp,
      });

      const authData = unwrap(res);
      if (!authData || !authData.accessToken) {
        toast.error(t('auth.authResponseInvalid'));
        return;
      }

      // Robust role extraction handling string, object, role_code or JWT payload
      let roleCode = '';
      const rawRole = authData.user?.role;
      if (typeof rawRole === 'string' && rawRole.trim() && rawRole !== '[object Object]') {
        roleCode = rawRole.trim();
      } else if (rawRole && typeof rawRole === 'object' && rawRole.code) {
        roleCode = rawRole.code;
      } else if (authData.user?.role_code) {
        roleCode = authData.user.role_code;
      }

      if (!roleCode && authData.accessToken) {
        try {
          const parts = authData.accessToken.split('.');
          if (parts.length >= 2) {
            const payload = JSON.parse(atob(parts[1]));
            roleCode = payload.role_code || payload.role || '';
          }
        } catch {
          // ignore
        }
      }

      if (!roleCode) {
        const queryRole = searchParams.get('role');
        if (queryRole === 'buyer' || queryRole === 'seller' || queryRole === 'farmer') {
          roleCode = queryRole;
        } else {
          roleCode = 'seller';
        }
      }

      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      localStorage.setItem('role', roleCode);
      localStorage.setItem('phone', authData.user?.phone || fullPhone);
      localStorage.setItem('fullName', authData.user?.full_name || 'User');
      localStorage.setItem('profilePhoto', authData.user?.profile_photo || '');

      // Sync user preferred language: if user previously had a saved language in MySQL, restore it immediately
      const savedUserLang = authData.user?.preferred_language;
      if (savedUserLang && (savedUserLang === 'en' || savedUserLang === 'hi' || savedUserLang === 'gu')) {
        setLang(savedUserLang);
      } else {
        // Otherwise save the current language preference
        setLang(lang);
      }

      toast.success(t('auth.welcomeBackUser', { name: authData.user?.full_name || t('common.user') }));

      // Dynamic redirection based on role associated with the mobile number
      if (roleCode === 'seller' || roleCode === 'farmer') {
        navigate('/seller');
      } else if (roleCode === 'buyer') {
        navigate('/buyer');
      } else if (roleCode === 'super_admin' || roleCode === 'staff') {
        navigate('/admin');
      } else {
        navigate('/seller');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.invalidOtpCode'));
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
          maxWidth: { xs: '100%', sm: 440 },
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
        {/* Universal Language Switcher Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <MdLanguage color="#64748B" size={18} />
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              {t('common.language')}
            </Typography>
          </Box>
          <LanguageSelector variant="chips" size="small" showIcon={false} />
        </Box>

        {/* Brand Icon & Heading */}
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3.5,
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              mx: 'auto',
              mb: 1.8,
              boxShadow: '0 8px 18px rgba(37, 99, 235, 0.22)',
            }}
          >
            <MdAgriculture />
          </Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.3px' }}>
            {t('auth.loginTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('auth.loginSubtitle')}
          </Typography>
        </Box>

        {/* Main Phone Input Form */}
        <Box component="form" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} noValidate>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.8, display: 'block' }}>
              {t('auth.phoneLabel')}
            </Typography>
            <PhoneInput
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('auth.phonePlaceholder')}
              autoComplete="off"
              disabled={otpSent}
              size="medium"
              InputProps={{
                sx: {
                  bgcolor: otpSent ? '#F8FAFC' : '#FFFFFF',
                },
              }}
            />
          </Box>

          {/* Action 1: Get OTP (Visible when OTP is not sent) */}
          {!otpSent && (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={sendOtpMutation.isPending}
              sx={{
                py: 1.4,
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: '0.95rem',
                textTransform: 'none',
                boxShadow: '0 6px 16px rgba(46, 125, 50, 0.25)',
              }}
            >
              {sendOtpMutation.isPending ? t('common.loading') : t('auth.getOtpBtn')}
            </Button>
          )}

          {/* Action 2: OTP Field Revealed below Phone Input */}
          <Collapse in={otpSent} timeout={300}>
            <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #E2E8F0' }}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                  <Typography variant="caption" fontWeight={700} color="#334155">
                    {t('auth.otpLabel')}
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                    sx={{ p: 0, minWidth: 'auto', textTransform: 'none', fontSize: '0.75rem', color: '#64748B' }}
                  >
                    {t('auth.changeNumber')}
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  variant="outlined"
                  autoFocus
                  inputProps={{ maxLength: 6, style: { letterSpacing: '4px', fontWeight: 700, fontSize: '1.1rem' } }}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: '#64748B' }}>
                        <MdLockOpen size={20} />
                      </Box>
                    ),
                    sx: { borderRadius: 2.5 },
                  }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={verifyOtpMutation.isPending}
                endIcon={<MdArrowForward />}
                sx={{
                  py: 1.4,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  boxShadow: '0 6px 16px rgba(46, 125, 50, 0.25)',
                  mb: 1.5,
                }}
              >
                {verifyOtpMutation.isPending ? t('common.loading') : t('auth.verifyBtn')}
              </Button>

              {/* Resend Timer & Notice */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={handleSendOtp}
                  disabled={resendCooldown > 0 || sendOtpMutation.isPending}
                  startIcon={<MdTimer size={16} />}
                  sx={{ textTransform: 'none', fontSize: '0.8rem', color: resendCooldown > 0 ? '#94A3B8' : '#2E7D32', fontWeight: 600 }}
                >
                  {resendCooldown > 0 ? `${t('auth.resendIn')} ${resendCooldown}s` : t('auth.resendBtn')}
                </Button>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                  {t('auth.demoNotice')}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Footer Link to Register */}
        <Box sx={{ mt: 3.5, textAlign: 'center', pt: 2.5, borderTop: '1px solid #F1F5F9' }}>
          <Typography variant="body2" color="text.secondary">
            {t('auth.newAccount')}{' '}
            <Link
              to={`/register?phone=${encodeURIComponent(phone)}&lang=${lang}`}
              style={{ color: '#2E7D32', fontWeight: 800, textDecoration: 'none' }}
            >
              {t('auth.registerLink')}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
