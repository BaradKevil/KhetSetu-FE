import { useState, useEffect } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  MdAgriculture,
  MdBusinessCenter,
  MdCheckCircle,
  MdLanguage,
  MdVerified,
  MdArrowForward,
  MdArrowBack,
} from 'react-icons/md';
import { useRegisterMutation } from '../../Api/Api';
import { unwrap } from '../../Api/apiUtils';
import { toast } from 'react-toastify';

const UI_TEXT = {
  en: {
    title: 'Join KhetSetu Marketplace',
    subtitle: 'Direct Farmer-to-Buyer Agricultural Escrow Network',
    step1Title: 'Basic Account & Mobile',
    step2Title: 'Farm / Business Details',
    farmerRole: 'Farmer (Seller)',
    farmerSub: 'List crops, guaranteed escrow payouts',
    buyerRole: 'Buyer / Trader',
    buyerSub: 'Direct farm sourcing with escrow safety',
    fullName: 'Full Name / Representative',
    phone: 'Mobile Number',
    otpVerified: 'Mobile Verified (Demo OTP: 123456)',
    state: 'State',
    district: 'District',
    village: 'Village / Taluka',
    pincode: 'Pincode',
    farmName: 'Farm / Krishi Kendra Name',
    landSize: 'Farm Land Size (Acres)',
    companyName: 'Company / Enterprise Name',
    buyerType: 'Business Buyer Category',
    farmingType: 'Farming Practice',
    organic: '100% Certified Organic',
    conventional: 'Conventional Farming',
    terms: 'I agree to the Terms of Service & Agricultural Escrow Guidelines',
    nextBtn: 'Proceed to Profile Setup',
    backBtn: 'Back',
    submitFarmerBtn: 'Complete Farmer Registration',
    submitBuyerBtn: 'Complete Buyer Registration',
    alreadyAccount: 'Already have an account?',
    signIn: 'Sign In',
  },
  hi: {
    title: 'खेतसेतु से जुड़ें',
    subtitle: 'किसान से खरीदार का सीधा सुरक्षित डिजिटल कृषि मंच',
    step1Title: 'खाता और मोबाइल विवरण',
    step2Title: 'खेत या व्यापार विवरण',
    farmerRole: 'किसान (विक्रेता)',
    farmerSub: 'फसल बेचें, सीधा बैंक भुगतान प्राप्त करें',
    buyerRole: 'खरीदार / व्यापारी',
    buyerSub: 'सस्ते दामों पर सीधी खरीद, एस्क्रो सुरक्षा',
    fullName: 'पूरा नाम',
    phone: 'मोबाइल नंबर',
    otpVerified: 'मोबाइल सत्यापित (डेमो: 123456)',
    state: 'राज्य',
    district: 'जिला',
    village: 'गाँव / तालुका',
    pincode: 'पिनकोड',
    farmName: 'खेत या कृषि केंद्र का नाम',
    landSize: 'खेत का आकार (एकड़)',
    companyName: 'कंपनी या फर्म का नाम',
    buyerType: 'खरीदार का प्रकार',
    farmingType: 'खेती का प्रकार',
    organic: 'जैविक खेती (Organic)',
    conventional: 'पारंपरिक खेती (Conventional)',
    terms: 'मैं खेतसेतु के नियमों और एस्क्रो सुरक्षा दिशानिर्देशों से सहमत हूँ',
    nextBtn: 'आगे बढ़ें',
    backBtn: 'पीछे',
    submitFarmerBtn: 'किसान पंजीकरण पूर्ण करें',
    submitBuyerBtn: 'खरीदार पंजीकरण पूर्ण करें',
    alreadyAccount: 'पहले से खाता है?',
    signIn: 'प्रवेश करें',
  },
  gu: {
    title: 'ખેતસેતુ સાથે જોડાવો',
    subtitle: 'ખેડૂતથી ખરીદનાર સીધું સુરક્ષિત કૃષિ માર્કેટપ્લેસ',
    step1Title: 'મૂળ ખાતું અને મોબાઈલ',
    step2Title: 'ખેતી અથવા વેપાર વિગતો',
    farmerRole: 'ખેડૂત (વેચનાર)',
    farmerSub: 'પાક વેચો, સીધા બેંક ખાતામાં નાણાં મેળવો',
    buyerRole: 'વેપારી / ખરીદનાર',
    buyerSub: 'સીધી ખેત ખરીદી અને એસ્ક્રો સુરક્ષા',
    fullName: 'સંપૂર્ણ નામ',
    phone: 'મોબાઈલ નંબર',
    otpVerified: 'મોબાઈલ ચકાસાયેલ (ડેમો: 123456)',
    state: 'રાજ્ય',
    district: 'જિલ્લો',
    village: 'ગામ / તાલુકો',
    pincode: 'પીનકોડ',
    farmName: 'ખેતર અથવા કૃષિ કેન્દ્રનું નામ',
    landSize: 'જમીનનું માપ (એકર)',
    companyName: 'કંપની અથવા પેઢીનું નામ',
    buyerType: 'ખરીદનારનો પ્રકાર',
    farmingType: 'ખેતીનો પ્રકાર',
    organic: 'ઓર્ગેનિક ખેતી',
    conventional: 'સામાન્ય ખેતી',
    terms: 'હું ખેતસેતુના નિયમો અને એસ્ક્રો માર્ગદર્શિકા સાથે સંમત છું',
    nextBtn: 'આગળ વધો',
    backBtn: 'પાછળ',
    submitFarmerBtn: 'ખેડૂત નોંધણી પૂર્ણ કરો',
    submitBuyerBtn: 'વેપારી નોંધણી પૂર્ણ કરો',
    alreadyAccount: 'પહેલેથી ખાતું છે?',
    signIn: 'લૉગિન કરો',
  },
};

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [lang, setLang] = useState(searchParams.get('lang') || 'en');
  const t = UI_TEXT[lang] || UI_TEXT.en;

  const [activeStep, setActiveStep] = useState(0);
  const [role, setRole] = useState('seller');
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: searchParams.get('phone') || '+91',
    email: '',
    password: '',
    state: 'Gujarat',
    district: 'Mehsana',
    sub_district: 'Kadi',
    village: 'Alampur',
    pincode: '382715',
    farm_name: '',
    land_size_acres: '10',
    farming_type: 'organic',
    company_name: '',
    buyer_type: 'trader',
  });

  const registerMutation = useRegisterMutation();

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.full_name?.trim() || !formData.phone?.trim() || formData.phone.length < 10) {
      toast.error('Please enter your full name and valid 10-digit mobile number.');
      return;
    }
    if (!acceptedTerms) {
      toast.error('Please accept the Terms of Service to proceed.');
      return;
    }
    setActiveStep(1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // Build clean payload without unnecessary empty fields
      const payload = {
        role,
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        preferred_language: lang,
      };

      if (formData.email && formData.email.trim()) {
        payload.email = formData.email.trim();
      }

      if (formData.password) {
        payload.password = formData.password;
      }

      if (role === 'seller') {
        if (formData.state?.trim()) payload.state = formData.state.trim();
        if (formData.district?.trim()) payload.district = formData.district.trim();
        if (formData.sub_district?.trim()) payload.sub_district = formData.sub_district.trim();
        if (formData.village?.trim()) payload.village = formData.village.trim();
        if (formData.pincode?.trim()) payload.pincode = formData.pincode.trim();
        if (formData.farm_name?.trim()) payload.farm_name = formData.farm_name.trim();
        if (formData.land_size_acres) payload.land_size_acres = Number(formData.land_size_acres);
      } else {
        if (formData.company_name?.trim()) payload.company_name = formData.company_name.trim();
        if (formData.buyer_type) payload.buyer_type = formData.buyer_type;
        if (formData.state?.trim()) payload.state = formData.state.trim();
        if (formData.district?.trim()) payload.district = formData.district.trim();
        if (formData.pincode?.trim()) payload.pincode = formData.pincode.trim();
      }

      const res = await registerMutation.mutateAsync(payload);
      const authData = unwrap(res);

      if (authData?.accessToken) {
        localStorage.setItem('accessToken', authData.accessToken);
        localStorage.setItem('refreshToken', authData.refreshToken);
        localStorage.setItem('role', authData.user?.role || role);
        localStorage.setItem('phone', authData.user?.phone || formData.phone);
        localStorage.setItem('fullName', authData.user?.full_name || formData.full_name);
        localStorage.setItem('preferredLanguage', lang);
      }

      toast.success(
        role === 'seller'
          ? 'Farmer registered successfully! Welcome to KhetSetu.'
          : 'Buyer registered successfully! Welcome to KhetSetu.'
      );

      if (role === 'seller') navigate('/seller');
      else navigate('/buyer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please check your details.');
    }
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
          p: { xs: 3, sm: 5 },
          width: '100%',
          maxWidth: 580,
          borderRadius: 4,
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)',
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Language Selection Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
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

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={800} color="#0F172A">
            {t.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t.subtitle}
          </Typography>
        </Box>

        {/* Stepper Progress */}
        <Stepper activeStep={activeStep} sx={{ mb: 3.5 }}>
          <Step>
            <StepLabel>{t.step1Title}</StepLabel>
          </Step>
          <Step>
            <StepLabel>{t.step2Title}</StepLabel>
          </Step>
        </Stepper>

        {/* STAGE 1: Fast Signup & Mobile Verification */}
        {activeStep === 0 && (
          <Box component="form" onSubmit={handleNextStep}>
            {/* Role Picker */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: role === 'seller' ? '2px solid #2E7D32' : '1px solid #E2E8F0',
                    bgcolor: role === 'seller' ? '#F0FDF4' : '#FFFFFF',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CardActionArea onClick={() => setRole('seller')} sx={{ p: 2, textAlign: 'center' }}>
                    <MdAgriculture size={32} color={role === 'seller' ? '#2E7D32' : '#64748B'} />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
                      {t.farmerRole}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {t.farmerSub}
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
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CardActionArea onClick={() => setRole('buyer')} sx={{ p: 2, textAlign: 'center' }}>
                    <MdBusinessCenter size={32} color={role === 'buyer' ? '#0288D1' : '#64748B'} />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
                      {t.buyerRole}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {t.buyerSub}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>

            <TextField
              label={t.fullName}
              fullWidth
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              sx={{ mb: 2 }}
              placeholder={role === 'seller' ? 'e.g. Rameshwar Patel' : 'e.g. Jayesh Shah'}
            />

            <TextField
              label={t.phone}
              fullWidth
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="+919876543210"
              helperText={t.otpVerified}
            />

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <TextField
                  label={t.state}
                  fullWidth
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label={t.district}
                  fullWidth
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  color="primary"
                />
              }
              label={<Typography variant="body2">{t.terms}</Typography>}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              endIcon={<MdArrowForward />}
              sx={{ py: 1.4, fontWeight: 700 }}
            >
              {t.nextBtn}
            </Button>
          </Box>
        )}

        {/* STAGE 2: Progressive Profile Setup */}
        {activeStep === 1 && (
          <Box component="form" onSubmit={handleRegister}>
            {role === 'seller' ? (
              // Farmer Stage 2 Fields
              <Box sx={{ mb: 3 }}>
                <TextField
                  label={t.farmName}
                  fullWidth
                  value={formData.farm_name}
                  onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                  sx={{ mb: 2 }}
                  placeholder="e.g. Patel Organic Krishi Farm"
                />

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      label={t.village}
                      fullWidth
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label={t.pincode}
                      fullWidth
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      label={t.landSize}
                      fullWidth
                      type="number"
                      value={formData.land_size_acres}
                      onChange={(e) => setFormData({ ...formData, land_size_acres: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label={t.farmingType}
                      select
                      fullWidth
                      value={formData.farming_type}
                      onChange={(e) => setFormData({ ...formData, farming_type: e.target.value })}
                    >
                      <MenuItem value="organic">{t.organic}</MenuItem>
                      <MenuItem value="conventional">{t.conventional}</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                <TextField
                  label="Create Password (Optional - for quick password login)"
                  fullWidth
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  sx={{ mb: 2 }}
                />

                <Paper elevation={0} sx={{ p: 2, bgcolor: '#F8FAF9', borderRadius: 2.5, border: '1px dashed #CBD5E1' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    ℹ️ <strong>Stage 3 (KYC)</strong> & <strong>Stage 4 (Bank Account Payouts)</strong> can be completed anytime in your Farmer Dashboard to publish live crops and receive money.
                  </Typography>
                </Paper>
              </Box>
            ) : (
              // Buyer Stage 2 Fields
              <Box sx={{ mb: 3 }}>
                <TextField
                  label={t.companyName}
                  fullWidth
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  sx={{ mb: 2 }}
                  placeholder="e.g. Gujarat Agro Commodities Pvt Ltd"
                />

                <TextField
                  label={t.buyerType}
                  select
                  fullWidth
                  value={formData.buyer_type}
                  onChange={(e) => setFormData({ ...formData, buyer_type: e.target.value })}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="trader">Mandi Trader / Merchant</MenuItem>
                  <MenuItem value="miller">Grain / Pulse Miller</MenuItem>
                  <MenuItem value="retailer">Food Retailer / Supermarket</MenuItem>
                  <MenuItem value="institution">Institutional / Bulk Buyer</MenuItem>
                  <MenuItem value="individual">Individual Buyer</MenuItem>
                </TextField>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      label="Delivery City / APMC"
                      fullWidth
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Delivery Pincode"
                      fullWidth
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    />
                  </Grid>
                </Grid>

                <TextField
                  label="Email Address (For Tax Invoices)"
                  fullWidth
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  sx={{ mb: 2 }}
                  placeholder="finance@agrotraders.com"
                />

                <TextField
                  label="Password (For Buyer Account)"
                  fullWidth
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  sx={{ mb: 2 }}
                />
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<MdArrowBack />}
                onClick={() => setActiveStep(0)}
                sx={{ py: 1.4, px: 3, fontWeight: 700 }}
              >
                {t.backBtn}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={registerMutation.isPending}
                sx={{ py: 1.4, fontWeight: 700 }}
              >
                {registerMutation.isPending
                  ? 'Registering...'
                  : role === 'seller'
                  ? t.submitFarmerBtn
                  : t.submitBuyerBtn}
              </Button>
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
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
