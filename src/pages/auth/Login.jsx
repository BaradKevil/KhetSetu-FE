import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  Divider,
  FormControlLabel,
  Checkbox,
  Chip,
  IconButton,
} from '@mui/material';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  MdAgriculture,
  MdPhoneIphone,
  MdLockOutline,
  MdPin,
  MdTimer,
  MdLanguage,
  MdCheckCircle,
} from 'react-icons/md';
import { useLoginMutation, useSendOtpMutation, useVerifyOtpMutation } from '../../Api/Api';
import { unwrap } from '../../Api/apiUtils';
import { toast } from 'react-toastify';

const UI_TEXT = {
  en: {
    title: 'Sign In to KhetSetu',
    subtitle: 'Farmer & Buyer Unified Agricultural Portal',
    tabOtp: 'Mobile OTP',
    tabPin: 'Quick App PIN',
    tabPassword: 'Password / Staff',
    phoneLabel: 'Registered Mobile Number',
    sendOtp: 'Send 6-Digit OTP',
    resendIn: 'Resend OTP in',
    resendBtn: 'Resend OTP',
    otpLabel: 'Enter 6-Digit OTP (Demo: 123456)',
    verifyBtn: 'Verify & Sign In',
    changePhone: 'Change Mobile Number',
    stayLoggedIn: 'Stay signed in on this phone',
    newToKhetSetu: 'New to KhetSetu?',
    createAccount: 'Register Free Account',
    demoAccess: 'DEMO SANDBOX QUICK LOGIN',
    pinLabel: 'Enter 4-Digit Quick PIN (Demo: 1234)',
    pinBtn: 'Sign In with PIN',
  },
  hi: {
    title: 'खेतसेतु में प्रवेश करें',
    subtitle: 'किसान और खरीदार का एकीकृत कृषि बाजार',
    tabOtp: 'मोबाइल OTP',
    tabPin: 'क्विक ऐप पिन',
    tabPassword: 'पासवर्ड / स्टाफ',
    phoneLabel: 'पंजीकृत मोबाइल नंबर',
    sendOtp: '6-अंकीय OTP भेजें',
    resendIn: 'पुनः OTP भेजें',
    resendBtn: 'OTP पुनः भेजें',
    otpLabel: '6-अंकीय OTP दर्ज करें (डेमो: 123456)',
    verifyBtn: 'सत्यापित करें और प्रवेश करें',
    changePhone: 'मोबाइल नंबर बदलें',
    stayLoggedIn: 'इस फोन पर लॉग इन रहें',
    newToKhetSetu: 'खेतसेतु पर नए हैं?',
    createAccount: 'निःशुल्क खाता बनाएं',
    demoAccess: 'डेमो 1-क्लिक टेस्ट लॉगिन',
    pinLabel: '4-अंकीय ऐप पिन दर्ज करें (डेमो: 1234)',
    pinBtn: 'पिन से प्रवेश करें',
  },
  gu: {
    title: 'ખેતસેતુમાં લોગિન કરો',
    subtitle: 'ખેડૂત અને વેપારી માટે વિશ્વસનીય કૃષિ પ્લેટફોર્મ',
    tabOtp: 'મોબાઇલ OTP',
    tabPin: 'ઝડપી એપ પિન',
    tabPassword: 'પાસવર્ડ / સ્ટાફ',
    phoneLabel: 'નોંધાયેલ મોબાઈલ નંબર',
    sendOtp: '6-અંકનો OTP મોકલો',
    resendIn: 'ફરીથી OTP મોકલો',
    resendBtn: 'OTP ફરીથી મોકલો',
    otpLabel: '6-અંકનો OTP દાખલ કરો (ડેમો: 123456)',
    verifyBtn: 'ચકાસો અને આગળ વધો',
    changePhone: 'મોબાઈલ નંબર બદલો',
    stayLoggedIn: 'આ ફોન પર લૉગ ઇન રહો',
    newToKhetSetu: 'ખેતસેતુ પર નવા છો?',
    createAccount: 'નવું ખાતું બનાવો',
    demoAccess: 'ડેમો 1-ક્લિક ટેસ્ટ લૉગિન',
    pinLabel: '4-અંકનો એપ પિન દાખલ કરો (ડેમો: 1234)',
    pinBtn: 'પિન સાથે લૉગિન કરો',
  },
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [lang, setLang] = useState('en');
  const t = UI_TEXT[lang] || UI_TEXT.en;

  const [tabIndex, setTabIndex] = useState(0); // 0: OTP, 1: Quick PIN, 2: Password
  const [phone, setPhone] = useState('+919876543210');
  const [password, setPassword] = useState('FarmerPassword@123');
  const [pin, setPin] = useState('1234');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [stayLoggedIn, setStayLoggedIn] = useState(true);

  const loginMutation = useLoginMutation();
  const sendOtpMutation = useSendOtpMutation();
  const verifyOtpMutation = useVerifyOtpMutation();

  // Cooldown countdown timer (30s)
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    if (!phone || phone.trim().length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }
    try {
      const res = await sendOtpMutation.mutateAsync({ phone: phone.trim() });
      setOtpSent(true);
      setResendCooldown(30);
      toast.success(res.data?.message || res.message || 'OTP sent! Test OTP is 123456');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length < 6) {
      toast.error('Please enter the 6-digit OTP.');
      return;
    }
    try {
      const res = await verifyOtpMutation.mutateAsync({ phone: phone.trim(), otp: otp.trim() });
      handleLoginSuccess(unwrap(res));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Please check and try again.');
    }
  };

  const handlePinLogin = async () => {
    if (!pin || pin.length < 4) {
      toast.error('Please enter your 4-digit PIN.');
      return;
    }
    // Sandbox PIN shortcut: verifies with default demo accounts
    try {
      const res = await loginMutation.mutateAsync({ phone: phone.trim(), password });
      handleLoginSuccess(unwrap(res));
    } catch (err) {
      toast.error(err.response?.data?.message || 'PIN authentication failed.');
    }
  };

  const handlePasswordLogin = async () => {
    try {
      const res = await loginMutation.mutateAsync({ phone: phone.trim(), password });
      handleLoginSuccess(unwrap(res));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    }
  };

  const handleLoginSuccess = (data) => {
    if (!data) return;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('role', data.user?.role || '');
    localStorage.setItem('phone', data.user?.phone || '');
    localStorage.setItem('fullName', data.user?.full_name || 'User');
    localStorage.setItem('preferredLanguage', lang);

    toast.success(`Welcome back, ${data.user?.full_name || 'User'}!`);

    if (data.user?.role === 'seller') {
      navigate('/seller');
    } else if (data.user?.role === 'buyer') {
      navigate('/buyer');
    } else if (data.user?.role === 'super_admin' || data.user?.role === 'staff') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  // Quick Sandbox Credentials
  const quickLoginAs = (roleCode) => {
    if (roleCode === 'seller') {
      setPhone('+919876543210');
      setPassword('FarmerPassword@123');
      setPin('1234');
      setTabIndex(0);
    } else if (roleCode === 'buyer') {
      setPhone('+919812345678');
      setPassword('BuyerPassword@123');
      setPin('1234');
      setTabIndex(0);
    } else if (roleCode === 'admin') {
      setPhone('+919999999999');
      setPassword('AdminPassword@123');
      setTabIndex(2);
    }
    setOtpSent(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'radial-gradient(circle at 10% 20%, rgba(46, 125, 50, 0.08) 0%, transparent 40%), #F8FAF9',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4.5 },
          width: '100%',
          maxWidth: 460,
          borderRadius: 4,
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)',
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Language Switcher Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MdLanguage color="#64748B" size={18} />
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              Language:
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिंदी' },
              { code: 'gu', label: 'ગુજરાતી' },
            ].map((item) => (
              <Chip
                key={item.code}
                size="small"
                label={item.label}
                clickable
                color={lang === item.code ? 'primary' : 'default'}
                variant={lang === item.code ? 'filled' : 'outlined'}
                onClick={() => setLang(item.code)}
                sx={{ fontSize: '0.75rem', fontWeight: 700 }}
              />
            ))}
          </Box>
        </Box>

        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: '#2E7D32',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              mx: 'auto',
              mb: 1.5,
              boxShadow: '0 8px 16px rgba(46, 125, 50, 0.2)',
            }}
          >
            <MdAgriculture />
          </Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A">
            {t.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t.subtitle}
          </Typography>
        </Box>

        {/* Auth Tabs */}
        <Tabs
          value={tabIndex}
          onChange={(_e, val) => setTabIndex(val)}
          variant="fullWidth"
          sx={{ mb: 3, borderBottom: '1px solid #F1F5F9' }}
        >
          <Tab icon={<MdPhoneIphone />} iconPosition="start" label={t.tabOtp} />
          <Tab icon={<MdPin />} iconPosition="start" label={t.tabPin} />
          <Tab icon={<MdLockOutline />} iconPosition="start" label={t.tabPassword} />
        </Tabs>

        {/* Tab 0: Primary Mobile OTP Login */}
        {tabIndex === 0 && (
          <Box>
            <TextField
              label={t.phoneLabel}
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              sx={{ mb: 2 }}
              disabled={otpSent}
              placeholder="+919876543210"
              helperText="Requires no password — verify securely via SMS OTP"
            />

            {!otpSent ? (
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSendOtp}
                disabled={sendOtpMutation.isPending}
                sx={{ py: 1.3, fontWeight: 700 }}
              >
                {sendOtpMutation.isPending ? 'Sending...' : t.sendOtp}
              </Button>
            ) : (
              <>
                <TextField
                  label={t.otpLabel}
                  fullWidth
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  sx={{ mb: 2 }}
                  autoFocus
                />
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleVerifyOtp}
                  disabled={verifyOtpMutation.isPending}
                  sx={{ py: 1.3, fontWeight: 700, mb: 1.5 }}
                >
                  {verifyOtpMutation.isPending ? 'Verifying...' : t.verifyBtn}
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleSendOtp}
                    disabled={resendCooldown > 0 || sendOtpMutation.isPending}
                    startIcon={<MdTimer />}
                  >
                    {resendCooldown > 0 ? `${t.resendIn} ${resendCooldown}s` : t.resendBtn}
                  </Button>
                  <Button variant="text" size="small" onClick={() => setOtpSent(false)} color="inherit">
                    {t.changePhone}
                  </Button>
                </Box>
              </>
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={stayLoggedIn}
                  onChange={(e) => setStayLoggedIn(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={<Typography variant="caption">{t.stayLoggedIn}</Typography>}
              sx={{ mt: 1 }}
            />
          </Box>
        )}

        {/* Tab 1: Quick 4-Digit PIN (Repeat visit shortcut for farmers) */}
        {tabIndex === 1 && (
          <Box>
            <TextField
              label={t.phoneLabel}
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label={t.pinLabel}
              fullWidth
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              sx={{ mb: 2.5 }}
              inputProps={{ maxLength: 6 }}
              helperText="Set an instant 4-digit PIN for daily sign-in without SMS OTP"
            />
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handlePinLogin}
              disabled={loginMutation.isPending}
              sx={{ py: 1.3, fontWeight: 700 }}
            >
              {loginMutation.isPending ? 'Verifying...' : t.pinBtn}
            </Button>
          </Box>
        )}

        {/* Tab 2: Password / Staff Portal */}
        {tabIndex === 2 && (
          <Box>
            <TextField
              label="Phone or Email"
              fullWidth
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2.5 }}
            />
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handlePasswordLogin}
              disabled={loginMutation.isPending}
              sx={{ py: 1.3, fontWeight: 700 }}
            >
              {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>
        )}

        {/* Sandbox Quick Access Pills */}
        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            {t.demoAccess}
          </Typography>
        </Divider>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => quickLoginAs('seller')}
            sx={{ fontSize: '0.75rem', fontWeight: 700 }}
          >
            🌾 Farmer
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => quickLoginAs('buyer')}
            sx={{ fontSize: '0.75rem', fontWeight: 700 }}
          >
            💼 Buyer
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => quickLoginAs('admin')}
            sx={{ fontSize: '0.75rem', fontWeight: 700 }}
          >
            🛡️ Admin
          </Button>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t.newToKhetSetu}{' '}
            <Link
              to={`/register?phone=${encodeURIComponent(phone)}&lang=${lang}`}
              style={{ color: '#2E7D32', fontWeight: 800, textDecoration: 'none' }}
            >
              {t.createAccount}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
