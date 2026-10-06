import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
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
import { toast } from 'react-toastify';

const UI_TEXT = {
  en: {
    language: 'Language',
    title: 'Create Your Free Account',
    subtitle: 'Connect directly to India’s farmer & buyer marketplace',
    farmerTitle: 'Farmer (Seller)',
    farmerDesc: 'Sell crops directly with guaranteed bank payouts',
    buyerTitle: 'Buyer (Personal / Trade)',
    buyerDesc: 'Buy fresh crops for household or business use',
    fullName: 'Full Name',
    fullNamePlaceholder: 'e.g. Rameshwar Patel',
    phone: 'Mobile Number',
    phonePlaceholder: 'Enter 10-digit mobile number',
    state: 'State',
    district: 'District / City',
    village: 'Village / Taluka (Optional)',
    buyerType: 'Account Type',
    individualBuyer: 'Individual (Personal / Household Use)',
    tradeBuyer: 'Trader / Merchant',
    millerBuyer: 'Grain Miller / Processor',
    retailBuyer: 'Retailer / Store',
    companyOptional: 'Company / Business Name (Optional)',
    password: 'Create Password',
    terms: 'I agree to the Terms of Service & Escrow Protection Guidelines',
    createFarmerBtn: 'Create Farmer Account',
    createBuyerBtn: 'Create Buyer Account',
    alreadyAccount: 'Already have an account?',
    signIn: 'Sign In',
  },
  hi: {
    language: 'भाषा',
    title: 'निःशुल्क खाता बनाएं',
    subtitle: 'सीधे किसान और खरीदार मंच से जुड़ें',
    farmerTitle: 'किसान (विक्रेता)',
    farmerDesc: 'फसल बेचें, सीधा बैंक भुगतान प्राप्त करें',
    buyerTitle: 'खरीदार (व्यक्तिगत / व्यापार)',
    buyerDesc: 'घरेलू या व्यापारिक उपयोग के लिए ताजा फसल खरीदें',
    fullName: 'पूरा नाम',
    fullNamePlaceholder: 'उदा. रामेश्वर पटेल',
    phone: 'मोबाइल नंबर',
    phonePlaceholder: '10-अंकीय मोबाइल नंबर दर्ज करें',
    state: 'राज्य',
    district: 'जिला / शहर',
    village: 'गाँव / तालुका (वैकल्पिक)',
    buyerType: 'खाता प्रकार',
    individualBuyer: 'व्यक्तिगत (घरेलू उपयोग)',
    tradeBuyer: 'व्यापारी / आढ़ती',
    millerBuyer: 'मिलर / प्रोसेसर',
    retailBuyer: 'दुकानदार / रिटेलर',
    companyOptional: 'कंपनी / फर्म का नाम (वैकल्पिक)',
    password: 'पासवर्ड बनाएं',
    terms: 'मैं नियमों और एस्क्रो सुरक्षा दिशानिर्देशों से सहमत हूँ',
    createFarmerBtn: 'किसान खाता बनाएं',
    createBuyerBtn: 'खरीदार खाता बनाएं',
    alreadyAccount: 'पहले से खाता है?',
    signIn: 'प्रवेश करें',
  },
  gu: {
    language: 'ભાષા',
    title: 'નવું ખાતું બનાવો',
    subtitle: 'ખેડૂત અને વેપારી વચ્ચે સીધું પારદર્શક માર્કેટપ્લેસ',
    farmerTitle: 'ખેડૂત (વેચનાર)',
    farmerDesc: 'પાક વેચો અને સુરક્ષિત બેંક ચુકવણી મેળવો',
    buyerTitle: 'ખરીદનાર (વ્યક્તિગત / વેપાર)',
    buyerDesc: 'ઘર વપરાશ કે વેપાર માટે સીધો સારો પાક ખરીદો',
    fullName: 'સંપૂર્ણ નામ',
    fullNamePlaceholder: 'દા.ત. રમેશભાઈ પટેલ',
    phone: 'મોબાઇલ નંબર',
    phonePlaceholder: '10-અંકનો મોબાઈલ નંબર દાખલ કરો',
    state: 'રાજ્ય',
    district: 'જિલ્લો / શહેર',
    village: 'ગામ / તાલુકો (વૈકલ્પિક)',
    buyerType: 'ખાતાનો પ્રકાર',
    individualBuyer: 'વ્યક્તિગત (ઘર વપરાશ માટે)',
    tradeBuyer: 'વેપારી / દલાલ',
    millerBuyer: 'મિલો / પ્રોસેસર',
    retailBuyer: 'દુકાનદાર / રિટેલર',
    companyOptional: 'કંપની / પેઢીનું નામ (મરજિયાત)',
    password: 'પાસવર્ડ બનાવો',
    terms: 'હું નિયમો અને એસ્ક્રો સુરક્ષા માર્ગદર્શિકા સાથે સંમત છું',
    createFarmerBtn: 'ખેડૂત ખાતું બનાવો',
    createBuyerBtn: 'ખરીદનાર ખાતું બનાવો',
    alreadyAccount: 'પહેલેથી ખાતું છે?',
    signIn: 'લૉગિન કરો',
  },
};

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { language: lang, changeLanguage: setLang } = useLanguage();
  const t = UI_TEXT[lang] || UI_TEXT.en;

  // If query parameter specifies language, set it globally if valid
  useState(() => {
    const paramLang = searchParams.get('lang');
    if (paramLang && (paramLang === 'en' || paramLang === 'hi' || paramLang === 'gu') && paramLang !== lang) {
      setLang(paramLang);
    }
  });

  const [role, setRole] = useState('seller'); // 'seller' or 'buyer'
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: searchParams.get('phone') || '',
    password: '',
    state: 'Gujarat',
    district: 'Mehsana',
    village: 'Alampur',
    buyer_type: 'individual',
    company_name: '',
  });

  const registerMutation = useRegisterMutation();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.full_name?.trim()) {
      toast.error('Please enter your full name.');
      return;
    }

    const cleanDigits = formData.phone.replace(/\D/g, '').slice(-10);
    if (!cleanDigits || cleanDigits.length < 10) {
      toast.error('Please provide a valid 10-digit mobile number.');
      return;
    }
    const fullPhone = `+91${cleanDigits}`;

    if (!acceptedTerms) {
      toast.error('Please accept the Terms of Service to continue.');
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
        if (formData.village?.trim()) payload.village = formData.village.trim();
      } else {
        payload.buyer_type = formData.buyer_type || 'individual';
        // Company name is completely optional for buyers (e.g. for personal use)
        if (formData.company_name?.trim()) {
          payload.company_name = formData.company_name.trim();
        }
        if (formData.state?.trim()) payload.state = formData.state.trim();
        if (formData.district?.trim()) payload.district = formData.district.trim();
      }

      const res = await registerMutation.mutateAsync(payload);
      const authData = unwrap(res);

      if (authData?.accessToken) {
        localStorage.setItem('accessToken', authData.accessToken);
        localStorage.setItem('refreshToken', authData.refreshToken);
        localStorage.setItem('role', authData.user?.role || role);
        localStorage.setItem('phone', authData.user?.phone || cleanPhone);
        localStorage.setItem('fullName', authData.user?.full_name || formData.full_name);
        localStorage.setItem('profilePhoto', authData.user?.profile_photo || '');
        setLang(lang);
      }

      toast.success(
        role === 'seller'
          ? 'Welcome to KhetSetu! Your farmer account is ready.'
          : 'Welcome to KhetSetu! Your buyer account is ready.'
      );

      if (role === 'seller') navigate('/seller');
      else navigate('/buyer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2.5,
        background: 'radial-gradient(circle at 10% 20%, rgba(46, 125, 50, 0.08) 0%, transparent 45%), #F8FAF9',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4.5 },
          width: '100%',
          maxWidth: 540,
          borderRadius: 4,
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Universal Language Selection Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <MdLanguage color="#64748B" size={18} />
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              {t.language || 'Language'}
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
              bgcolor: role === 'seller' ? '#2E7D32' : '#0288D1',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              mx: 'auto',
              mb: 1.5,
              transition: 'background-color 0.3s ease',
              boxShadow:
                role === 'seller'
                  ? '0 8px 18px rgba(46, 125, 50, 0.22)'
                  : '0 8px 18px rgba(2, 136, 209, 0.22)',
            }}
          >
            {role === 'seller' ? <MdAgriculture /> : <MdShoppingCart />}
          </Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.3px' }}>
            {t.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t.subtitle}
          </Typography>
        </Box>

        {/* Clean Role Toggle Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Card
              sx={{
                borderRadius: 3,
                border: role === 'seller' ? '2px solid #2E7D32' : '1px solid #E2E8F0',
                bgcolor: role === 'seller' ? '#F0FDF4' : '#FFFFFF',
                boxShadow: role === 'seller' ? '0 4px 12px rgba(46, 125, 50, 0.1)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <CardActionArea onClick={() => setRole('seller')} sx={{ p: 2, textAlign: 'center' }}>
                <MdAgriculture size={30} color={role === 'seller' ? '#2E7D32' : '#64748B'} />
                <Typography variant="subtitle2" fontWeight={800} sx={{ mt: 1, color: role === 'seller' ? '#166534' : '#1E293B' }}>
                  {t.farmerTitle}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem', mt: 0.3 }}>
                  {t.farmerDesc}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>

          <Grid item xs={6}>
            <Card
              sx={{
                borderRadius: 3,
                border: role === 'buyer' ? '2px solid #0288D1' : '1px solid #E2E8F0',
                bgcolor: role === 'buyer' ? '#F0F9FF' : '#FFFFFF',
                boxShadow: role === 'buyer' ? '0 4px 12px rgba(2, 136, 209, 0.1)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <CardActionArea onClick={() => setRole('buyer')} sx={{ p: 2, textAlign: 'center' }}>
                <MdShoppingCart size={30} color={role === 'buyer' ? '#0288D1' : '#64748B'} />
                <Typography variant="subtitle2" fontWeight={800} sx={{ mt: 1, color: role === 'buyer' ? '#0369A1' : '#1E293B' }}>
                  {t.buyerTitle}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem', mt: 0.3 }}>
                  {t.buyerDesc}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>

        {/* User-Friendly Form */}
        <Box component="form" onSubmit={handleRegister} noValidate>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block' }}>
              {t.fullName} *
            </Typography>
            <TextField
              fullWidth
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder={t.fullNamePlaceholder}
              size="medium"
              InputProps={{ sx: { borderRadius: 2.5 } }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block' }}>
              {t.phone} *
            </Typography>
            <PhoneInput
              fullWidth
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder={t.phonePlaceholder}
              autoComplete="off"
              size="medium"
            />
          </Box>

          {/* Location fields */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block' }}>
                {t.state}
              </Typography>
              <TextField
                fullWidth
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                size="medium"
                InputProps={{ sx: { borderRadius: 2.5 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block' }}>
                {t.district}
              </Typography>
              <TextField
                fullWidth
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                size="medium"
                InputProps={{ sx: { borderRadius: 2.5 } }}
              />
            </Grid>
          </Grid>

          {/* Farmer Specific: Village */}
          {role === 'seller' && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block' }}>
                {t.village}
              </Typography>
              <TextField
                fullWidth
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder="e.g. Alampur"
                size="medium"
                InputProps={{ sx: { borderRadius: 2.5 } }}
              />
            </Box>
          )}

          {/* Buyer Specific: Individual vs Business (Company NOT required) */}
          {role === 'buyer' && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block' }}>
                  {t.buyerType}
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={formData.buyer_type}
                  onChange={(e) => setFormData({ ...formData, buyer_type: e.target.value })}
                  size="medium"
                  InputProps={{ sx: { borderRadius: 2.5 } }}
                >
                  <MenuItem value="individual">{t.individualBuyer}</MenuItem>
                  <MenuItem value="trader">{t.tradeBuyer}</MenuItem>
                  <MenuItem value="retailer">{t.retailBuyer}</MenuItem>
                  <MenuItem value="miller">{t.millerBuyer}</MenuItem>
                </TextField>
              </Box>

              {/* Company name only shown as optional helper for trade buyers */}
              {formData.buyer_type !== 'individual' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.6, display: 'block' }}>
                    {t.companyOptional}
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
              {t.password} (Optional)
            </Typography>
            <TextField
              fullWidth
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              size="medium"
              InputProps={{ sx: { borderRadius: 2.5 } }}
              helperText="You can also login anytime using just your mobile number & OTP"
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
            label={<Typography variant="caption" color="text.secondary">{t.terms}</Typography>}
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
              ? 'Creating Account...'
              : role === 'seller'
              ? t.createFarmerBtn
              : t.createBuyerBtn}
          </Button>
        </Box>

        {/* Footer Link to Login */}
        <Box sx={{ mt: 3, textAlign: 'center', pt: 2, borderTop: '1px solid #F1F5F9' }}>
          <Typography variant="body2" color="text.secondary">
            {t.alreadyAccount}{' '}
            <Link to="/login" style={{ color: '#2E7D32', fontWeight: 800, textDecoration: 'none' }}>
              {t.signIn}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
