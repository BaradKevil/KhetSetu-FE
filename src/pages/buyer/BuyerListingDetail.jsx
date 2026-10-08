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
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MdLocationOn,
  MdVerified,
  MdSecurity,
  MdAgriculture,
  MdShoppingCart,
  MdFlashOn,
  MdLocalOffer,
  MdArrowBack,
  MdAdd,
  MdRemove,
  MdStar,
} from 'react-icons/md';
import { useGetProductDetailsQuery } from '../../Api/Api';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { getImageUrl, DEFAULT_FALLBACK_IMAGE } from '../../common/imageUtils';

const BuyerListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, formatCurrency } = useLanguage();
  const { addToCart } = useCart();
  const { data: product, isLoading } = useGetProductDetailsQuery(id);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [orderQty, setOrderQty] = useState(1);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerNote, setOfferNote] = useState('');

  if (isLoading) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="text.secondary">
          {t('market.specsLoading', 'Loading crop harvest specifications...')}
        </Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3.5 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {t('market.produceNotFound', 'Produce listing not found')}
        </Typography>
        <Button component={Link} to="/buyer/market" startIcon={<MdArrowBack />} sx={{ mt: 2 }} variant="contained">
          {t('market.backToMarket', 'Back to Marketplace')}
        </Button>
      </Paper>
    );
  }

  const minQty = product.min_order_quantity || 1;
  const maxQty = product.available_quantity || 100;
  const priceINR = product.price_per_unit_paise / 100;
  const subtotal = Math.round(orderQty * priceINR);
  const buyerFee = Math.round(subtotal * 0.005);
  const totalPayable = subtotal + buyerFee;

  const handleQtyChange = (val) => {
    const num = Number(val);
    if (isNaN(num)) return;
    if (num < minQty) setOrderQty(minQty);
    else if (num > maxQty) setOrderQty(maxQty);
    else setOrderQty(num);
  };

  const handleBuyNow = () => {
    navigate(`/buyer/checkout?product_id=${product.id}&qty=${orderQty}`);
  };

  const handleAddToCart = () => {
    addToCart(product, orderQty);
  };

  const handleSendOffer = () => {
    if (!offerPrice || Number(offerPrice) <= 0) {
      toast.error('Please enter a valid offer price per unit');
      return;
    }
    toast.success(`Counter offer of ₹${offerPrice}/${product.unit} sent to farmer for review!`);
    setOfferModalOpen(false);
    setOfferPrice('');
    setOfferNote('');
  };

  const fallbackImg = product.crop?.image_url ? getImageUrl(product.crop.image_url) : DEFAULT_FALLBACK_IMAGE;

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

  const images = Array.isArray(rawImages) && rawImages.length > 0
    ? rawImages.map((img) => getImageUrl(img, fallbackImg))
    : [fallbackImg];

  const sellerProfile = product.seller?.seller_profile;
  const isFarmerVerified = sellerProfile?.kyc_status === 'verified';
  const farmerId = product.seller_id;

  return (
    <Box>
      {/* Breadcrumb / Back Navigation */}
      <Box sx={{ mb: 2 }}>
        <Button component={Link} to="/buyer/market" startIcon={<MdArrowBack />} color="inherit" sx={{ fontWeight: 600 }}>
          {t('market.backToMarket', 'Back to Marketplace')}
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Photos & Farmer Trust Card */}
        <Grid item xs={12} md={6} size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #E2E8F0', position: 'relative' }}>
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
            {product.is_organic && (
              <Chip
                label={t('market.organicBadge', 'Organic')}
                size="small"
                color="success"
                sx={{ position: 'absolute', top: 14, left: 14, fontWeight: 700 }}
              />
            )}
          </Card>

          {/* Thumbnail Gallery Row */}
          {images.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, overflowX: 'auto', pb: 0.5 }}>
              {images.map((img, i) => (
                <Box
                  key={i}
                  onClick={() => setSelectedPhotoIndex(i)}
                  sx={{
                    width: 68,
                    height: 68,
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedPhotoIndex === i ? '2.5px solid #2563EB' : '1px solid #E2E8F0',
                    opacity: selectedPhotoIndex === i ? 1 : 0.7,
                    flexShrink: 0,
                  }}
                >
                  <Box component="img" src={img} alt={`Thumb ${i}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Box>
          )}

          {/* Seller Trust Card (Spec Section 6.4) */}
          <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                {t('buyer.verifiedSellerCard', 'Verified Farm Producer')}
              </Typography>
              <Button component={Link} to={`/buyer/farmers/${farmerId}`} size="small" sx={{ fontWeight: 700 }}>
                {t('buyer.viewProfile', 'View Farmer Profile')}
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  bgcolor: '#E8F5E9',
                  color: '#2E7D32',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                }}
              >
                <MdAgriculture />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                    {sellerProfile?.full_name || t('market.farmerSeller', 'Farmer Seller')}
                  </Typography>
                  {isFarmerVerified && (
                    <Chip label={t('common.verified', 'Verified')} size="small" color="success" icon={<MdVerified />} />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  🌾 {sellerProfile?.farm_name || 'Farm'} • {product.pickup_district}, {product.pickup_state}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <MdStar color="#F59E0B" size={16} />
                    <Typography variant="caption" fontWeight={700}>
                      {sellerProfile?.rating_avg ? Number(sellerProfile.rating_avg).toFixed(1) : '5.0'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    • {sellerProfile?.total_sales_count ?? 0} batches fulfilled
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Specifications & Quantity Calculator */}
        <Grid item xs={12} md={6} size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <Chip label={product.crop?.name} color="primary" size="small" sx={{ fontWeight: 700 }} />
            <Chip label={`${t('farmer.grade', 'Grade')}: ${product.grade}`} variant="outlined" size="small" sx={{ fontWeight: 600 }} />
            {product.is_organic && <Chip label={t('market.certifiedOrganic', 'Certified Organic')} color="success" size="small" sx={{ fontWeight: 700 }} />}
          </Box>

          <Typography variant="h3" fontWeight={800} color="#0F172A" gutterBottom>
            {product.variety}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 3 }}>
            <MdLocationOn size={18} color="#64748B" />
            {product.pickup_village ? `${product.pickup_village}, ` : ''}{product.pickup_district}, {product.pickup_state} ({t('common.pincode', 'PIN')} {product.pickup_pincode})
          </Typography>

          {/* Pricing & Harvest Attributes */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: '#FFFFFF', borderRadius: 3, border: '1px solid #E2E8F0', mb: 3 }}>
            <Typography variant="caption" color="text.secondary">
              {t('market.guaranteedEscrowRate', 'Guaranteed Escrow Rate')}
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#2E7D32">
              {formatCurrency(product.price_per_unit_paise, true)}
              <span style={{ fontSize: '1.1rem', color: '#64748B', fontWeight: 500 }}> / {product.unit}</span>
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6} size={6}>
                <Typography variant="caption" color="text.secondary">
                  {t('market.totalQuantityAvailable', 'Total Available')}
                </Typography>
                <Typography variant="body1" fontWeight={800}>
                  {product.available_quantity} {product.unit}
                </Typography>
              </Grid>
              <Grid item xs={6} size={6}>
                <Typography variant="caption" color="text.secondary">
                  {t('market.minimumOrderQuantity', 'Min Order Qty')}
                </Typography>
                <Typography variant="body1" fontWeight={800}>
                  {product.min_order_quantity} {product.unit}
                </Typography>
              </Grid>
              <Grid item xs={6} size={6}>
                <Typography variant="caption" color="text.secondary">
                  {t('market.moistureContent', 'Moisture Content')}
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {product.moisture_percentage ? `${product.moisture_percentage}%` : t('market.standardQuality', 'Standard')}
                </Typography>
              </Grid>
              <Grid item xs={6} size={6}>
                <Typography variant="caption" color="text.secondary">
                  {t('market.packaging', 'Packaging')}
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {product.packaging_type || t('market.juteBags', 'Jute Bags')}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Quantity Calculator */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: '#F8FAF9', borderRadius: 3, border: '1px solid #E2E8F0', mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={800} color="#0F172A" sx={{ mb: 1.5 }}>
              {t('buyer.calculateEscrowOrder', '🧮 Quantity & Escrow Calculator')}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: 2, bgcolor: '#FFFFFF' }}>
                <IconButton size="small" onClick={() => handleQtyChange(orderQty - 1)} disabled={orderQty <= minQty}>
                  <MdRemove />
                </IconButton>
                <TextField
                  type="number"
                  value={orderQty}
                  onChange={(e) => handleQtyChange(e.target.value)}
                  inputProps={{ min: minQty, max: maxQty, style: { textAlign: 'center', width: 60, fontWeight: 700 } }}
                  variant="standard"
                  InputProps={{ disableUnderline: true }}
                />
                <IconButton size="small" onClick={() => handleQtyChange(orderQty + 1)} disabled={orderQty >= maxQty}>
                  <MdAdd />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {product.unit} (Min: {minQty}, Max: {maxQty})
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Produce Subtotal ({orderQty} {product.unit}):</Typography>
              <Typography variant="body2" fontWeight={700}>{formatCurrency(subtotal * 100, true)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Escrow Platform Fee (0.5%):</Typography>
              <Typography variant="body2" fontWeight={700}>{formatCurrency(buyerFee * 100, true)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontWeight={800}>Total Escrow Vault Hold:</Typography>
              <Typography variant="subtitle1" fontWeight={800} color="#2E7D32">{formatCurrency(totalPayable * 100, true)}</Typography>
            </Box>
          </Paper>

          {/* Escrow Guarantee Notice */}
          <Alert severity="info" icon={<MdSecurity size={22} />} sx={{ mb: 3, borderRadius: 2.5 }}>
            <strong>{t('market.escrowGuaranteeTitle', 'KhetSetu Escrow Guarantee:')}</strong>{' '}
            {t(
              'market.escrowGuaranteeBody',
              'Your payment is held securely in the platform trust vault. The farmer is paid only after you inspect and confirm delivery.'
            )}
          </Alert>

          {/* Action Buttons (Buy Now, Add to Cart, Make Offer) */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={<MdFlashOn size={22} />}
                onClick={handleBuyNow}
                sx={{ py: 1.5, fontWeight: 800, borderRadius: 2.5 }}
              >
                {t('buyer.buyNow', 'Buy Now (Escrow)')}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                fullWidth
                startIcon={<MdShoppingCart size={20} />}
                onClick={handleAddToCart}
                sx={{ py: 1.5, fontWeight: 700, borderRadius: 2.5 }}
              >
                {t('buyer.addToCart', 'Add to Cart')}
              </Button>
            </Grid>
            <Grid item xs={12} size={12}>
              <Button
                variant="text"
                color="inherit"
                fullWidth
                startIcon={<MdLocalOffer size={18} color="#D97706" />}
                onClick={() => setOfferModalOpen(true)}
                sx={{ color: '#B45309', fontWeight: 700 }}
              >
                {t('buyer.makeOffer', 'Negotiate / Make an Offer to Farmer')}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Offer Negotiation Dialog */}
      <Dialog open={offerModalOpen} onClose={() => setOfferModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('buyer.makeOfferTitle', '🤝 Make Counter Offer to Farmer')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Listed Price: <strong>₹{priceINR} / {product.unit}</strong>
          </Typography>
          <TextField
            label={`Proposed Price per ${product.unit} (₹)`}
            fullWidth
            type="number"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            placeholder={`e.g. ${Math.round(priceINR * 0.95)}`}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('buyer.offerNote', 'Note to Farmer (Optional)')}
            fullWidth
            multiline
            rows={2}
            value={offerNote}
            onChange={(e) => setOfferNote(e.target.value)}
            placeholder="e.g. Willing to pick up directly from godown if rate matches."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOfferModalOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
          <Button variant="contained" color="primary" onClick={handleSendOffer}>
            {t('buyer.sendOffer', 'Submit Offer')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BuyerListingDetail;
