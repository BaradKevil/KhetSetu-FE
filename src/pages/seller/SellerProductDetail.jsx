import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  Button,
  Chip,
  Paper,
  Divider,
  Stack,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MdArrowBack,
  MdLocationOn,
  MdVerified,
  MdAgriculture,
  MdInventory2,
  MdPayments,
  MdLocalShipping,
  MdOpenInNew,
  MdDescription,
  MdCheckCircle,
  MdOutlineCalendarToday,
  MdCategory,
  MdShare,
} from 'react-icons/md';
import { useGetProductDetailsQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';
import { getImageUrl, DEFAULT_FALLBACK_IMAGE } from '../../common/imageUtils';

const SellerProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: product, isLoading, error } = useGetProductDetailsQuery(id);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [certModalOpen, setCertModalOpen] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12 }}>
        <CircularProgress color="primary" size={48} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2.5, fontWeight: 600 }}>
          {language === 'gu'
            ? 'પાકની વિગતો લોડ થઈ રહી છે...'
            : language === 'hi'
            ? 'फसल का विवरण लोड हो रहा है...'
            : 'Loading crop specifications...'}
        </Typography>
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 4,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          my: 4,
          maxWidth: 600,
          mx: 'auto',
        }}
      >
        <MdAgriculture size={56} color="#94A3B8" />
        <Typography variant="h5" fontWeight={700} sx={{ mt: 2, mb: 1, color: '#1E293B' }}>
          {language === 'gu'
            ? 'પાક લિસ્ટિંગ મળ્યું નથી'
            : language === 'hi'
            ? 'फसल लिस्टिंग नहीं मिली'
            : 'Produce Listing Not Found'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {language === 'gu'
            ? 'આ પાક લિસ્ટિંગ ઉપલબ્ધ નથી અથવા કાઢી નાખવામાં આવ્યું છે.'
            : language === 'hi'
            ? 'यह फसल लिस्टिंग उपलब्ध नहीं है या हटा दी गई है।'
            : 'The requested crop listing does not exist or has been removed.'}
        </Typography>
        <Button
          component={Link}
          to="/seller/products"
          variant="contained"
          color="primary"
          startIcon={<MdArrowBack />}
          sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', px: 3 }}
        >
          {language === 'gu' ? 'મારા તમામ પાકો પર પાછા જાઓ' : language === 'hi' ? 'मेरी सभी फसलों पर वापस जाएं' : 'Back to My Crops'}
        </Button>
      </Paper>
    );
  }

  const priceINR = (product.price_per_unit_paise || 0) / 100;
  const totalValue = Math.round((product.total_quantity || 0) * priceINR);
  const soldQty = Math.max(0, (product.total_quantity || 0) - (product.available_quantity || 0));
  const stockPercentage = product.total_quantity > 0
    ? Math.round(((product.available_quantity || 0) / product.total_quantity) * 100)
    : 0;

  const fallbackImg = product.crop?.image_url
    ? getImageUrl(product.crop.image_url)
    : DEFAULT_FALLBACK_IMAGE;

  let rawImages = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    rawImages = product.images;
  } else if (typeof product.images === 'string') {
    try {
      rawImages = JSON.parse(product.images);
    } catch {
      rawImages = [product.images];
    }
  }

  const validImages = Array.isArray(rawImages) && rawImages.length > 0
    ? rawImages
        .filter((img) => img && !String(img).startsWith('blob:'))
        .map((img) => getImageUrl(img, fallbackImg))
    : [];

  const images = validImages.length > 0 ? validImages : [fallbackImg];

  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return { bg: '#DCFCE7', text: '#15803D', label: language === 'gu' ? 'લાઇવ / વેચાણ માટે ઉપલબ્ધ' : language === 'hi' ? 'लाइव / बिक्री हेतु उपलब्ध' : 'Live on Mandi' };
      case 'sold_out':
        return { bg: '#F1F5F9', text: '#475569', label: language === 'gu' ? 'સંપૂર્ણ વેચાઈ ગયું' : language === 'hi' ? 'सब बिक गया' : 'Sold Out' };
      case 'draft':
        return { bg: '#FEF3C7', text: '#B45309', label: language === 'gu' ? 'ડ્રાફ્ટ (KYC વેરિફિકેશન પેન્ડિંગ)' : language === 'hi' ? 'ड्राफ्ट (केवाईसी सत्यापन लंबित)' : 'Draft (Pending KYC)' };
      default:
        return { bg: '#E2E8F0', text: '#334155', label: status?.toUpperCase() || 'UNKNOWN' };
    }
  };

  const statusInfo = getStatusColor(product.status);

  const handleShare = () => {
    const marketUrl = `${window.location.origin}/market/${product.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(marketUrl);
      toast.success(
        language === 'gu'
          ? 'માર્કેટ લિસ્ટિંગ લિંક ક્લિપબોર્ડમાં કોપી થઈ ગઈ!'
          : language === 'hi'
          ? 'मार्केट लिस्टिंग लिंक कॉपी हो गया!'
          : 'Public marketplace link copied to clipboard!'
      );
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Top Header / Back Navigation Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            component={Link}
            to="/seller/products"
            variant="outlined"
            color="inherit"
            startIcon={<MdArrowBack />}
            sx={{
              borderRadius: 2.5,
              fontWeight: 700,
              textTransform: 'none',
              px: 2,
              py: 0.8,
              bgcolor: '#FFFFFF',
              borderColor: '#CBD5E1',
              color: '#334155',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              '&:hover': {
                bgcolor: '#F1F5F9',
                borderColor: '#94A3B8',
              },
            }}
          >
            {language === 'gu'
              ? '← મારા પાક પર પાછા જાઓ'
              : language === 'hi'
              ? '← मेरी फसलों पर वापस जाएं'
              : 'Back to My Crops'}
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            / {language === 'gu' ? 'પાક આઈડી' : language === 'hi' ? 'फसल आईडी' : 'Produce ID'} #{product.id}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title={language === 'gu' ? 'ખરીદદારો માટેની લિંક કોપી કરો' : 'Copy Public Share Link'}>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={handleShare}
              startIcon={<MdShare />}
              sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#FFFFFF', borderColor: '#CBD5E1', fontWeight: 600 }}
            >
              {language === 'gu' ? 'શેર કરો' : language === 'hi' ? 'शेयर करें' : 'Share'}
            </Button>
          </Tooltip>
{/* 
          <Tooltip title={language === 'gu' ? 'ખરીદદારો કેવું જુએ છે તે જુઓ' : 'View Public Listing on Market'}>
            <Button
              component={Link}
              to={`/market/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              color="primary"
              size="small"
              endIcon={<MdOpenInNew />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              {language === 'gu'
                ? 'માર્કેટ લિસ્ટિંગ જુઓ'
                : language === 'hi'
                ? 'मार्केट लिस्टिंग देखें'
                : 'Marketplace View'}
            </Button>
          </Tooltip> */}
        </Box>
      </Box>

      {/* Main Content Layout */}
      <Grid container spacing={3.5}>
        {/* Left Column: Photos Gallery */}
        <Grid item xs={12} lg={5} size={{ xs: 12, lg: 5 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3.5,
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              position: 'relative',
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 20px -4px rgba(0,0,0,0.06)',
            }}
          >
            <CardMedia
              component="img"
              height="380"
              image={images[selectedPhotoIndex] || images[0]}
              alt={product.variety}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImg;
              }}
              sx={{ objectFit: 'cover' }}
            />

            {/* Primary Cover Badge on photo index 0 */}
            {selectedPhotoIndex === 0 && (
              <Chip
                label={language === 'gu' ? '⭐ મુખ્ય ફોટો (કવર)' : language === 'hi' ? '⭐ मुख्य फोटो (कवर)' : '⭐ Primary Cover Photo'}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  bgcolor: 'rgba(37, 99, 235, 0.92)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  backdropFilter: 'blur(4px)',
                }}
              />
            )}

            {/* Status Chip overlay */}
            <Chip
              label={statusInfo.label}
              size="small"
              sx={{
                position: 'absolute',
                top: 14,
                right: 14,
                bgcolor: statusInfo.bg,
                color: statusInfo.text,
                fontWeight: 800,
                fontSize: '0.74rem',
                border: `1px solid ${statusInfo.text}33`,
              }}
            />
          </Card>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mt: 2,
                borderRadius: 3,
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
              }}
            >
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {language === 'gu'
                  ? `અપલોડ કરેલા ફોટા (${images.length} માંથી ૧ મુખ્ય છે):`
                  : language === 'hi'
                  ? `अपलोड की गई तस्वीरें (${images.length} में से १ मुख्य है):`
                  : `Uploaded Harvest Photos (${images.length} photos):`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 0.5 }}>
                {images.map((img, idx) => (
                  <Box
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    sx={{
                      width: 72,
                      height: 72,
                      minWidth: 72,
                      borderRadius: 2.5,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: selectedPhotoIndex === idx ? '3px solid #2563EB' : '1px solid #CBD5E1',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      opacity: selectedPhotoIndex === idx ? 1 : 0.75,
                      '&:hover': { opacity: 1, borderColor: '#3B82F6' },
                    }}
                  >
                    <Box
                      component="img"
                      src={img}
                      alt={`Photo ${idx + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImg;
                      }}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {idx === 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          bgcolor: 'rgba(37,99,235,0.85)',
                          color: '#fff',
                          fontSize: '0.6rem',
                          textAlign: 'center',
                          py: 0.2,
                          fontWeight: 700,
                        }}
                      >
                        {language === 'gu' ? 'મુખ્ય' : 'Main'}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          {/* Quick Stats Card for Inventory */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mt: 2,
              borderRadius: 3,
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
            }}
          >
            <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MdInventory2 color="#16A34A" size={18} />
              {language === 'gu' ? 'સ્ટોક ઉપલબ્ધતા સ્ટેટસ' : language === 'hi' ? 'स्टॉक उपलब्धता स्थिति' : 'Inventory & Stock Balance'}
            </Typography>

            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                <Typography variant="body2" color="text.secondary">
                  {language === 'gu' ? 'ઉપલબ્ધ જથ્થો:' : language === 'hi' ? 'उपलब्ध मात्रा:' : 'Remaining Stock:'}
                </Typography>
                <Typography variant="body2" fontWeight={800} color="#15803D">
                  {product.available_quantity} {product.unit} ({stockPercentage}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, stockPercentage))}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#E2E8F0',
                  '& .MuiLinearProgress-bar': { bgcolor: stockPercentage > 20 ? '#16A34A' : '#EF4444' },
                }}
              />
            </Box>

            <Grid container spacing={1.5} sx={{ pt: 1, borderTop: '1px dashed #E2E8F0' }}>
              <Grid item xs={6} size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {language === 'gu' ? 'કુલ લિસ્ટ કરેલ:' : language === 'hi' ? 'कुल सूचीबद्ध:' : 'Total Batch:'}
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {product.total_quantity} {product.unit}
                </Typography>
              </Grid>
              <Grid item xs={6} size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {language === 'gu' ? 'વેચાયેલ જથ્થો:' : language === 'hi' ? 'बिकी हुई मात्रा:' : 'Sold to Buyers:'}
                </Typography>
                <Typography variant="body2" fontWeight={700} color={soldQty > 0 ? '#2563EB' : 'text.primary'}>
                  {soldQty} {product.unit}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right Column: Complete Specifications & Logistics */}
        <Grid item xs={12} lg={7} size={{ xs: 12, lg: 7 }}>
          {/* Header Title Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 20px -4px rgba(0,0,0,0.06)',
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label={product.crop?.name_en ? `${product.crop.name_en} (${product.crop.name_gu || product.crop.name_hi || ''})` : (product.crop?.name || 'Crop')}
                color="success"
                size="small"
                sx={{ fontWeight: 800 }}
              />
              <Chip
                label={`Grade: ${product.grade}`}
                variant="outlined"
                color="primary"
                size="small"
                sx={{ fontWeight: 700 }}
              />
              {product.is_organic && (
                <Chip
                  label={language === 'gu' ? '🌿 પ્રમાણિત ઓર્ગેનિક' : language === 'hi' ? '🌿 प्रमाणित जैविक' : '🌿 Certified Organic'}
                  size="small"
                  sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 800, border: '1px solid #86EFAC' }}
                />
              )}
            </Box>

            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
              {product.variety}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', flexWrap: 'wrap' }}>
              <MdLocationOn color="#16A34A" size={18} />
              <Typography variant="body2" fontWeight={600}>
                {product.pickup_village ? `${product.pickup_village}, ` : ''}
                {product.pickup_district}, {product.pickup_state}
                {product.pickup_pincode ? ` - ${product.pickup_pincode}` : ''}
              </Typography>
            </Box>

            {/* Price Highlight Banner */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mt: 2.5,
                borderRadius: 3,
                bgcolor: '#F0FDF4',
                border: '1.5px solid #BBF7D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="caption" fontWeight={700} color="#15803D" textTransform="uppercase" letterSpacing={0.5}>
                  {language === 'gu' ? 'નિર્ધારિત ભાવ (પ્રતિ એકમ)' : language === 'hi' ? 'निर्धारित मूल्य (प्रति इकाई)' : 'Fixed Selling Price'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.2 }}>
                  <Typography variant="h3" fontWeight={900} color="#15803D">
                    ₹{priceINR.toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="#166534">
                    / {product.unit}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {language === 'gu' ? 'કુલ લોટનું અંદાજિત મૂલ્ય:' : language === 'hi' ? 'कुल लॉट का अनुमानित मूल्य:' : 'Estimated Total Lot Value:'}
                </Typography>
                <Typography variant="h5" fontWeight={800} color="#0F172A">
                  ₹{totalValue.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Paper>
          </Paper>

          {/* Crop Specifications Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 20px -4px rgba(0,0,0,0.06)',
              mb: 3,
            }}
          >
            <Typography variant="subtitle1" fontWeight={800} color="#0F172A" sx={{ mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MdAgriculture color="#2563EB" size={22} />
              {language === 'gu' ? 'પાક અને ગુણવત્તા વિગતો' : language === 'hi' ? 'फसल एवं गुणवत्ता विवरण' : 'Crop & Harvest Specifications'}
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#F8FAF9', border: '1px solid #E2E8F0' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {language === 'gu' ? 'ઓછામાં ઓછો ઓર્ડર (MOQ):' : language === 'hi' ? 'न्यूनतम ऑर्डर मात्रा (MOQ):' : 'Minimum Order Quantity:'}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="#0F172A" sx={{ mt: 0.5 }}>
                    {product.min_order_quantity} {product.unit}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {language === 'gu' ? 'ખરીદદારો આનાથી ઓછો ઓર્ડર આપી શકશે નહીં' : 'Smallest batch size buyers can book'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#F8FAF9', border: '1px solid #E2E8F0' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {language === 'gu' ? 'પેકેજિંગ પ્રકાર:' : language === 'hi' ? 'पैकेजिंग प्रकार:' : 'Packaging Type:'}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="#0F172A" sx={{ mt: 0.5 }}>
                    {product.packaging_type || (language === 'gu' ? 'સામાન્ય બોરીઓ' : 'Standard Packaging')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {language === 'gu' ? 'માલની પેકિંગ પદ્ધતિ' : 'Loading container & packing standard'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#F8FAF9', border: '1px solid #E2E8F0' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {language === 'gu' ? 'લણણી / હાર્વેસ્ટ તારીખ:' : language === 'hi' ? 'कटाई / हार्वेस्ट की तारीख:' : 'Harvest Date:'}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="#0F172A" sx={{ mt: 0.5 }}>
                    {product.harvest_date
                      ? new Date(product.harvest_date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                      : (language === 'gu' ? 'તાજેતરની લણણી' : 'Fresh Harvest')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {language === 'gu' ? 'ખેતરમાંથી લણણી કરેલ સમય' : 'Batch freshness timeline'}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, bgcolor: '#F8FAF9', border: '1px solid #E2E8F0' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {language === 'gu' ? 'ઓર્ગેનિક પ્રમાણપત્ર:' : language === 'hi' ? 'जैविक प्रमाणीकरण:' : 'Organic Certification:'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="h6" fontWeight={700} color={product.is_organic ? '#15803D' : 'text.primary'}>
                      {product.is_organic
                        ? (language === 'gu' ? 'હા (ઓર્ગેનિક)' : language === 'hi' ? 'हाँ (जैविक)' : 'Certified Yes')
                        : (language === 'gu' ? 'ના (પરંપરાગત)' : language === 'hi' ? 'नहीं (पारंपरिक)' : 'Conventional / No')}
                    </Typography>
                    {product.organic_certificate_url && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => setCertModalOpen(true)}
                        startIcon={<MdDescription />}
                        sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 700, fontSize: '0.72rem' }}
                      >
                        {language === 'gu' ? 'પ્રમાણપત્ર જુઓ' : 'View Cert'}
                      </Button>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {product.is_organic ? 'APEDA / Govt Accredited' : 'Standard farming practice'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* Farm Pickup & Logistics Card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3.5,
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 20px -4px rgba(0,0,0,0.06)',
              mb: 3,
            }}
          >
            <Typography variant="subtitle1" fontWeight={800} color="#0F172A" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MdLocalShipping color="#16A34A" size={22} />
              {language === 'gu' ? 'પિકઅપ અને ગોડાઉન સરનામું' : language === 'hi' ? 'पिकअप और गोदाम का पता' : 'Dispatch & Farm Pickup Location'}
            </Typography>

            <Box sx={{ bgcolor: '#F8FAF9', p: 2.5, borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {language === 'gu' ? 'સરનામાનો પ્રકાર:' : language === 'hi' ? 'पते का प्रकार:' : 'Address Type:'}
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="#0F172A">
                    {product.pickup_address_type || (language === 'gu' ? 'ખેતર (ફાર્મ ગેટ)' : 'Farm Gate / Field')}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {language === 'gu' ? 'ગામ / તાલુકો:' : language === 'hi' ? 'गांव / तालुका:' : 'Village / Taluka:'}
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="#0F172A">
                    {product.pickup_village || '-'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {language === 'gu' ? 'જિલ્લો અને રાજ્ય:' : language === 'hi' ? 'जिला और राज्य:' : 'District & State:'}
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="#0F172A">
                    {product.pickup_district}, {product.pickup_state}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {language === 'gu' ? 'પીનકોડ:' : language === 'hi' ? 'पिनकोड:' : 'Pincode:'}
                  </Typography>
                  <Typography variant="body1" fontWeight={700} color="#0F172A">
                    {product.pickup_pincode || '-'}
                  </Typography>
                </Grid>

                {product.pickup_exact_address && (
                  <Grid item xs={12} size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {language === 'gu' ? 'ચોક્કસ સરનામું અને લેન્ડમાર્ક (રોડ વિગત):' : language === 'hi' ? 'सटीक पता और लैंडमार्क:' : 'Exact Landmark & Dispatch Road Details:'}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="#1E293B" sx={{ mt: 0.5, bgcolor: '#FFFFFF', p: 1.5, borderRadius: 2, border: '1px solid #E2E8F0' }}>
                      {product.pickup_exact_address}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>

          {/* Quick Actions Footer Card */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3.5,
              border: '1.5px solid #CBD5E1',
              bgcolor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                {language === 'gu' ? 'ઓર્ડર્સ અને સપ્લાય મેનેજમેન્ટ' : language === 'hi' ? 'ऑर्डर्स और आपूर्ति प्रबंधन' : 'Orders & Harvest Management'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {language === 'gu'
                  ? 'આ પાક માટે ખરીદદારો તરફથી મળેલા એસ્ક્રો ઓર્ડર્સ તપાસો.'
                  : language === 'hi'
                  ? 'इस फसल के लिए खरीदारों से प्राप्त एस्क्रो ऑर्डर्स देखें।'
                  : 'Track fulfillment, dispatch confirmation, and escrow payouts for your produce.'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                component={Link}
                to="/seller/orders"
                variant="contained"
                color="primary"
                sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', px: 2.5 }}
              >
                {language === 'gu' ? 'ઓર્ડર્સ જુઓ' : language === 'hi' ? 'ऑर्डर्स देखें' : 'View Orders'}
              </Button>
              <Button
                component={Link}
                to="/seller/products"
                variant="outlined"
                color="inherit"
                sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', px: 2.5 }}
              >
                {language === 'gu' ? 'પાકની યાદી' : language === 'hi' ? 'फसल सूची' : 'All Products'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Organic Certificate Preview Modal */}
      {product.organic_certificate_url && (
        <Dialog open={certModalOpen} onClose={() => setCertModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🌿 {language === 'gu' ? 'ઓર્ગેનિક સર્ટિફિકેટ દસ્તાવેજ' : 'Organic Certification Document'}</span>
            <Button size="small" onClick={() => setCertModalOpen(false)}>✕</Button>
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              {product.organic_certificate_url.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={product.organic_certificate_url}
                  title="Organic Certificate"
                  style={{ width: '100%', height: '550px', border: 'none', borderRadius: 8 }}
                />
              ) : (
                <Box
                  component="img"
                  src={product.organic_certificate_url}
                  alt="Organic Certificate"
                  sx={{ maxWidth: '100%', maxHeight: '600px', borderRadius: 2, objectFit: 'contain' }}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              component="a"
              href={product.organic_certificate_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              color="primary"
              startIcon={<MdOpenInNew />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              {language === 'gu' ? 'નવી ટેબમાં ખોલો' : 'Open in New Tab'}
            </Button>
            <Button onClick={() => setCertModalOpen(false)} sx={{ textTransform: 'none' }}>
              {language === 'gu' ? 'બંધ કરો' : 'Close'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default SellerProductDetail;
