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
import { useNavigate, Link } from 'react-router-dom';
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

const UI_TEXT = {
  en: {
    language: 'Language',
    title: 'Sign In to KhetSetu',
    subtitle: 'Farmer & Buyer Unified Marketplace',
    phoneLabel: 'Registered Mobile Number',
    phonePlaceholder: 'Enter 10-digit mobile number',
    getOtpBtn: 'Get OTP',
    otpLabel: 'Enter 6-Digit Verification Code',
    otpPlaceholder: 'Enter 6-digit OTP',
    verifyBtn: 'Verify & Sign In',
    resendIn: 'Resend code in',
    resendBtn: 'Resend OTP',
    changeNumber: 'Change Number',
    newAccount: 'New to KhetSetu?',
    registerLink: 'Register Free Account',
    demoNotice: '💡 Demo Sandbox OTP: 123456',
  },
  hi: {
    language: 'भाषा',
    title: 'खेतसेतु में प्रवेश करें',
    subtitle: 'किसान और खरीदार का एकीकृत कृषि बाजार',
    phoneLabel: 'पंजीकृत मोबाइल नंबर',
    phonePlaceholder: '10-अंकीय मोबाइल नंबर दर्ज करें',
    getOtpBtn: 'OTP प्राप्त करें',
    otpLabel: '6-अंकीय सत्यापन कोड दर्ज करें',
    otpPlaceholder: '6-अंकीय OTP दर्ज करें',
    verifyBtn: 'सत्यापित करें और प्रवेश करें',
    resendIn: 'पुनः कोड भेजें',
    resendBtn: 'OTP पुनः भेजें',
    changeNumber: 'नंबर बदलें',
    newAccount: 'खेतसेतु पर नए हैं?',
    registerLink: 'निःशुल्क खाता बनाएं',
    demoNotice: '💡 डेमो टेस्ट OTP: 123456',
  },
  gu: {
    language: 'ભાષા',
    title: 'ખેતસેતુમાં લોગિન કરો',
    subtitle: 'ખેડૂત અને વેપારી માટે વિશ્વસનીય કૃષિ પ્લેટફોર્મ',
    phoneLabel: 'નોંધાયેલ મોબાઈલ નંબર',
    phonePlaceholder: '10-અંકનો મોબાઈલ નંબર દાખલ કરો',
    getOtpBtn: 'OTP મેળવો',
    otpLabel: '6-અંકનો વેરિફિકેશન કોડ દાખલ કરો',
    otpPlaceholder: '6-અંકનો OTP દાખલ કરો',
    verifyBtn: 'ચકાસો અને આગળ વધો',
    resendIn: 'ફરીથી કોડ મોકલો',
    resendBtn: 'OTP ફરીથી મોકલો',
    changeNumber: 'નંબર બદલો',
    newAccount: 'ખેતસેતુ પર નવા છો?',
    registerLink: 'નવું ખાતું બનાવો',
    demoNotice: '💡 ડેમો ટેસ્ટ OTP: 123456',
  },
};

const Login = () => {
  const navigate = useNavigate();
  const { language: lang, changeLanguage: setLang } = useLanguage();
  const t = UI_TEXT[lang] || UI_TEXT.en;

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

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
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }
    const fullPhone = `+91${cleanDigits}`;
    try {
      const res = await sendOtpMutation.mutateAsync({ phone: fullPhone });
      setOtpSent(true);
      setResendCooldown(30);
      toast.success(res.data?.message || res.message || 'OTP sent! Test OTP is 123456');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      toast.error('Please enter the 6-digit OTP code.');
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
        toast.error('Authentication response invalid. Please try again.');
        return;
      }

      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      localStorage.setItem('role', authData.user?.role || '');
      localStorage.setItem('phone', authData.user?.phone || '');
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

      toast.success(`Welcome back, ${authData.user?.full_name || 'User'}!`);

      // Dynamic redirection based on role associated with the mobile number
      const userRole = authData.user?.role;
      if (userRole === 'seller') {
        navigate('/seller');
      } else if (userRole === 'buyer') {
        navigate('/buyer');
      } else if (userRole === 'super_admin' || userRole === 'staff') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP code. Please try again.');
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
        bgcolor: { xs: '#FFFFFF', sm: '#F8FAF9' },
        background: {
          xs: '#FFFFFF',
          sm: 'radial-gradient(circle at 10% 20%, rgba(46, 125, 50, 0.08) 0%, transparent 45%), #F8FAF9',
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
          boxShadow: { xs: 'none', sm: '0 20px 40px rgba(0, 0, 0, 0.05)' },
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
              {t.language || 'Language'}
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
              bgcolor: '#2E7D32',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              mx: 'auto',
              mb: 1.8,
              boxShadow: '0 8px 18px rgba(46, 125, 50, 0.22)',
            }}
          >
            <MdAgriculture />
          </Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.3px' }}>
            {t.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t.subtitle}
          </Typography>
        </Box>

        {/* Main Phone Input Form */}
        <Box component="form" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} noValidate>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.8, display: 'block' }}>
              {t.phoneLabel}
            </Typography>
            <PhoneInput
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.phonePlaceholder}
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
              {sendOtpMutation.isPending ? 'Sending OTP...' : t.getOtpBtn}
            </Button>
          )}

          {/* Action 2: OTP Field Revealed below Phone Input */}
          <Collapse in={otpSent} timeout={300}>
            <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #E2E8F0' }}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                  <Typography variant="caption" fontWeight={700} color="#334155">
                    {t.otpLabel}
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
                    {t.changeNumber}
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
                {verifyOtpMutation.isPending ? 'Verifying...' : t.verifyBtn}
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
                  {resendCooldown > 0 ? `${t.resendIn} ${resendCooldown}s` : t.resendBtn}
                </Button>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                  {t.demoNotice}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Footer Link to Register */}
        <Box sx={{ mt: 3.5, textAlign: 'center', pt: 2.5, borderTop: '1px solid #F1F5F9' }}>
          <Typography variant="body2" color="text.secondary">
            {t.newAccount}{' '}
            <Link
              to={`/register?phone=${encodeURIComponent(phone)}&lang=${lang}`}
              style={{ color: '#2E7D32', fontWeight: 800, textDecoration: 'none' }}
            >
              {t.registerLink}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
